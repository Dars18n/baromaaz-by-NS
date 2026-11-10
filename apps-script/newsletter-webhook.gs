// Paste into Extensions > Apps Script of a Google Sheet, then Deploy > New deployment > Web app
// (Execute as: Me, Who has access: Anyone). Put the web app URL in NEWSLETTER_WEBHOOK_URL.
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Signups") || ss.insertSheet("Signups");
    if (sheet.getLastRow() === 0) sheet.appendRow(["Time", "Email", "Source"]);
    sheet.appendRow([data.at || new Date().toISOString(), data.email, data.source || ""]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
