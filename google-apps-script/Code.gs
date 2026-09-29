const RSVP_SHEET = "RSVP";
const GUESTS_SHEET = "Guests";

const RSVP_HEADERS = [
  "زمان ثبت",
  "شناسه مهمان",
  "نام دعوت‌شده",
  "وضعیت حضور",
  "پیام",
  "User Agent"
];

const GUEST_HEADERS = [
  "زمان ایجاد",
  "شناسه مهمان",
  "نام مهمان",
  "لینک دعوت‌نامه",
  "وضعیت پاسخ",
  "آخرین پاسخ",
  "عنوان پیش‌نمایش",
  "توضیح پیش‌نمایش",
];

function getOrCreateSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  // Migrate the previous Guests/RSVP structure once, removing guest-count
  // columns while keeping existing names, links, responses and messages.
  if (sheet.getLastRow() > 0) {
    var oldHeaders = sheet.getRange(1, 1, 1, Math.min(sheet.getMaxColumns(), 11)).getValues()[0];
    if (name === GUESTS_SHEET && String(oldHeaders[3] || "") === "تعداد نفرات مجاز") {
      var oldLast = sheet.getLastRow();
      var oldRows = oldLast > 1 ? sheet.getRange(2, 1, oldLast - 1, Math.min(sheet.getMaxColumns(), 11)).getValues() : [];
      var newRows = oldRows.map(function(row) {
        return [row[0], row[1], row[2], row[4], row[5], row[7], row[8], row[9]];
      });
      sheet.clearContents();
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      if (newRows.length) sheet.getRange(2, 1, newRows.length, headers.length).setValues(newRows);
    } else if (name === RSVP_SHEET && String(oldHeaders[4] || "") === "تعداد نفرات") {
      var oldRsvpLast = sheet.getLastRow();
      var oldRsvpRows = oldRsvpLast > 1 ? sheet.getRange(2, 1, oldRsvpLast - 1, Math.min(sheet.getMaxColumns(), 7)).getValues() : [];
      var newRsvpRows = oldRsvpRows.map(function(row) {
        return [row[0], row[1], row[2], row[3], row[5], row[6]];
      });
      sheet.clearContents();
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      if (newRsvpRows.length) sheet.getRange(2, 1, newRsvpRows.length, headers.length).setValues(newRsvpRows);
    }
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  } else if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  } else {
    var headerValues = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    var headerChanged = false;
    for (var h = 0; h < headers.length; h++) {
      if (!String(headerValues[h] || "").trim()) {
        headerValues[h] = headers[h];
        headerChanged = true;
      }
    }
    if (headerChanged) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headerValues]);
    }
  }

  return sheet;
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonp_(data, callback) {
  var safeCallback = String(callback || "")
    .replace(/[^a-zA-Z0-9_$.]/g, "");

  if (!safeCallback) {
    return json_(data);
  }

  return ContentService
    .createTextOutput(
      safeCallback + "(" + JSON.stringify(data) + ");"
    )
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doGet(e) {
  var p = e && e.parameter ? e.parameter : {};

  // بعضی درخواست‌های مستقیم/redirect شده ممکن است e.parameter را
  // کامل منتقل نکنند؛ queryString را هم به‌عنوان fallback می‌خوانیم.
  if (e && e.queryString) {
    var qs = String(e.queryString);
    qs.split("&").forEach(function(part) {
      var bits = part.split("=");
      var key = decodeURIComponent(bits[0] || "");
      if (!key) return;

      var value = bits.slice(1).join("=");
      try {
        value = decodeURIComponent(value.replace(/\+/g, " "));
      } catch (ignore) {}

      // queryString را منبع اصلی پارامترها قرار می‌دهیم.
      p[key] = value;
    });
  }

  // بعضی محیط‌ها ممکن است action را به‌صورت
  // "reset_all&callback=testCallback" تحویل دهند.
  // در این حالت آن را دوباره به پارامترهای جداگانه تبدیل می‌کنیم.
  if (String(p.action || "").indexOf("&") !== -1) {
    var actionParts = String(p.action).split("&");
    var cleanAction = actionParts.shift();

    if (cleanAction) {
      p.action = cleanAction;
    }

    actionParts.forEach(function(part) {
      var bits = part.split("=");
      var key = decodeURIComponent(bits[0] || "");
      var value = bits.slice(1).join("=");

      if (!key) return;

      try {
        value = decodeURIComponent(value.replace(/\+/g, " "));
      } catch (ignore) {}

      p[key] = value;
    });
  }

  try {
    if (p.action === "list_guests") {
      return listGuests_(p.callback);
    }

    if (p.action === "list_links") {
      return listLinks_(p.callback);
    }

    if (p.action === "find_guest") {
      return findGuestByName_(p.callback, p.name);
    }

    if (p.action === "get_guest") {
      return getGuest_(p.callback, p.guestId);
    }

    // پاک کردن کامل لیست؛ هم JSON و هم JSONP پشتیبانی می‌شود.
    if (p.action === "reset_all") {
      return resetAll_(p.callback);
    }

    // پاسخ تشخیصی برای درخواست‌های بدون action
    return json_({
      ok: true,
      service: "Noora guest service",
      action: p.action || null
    });

  } catch (err) {
    return jsonp_({
      ok: false,
      error: String(err.message || err)
    }, p.callback);
  }
}

function doPost(e) {
  var p = e && e.parameter ? e.parameter : {};
  var action = p.action || "rsvp";

  try {
    if (action === "create_guest") {
      return createGuest_(p);
    }

    if (action === "rsvp") {
      return saveRsvp_(p);
    }

    if (action === "reset_all") {
      return resetAll_();
    }

    return json_({
      ok: false,
      error: "unknown_action"
    });

  } catch (err) {
    return json_({
      ok: false,
      error: String(err.message || err)
    });
  }
}

function createGuest_(p) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var name = String(p.name || "").trim();
    var guestId = String(p.guestId || "").trim();
    var invitationUrl = String(p.invitationUrl || "").trim();
    var ogTitle = String(p.ogTitle || "").trim();
    var ogDescription = String(p.ogDescription || "").trim();

    if (!ogTitle) ogTitle = "تقدیم به " + name + " عزیز";
    if (!ogDescription) ogDescription = "دعوت‌نامه جشن تولد یک‌سالگی نورا جان";

    if (!name || !guestId || !invitationUrl) {
      return json_({
        ok: false,
        error: "missing_fields"
      });
    }

    var sheet = getOrCreateSheet_(
      GUESTS_SHEET,
      GUEST_HEADERS
    );

    var lastRow = sheet.getLastRow();

    if (lastRow > 1) {
      var rows = sheet.getRange(
        2,
        1,
        lastRow - 1,
        GUEST_HEADERS.length
      ).getValues();

      var normalizedName = normalizeName_(name);

      for (var i = 0; i < rows.length; i++) {
        if (
          normalizeName_(String(rows[i][2] || "")) ===
          normalizedName
        ) {
          return json_({
            ok: true,
            duplicate: true,
            guestId: String(rows[i][1] || ""),
            name: String(rows[i][2] || ""),
            invitationUrl: String(rows[i][3] || ""),
            ogTitle: String(rows[i][6] || ("تقدیم به " + String(rows[i][2] || "") + " عزیز")),
            ogDescription: String(rows[i][7] || "دعوت‌نامه جشن تولد یک‌سالگی نورا جان")
          });
        }
      }

      var ids = rows.map(function(row) {
        return String(row[1] || "");
      });

      if (ids.indexOf(guestId) !== -1) {
        return json_({
          ok: false,
          error: "duplicate_guest_id"
        });
      }
    }

    sheet.appendRow([
      new Date(),
      guestId,
      name,
      invitationUrl,
      "بدون پاسخ",
      ogTitle,
      ogDescription
    ]);

    CacheService.getScriptCache().put(
      "guest:" + guestId,
      JSON.stringify({
        guestId: guestId,
        name: name,
        ogTitle: ogTitle,
        ogDescription: ogDescription
      }),
      21600
    );

    return json_({
      ok: true,
      guestId: guestId,
      name: name,
      invitationUrl: invitationUrl
    });

  } finally {
    lock.releaseLock();
  }
}

function getGuest_(callback, guestId) {
  var wantedId = String(guestId || "").trim();
  var guest = getGuestFromCache_(wantedId);

  if (!guest) {
    return jsonp_({
      ok: false,
      error: "guest_not_found"
    }, callback);
  }

  return jsonp_({
    ok: true,
    guest: guest
  }, callback);
}

function getGuestFromCache_(guestId) {
  if (!guestId) return null;

  var cache = CacheService.getScriptCache();
  var key = "guest:" + guestId;
  var cached = cache.get(key);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (ignore) {}
  }

  // اگر مهمان در Cache نبود، یک بار کل لیست مهمان‌ها را می‌خوانیم
  // و هر مهمان را جداگانه Cache می‌کنیم تا درخواست‌های بعدی سریع باشند.
  var sheet = getOrCreateSheet_(
    GUESTS_SHEET,
    GUEST_HEADERS
  );
  var lastRow = sheet.getLastRow();

  if (lastRow < 2) return null;

  var values = sheet.getRange(
    2,
    1,
    lastRow - 1,
    GUEST_HEADERS.length
  ).getValues();

  var found = null;
  var entries = {};

  values.forEach(function(row) {
    var id = String(row[1] || "").trim();
    var name = String(row[2] || "").trim();
    if (!id || !name) return;

    var item = {
      guestId: id,
      name: name,
      ogTitle: String(row[6] || ("تقدیم به " + name + " عزیز")),
      ogDescription: String(row[7] || "دعوت‌نامه جشن تولد یک‌سالگی نورا جان")
    };

    entries[id] = item;
    if (id === guestId) found = item;
  });

  Object.keys(entries).forEach(function(id) {
    try {
      cache.put("guest:" + id, JSON.stringify(entries[id]), 21600);
    } catch (ignore) {}
  });

  return found;
}

function clearGuestCache_() {
  CacheService.getScriptCache().removeAll(
    CacheService.getScriptCache().getKeys()
  );
}

function listGuests_(callback) {
  var sheet = getOrCreateSheet_(
    GUESTS_SHEET,
    GUEST_HEADERS
  );

  var lastRow = sheet.getLastRow();
  var guests = [];
  var messageByGuest = {};

  var rsvp = getOrCreateSheet_(
    RSVP_SHEET,
    RSVP_HEADERS
  );

  var rsvpLast = rsvp.getLastRow();

  if (rsvpLast > 1) {
    var rsvpValues = rsvp.getRange(
      2,
      1,
      rsvpLast - 1,
      RSVP_HEADERS.length
    ).getValues();

    rsvpValues.forEach(function(row) {
      messageByGuest[String(row[1] || "")] = String(row[4] || "");
    });
  }

  if (lastRow > 1) {
    var values = sheet.getRange(
      2,
      1,
      lastRow - 1,
      GUEST_HEADERS.length
    ).getValues();

    values.forEach(function(row) {
      var id = String(row[1] || "");

      guests.push({
        createdAt:
          row[0] instanceof Date
            ? row[0].toISOString()
            : String(row[0] || ""),

        guestId: id,

        name: String(row[2] || ""),

        invitationUrl: String(row[3] || ""),

        attendance:
          String(row[4] || "بدون پاسخ"),

        message:
          messageByGuest[id] || ""
      });
    });
  }

  guests.reverse();

  return jsonp_({
    ok: true,
    count: guests.length,
    guests: guests
  }, callback);
}

function normalizeName_(name) {
  return String(name || "")
    .trim()
    .replace(/\s+/g, " ");
}

function findGuestByName_(callback, name) {
  var sheet = getOrCreateSheet_(
    GUESTS_SHEET,
    GUEST_HEADERS
  );

  var wanted = normalizeName_(name);
  var lastRow = sheet.getLastRow();

  if (lastRow < 2 || !wanted) {
    return jsonp_({
      ok: false,
      error: "guest_not_found"
    }, callback);
  }

  var values = sheet.getRange(
    2,
    1,
    lastRow - 1,
    GUEST_HEADERS.length
  ).getValues();

  for (var i = 0; i < values.length; i++) {
    if (
      normalizeName_(String(values[i][2] || "")) ===
      wanted
    ) {
      return jsonp_({
        ok: true,
        guest: {
          guestId: String(values[i][1] || ""),
          name: String(values[i][2] || ""),
          url: String(values[i][3] || ""),
          invitationUrl: String(values[i][3] || ""),
          ogTitle: String(values[i][6] || ("تقدیم به " + String(values[i][2] || "") + " عزیز")),
          ogDescription: String(values[i][7] || "دعوت‌نامه جشن تولد یک‌سالگی نورا جان")
        }
      }, callback);
    }
  }

  return jsonp_({
    ok: false,
    error: "guest_not_found"
  }, callback);
}

function listLinks_(callback) {
  var sheet = getOrCreateSheet_(
    GUESTS_SHEET,
    GUEST_HEADERS
  );

  var lastRow = sheet.getLastRow();
  var links = [];

  if (lastRow > 1) {
    var values = sheet.getRange(
      2,
      1,
      lastRow - 1,
      GUEST_HEADERS.length
    ).getValues();

    values.forEach(function(row) {
      var name = String(row[2] || "").trim();
      var url = String(row[3] || "").trim();

      if (name && url) {
        links.push({
          name: name,
          id: String(row[1] || ""),
          url: url,
          invitationUrl: url
        });
      }
    });
  }

  links.reverse();

  return jsonp_({
    ok: true,
    count: links.length,
    links: links
  }, callback);
}

function findGuest_(sheet, guestId) {
  var lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return null;
  }

  var values = sheet.getRange(
    2,
    1,
    lastRow - 1,
    GUEST_HEADERS.length
  ).getValues();

  for (var i = 0; i < values.length; i++) {
    if (String(values[i][1]) === guestId) {
      return {
        row: i + 2,
        values: values[i]
      };
    }
  }

  return null;
}

function saveRsvp_(p) {
  var guestId = String(
    p.guestId || p.g || ""
  ).trim();

  var attendance =
    p.attendance === "yes"
      ? "می‌آید"
      : "نمی‌آید";

  var message =
    String(p.message || "").trim();

  var userAgent =
    String(p.userAgent || "").trim();

  if (!guestId) {
    return json_({
      ok: false,
      error: "missing_guest_id"
    });
  }

  var guests = getOrCreateSheet_(
    GUESTS_SHEET,
    GUEST_HEADERS
  );

  var guest = findGuest_(
    guests,
    guestId
  );

  if (!guest) {
    var recoveredName = String(p.guestName || "").trim();
    var recoveredUrl = String(p.invitationUrl || "").trim();

    if (!recoveredName) {
      return json_({
        ok: false,
        error: "missing_guest_name"
      });
    }

    guests.appendRow([
      new Date(),
      guestId,
      recoveredName,
      recoveredUrl,
      "بدون پاسخ",
      "",
      "تقدیم به " + recoveredName + " عزیز",
      "دعوت‌نامه جشن یک‌سالگی نورا جان"
    ]);

    guest = findGuest_(guests, guestId);
  }

  var invitedName =
    String(guest.values[2] || String(p.guestName || "").trim());

  if (!invitedName) {
    return json_({
      ok: false,
      error: "missing_guest_name"
    });
  }


  var rsvp = getOrCreateSheet_(
    RSVP_SHEET,
    RSVP_HEADERS
  );

  rsvp.appendRow([
    new Date(),
    guestId,
    invitedName,
    attendance,
    message,
    userAgent
  ]);

  guests
    .getRange(guest.row, 5, 1, 2).setValues([[attendance, new Date()]]);

  return json_({
    ok: true,
    guestId: guestId,
    invitedName: invitedName,
    attendance: attendance,
    message: message
  });
}

/*
 * پاک کردن کامل مهمان‌ها و پاسخ‌ها
 *
 * این تابع هم از doGet (برای پنل مدیریت و JSONP)
 * و هم از doPost پشتیبانی می‌کند.
 */
function resetAll_(callback) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var ss =
      SpreadsheetApp.getActiveSpreadsheet();

    // پاک کردن Guests
    var guests =
      ss.getSheetByName(GUESTS_SHEET);

    if (guests) {
      guests.clearContents();

      guests
        .getRange(
          1,
          1,
          1,
          GUEST_HEADERS.length
        )
        .setValues([GUEST_HEADERS]);

      guests.setFrozenRows(1);

    } else {
      guests =
        getOrCreateSheet_(
          GUESTS_SHEET,
          GUEST_HEADERS
        );
    }

    // پاک کردن RSVP
    var rsvp =
      ss.getSheetByName(RSVP_SHEET);

    if (rsvp) {
      rsvp.clearContents();

      rsvp
        .getRange(
          1,
          1,
          1,
          RSVP_HEADERS.length
        )
        .setValues([RSVP_HEADERS]);

      rsvp.setFrozenRows(1);

    } else {
      rsvp =
        getOrCreateSheet_(
          RSVP_SHEET,
          RSVP_HEADERS
        );
    }

    clearGuestCache_();

    var result = {
      ok: true,
      reset: true
    };

    // اگر callback وجود داشته باشد،
    // پاسخ JSONP برمی‌گردد.
    if (callback) {
      return jsonp_(result, callback);
    }

    // برای درخواست POST قدیمی
    return json_(result);

  } finally {
    lock.releaseLock();
  }
}

function setupSheet() {
  var ss =
    SpreadsheetApp.getActiveSpreadsheet();

  var guests =
    ss.getSheetByName(GUESTS_SHEET) ||
    ss.insertSheet(GUESTS_SHEET);

  guests.clear();

  guests
    .getRange(
      1,
      1,
      1,
      GUEST_HEADERS.length
    )
    .setValues([GUEST_HEADERS]);

  guests.setFrozenRows(1);
  guests.autoResizeColumns(
    1,
    GUEST_HEADERS.length
  );

  var rsvp =
    ss.getSheetByName(RSVP_SHEET) ||
    ss.insertSheet(RSVP_SHEET);

  rsvp.clear();

  rsvp
    .getRange(
      1,
      1,
      1,
      RSVP_HEADERS.length
    )
    .setValues([RSVP_HEADERS]);

  rsvp.setFrozenRows(1);
  rsvp.autoResizeColumns(
    1,
    RSVP_HEADERS.length
  );
}

