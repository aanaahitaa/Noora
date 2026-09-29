const ORIGIN = "https://aanaahitaa.github.io/Noora/";
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

    // Send the HTML as soon as the origin responds. Guest data is fetched
    // client-side by script.js so a slow Google Apps Script call cannot block first paint.
    const originResponse = await fetch(ORIGIN, {
      headers: { "User-Agent": "Noora-Preview-Worker" }
    });

    const title = FALLBACK_TITLE;
    const description = "دعوت‌نامه جشن تولد یک‌سالگی نورا جان";

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

    return new Response(rewriter.transform(originResponse).body, { headers });
  }
};
