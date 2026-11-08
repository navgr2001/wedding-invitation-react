var SPREADSHEET_ID = "1_D3_kgP8MUqUyuPEvJ7gVwwCwRT7oSMqu3vA_06DZJM";
var SHEET_NAME = "RSVP Responses"; // change if your tab name is different
var HEADERS = ["Timestamp", "Name", "Attendance", "Guests", "Message"];

var GUEST_UPLOAD_MAX_IMAGE_BYTES = 500 * 1024 * 1024;
var GUEST_UPLOAD_MAX_VIDEO_BYTES = 5 * 1024 * 1024 * 1024;
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

// Normalize guest names for duplicate RSVP checking.
function normalizeRsvpName_(value) {
  return sanitize_(value).normalize("NFKC").replace(/\s+/g, " ").toLowerCase();
}

// Send RSVP submission result to the website.
function createRsvpResult_(status, message) {
  var payload = JSON.stringify({
    type: "wedding-rsvp-result",
    status: status,
    message: message,
  }).replace(/</g, "\\u003c");

  return HtmlService.createHtmlOutput(
    "<!doctype html><html><body>" +
      "<script>" +
      "window.parent.postMessage(" +
      payload +
      ", '*');" +
      "</script>" +
      "</body></html>",
  );
}

// Fetch wedding wishes for display.
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

// GET endpoint for wedding wishes.
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

// Main POST endpoint.
function doPost(e) {
  try {
    if (isGuestMediaUploadRequest_(e)) {
      return handleGuestMediaUpload_(e);
    }

    return handleRsvpSubmission_(e);
  } catch (error) {
    if (isGuestMediaUploadRequest_(e)) {
      return createJsonOutput_({
        success: false,
        message: sanitize_(error && error.message) || "Upload failed.",
      });
    }

    return createRsvpResult_("error", "Submission failed. Please try again.");
  }
}

// Detect photo/video upload requests.
function isGuestMediaUploadRequest_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return false;
  }

  try {
    var request = JSON.parse(e.postData.contents);
    return Boolean(
      request &&
      (request.action === "guestMediaUploadInit" ||
        request.action === "guestMediaUploadVerify"),
    );
  } catch (error) {
    return false;
  }
}

// ========================================
// RSVP SUBMISSION WITH DUPLICATE PREVENTION
// ========================================

function handleRsvpSubmission_(e) {
  var params = (e && e.parameter) || {};

  var enteredName = String(params.name == null ? "" : params.name);
  var rawName = sanitize_(enteredName);
  var attendance = sanitize_(params.attendance);
  var guestsRaw = sanitize_(params.guests);
  var rawMessage = String(params.message == null ? "" : params.message);

  // Validate required fields.
  if (!rawName || !attendance || !guestsRaw) {
    return createRsvpResult_("error", "Missing required RSVP fields.");
  }

  if (enteredName.length > 50 || !/^[\p{L}\p{M}\p{N} &.]+$/u.test(rawName)) {
    return createRsvpResult_(
      "error",
      "Name must be up to 50 characters, with no special characters except & and a period (.).",
    );
  }

  if (rawMessage.length > 320) {
    return createRsvpResult_(
      "error",
      "Message must be 320 characters or fewer, including spaces.",
    );
  }

  var name = safeSheetValue_(rawName, 50);
  var message = safeSheetValue_(rawMessage, 320);

  // Validate attendance.
  if (
    attendance !== "Yes, I'll be there" &&
    attendance !== "Sorry, I can't make it"
  ) {
    return createRsvpResult_("error", "Invalid attendance selection.");
  }

  // Validate guest count.
  var guests = Number(guestsRaw);

  if (
    !isFinite(guests) ||
    Math.floor(guests) !== guests ||
    guests < 1 ||
    guests > 10
  ) {
    return createRsvpResult_("error", "Guest count must be between 1 and 10.");
  }

  // Lock prevents simultaneous duplicate submissions.
  var lock = LockService.getScriptLock();

  if (!lock.tryLock(30000)) {
    return createRsvpResult_("error", "The system is busy. Please try again.");
  }

  try {
    var sheet = getSheet_();
    var lastRow = sheet.getLastRow();
    var normalizedName = normalizeRsvpName_(rawName);

    // Check all previously submitted names.
    if (lastRow > 1) {
      var existingNames = sheet
        .getRange(2, 2, lastRow - 1, 1)
        .getDisplayValues();

      var duplicate = existingNames.some(function (row) {
        return normalizeRsvpName_(row[0]) === normalizedName;
      });

      // Reject an existing guest name.
      if (duplicate) {
        return createRsvpResult_(
          "duplicate",
          "An RSVP has already been submitted under this name. You cannot submit another response.",
        );
      }
    }

    // Only first-time names are inserted.
    sheet.appendRow([new Date(), name, attendance, guests, message]);

    // Ensure data is committed before releasing the lock.
    SpreadsheetApp.flush();

    return createRsvpResult_(
      "success",
      "Your RSVP has been saved successfully.",
    );
  } catch (error) {
    console.error("RSVP submission error: " + error);

    return createRsvpResult_(
      "error",
      "Unable to save your RSVP. Please try again.",
    );
  } finally {
    lock.releaseLock();
  }
}

// ========================================
// GUEST PHOTO AND VIDEO UPLOAD
// ========================================

function handleGuestMediaUpload_(e) {
  var request = JSON.parse(e.postData.contents);

  validateWeddingEventToken_(request.eventToken);

  if (request.action === "guestMediaUploadVerify") {
    return verifyGuestMediaUpload_(request);
  }

  if (request.action !== "guestMediaUploadInit") {
    throw new Error("Invalid upload action.");
  }

  var fileName = sanitizeUploadFileName_(request.fileName);
  var mimeType = sanitize_(request.mimeType);
  var fileSize = Number(request.fileSize || 0);
  var fileHeaderBase64 = sanitize_(request.fileHeaderBase64);
  var guestName = sanitizeGuestName_(request.guestName) || "Guest";

  validateGuestUpload_(fileName, mimeType, fileSize, fileHeaderBase64);

  var headerBytes = Utilities.base64Decode(fileHeaderBase64);
  validateFileSignature_(headerBytes, mimeType);

  var folder = getWeddingUploadFolder_();
  var timestamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyyMMdd_HHmmss",
  );

  var storedFileName = timestamp + "_" + guestName + "_" + fileName;

  // Create a Google Drive resumable-upload session.
  // The large media file never passes through Apps Script.
  // The browser sends the original binary directly to Drive.
  var metadata = {
    name: storedFileName,
    parents: [folder.getId()],
    description: [
      "Wedding guest upload",
      "Guest: " + guestName,
      "Original filename: " + fileName,
      "Uploaded: " + new Date().toISOString(),
    ].join("\n"),
  };

  var response = UrlFetchApp.fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id",
    {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(metadata),
      headers: {
        Authorization: "Bearer " + ScriptApp.getOAuthToken(),
        "X-Upload-Content-Type": mimeType,
        "X-Upload-Content-Length": String(fileSize),
      },
      muteHttpExceptions: true,
    },
  );

  var status = response.getResponseCode();
  var headers = response.getAllHeaders();
  var uploadUrl = headers.Location || headers.location;

  if (status < 200 || status >= 300 || !uploadUrl) {
    throw new Error("Unable to create the secure Drive upload session.");
  }

  return createJsonOutput_({
    success: true,
    uploadUrl: String(uploadUrl),
    storedFileName: storedFileName,
  });
}

// Verify uploaded media file.
function verifyGuestMediaUpload_(request) {
  var storedFileName = sanitizeUploadFileName_(request.storedFileName);

  var expectedSize = Number(request.fileSize || 0);

  if (!storedFileName || !expectedSize || expectedSize <= 0) {
    throw new Error("Invalid upload verification request.");
  }

  var files = getWeddingUploadFolder_().getFilesByName(storedFileName);

  while (files.hasNext()) {
    var file = files.next();

    if (Number(file.getSize()) === expectedSize) {
      return createJsonOutput_({
        success: true,
        uploaded: true,
      });
    }
  }

  return createJsonOutput_({
    success: true,
    uploaded: false,
  });
}

// Validate wedding upload token.
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

// Get Google Drive upload folder.
function getWeddingUploadFolder_() {
  var folderId = PropertiesService.getScriptProperties().getProperty(
    "WEDDING_UPLOAD_FOLDER_ID",
  );

  if (!folderId) {
    throw new Error("Wedding upload folder has not been configured.");
  }

  return DriveApp.getFolderById(folderId);
}

// Validate uploaded photo or video.
function validateGuestUpload_(fileName, mimeType, fileSize, fileHeaderBase64) {
  if (!fileName) {
    throw new Error("File name is missing.");
  }

  if (!mimeType) {
    throw new Error("File type is missing.");
  }

  if (!GUEST_UPLOAD_ALLOWED_TYPES[mimeType]) {
    throw new Error("Only supported photos and videos are allowed.");
  }

  if (!fileSize || fileSize <= 0 || Math.floor(fileSize) !== fileSize) {
    throw new Error("The selected file is empty or invalid.");
  }

  var isVideo = mimeType.indexOf("video/") === 0;
  var maximumBytes = isVideo
    ? GUEST_UPLOAD_MAX_VIDEO_BYTES
    : GUEST_UPLOAD_MAX_IMAGE_BYTES;

  if (fileSize > maximumBytes) {
    throw new Error(
      isVideo
        ? "The selected video is larger than the allowed 5 GB limit."
        : "The selected photo is larger than the allowed 500 MB limit.",
    );
  }

  if (!fileHeaderBase64) {
    throw new Error("File header is missing.");
  }

  var headerBytes;

  try {
    headerBytes = Utilities.base64Decode(fileHeaderBase64);
  } catch (error) {
    throw new Error("The selected file header is invalid.");
  }

  if (!headerBytes || headerBytes.length < 12 || headerBytes.length > 64) {
    throw new Error("The selected file header is invalid.");
  }
}

// Validate uploaded file signature.
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

// Sanitize guest name for uploaded media filename.
function sanitizeGuestName_(value) {
  return String(value || "")
    .trim()
    .replace(/[^A-Za-z0-9 _-]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 60);
}

// Sanitize uploaded file name.
function sanitizeUploadFileName_(value) {
  return String(value || "")
    .trim()
    .replace(/[\x00-\x1F\x7F\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .substring(0, 150);
}

// Test Google Drive upload folder.
function testWeddingUploadFolder_() {
  var folder = getWeddingUploadFolder_();
  Logger.log(folder.getName());
}
