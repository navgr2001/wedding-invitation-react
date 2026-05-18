var SPREADSHEET_ID = "1_D3_kgP8MUqUyuPEvJ7gVwwCwRT7oSMqu3vA_06DZJM";
var SHEET_NAME = "RSVP Responses"; // change if your tab name is different
var HEADERS = ["Timestamp", "Name", "Attendance", "Guests", "Message"];

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
  } catch (error) {
    return createHtmlOutput_(
      "Submission failed: " + sanitize_(error && error.message),
    );
  }
}
