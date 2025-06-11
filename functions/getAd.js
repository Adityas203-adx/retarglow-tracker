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
    const body = JSON.parse(event.body);

    // 👇 Fallback support for u + cm fields
    const page_url = body.page_url || body.u || "";
    const country = body.country || null;
    const custom_metadata = body.custom_metadata || body.cm || {};
    const _r = custom_metadata._r;

    console.log("📥 getAd request received:", { page_url, country, _r });

    // 🔁 Step 1: Check if user was previously tracked (retargeting)
    let isReturningVisitor = false;
    if (_r) {
      const { data: pastEvents, error: eventErr } = await supabase
        .from("events")
        .select("id")
        .eq("custom_metadata->_r", _r)
        .limit(1);

      if (eventErr) console.warn("⚠️ Event fetch error:", eventErr.message);

      isReturningVisitor = pastEvents && pastEvents.length > 0;
    }

    // 🎯 Step 2: Fetch campaigns
    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", true);

    if (error) throw new Error(`Supabase error: ${error.message}`);

    // 🧠 Step 3: Match logic
    const matched = campaigns.find((c) => {
      const rules = c.audience_rules || {};
      const countries = c.target_countries || [];

      const matchDomain = rules.domain
        ? page_url.includes(rules.domain)
        : true;

      const matchCountry = countries.length === 0 || countries.includes(country);

      const matchBrowser = rules.browser
        ? custom_metadata.b === rules.browser
        : true;

      const matchDevice = rules.device_type
        ? custom_metadata.dt === rules.device_type
        : true;

      const matchRetargeting =
        c.audience_type === "retarget" ? isReturningVisitor : true;

      return matchDomain && matchCountry && matchBrowser && matchDevice && matchRetargeting;
    });

    if (matched) {
      console.log("✅ Matched campaign:", matched.name, matched.ad_url);
    } else {
      console.warn("🚫 No campaign matched for", { page_url, country, custom_metadata });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ad_url: matched?.ad_url || null })
    };
  } catch (err) {
    console.error("❌ getAd Error:", err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: err.message
      })
    };
  }
};
