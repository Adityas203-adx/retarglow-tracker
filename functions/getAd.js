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

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "OK"
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: "Method Not Allowed"
    };
  }

  try {
    const { page_url, country, custom_metadata } = JSON.parse(event.body);

    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", true); // Use boolean true, not "active"

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    const matched = campaigns.find((c) => {
      const rules = c.audience_rules || {};
      const targetCountries = c.target_countries || [];

      const matchDomain = rules.domain
        ? page_url.includes(rules.domain)
        : true;

      const matchCountry = targetCountries.length === 0 ||
        targetCountries.includes(country);

      return matchDomain && matchCountry;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ad_url: matched?.ad_url || null })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: err.message,
        debug: {
          input: event.body
        }
      })
    };
  }
};
