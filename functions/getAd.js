const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://nandqoilqwsepborxkrz.supabase.co",
  "YOUR_SUPABASE_ANON_KEY"
);

exports.handler = async (event) => {
  console.log("=== Incoming Request ===");
  console.log("Method:", event.httpMethod);
  console.log("Body:", event.body);

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: "Method Not Allowed"
    };
  }

  try {
    const { page_url, country, custom_metadata } = JSON.parse(event.body);
    console.log("Parsed payload:", { page_url, country, custom_metadata });

    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active");

    if (error) {
      console.error("Supabase query error:", error);
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Supabase error", error })
      };
    }

    console.log("Loaded campaigns:", campaigns);

    const matched = campaigns.find((c) => {
      let rules = {};
      try {
        rules = typeof c.audience_rules === "string"
          ? JSON.parse(c.audience_rules)
          : c.audience_rules || {};
      } catch (e) {
        console.warn("Invalid JSON in audience_rules:", c.audience_rules);
      }

      const matchDomain = rules.domain ? page_url.includes(rules.domain) : true;

      const matchCountry = !c.target_countries ||
        c.target_countries.toLowerCase().split(",").includes(country.toLowerCase());

      console.log(`Campaign match check:`, {
        campaign: c.name,
        matchDomain,
        matchCountry
      });

      return matchDomain && matchCountry;
    });

    console.log("Matched Campaign:", matched);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ad_url: matched?.ad_url || null })
    };
  } catch (err) {
    console.error("Unhandled error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Server error", error: err.message })
    };
  }
};
