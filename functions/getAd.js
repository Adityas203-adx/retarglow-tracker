const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://nandqoilqwsepborxkrz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg"
);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { page_url, country, custom_metadata } = JSON.parse(event.body);

    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", true); // status is boolean

    if (error) {
      console.error("Supabase Error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Error loading campaigns", error })
      };
    }

    const matched = campaigns.find((c) => {
      // Handle audience_rules parsing
      let rules = {};
      try {
        rules = typeof c.audience_rules === "string"
          ? JSON.parse(c.audience_rules)
          : c.audience_rules || {};
      } catch (_) {
        rules = {};
      }

      // Domain match
      const matchDomain = rules.domain
        ? page_url.includes(rules.domain)
        : true;

      // Country match
      const tc = c.target_countries;
      let matchCountry = true;
      if (tc) {
        if (Array.isArray(tc)) {
          matchCountry = tc.map((x) => x.toLowerCase()).includes(country.toLowerCase());
        } else if (typeof tc === "string") {
          matchCountry = tc.toLowerCase().split(",").includes(country.toLowerCase());
        }
      }

      return matchDomain && matchCountry;
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // CORS support
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ ad_url: matched?.ad_url || null })
    };
  } catch (err) {
    console.error("Handler Error:", err);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ message: "Invalid Request", error: err.message })
    };
  }
};
