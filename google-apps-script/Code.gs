const RSVP_SHEET = "RSVP";
const GUESTS_SHEET = "Guests";

const RSVP_HEADERS = [
  "زمان ثبت","شناسه مهمان","نام دعوت‌شده","وضعیت حضور",
  "تعداد نفرات","پیام","User Agent"
];

const GUEST_HEADERS = [
  "زمان ایجاد","شناسه مهمان","نام مهمان","تعداد نفرات مجاز",
  "لینک دعوت‌نامه","وضعیت پاسخ","تعداد نفرات ثبت‌شده","آخرین پاسخ"
];

function getOrCreateSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }
  return sheet;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonp_(data, callback) {
  var safeCallback = String(callback || "").replace(/[^a-zA-Z0-9_$.]/g, "");
  if (!safeCallback) return json_(data);
  return ContentService.createTextOutput(
    safeCallback + "(" + JSON.stringify(data) + ");"
  ).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doGet(e) {
  var p = e && e.parameter ? e.parameter : {};
  try {
    if (p.action === "list_guests") return listGuests_(p.callback);
    if (p.action === "get_guest") return getGuest_(p.callback, p.guestId);
    return json_({ok:true, service:"Noora guest service"});
  } catch (err) {
    return jsonp_({ok:false,error:String(err.message || err)}, p.callback);
  }
}

function doPost(e) {
  var p = e && e.parameter ? e.parameter : {};
  var action = p.action || "rsvp";
  try {
    if (action === "create_guest") return createGuest_(p);
    if (action === "rsvp") return saveRsvp_(p);
    return json_({ok:false, error:"unknown_action"});
  } catch (err) {
    return json_({ok:false, error:String(err.message || err)});
  }
}

function createGuest_(p) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var name = String(p.name || "").trim();
    var guestId = String(p.guestId || "").trim();
    var invitationUrl = String(p.invitationUrl || "").trim();
    if (!name || !guestId || !invitationUrl) return json_({ok:false,error:"missing_fields"});

    var sheet = getOrCreateSheet_(GUESTS_SHEET, GUEST_HEADERS);
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var ids = sheet.getRange(2,2,lastRow-1,1).getValues().flat().map(String);
      if (ids.indexOf(guestId) !== -1) return json_({ok:false,error:"duplicate_guest_id"});
    }

    sheet.appendRow([new Date(),guestId,name,1,invitationUrl,"بدون پاسخ","", ""]);
    return json_({ok:true,guestId:guestId,name:name,maxGuests:1,invitationUrl:invitationUrl});
  } finally {
    lock.releaseLock();
  }
}

function getGuest_(callback, guestId) {
  var sheet = getOrCreateSheet_(GUESTS_SHEET, GUEST_HEADERS);
  var guest = findGuest_(sheet, String(guestId || "").trim());
  if (!guest) return jsonp_({ok:false,error:"guest_not_found"}, callback);
  return jsonp_({
    ok:true,
    guest:{
      guestId:String(guest.values[1] || ""),
      name:String(guest.values[2] || ""),
      maxGuests:Number(guest.values[3] || 1)
    }
  }, callback);
}

function listGuests_(callback) {
  var sheet = getOrCreateSheet_(GUESTS_SHEET, GUEST_HEADERS);
  var lastRow = sheet.getLastRow();
  var guests = [];
  if (lastRow > 1) {
    var values = sheet.getRange(2,1,lastRow-1,GUEST_HEADERS.length).getValues();
    values.forEach(function(row) {
      guests.push({
        createdAt: row[0] instanceof Date ? row[0].toISOString() : String(row[0] || ""),
        guestId: String(row[1] || ""),
        name: String(row[2] || ""),
        invitationUrl: String(row[4] || ""),
        attendance: String(row[5] || "بدون پاسخ"),
        guestCount: row[6] === "" ? null : Number(row[6]),
        lastResponse: row[7] instanceof Date ? row[7].toISOString() : String(row[7] || "")
      });
    });
  }
  guests.reverse();
  return jsonp_({ok:true,count:guests.length,guests:guests},callback);
}

function findGuest_(sheet, guestId) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  var values = sheet.getRange(2,1,lastRow-1,GUEST_HEADERS.length).getValues();
  for (var i=0;i<values.length;i++) {
    if (String(values[i][1]) === guestId) return {row:i+2,values:values[i]};
  }
  return null;
}

function saveRsvp_(p) {
  var guestId = String(p.guestId || p.g || "").trim();
  var attendance = p.attendance === "yes" ? "می‌آید" : "نمی‌آید";
  var message = String(p.message || "").trim();
  var userAgent = String(p.userAgent || "").trim();
  if (!guestId) return json_({ok:false,error:"missing_guest_id"});

  var guests = getOrCreateSheet_(GUESTS_SHEET,GUEST_HEADERS);
  var guest = findGuest_(guests,guestId);
  if (!guest) return json_({ok:false,error:"guest_not_found"});

  var invitedName = String(guest.values[2] || "");
  var count = attendance === "می‌آید" ? Math.max(1,Number(p.guestCount || 1)) : 0;
  var rsvp = getOrCreateSheet_(RSVP_SHEET,RSVP_HEADERS);
  rsvp.appendRow([new Date(),guestId,invitedName,attendance,count,message,userAgent]);
  guests.getRange(guest.row,6,1,3).setValues([[attendance,count,new Date()]]);
  return json_({ok:true,guestId:guestId,invitedName:invitedName,attendance:attendance,guestCount:count});
}

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var guests = ss.getSheetByName(GUESTS_SHEET) || ss.insertSheet(GUESTS_SHEET);
  guests.clear();
  guests.getRange(1,1,1,GUEST_HEADERS.length).setValues([GUEST_HEADERS]);
  guests.setFrozenRows(1);
  guests.autoResizeColumns(1,GUEST_HEADERS.length);
  var rsvp = ss.getSheetByName(RSVP_SHEET) || ss.insertSheet(RSVP_SHEET);
  rsvp.clear();
  rsvp.getRange(1,1,1,RSVP_HEADERS.length).setValues([RSVP_HEADERS]);
  rsvp.setFrozenRows(1);
  rsvp.autoResizeColumns(1,RSVP_HEADERS.length);
}
