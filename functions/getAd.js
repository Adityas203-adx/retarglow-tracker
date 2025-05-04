const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://nandqoilqwsepborxkrz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg" // truncated
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
      .eq("status", "active");

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Error loading campaigns", error })
      };
    }

    const matched = campaigns.find((c) => {
      const rules = c.audience_rules || {};
      const matchDomain = rules.domain
        ? page_url.includes(rules.domain)
        : true;
      const matchCountry =
        !c.country_targeting ||
        c.country_targeting.toLowerCase().split(",").includes(country.toLowerCase());

      return matchDomain && matchCountry;
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ad_url: matched?.ad_url || null })
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid Request", error: err.message })
    };
  }
};
