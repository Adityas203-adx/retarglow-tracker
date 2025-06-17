const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://nandqoilqwsepborxkrz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg"
);

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const page_url = body.page_url || body.u || "";
    const country = body.country || null;
    const cm = body.custom_metadata || body.cm || {};
    const _r = cm._r;

    if (!page_url || !_r) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ad_url: null, error: "Missing page_url or _r" })
      };
    }

    console.log("📥 Incoming getAd request:", { page_url, country, _r });

   
    let isReturningVisitor = false;
    const { data: events, error: eErr } = await supabase
      .from("events")
      .select("id")
      .eq("custom_metadata->_r", _r)
      .limit(1);

    if (eErr) console.warn("⚠️ Event fetch error:", eErr.message);
    isReturningVisitor = events?.length > 0;

   
    const { data: campaigns, error: cErr } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", true);

    if (cErr) throw new Error(`Supabase error: ${cErr.message}`);

  
    const matched = campaigns.find((c) => {
      const rules = c.audience_rules || {};
      const countries = c.target_countries || [];

      const matchDomain = rules.domain ? page_url.includes(rules.domain) : true;
      const matchCountry = countries.length === 0 || countries.includes(country);
      const matchBrowser = rules.browser ? cm.b === rules.browser : true;
      const matchDevice = rules.device_type ? cm.dt === rules.device_type : true;

      const matchRetargeting =
        !("audience_type" in c) || c.audience_type !== "retarget" || isReturningVisitor;

      return matchDomain && matchCountry && matchBrowser && matchDevice && matchRetargeting;
    });

    const adUrl = matched?.ad_url
      ? matched.ad_url.replace("{{_r}}", encodeURIComponent(_r))
      : null;

    if (matched) {
      console.log("✅ Campaign matched:", matched.name);
    } else {
      console.warn("🚫 No matching campaign.");
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ad_url: adUrl })
    };

  } catch (err) {
    console.error("❌ getAd error:", err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ad_url: null, error: err.message })
    };
  }
};
