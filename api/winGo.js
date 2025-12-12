// api/winGo.js
export default async function handler(req, res) {
  try {
    const targetAPI = "https://okwin05.com/saas-api/lotterySsc/getSscHistory?lotteryCode=WinGo_30S&num=1";

    const response = await fetch(targetAPI, {
      method: "GET",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "winGo-backend/1.0"
      }
    });

    const contentType = response.headers.get("content-type") || "";

    // Try to parse JSON safely; if HTML/text returned, capture it for debugging
    let remote;
    if (contentType.includes("application/json") || contentType.includes("text/json")) {
      remote = await response.json();
    } else {
      // fallback: try as text then attempt JSON.parse
      const txt = await response.text();
      try {
        remote = JSON.parse(txt);
      } catch (e) {
        // Not JSON — return the raw text (truncated) so we can debug easily
        const sample = txt.length > 200 ? txt.slice(0, 200) + " ... (truncated)" : txt;
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res.status(502).json({
          success: false,
          error: "Upstream returned non-JSON",
          remoteContentSample: sample
        });
      }
    }

    // Normalise different shapes — WinGo often returns { code, data: [ ... ] }
    let period = null;
    let number = null;
    // Common path: remote.data is an array with latest at index 0
    if (Array.isArray(remote?.data) && remote.data.length > 0) {
      const first = remote.data[0];
      // try common keys
      period = first.issue ?? first.period ?? first.periodNo ?? first.id ?? null;
      // number may be a numeric or string, sometimes comma-separated; extract first integer
      let rawNum = first.number ?? first.openNumber ?? first.result ?? first.value ?? null;
      if (rawNum !== null && rawNum !== undefined) {
        const s = String(rawNum);
        const m = s.match(/\d+/);
        number = m ? parseInt(m[0], 10) : null;
      }
    } else if (remote?.data && typeof remote.data === "object") {
      // sometimes data is a single object
      const d = remote.data;
      period = d.issue ?? d.period ?? null;
      let rawNum = d.number ?? d.openNumber ?? d.result ?? null;
      if (rawNum !== null && rawNum !== undefined) {
        const s = String(rawNum);
        const m = s.match(/\d+/);
        number = m ? parseInt(m[0], 10) : null;
      }
    } else {
      // fallback: inspect top-level keys
      if (Array.isArray(remote)) {
        const first = remote[0];
        period = first?.issue ?? first?.period ?? null;
        let rawNum = first?.number ?? first?.openNumber ?? first?.result ?? null;
        if (rawNum !== undefined) {
          const s = String(rawNum);
          const m = s.match(/\d+/);
          number = m ? parseInt(m[0], 10) : null;
        }
      }
    }

    // final sanity: if still null, return useful remote snapshot for debugging
    if (number === null && period === null) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(502).json({
        success: false,
        error: "Could not locate period/number in upstream response",
        upstreamSample: remote
      });
    }

    // compute Big/Small (example: >=5 Big, else Small)
    const bigSmall = (typeof number === "number") ? (number >= 5 ? "BIG" : "SMALL") : null;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).json({
      success: true,
      source: "WinGo_30S",
      period,
      number,
      bigSmall,
      raw: remote // small normalized raw so client can inspect if needed
    });

  } catch (err) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(500).json({
      success: false,
      error: "Server exception",
      details: String(err)
    });
  }
}
