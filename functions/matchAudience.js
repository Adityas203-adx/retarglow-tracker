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

// Enhanced matching logic
function doesMatch(rules = {}, metadata = {}) {
  const domain = metadata.page_url ? extractDomain(metadata.page_url) : null;
  const pageUrl = metadata.page_url || "";
  const customMetadata = metadata.custom_metadata || {};

  // Match domain
  if (rules.domain) {
    const expectedDomains = Array.isArray(rules.domain) ? rules.domain : [rules.domain];
    if (!domain || !expectedDomains.includes(domain)) return false;
  }

  // Match page_url_contains
  if (rules.page_url_contains) {
    const patterns = Array.isArray(rules.page_url_contains)
      ? rules.page_url_contains
      : [rules.page_url_contains];

    const matched = patterns.some((substr) => pageUrl.includes(substr));
    if (!matched) return false;
  }

  // Match custom_metadata key-value pairs
  if (rules.custom_metadata && typeof rules.custom_metadata === "object") {
    for (const [key, expectedValue] of Object.entries(rules.custom_metadata)) {
      if (customMetadata[key] !== expectedValue) return false;
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
