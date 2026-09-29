var SPREADSHEET_ID = "1_D3_kgP8MUqUyuPEvJ7gVwwCwRT7oSMqu3vA_06DZJM";
var SHEET_NAME = "RSVP Responses"; // change if your tab name is different
var HEADERS = ["Timestamp", "Name", "Attendance", "Guests", "Message"];

// Separate limits for images and videos.
var GUEST_UPLOAD_MAX_IMAGE_BYTES = 30 * 1024 * 1024; // 30 MB
var GUEST_UPLOAD_MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB

var GUEST_UPLOAD_ALLOWED_TYPES = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-m4v": "m4v",
  "video/3gpp": "3gp",
};

function getSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error("Sheet not found: " + SHEET_NAME);
  }

  return sheet;
}

function sanitize_(value) {
  return String(value == null ? "" : value).trim();
}

function escapeHtml_(value) {
  return sanitize_(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Prevent user-controlled cells from being interpreted as spreadsheet formulas.
function safeSheetValue_(value, maxLength) {
  var text = sanitize_(value).substring(0, maxLength || 1000);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function createJsonOutput_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function createJsonpOutput_(callbackName, payload) {
  var safeCallback = sanitize_(callbackName);

  if (!/^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(safeCallback)) {
    safeCallback = "callback";
  }

  return ContentService.createTextOutput(
    safeCallback + "(" + JSON.stringify(payload) + ");",
  ).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function createHtmlOutput_(message) {
  return HtmlService.createHtmlOutput(
    "<!doctype html><html><body>" +
      escapeHtml_(message || "OK") +
      "</body></html>",
  );
}

function listWords_() {
  var sheet = getSheet_();
  var values = sheet.getDataRange().getDisplayValues();

  if (!values || values.length <= 1) {
    return [];
  }

  return values
    .slice(1)
    .map(function (row) {
      return {
        timestamp: sanitize_(row[0]),
        name: sanitize_(row[1]),
        attendance: sanitize_(row[2]),
        guests: sanitize_(row[3]),
        message: sanitize_(row[4]),
      };
    })
    .filter(function (item) {
      return item.name !== "" && item.message !== "";
    })
    .filter(function (item) {
      return item.attendance !== "Sorry, I can't make it";
    })
    .reverse()
    .slice(0, 30)
    .map(function (item) {
      return {
        name: item.name,
        message: item.message,
      };
    });
}

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};

    var payload = {
      ok: true,
      items: listWords_(),
    };

    if (params.callback) {
      return createJsonpOutput_(params.callback, payload);
    }

    return createJsonOutput_(payload);
  } catch (error) {
    var errPayload = {
      ok: false,
      error: sanitize_(error && error.message),
      items: [],
    };

    if (e && e.parameter && e.parameter.callback) {
      return createJsonpOutput_(e.parameter.callback, errPayload);
    }

    return createJsonOutput_(errPayload);
  }
}

function doPost(e) {
  var request = parseJsonRequest_(e);

  try {
    if (request && request.action === "guestMediaUploadStart") {
      return handleGuestMediaUploadStart_(request);
    }

    if (request && request.action === "guestMediaUploadChunk") {
      return handleGuestMediaUploadChunk_(request);
    }

    if (request && request.action === "guestMediaUploadFinalize") {
      return handleGuestMediaUploadFinalize_(request);
    }

    if (request && request.action === "guestMediaUploadCancel") {
      return handleGuestMediaUploadCancel_(request);
    }

    return handleRsvpSubmission_(e);
  } catch (error) {
    if (request && request.action && request.action.indexOf("guestMediaUpload") === 0) {
      return createJsonOutput_({
        success: false,
        message: sanitize_(error && error.message) || "Upload failed.",
      });
    }

    return createHtmlOutput_(
      "Submission failed: " + sanitize_(error && error.message),
    );
  }
}

function parseJsonRequest_(e) {
  if (!e || !e.postData || !e.postData.contents) return null;

  var content = String(e.postData.contents || "").trim();
  if (!content || content.charAt(0) !== "{") return null;

  try {
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

function handleRsvpSubmission_(e) {
  var params = (e && e.parameter) || {};
  var name = safeSheetValue_(params.name, 120);
  var attendance = sanitize_(params.attendance);
  var guestsRaw = sanitize_(params.guests);
  var message = safeSheetValue_(params.message, 1000);

  if (!name || !attendance || !guestsRaw) {
    return createHtmlOutput_("Missing required RSVP fields.");
  }

  if (
    attendance !== "Yes, I'll be there" &&
    attendance !== "Sorry, I can't make it"
  ) {
    return createHtmlOutput_("Invalid attendance selection.");
  }

  var guests = Number(guestsRaw);
  if (!isFinite(guests) || Math.floor(guests) !== guests || guests < 1 || guests > 20) {
    return createHtmlOutput_("Guest count must be between 1 and 20.");
  }

  getSheet_().appendRow([new Date(), name, attendance, guests, message]);
  SpreadsheetApp.flush();
  return createHtmlOutput_("RSVP saved successfully.");
}

/*
 * Large guest uploads use a server-controlled Google Drive resumable session.
 * The browser sends one small Base64 chunk at a time to Apps Script.
 * Apps Script decodes only that chunk and forwards the binary bytes to Drive.
 * The private Drive resumable-session URL and OAuth token never reach guests.
 */
function handleGuestMediaUploadStart_(request) {
  validateWeddingEventToken_(request.eventToken);

  var fileName = sanitizeUploadFileName_(request.fileName);
  var mimeType = sanitize_(request.mimeType);
  var fileSize = Number(request.fileSize || 0);
  var guestName = sanitizeGuestName_(request.guestName) || "Guest";

  validateGuestUploadMetadata_(fileName, mimeType, fileSize);

  var folder = getWeddingUploadFolder_();
  var timestamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyyMMdd_HHmmss",
  );
  var storedFileName = timestamp + "_" + guestName + "_" + fileName;

  var metadata = {
    name: storedFileName,
    mimeType: mimeType,
    parents: [folder.getId()],
    description: [
      "Wedding guest upload",
      "Guest: " + guestName,
      "Original filename: " + fileName,
      "Upload initiated: " + new Date().toISOString(),
    ].join("\n"),
  };

  var response = UrlFetchApp.fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size,parents",
    {
      method: "post",
      contentType: "application/json; charset=UTF-8",
      headers: {
        Authorization: "Bearer " + ScriptApp.getOAuthToken(),
        "X-Upload-Content-Type": mimeType,
        "X-Upload-Content-Length": String(fileSize),
      },
      payload: JSON.stringify(metadata),
      muteHttpExceptions: true,
    },
  );

  var status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    Logger.log("Drive session error: " + response.getContentText());
    throw new Error("Unable to prepare the Google Drive upload.");
  }

  var headers = response.getAllHeaders();
  var uploadUrl = headers.Location || headers.location;
  if (!uploadUrl) {
    throw new Error("Google Drive did not return an upload session.");
  }

  var uploadId = Utilities.getUuid().replace(/-/g, "");
  saveGuestUploadState_(uploadId, {
    uploadUrl: String(uploadUrl),
    fileName: storedFileName,
    mimeType: mimeType,
    fileSize: fileSize,
    nextOffset: 0,
    fileId: "",
    createdAt: new Date().getTime(),
  });

  return createJsonOutput_({
    success: true,
    uploadId: uploadId,
  });
}

function handleGuestMediaUploadChunk_(request) {
  validateWeddingEventToken_(request.eventToken);

  var uploadId = validateGuestUploadId_(request.uploadId);
  var state = getGuestUploadState_(uploadId);
  var start = Number(request.start);
  var endExclusive = Number(request.endExclusive);
  var totalSize = Number(request.totalSize);
  var base64 = sanitize_(request.base64);

  if (!base64) throw new Error("Upload chunk data is missing.");
  if (!isFinite(start) || !isFinite(endExclusive) || start < 0 || endExclusive <= start) {
    throw new Error("Invalid upload chunk range.");
  }
  if (totalSize !== Number(state.fileSize)) {
    throw new Error("Upload size does not match the original file.");
  }
  if (start !== Number(state.nextOffset)) {
    throw new Error("Upload chunk is out of sequence. Please retry the file.");
  }
  if (endExclusive > totalSize) {
    throw new Error("Upload chunk exceeds the file size.");
  }

  var bytes = Utilities.base64Decode(base64);
  var expectedLength = endExclusive - start;
  if (bytes.length !== expectedLength) {
    throw new Error("Upload chunk size does not match the request.");
  }

  // Validate the real binary signature before accepting the first chunk.
  if (start === 0) {
    validateFileSignature_(bytes.slice(0, Math.min(32, bytes.length)), state.mimeType);
  }

  var response = UrlFetchApp.fetch(state.uploadUrl, {
    method: "put",
    contentType: state.mimeType,
    headers: {
      "Content-Range":
        "bytes " + start + "-" + (endExclusive - 1) + "/" + totalSize,
    },
    payload: bytes,
    followRedirects: false,
    muteHttpExceptions: true,
  });

  var status = response.getResponseCode();

  if (status === 308) {
    state.nextOffset = endExclusive;
    saveGuestUploadState_(uploadId, state);
    return createJsonOutput_({
      success: true,
      complete: false,
      receivedBytes: endExclusive,
    });
  }

  if (status >= 200 && status < 300) {
    var driveFile = {};
    try {
      driveFile = JSON.parse(response.getContentText() || "{}");
    } catch (error) {
      driveFile = {};
    }

    if (!driveFile.id) {
      throw new Error("Google Drive completed the upload but did not return a file ID.");
    }

    state.nextOffset = endExclusive;
    state.fileId = String(driveFile.id);
    saveGuestUploadState_(uploadId, state);

    return createJsonOutput_({
      success: true,
      complete: true,
      receivedBytes: endExclusive,
    });
  }

  Logger.log(
    "Drive chunk error " + status + ": " + response.getContentText(),
  );
  throw new Error("Google Drive could not save this part of the upload. Please retry.");
}

function handleGuestMediaUploadFinalize_(request) {
  validateWeddingEventToken_(request.eventToken);

  var uploadId = validateGuestUploadId_(request.uploadId);
  var state = getGuestUploadState_(uploadId);

  if (Number(state.nextOffset) !== Number(state.fileSize) || !state.fileId) {
    throw new Error("The file has not finished uploading yet.");
  }

  var file;
  try {
    file = DriveApp.getFileById(state.fileId);
  } catch (error) {
    deleteGuestUploadState_(uploadId);
    throw new Error("The uploaded file could not be found.");
  }

  if (!isFileInWeddingFolder_(file)) {
    safelyTrashFile_(file);
    deleteGuestUploadState_(uploadId);
    throw new Error("The uploaded file is not in the wedding folder.");
  }

  var mimeType = sanitize_(file.getMimeType());
  var fileSize = Number(file.getSize());

  if (!GUEST_UPLOAD_ALLOWED_TYPES[mimeType]) {
    safelyTrashFile_(file);
    deleteGuestUploadState_(uploadId);
    throw new Error("The uploaded file type is not supported.");
  }

  if (mimeType !== state.mimeType || fileSize !== Number(state.fileSize)) {
    safelyTrashFile_(file);
    deleteGuestUploadState_(uploadId);
    throw new Error("The uploaded file does not match the selected file.");
  }

  if (!fileSize || fileSize > getGuestUploadMaxBytes_(mimeType)) {
    safelyTrashFile_(file);
    deleteGuestUploadState_(uploadId);
    throw new Error(getGuestUploadSizeError_(mimeType));
  }

  file.setDescription(
    file.getDescription() + "\nVerified: " + new Date().toISOString(),
  );

  deleteGuestUploadState_(uploadId);

  return createJsonOutput_({
    success: true,
    message: "Upload successful.",
  });
}

function handleGuestMediaUploadCancel_(request) {
  validateWeddingEventToken_(request.eventToken);

  var uploadId = validateGuestUploadId_(request.uploadId);
  var state = getGuestUploadState_(uploadId, true);

  if (state && state.fileId) {
    try {
      safelyTrashFile_(DriveApp.getFileById(state.fileId));
    } catch (error) {
      Logger.log("Unable to clean up cancelled upload: " + error);
    }
  }

  deleteGuestUploadState_(uploadId);
  return createJsonOutput_({ success: true });
}

function validateGuestUploadMetadata_(fileName, mimeType, fileSize) {
  if (!fileName) throw new Error("File name is missing.");
  if (!mimeType || !GUEST_UPLOAD_ALLOWED_TYPES[mimeType]) {
    throw new Error("Only supported photos and videos are allowed.");
  }
  if (!fileSize || !isFinite(fileSize) || fileSize <= 0) {
    throw new Error("The selected file is empty.");
  }
  if (fileSize > getGuestUploadMaxBytes_(mimeType)) {
    throw new Error(getGuestUploadSizeError_(mimeType));
  }
}

function validateGuestUploadId_(value) {
  var uploadId = sanitize_(value);
  if (!/^[A-Za-z0-9]{20,80}$/.test(uploadId)) {
    throw new Error("Invalid upload session.");
  }
  return uploadId;
}

function guestUploadStateKey_(uploadId) {
  return "GUEST_UPLOAD_" + uploadId;
}

function saveGuestUploadState_(uploadId, state) {
  PropertiesService.getScriptProperties().setProperty(
    guestUploadStateKey_(uploadId),
    JSON.stringify(state),
  );
}

function getGuestUploadState_(uploadId, allowMissing) {
  var raw = PropertiesService.getScriptProperties().getProperty(
    guestUploadStateKey_(uploadId),
  );

  if (!raw) {
    if (allowMissing) return null;
    throw new Error("The upload session expired. Please retry the file.");
  }

  var state;
  try {
    state = JSON.parse(raw);
  } catch (error) {
    throw new Error("The upload session is invalid. Please retry the file.");
  }

  // Do not retain abandoned sessions indefinitely.
  var maxAgeMs = 24 * 60 * 60 * 1000;
  if (!state.createdAt || new Date().getTime() - Number(state.createdAt) > maxAgeMs) {
    deleteGuestUploadState_(uploadId);
    throw new Error("The upload session expired. Please retry the file.");
  }

  return state;
}

function deleteGuestUploadState_(uploadId) {
  PropertiesService.getScriptProperties().deleteProperty(
    guestUploadStateKey_(uploadId),
  );
}

function isFileInWeddingFolder_(file) {
  var expectedFolderId = getWeddingUploadFolder_().getId();
  var parents = file.getParents();
  while (parents.hasNext()) {
    if (parents.next().getId() === expectedFolderId) return true;
  }
  return false;
}

function safelyTrashFile_(file) {
  try {
    file.setTrashed(true);
  } catch (error) {
    Logger.log("Unable to trash invalid upload: " + error);
  }
}

function validateWeddingEventToken_(receivedToken) {
  var expectedToken = PropertiesService.getScriptProperties().getProperty(
    "WEDDING_EVENT_TOKEN",
  );

  if (!expectedToken) {
    throw new Error("Wedding upload token has not been configured.");
  }

  if (!receivedToken || String(receivedToken) !== expectedToken) {
    throw new Error("This wedding upload link is invalid.");
  }
}

function getWeddingUploadFolder_() {
  var folderId = PropertiesService.getScriptProperties().getProperty(
    "WEDDING_UPLOAD_FOLDER_ID",
  );

  if (!folderId) {
    throw new Error("Wedding upload folder has not been configured.");
  }

  return DriveApp.getFolderById(folderId);
}

/**
 * Return the maximum permitted upload size based on
 * the validated MIME type.
 *
 * Images: 30 MB
 * Videos: 500 MB
 */
function getGuestUploadMaxBytes_(mimeType) {
  if (isGuestImageType_(mimeType)) {
    return GUEST_UPLOAD_MAX_IMAGE_BYTES;
  }

  if (isGuestVideoType_(mimeType)) {
    return GUEST_UPLOAD_MAX_VIDEO_BYTES;
  }

  throw new Error("Only supported photos and videos are allowed.");
}

function getGuestUploadSizeError_(mimeType) {
  if (isGuestVideoType_(mimeType)) {
    return "The selected video is larger than the allowed 500 MB limit.";
  }

  return "The selected photo is larger than the allowed 30 MB limit.";
}

function isGuestImageType_(mimeType) {
  return (
    mimeType === "image/jpeg" ||
    mimeType === "image/png" ||
    mimeType === "image/webp" ||
    mimeType === "image/heic" ||
    mimeType === "image/heif"
  );
}

function isGuestVideoType_(mimeType) {
  return (
    mimeType === "video/mp4" ||
    mimeType === "video/quicktime" ||
    mimeType === "video/webm" ||
    mimeType === "video/x-m4v" ||
    mimeType === "video/3gpp"
  );
}

function validateGuestUpload_(fileName, mimeType, fileSize, base64) {
  if (!fileName) {
    throw new Error("File name is missing.");
  }

  if (!mimeType) {
    throw new Error("File type is missing.");
  }

  // Exact MIME allowlist.
  if (!GUEST_UPLOAD_ALLOWED_TYPES[mimeType]) {
    throw new Error("Only supported photos and videos are allowed.");
  }

  if (!fileSize || !isFinite(fileSize) || fileSize <= 0) {
    throw new Error("The selected file is empty.");
  }

  var maxAllowedBytes = getGuestUploadMaxBytes_(mimeType);

  if (fileSize > maxAllowedBytes) {
    throw new Error(getGuestUploadSizeError_(mimeType));
  }

  if (!base64) {
    throw new Error("File data is missing.");
  }
}

function validateFileSignature_(bytes, mimeType) {
  if (!bytes || bytes.length < 12) {
    throw new Error("The uploaded file is invalid or incomplete.");
  }

  function u(index) {
    return bytes[index] < 0 ? bytes[index] + 256 : bytes[index];
  }

  function ascii(start, length) {
    var value = "";

    for (var i = start; i < start + length && i < bytes.length; i += 1) {
      value += String.fromCharCode(u(i));
    }

    return value;
  }

  var valid = false;

  if (mimeType === "image/jpeg") {
    valid = u(0) === 0xff && u(1) === 0xd8 && u(2) === 0xff;
  } else if (mimeType === "image/png") {
    valid =
      u(0) === 0x89 && ascii(1, 3) === "PNG" && u(4) === 0x0d && u(5) === 0x0a;
  } else if (mimeType === "image/webp") {
    valid = ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP";
  } else if (mimeType === "video/webm") {
    valid = u(0) === 0x1a && u(1) === 0x45 && u(2) === 0xdf && u(3) === 0xa3;
  } else if (
    mimeType === "video/mp4" ||
    mimeType === "video/quicktime" ||
    mimeType === "video/x-m4v" ||
    mimeType === "video/3gpp" ||
    mimeType === "image/heic" ||
    mimeType === "image/heif"
  ) {
    /*
     * MP4/MOV/M4V/3GP/HEIC/HEIF are based on the
     * ISO Base Media File Format and normally contain
     * an ftyp box near the beginning.
     */
    valid = ascii(4, 4) === "ftyp";
  }

  if (!valid) {
    throw new Error("The file contents do not match the declared file type.");
  }
}

function sanitizeGuestName_(value) {
  return String(value || "")
    .trim()
    .replace(/[^A-Za-z0-9 _-]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 60);
}

function sanitizeUploadFileName_(value) {
  return String(value || "")
    .trim()
    .replace(/[\x00-\x1F\x7F\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .substring(0, 150);
}

function testWeddingUploadFolder_() {
  var folder = getWeddingUploadFolder_();
  Logger.log(folder.getName());
}
