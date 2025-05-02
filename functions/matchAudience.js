const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://nandqoilqwsepborxkrz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg"
);

// Utility: normalize domain from full page URL
const extractDomain = (url) => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return null;
  }
};

// Evaluate if audience_rules match user metadata
function doesMatch(rules = {}, metadata = {}) {
  for (const key in rules) {
    const ruleValue = rules[key];
    let userValue = metadata[key];

    if (key === "domain" && metadata.page_url) {
      userValue = extractDomain(metadata.page_url);
    }

    if (!userValue) return false;

    if (Array.isArray(ruleValue)) {
      if (!ruleValue.includes(userValue)) return false;
    } else if (ruleValue !== userValue) {
      return false;
    }
  }
  return true;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const metadata = JSON.parse(event.body);

    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;

    const matchedCampaigns = campaigns.filter((campaign) =>
      doesMatch(campaign.audience_rules, metadata)
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchedCampaigns }),
    };
  } catch (err) {
    console.error("matchAudience error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
