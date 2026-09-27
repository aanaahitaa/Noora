function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var headers = ["زمان ثبت","شناسه مهمان","نام دعوت‌شده","نام ثبت‌شده","وضعیت حضور","تعداد نفرات","پیام","User Agent"];
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  var p = e.parameter || {};
  var attendance = p.attendance === "yes" ? "می‌آید" : "نمی‌آید";
  var count = p.attendance === "yes" ? Number(p.guestCount || 0) : 0;
  sheet.appendRow([new Date(),p.guestId||"",p.invitedName||"",p.guestName||"",attendance,count,p.message||"",p.userAgent||""]);
  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
}

function setupSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var headers = ["زمان ثبت","شناسه مهمان","نام دعوت‌شده","نام ثبت‌شده","وضعیت حضور","تعداد نفرات","پیام","User Agent"];
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}