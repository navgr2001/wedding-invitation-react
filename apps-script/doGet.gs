var SPREADSHEET_ID = "1_D3_kgP8MUqUyuPEvJ7gVwwCwRT7oSMqu3vA_06DZJM";

var SHEET_NAME = "RSVP Responses";

var HEADERS = ["Timestamp", "Name", "Attendance", "Guests", "Message"];

var GUEST_UPLOAD_MAX_IMAGE_BYTES = 30 * 1024 * 1024;

var GUEST_UPLOAD_MAX_VIDEO_BYTES = 500 * 1024 * 1024;

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

/* =========================================================
   Sheet
   ========================================================= */

function getSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error("Sheet not found: " + SHEET_NAME);
  }

  return sheet;
}

/* =========================================================
   Common helpers
   ========================================================= */

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

/* =========================================================
   Wedding words
   ========================================================= */

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

/* =========================================================
   GET
   ========================================================= */

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

/* =========================================================
   POST router
   ========================================================= */

function doPost(e) {
  var request = null;

  try {
    request = parseJsonRequest_(e);

    if (request && request.action === "guestMediaUploadStart") {
      return handleGuestMediaUploadStart_(request);
    }

    if (request && request.action === "guestMediaUploadFinalize") {
      return handleGuestMediaUploadFinalize_(request);
    }

    return handleRsvpSubmission_(e);
  } catch (error) {
    if (
      request &&
      (request.action === "guestMediaUploadStart" ||
        request.action === "guestMediaUploadFinalize")
    ) {
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
  if (!e || !e.postData || !e.postData.contents) {
    return null;
  }

  var content = String(e.postData.contents || "").trim();

  if (!content || content.charAt(0) !== "{") {
    return null;
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/* =========================================================
   RSVP
   ========================================================= */

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

  if (
    !isFinite(guests) ||
    Math.floor(guests) !== guests ||
    guests < 1 ||
    guests > 20
  ) {
    return createHtmlOutput_("Guest count must be between 1 and 20.");
  }

  var sheet = getSheet_();

  sheet.appendRow([new Date(), name, attendance, guests, message]);

  SpreadsheetApp.flush();

  return createHtmlOutput_("RSVP saved successfully.");
}

/* =========================================================
   Resumable upload - start
   ========================================================= */

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

  /*
   * Create metadata for the future Drive file.
   *
   * No video bytes are sent to Apps Script.
   */
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

  /*
   * Ask Google Drive to create a resumable
   * upload session.
   */
  var driveResponse = UrlFetchApp.fetch(
    "https://www.googleapis.com/upload/drive/v3/files" +
      "?uploadType=resumable" +
      "&fields=id,name,mimeType,size,parents",
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

  var statusCode = driveResponse.getResponseCode();

  if (statusCode < 200 || statusCode >= 300) {
    throw new Error("Unable to prepare the Google Drive upload.");
  }

  var headers = driveResponse.getAllHeaders();

  var uploadUrl = headers.Location || headers.location;

  if (!uploadUrl) {
    throw new Error("Google Drive did not return an upload session.");
  }

  return createJsonOutput_({
    success: true,

    uploadUrl: String(uploadUrl),
  });
}

/* =========================================================
   Resumable upload - finalize
   ========================================================= */

function handleGuestMediaUploadFinalize_(request) {
  validateWeddingEventToken_(request.eventToken);

  var fileId = sanitize_(request.fileId);

  if (!fileId || !/^[A-Za-z0-9_-]+$/.test(fileId)) {
    throw new Error("Invalid uploaded file.");
  }

  var file;

  try {
    file = DriveApp.getFileById(fileId);
  } catch (error) {
    throw new Error("The uploaded file could not be found.");
  }

  /*
   * Security:
   * Verify the uploaded file actually belongs
   * to this wedding's private upload folder.
   */
  if (!isFileInWeddingFolder_(file)) {
    throw new Error("The uploaded file is not in the wedding folder.");
  }

  var mimeType = sanitize_(file.getMimeType());

  var fileSize = Number(file.getSize());

  if (!GUEST_UPLOAD_ALLOWED_TYPES[mimeType]) {
    safelyTrashFile_(file);

    throw new Error("The uploaded file type is not supported.");
  }

  var maxAllowedBytes = getGuestUploadMaxBytes_(mimeType);

  if (!fileSize || fileSize <= 0 || fileSize > maxAllowedBytes) {
    safelyTrashFile_(file);

    throw new Error(getGuestUploadSizeError_(mimeType));
  }

  /*
   * Read only the beginning of the uploaded
   * Drive file for binary signature validation.
   *
   * This avoids downloading a 500 MB video
   * back into Apps Script.
   */
  var signatureBytes = getDriveFilePrefix_(fileId, 32);

  try {
    validateFileSignature_(signatureBytes, mimeType);
  } catch (error) {
    safelyTrashFile_(file);

    throw error;
  }

  file.setDescription(
    file.getDescription() + "\nVerified: " + new Date().toISOString(),
  );

  /*
   * Do not expose the Drive file ID back
   * to the public page.
   */
  return createJsonOutput_({
    success: true,

    message: "Upload successful.",
  });
}

/* =========================================================
   Read only first bytes from Drive
   ========================================================= */

function getDriveFilePrefix_(fileId, byteCount) {
  var response = UrlFetchApp.fetch(
    "https://www.googleapis.com/drive/v3/files/" +
      encodeURIComponent(fileId) +
      "?alt=media",
    {
      method: "get",

      headers: {
        Authorization: "Bearer " + ScriptApp.getOAuthToken(),

        Range: "bytes=0-" + String(Math.max(0, byteCount - 1)),
      },

      muteHttpExceptions: true,
    },
  );

  var status = response.getResponseCode();

  if (status !== 200 && status !== 206) {
    throw new Error("Unable to verify the uploaded file.");
  }

  var bytes = response.getBlob().getBytes();

  if (!bytes || bytes.length < 12) {
    throw new Error("The uploaded file is invalid or incomplete.");
  }

  /*
   * Never keep more bytes than necessary.
   */
  return bytes.slice(0, byteCount);
}

/* =========================================================
   Folder security
   ========================================================= */

function isFileInWeddingFolder_(file) {
  var expectedFolder = getWeddingUploadFolder_();

  var expectedFolderId = expectedFolder.getId();

  var parents = file.getParents();

  while (parents.hasNext()) {
    if (parents.next().getId() === expectedFolderId) {
      return true;
    }
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

/* =========================================================
   Wedding configuration
   ========================================================= */

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

/* =========================================================
   Upload validation
   ========================================================= */

function validateGuestUploadMetadata_(fileName, mimeType, fileSize) {
  if (!fileName) {
    throw new Error("File name is missing.");
  }

  if (!mimeType) {
    throw new Error("File type is missing.");
  }

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
}

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
    return "The selected video is larger than " + "the allowed 500 MB limit.";
  }

  return "The selected photo is larger than " + "the allowed 30 MB limit.";
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

/* =========================================================
   Binary signature validation
   ========================================================= */

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
    valid = ascii(4, 4) === "ftyp";
  }

  if (!valid) {
    throw new Error("The file contents do not match the declared file type.");
  }
}

/* =========================================================
   Filename sanitization
   ========================================================= */

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

/* =========================================================
   Test helper
   ========================================================= */

function testWeddingUploadFolder_() {
  var folder = getWeddingUploadFolder_();

  Logger.log(folder.getName());
}
