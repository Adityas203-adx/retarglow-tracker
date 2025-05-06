const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://nandqoilqwsepborxkrz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg"
);

exports.handler = async (event) => {
  // Handle preflight OPTIONS request
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
    const safeCountry = (country || "").toLowerCase();
    const safePageUrl = page_url || "";

    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active");

    if (error) {
      console.error("Supabase error:", error);
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Error loading campaigns", error })
      };
    }

    const matched = campaigns.find((c) => {
      const rules = c.audience_rules || {};
      const matchDomain = rules.domain ? safePageUrl.includes(rules.domain) : true;
      const matchCountry =
        !c.country_targeting ||
        c.country_targeting.toLowerCase().split(",").includes(safeCountry);

      return matchDomain && matchCountry;
    });

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ad_url: matched?.ad_url || null })
    };
  } catch (err) {
    console.error("getAd function error:", err);
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Invalid Request", error: err.message })
    };
  }
};
