const ORIGIN = "https://aanaahitaa.github.io/Noora/";
const FALLBACK_TITLE = "دعوت‌نامه جشن تولد یک‌سالگی نورا جان";
const FALLBACK_DESCRIPTION = "دعوت‌نامه جشن تولد یک‌سالگی نورا جان";
const IMAGE_URL = "https://aanaahitaa.github.io/Noora/assets/noora-cover.webp";

function proxyRequest(request) {
  const incoming = new URL(request.url);
  const target = new URL(ORIGIN);
  target.pathname = incoming.pathname || "/";
  target.search = incoming.search;
  return fetch(new Request(target.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "follow"
  }));
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store"
  };
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      ...corsHeaders(),
      ...extraHeaders
    }
  });
}

function normalizeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function guestFromRow(row) {
  return {
    guestId: String(row.guest_id || ""),
    name: String(row.name || ""),
    invitationUrl: String(row.invitation_url || ""),
    url: String(row.invitation_url || ""),
    ogTitle: String(row.og_title || "").trim() || ("تقدیم به " + String(row.name || "").trim() + " عزیز"),
    ogDescription: String(row.og_description || "").trim() || FALLBACK_DESCRIPTION
  };
}

async function createGuest(env, params) {
  const guestId = String(params.guestId || "").trim();
  const name = normalizeName(params.name);
  const invitationUrl = String(params.invitationUrl || "").trim();
  const ogTitle = String(params.ogTitle || "").trim() || ("تقدیم به " + name + " عزیز");
  const ogDescription = String(params.ogDescription || "").trim() || FALLBACK_DESCRIPTION;

  if (!guestId) return {ok:false, error:"missing_guest_id"};
  if (!name) return {ok:false, error:"missing_name"};
  if (!invitationUrl) return {ok:false, error:"missing_invitation_url"};

  const duplicate = await env.DB.prepare(
    "SELECT guest_id, name, invitation_url, og_title, og_description FROM Guests WHERE guest_id = ? OR name = ? LIMIT 1"
  ).bind(guestId, name).first();

  if (duplicate) {
    if (String(duplicate.guest_id) === guestId) {
      return {
        ok:true,
        existing:true,
        guest:guestFromRow(duplicate)
      };
    }
    return {ok:false, error:"guest_name_exists"};
  }

  const result = await env.DB.prepare(
    `INSERT INTO Guests
      (guest_id, name, allowed_people, invitation_url, rsvp_status, rsvp_count, last_rsvp, og_title, og_description)
     VALUES (?, ?, 1, ?, 'بدون پاسخ', 0, NULL, ?, ?)`
  ).bind(guestId, name, invitationUrl, ogTitle, ogDescription).run();

  return {
    ok:true,
    created:true,
    guestId,
    name,
    invitationUrl,
    ogTitle,
    ogDescription,
    dbChanges: result.meta && result.meta.changes || 0
  };
}

async function getGuest(env, guestId) {
  const wanted = String(guestId || "").trim();
  if (!wanted) return {ok:false, error:"missing_guest_id"};

  const row = await env.DB.prepare(
    "SELECT guest_id, name, invitation_url, og_title, og_description FROM Guests WHERE guest_id = ? LIMIT 1"
  ).bind(wanted).first();

  if (!row) return {ok:false, error:"guest_not_found"};
  return {ok:true, guest:guestFromRow(row)};
}

async function listGuests(env) {
  const result = await env.DB.prepare(
    `SELECT
       g.created_at,
       g.guest_id,
       g.name,
       g.invitation_url,
       g.rsvp_status,
       COALESCE((
         SELECT r.message
         FROM RSVP r
         WHERE r.guest_id = g.guest_id
         ORDER BY r.id DESC
         LIMIT 1
       ), '') AS message
     FROM Guests g
     ORDER BY g.id DESC`
  ).run();

  const guests = (result.results || []).map(row => ({
    createdAt: String(row.created_at || ""),
    guestId: String(row.guest_id || ""),
    name: String(row.name || ""),
    invitationUrl: String(row.invitation_url || ""),
    attendance: String(row.rsvp_status || "بدون پاسخ"),
    message: String(row.message || "")
  }));

  return {ok:true, count:guests.length, guests};
}

async function listLinks(env) {
  const result = await env.DB.prepare(
    "SELECT guest_id, name, invitation_url FROM Guests ORDER BY id DESC"
  ).run();

  const links = (result.results || []).map(row => ({
    name: String(row.name || ""),
    id: String(row.guest_id || ""),
    url: String(row.invitation_url || ""),
    invitationUrl: String(row.invitation_url || "")
  }));

  return {ok:true, count:links.length, links};
}

async function findGuest(env, name) {
  const wanted = normalizeName(name);
  if (!wanted) return {ok:false, error:"guest_not_found"};

  const rows = await env.DB.prepare(
    "SELECT guest_id, name, invitation_url, og_title, og_description FROM Guests ORDER BY id DESC"
  ).run();

  const row = (rows.results || []).find(item => normalizeName(item.name) === wanted);
  if (!row) return {ok:false, error:"guest_not_found"};

  return {ok:true, guest:guestFromRow(row)};
}

async function saveRsvp(env, params) {
  const guestId = String(params.guestId || params.g || "").trim();
  const attendance = params.attendance === "yes" ? "می‌آید" : "نمی‌آید";
  const guestCount = Math.max(1, Number(params.guestCount || params.count || 1) || 1);
  const message = String(params.message || "").trim();
  const userAgent = String(params.userAgent || "").trim();

  if (!guestId) return {ok:false, error:"missing_guest_id"};

  let guest = await env.DB.prepare(
    "SELECT id, guest_id, name, invitation_url, og_title, og_description FROM Guests WHERE guest_id = ? LIMIT 1"
  ).bind(guestId).first();

  if (!guest) {
    const recoveredName = normalizeName(params.guestName);
    const recoveredUrl = String(params.invitationUrl || "").trim();
    if (!recoveredName) return {ok:false, error:"missing_guest_name"};

    const recoveredTitle = "تقدیم به " + recoveredName + " عزیز";
    const recoveredDescription = FALLBACK_DESCRIPTION;

    await env.DB.prepare(
      `INSERT INTO Guests
        (guest_id, name, allowed_people, invitation_url, rsvp_status, rsvp_count, last_rsvp, og_title, og_description)
       VALUES (?, ?, 1, ?, 'بدون پاسخ', 0, NULL, ?, ?)`
    ).bind(guestId, recoveredName, recoveredUrl, recoveredTitle, recoveredDescription).run();

    guest = await env.DB.prepare(
      "SELECT id, guest_id, name, invitation_url, og_title, og_description FROM Guests WHERE guest_id = ? LIMIT 1"
    ).bind(guestId).first();
  }

  const invitedName = normalizeName(guest && guest.name);
  if (!invitedName) return {ok:false, error:"missing_guest_name"};

  await env.DB.prepare(
    `INSERT INTO RSVP
      (guest_id, guest_name, status, people_count, message, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(guestId, invitedName, attendance, guestCount, message, userAgent).run();

  await env.DB.prepare(
    `UPDATE Guests
     SET rsvp_status = ?, rsvp_count = ?, last_rsvp = CURRENT_TIMESTAMP
     WHERE guest_id = ?`
  ).bind(attendance, guestCount, guestId).run();

  return {
    ok:true,
    guestId,
    invitedName,
    attendance,
    message
  };
}

async function updateGuestName(env, guestId, name) {
  const wanted = String(guestId || "").trim();
  const newName = normalizeName(name);
  if (!wanted) return {ok:false, error:"missing_guest_id"};
  if (!newName) return {ok:false, error:"missing_name"};
  const existing = await env.DB.prepare(
    "SELECT guest_id FROM Guests WHERE name = ? AND guest_id <> ? LIMIT 1"
  ).bind(newName, wanted).first();
  if (existing) return {ok:false, error:"guest_name_exists"};
  const guest = await env.DB.prepare(
    "SELECT guest_id, name FROM Guests WHERE guest_id = ? LIMIT 1"
  ).bind(wanted).first();
  if (!guest) return {ok:false, error:"guest_not_found"};
  await env.DB.batch([
    env.DB.prepare("UPDATE Guests SET name = ? WHERE guest_id = ?").bind(newName, wanted),
    env.DB.prepare("UPDATE RSVP SET guest_name = ? WHERE guest_id = ?").bind(newName, wanted)
  ]);
  return {ok:true, updated:true, guestId:wanted, oldName:String(guest.name || ""), name:newName};
}

async function deleteGuest(env, guestId) {
  const wanted = String(guestId || "").trim();
  if (!wanted) return {ok:false, error:"missing_guest_id"};
  const guest = await env.DB.prepare("SELECT guest_id, name, invitation_url FROM Guests WHERE guest_id = ? LIMIT 1").bind(wanted).first();
  if (!guest) return {ok:false, error:"guest_not_found"};
  await env.DB.batch([
    env.DB.prepare("DELETE FROM RSVP WHERE guest_id = ?").bind(wanted),
    env.DB.prepare("DELETE FROM Guests WHERE guest_id = ?").bind(wanted)
  ]);
  return {ok:true, deleted:true, guestId:wanted, name:String(guest.name || "")};
}

async function resetAll(env) {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM RSVP"),
    env.DB.prepare("DELETE FROM Guests")
  ]);
  return {ok:true, reset:true};
}

async function handleApi(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {status:204, headers:corsHeaders()});
  }

  if (request.method !== "GET" && request.method !== "POST") {
    return jsonResponse({ok:false,error:"method_not_allowed"},405);
  }

  const url = new URL(request.url);
  let params = {};

  if (request.method === "POST") {
    const contentType = request.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      try {
        params = await request.json();
      } catch {
        return jsonResponse({ok:false,error:"invalid_json"},400);
      }
    } else {
      const body = await request.text();
      params = Object.fromEntries(new URLSearchParams(body));
    }
  } else {
    params = Object.fromEntries(url.searchParams.entries());
  }

  const action = String(params.action || "").trim();

  try {
    let result;

    if (action === "create_guest" && request.method === "POST") {
      result = await createGuest(env, params);
    } else if (action === "rsvp" && request.method === "POST") {
      result = await saveRsvp(env, params);
    } else if (action === "update_guest_name") {
      result = await updateGuestName(env, params.guestId || params.g, params.name);
    } else if (action === "delete_guest") {
      result = await deleteGuest(env, params.guestId || params.g);
    } else if (action === "reset_all") {
      result = await resetAll(env);
    } else if (action === "get_guest") {
      result = await getGuest(env, params.guestId || params.g);
    } else if (action === "list_guests") {
      result = await listGuests(env);
    } else if (action === "list_links") {
      result = await listLinks(env);
    } else if (action === "find_guest") {
      result = await findGuest(env, params.name);
    } else {
      result = {ok:false,error:"invalid_action"};
    }

    return jsonResponse(result, result.ok === false && result.error === "invalid_action" ? 400 : 200);
  } catch (error) {
    console.error("Noora D1 API error:", error);
    return jsonResponse({
      ok:false,
      error:"database_error",
      detail:String(error && error.message || error)
    },500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api") {
      return handleApi(request, env);
    }

    const guestId = (url.searchParams.get("g") || url.searchParams.get("guest") || "").trim();
    if (!guestId || request.method !== "GET") {
      return proxyRequest(request);
    }

    const originResponse = await fetch(ORIGIN, {
      headers: {"User-Agent":"Noora-Preview-Worker"}
    });

    if (!originResponse.ok) return originResponse;

    let title = FALLBACK_TITLE;
    let description = FALLBACK_DESCRIPTION;

    try {
      const guestData = await getGuest(env, guestId);
      if (guestData.ok && guestData.guest) {
        const guest = guestData.guest;
        title = guest.ogTitle || ("تقدیم به " + guest.name + " عزیز");
        description = guest.ogDescription || FALLBACK_DESCRIPTION;
      }
    } catch (error) {
      console.error("Noora guest metadata error:", error);
    }

    const headers = new Headers(originResponse.headers);
    headers.set("Cache-Control","no-store");
    headers.set("Content-Type","text/html; charset=UTF-8");

    const rewriter = new HTMLRewriter()
      .on("head",{element(element){
        element.prepend(`<base href="${ORIGIN}">`,{html:true});
      }})
      .on("title",{element(element){element.setInnerContent(title);}})
      .on('meta[property="og:title"]',{element(element){element.setAttribute("content",title);}})
      .on('meta[property="og:description"]',{element(element){element.setAttribute("content",description);}})
      .on('meta[property="og:url"]',{element(element){element.setAttribute("content",url.toString());}})
      .on('meta[property="og:image"]',{element(element){element.setAttribute("content",IMAGE_URL);}})
      .on('meta[name="description"]',{element(element){element.setAttribute("content",description);}})
      .on('meta[name="twitter:title"]',{element(element){element.setAttribute("content",title);}})
      .on('meta[name="twitter:description"]',{element(element){element.setAttribute("content",description);}})
      .on('meta[name="twitter:image"]',{element(element){element.setAttribute("content",IMAGE_URL);}});

    return new Response(rewriter.transform(originResponse).body,{headers});
  }
};
