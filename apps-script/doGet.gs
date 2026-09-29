var SPREADSHEET_ID = "1_D3_kgP8MUqUyuPEvJ7gVwwCwRT7oSMqu3vA_06DZJM";
var SHEET_NAME = "RSVP Responses"; // change if your tab name is different
var HEADERS = ["Timestamp", "Name", "Attendance", "Guests", "Message"];

var GUEST_UPLOAD_MAX_BYTES = 30 * 1024 * 1024;
var GUEST_UPLOAD_ALLOWED_PREFIXES = ["image/", "video/"];

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
      sanitize_(message || "OK") +
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

    return createHtmlOutput_(
      "Submission failed: " + sanitize_(error && error.message),
    );
  }
}

function isGuestMediaUploadRequest_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return false;
  }

  var content = sanitize_(e.postData.contents);

  return content.charAt(0) === "{" && content.indexOf('"guestMediaUpload"') !== -1;
}

function handleRsvpSubmission_(e) {
  var params = (e && e.parameter) || {};
  var name = sanitize_(params.name);
  var attendance = sanitize_(params.attendance);
  var guestsRaw = sanitize_(params.guests);
  var message = sanitize_(params.message);

  if (!name || !attendance || !guestsRaw) {
    return createHtmlOutput_("Missing required RSVP fields.");
  }

  var guests = Number(guestsRaw);
  if (!isFinite(guests) || guests < 1) {
    return createHtmlOutput_("Guest count must be at least 1.");
  }

  var sheet = getSheet_();
  sheet.appendRow([new Date(), name, attendance, guests, message]);

  SpreadsheetApp.flush();

  return createHtmlOutput_("RSVP saved successfully.");
}

function handleGuestMediaUpload_(e) {
  var request = JSON.parse(e.postData.contents);

  if (request.action !== "guestMediaUpload") {
    throw new Error("Invalid upload action.");
  }

  validateWeddingEventToken_(request.eventToken);

  var fileName = sanitizeUploadFileName_(request.fileName);
  var mimeType = sanitize_(request.mimeType);
  var fileSize = Number(request.fileSize || 0);
  var base64 = sanitize_(request.base64);
  var guestName = sanitizeGuestName_(request.guestName) || "Guest";

  validateGuestUpload_(fileName, mimeType, fileSize, base64);

  var folder = getWeddingUploadFolder_();
  var decodedBytes = Utilities.base64Decode(base64);

  if (decodedBytes.length > GUEST_UPLOAD_MAX_BYTES) {
    throw new Error("The uploaded file is larger than the allowed 30 MB limit.");
  }

  var timestamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyyMMdd_HHmmss",
  );

  var storedFileName = timestamp + "_" + guestName + "_" + fileName;
  var blob = Utilities.newBlob(decodedBytes, mimeType, storedFileName);
  var driveFile = folder.createFile(blob);

  driveFile.setDescription(
    [
      "Wedding guest upload",
      "Guest: " + guestName,
      "Original filename: " + fileName,
      "Uploaded: " + new Date().toISOString(),
    ].join("\n"),
  );

  return createJsonOutput_({
    success: true,
    message: "Upload successful.",
    fileId: driveFile.getId(),
  });
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

function validateGuestUpload_(fileName, mimeType, fileSize, base64) {
  if (!fileName) {
    throw new Error("File name is missing.");
  }

  if (!mimeType) {
    throw new Error("File type is missing.");
  }

  var allowed = GUEST_UPLOAD_ALLOWED_PREFIXES.some(function (prefix) {
    return mimeType.indexOf(prefix) === 0;
  });

  if (!allowed) {
    throw new Error("Only photos and videos are allowed.");
  }

  if (!fileSize || fileSize <= 0) {
    throw new Error("The selected file is empty.");
  }

  if (fileSize > GUEST_UPLOAD_MAX_BYTES) {
    throw new Error("The selected file is larger than the allowed 30 MB limit.");
  }

  if (!base64) {
    throw new Error("File data is missing.");
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
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .substring(0, 150);
}

function testWeddingUploadFolder_() {
  var folder = getWeddingUploadFolder_();
  Logger.log(folder.getName());
}
