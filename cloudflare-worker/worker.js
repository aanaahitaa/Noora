const ORIGIN = "https://aanaahitaa.github.io/Noora/";
const GUEST_API = "https://script.google.com/macros/s/AKfycbwbAFhiYbNwpqxczEQzeQNbGm1yIYGveTBUvQ-Cu3zfKFKPdS8wcaNI4CdarzSmwolbuA/exec";
const FALLBACK_TITLE = "دعوت‌نامه جشن تولد یک‌سالگی نورا جان";
const IMAGE_URL = "https://aanaahitaa.github.io/Noora/assets/noora-cover.webp";

async function getGuest(guestId) {
  if (!guestId) return null;
  try {
    const apiUrl = new URL(GUEST_API);
    apiUrl.searchParams.set("action", "get_guest");
    apiUrl.searchParams.set("guestId", guestId);
    const response = await fetch(apiUrl, {
      cf: { cacheTtl: 0, cacheEverything: false }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data && data.ok && data.guest ? data.guest : null;
  } catch (_) {
    return null;
  }
}

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

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const guestId = (url.searchParams.get("g") || url.searchParams.get("guest") || "").trim();

    if (!guestId || request.method !== "GET") {
      return proxyRequest(request);
    }

    const guest = await getGuest(guestId);
    const title = guest?.ogTitle || (guest?.name ? `تقدیم به ${guest.name} عزیز` : FALLBACK_TITLE);
    const description = guest?.ogDescription || "دعوت‌نامه جشن تولد یک‌سالگی نورا جان";

    const originResponse = await fetch(ORIGIN, {
      headers: { "User-Agent": "Noora-Preview-Worker" }
    });

    if (!originResponse.ok) return originResponse;

    const headers = new Headers(originResponse.headers);
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    headers.set("Content-Type", "text/html; charset=UTF-8");

    const rewriter = new HTMLRewriter()
      .on("head", {
        element(element) {
          element.prepend(`<base href="${ORIGIN}">`, { html: true });
        }
      })
      .on("title", {
        element(element) { element.setInnerContent(title); }
      })
      .on('meta[property="og:title"]', {
        element(element) { element.setAttribute("content", title); }
      })
      .on('meta[property="og:description"]', {
        element(element) { element.setAttribute("content", description); }
      })
      .on('meta[property="og:url"]', {
        element(element) { element.setAttribute("content", url.toString()); }
      })
      .on('meta[property="og:image"]', {
        element(element) { element.setAttribute("content", IMAGE_URL); }
      })
      .on('meta[name="description"]', {
        element(element) { element.setAttribute("content", description); }
      })
      .on('meta[name="twitter:title"]', {
        element(element) { element.setAttribute("content", title); }
      })
      .on('meta[name="twitter:description"]', {
        element(element) { element.setAttribute("content", description); }
      })
      .on('meta[name="twitter:image"]', {
        element(element) { element.setAttribute("content", IMAGE_URL); }
      })
      .on(".greeting-text", {
        element(element) {
          if (guest?.name) element.setInnerContent(guest.name + " عزیز");
        }
      })
      .on("[data-guest-name]", {
        element(element) {
          if (guest?.name) element.setInnerContent(guest.name + " عزیز");
        }
      })
      .on("body", {
        element(element) {
          if (guest?.name) {
            element.append(`<script>window.__NOORA_GUEST_NAME=${JSON.stringify(String(guest.name))};</script>`, { html: true });
          }
        }
      });

    return new Response(rewriter.transform(originResponse).body, { headers });
  }
};
