const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://nandqoilqwsepborxkrz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg" // Replace with your real anon key
);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const {
      page_url,
      referrer,
      country,
      region,
      city,
      custom_metadata,
    } = JSON.parse(event.body);

    // Fetch active campaigns
    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active");

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Error loading campaigns", error }),
      };
    }

    // Filter based on targeting
    const matchedCampaign = campaigns.find((campaign) => {
      const rules = campaign.audience_rules || {};
      const countries = (campaign.country_targeting || "").split(",").map(c => c.trim().toLowerCase());

      const domainMatch = rules.domain
        ? page_url.includes(rules.domain)
        : true;

      const urlMatch = rules.url_contains
        ? page_url.includes(rules.url_contains)
        : true;

      const countryMatch =
        countries.length === 0 || countries.includes((country || "").toLowerCase());

      return domainMatch && urlMatch && countryMatch;
    });

    if (!matchedCampaign) {
      return {
        statusCode: 200,
        body: JSON.stringify({ ad_url: null }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ad_url: matchedCampaign.ad_url }),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid Request", error: err.message }),
    };
  }
};
