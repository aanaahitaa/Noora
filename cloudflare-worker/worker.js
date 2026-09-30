const ORIGIN = "https://aanaahitaa.github.io/Noora/";
const FALLBACK_TITLE = "دعوت‌نامه جشن تولد یک‌سالگی نورا جان";
const IMAGE_URL = "https://aanaahitaa.github.io/Noora/assets/noora-cover.webp";
const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbwbAFhiYbNwpqxczEQzeQNbGm1yIYGveTBUvQ-Cu3zfKFKPdS8wcaNI4CdarzSmwolbuA/exec";

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

async function fetchWithRetry(url, options = {}, attempts = 2) {
  let lastError = null;
  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(url, {...options, signal: controller.signal});
      clearTimeout(timer);
      if (response.ok) return response;
      lastError = new Error("upstream_http_" + response.status);
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
    }
  }
  throw lastError || new Error("upstream_failed");
}

async function handleApi(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, {status: 204, headers: corsHeaders()});
  }
  if (request.method !== "GET" && request.method !== "POST") {
    return jsonResponse({ok:false, error:"method_not_allowed"},405);
  }

  const incoming = new URL(request.url);
  const action = (incoming.searchParams.get("action") || "").trim();

  // Proxy guest creation to Apps Script so the admin panel can use one
  // stable Worker endpoint instead of posting directly to Google.
  if (request.method === "POST") {
    try {
      const body = await request.text();
      const response = await fetch(GAS_ENDPOINT, {
        method: "POST",
        headers: {"Content-Type": request.headers.get("Content-Type") || "application/x-www-form-urlencoded"},
        body
      });
      const responseBody = await response.text();
      return new Response(responseBody, {
        status: response.status,
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "no-store"
        }
      });
    } catch (error) {
      return jsonResponse({ok:false,error:"upstream_unavailable"},504);
    }
  }
  const allowedActions = new Set(["list_guests","list_links","find_guest","get_guest","reset_all"]);
  if (!allowedActions.has(action)) {
    return jsonResponse({ok:false,error:"invalid_action"},400);
  }

  const upstream = new URL(GAS_ENDPOINT);
  for (const [key,value] of incoming.searchParams) {
    if (key === "callback" || key === "t" || key === "api" || key === "fresh") continue;
    upstream.searchParams.set(key,value);
  }

  const fresh = incoming.searchParams.get("fresh") === "1";
  const cacheable = !fresh && ["list_guests","list_links","find_guest","get_guest"].includes(action);

  try {
    const response = await fetchWithRetry(upstream.toString(), {
      ...(fresh ? {cache:"no-cache"} : {}),
      ...(cacheable ? {cf:{cacheTtl:300,cacheEverything:true}} : {})
    }, 2);

    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type":"application/json; charset=UTF-8",
        "Access-Control-Allow-Origin":"*",
        "Access-Control-Allow-Methods":"GET, POST, OPTIONS",
        "Access-Control-Allow-Headers":"Content-Type",
        "Cache-Control":cacheable ? "public, max-age=300, stale-while-revalidate=60" : "no-store"
      }
    });
  } catch (error) {
    return jsonResponse({
      ok:false,
      error:error && error.name === "AbortError" ? "upstream_timeout" : "upstream_unavailable"
    },504);
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api") {
      return handleApi(request);
    }

    const guestId = (url.searchParams.get("g") || url.searchParams.get("guest") || "").trim();
    if (!guestId || request.method !== "GET") return proxyRequest(request);

    const originResponse = await fetch(ORIGIN, {
      headers: {"User-Agent":"Noora-Preview-Worker"}
    });
    if (!originResponse.ok) return originResponse;

    let title = FALLBACK_TITLE;
    let description = "دعوت‌نامه جشن تولد یک‌سالگی نورا جان";

    // Fetch guest-specific Open Graph metadata for link previews.
    try {
      const guestApi = new URL(GAS_ENDPOINT);
      guestApi.searchParams.set("action", "get_guest");
      guestApi.searchParams.set("guestId", guestId);

      const guestResponse = await fetchWithRetry(guestApi.toString(), {
        cf: {cacheTtl: 300, cacheEverything: true}
      }, 2);

      if (guestResponse.ok) {
        const guestData = await guestResponse.json();
        if (guestData && guestData.ok && guestData.guest) {
          const guest = guestData.guest;
          title = String(guest.ogTitle || "").trim() || ("تقدیم به " + String(guest.name || "").trim() + " عزیز");
          description = String(guest.ogDescription || "").trim() || description;
        }
      }
    } catch (error) {
      // Keep the public fallback metadata if the guest lookup is unavailable.
    }
    const headers = new Headers(originResponse.headers);
    headers.set("Cache-Control","public, max-age=60, s-maxage=300");
    headers.set("Content-Type","text/html; charset=UTF-8");

    const rewriter = new HTMLRewriter()
      .on("head",{element(element){element.prepend(`<base href="${ORIGIN}">`,{html:true});}})
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