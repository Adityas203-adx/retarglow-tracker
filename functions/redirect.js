const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://nandqoilqwsepborxkrz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg"
);

exports.handler = async (event) => {
  const ad_name = event.queryStringParameters.ad_id;

  if (!ad_name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing ad_id" }),
    };
  }

  try {
    // Get campaign by name
    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("name", ad_name)
      .limit(1);

    const campaign = campaigns && campaigns.length > 0 ? campaigns[0] : null;

    if (error || !campaign) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Ad not found",
          error,
        }),
      };
    }

    const redirectUrl = campaign.ad_url;

    // Log the click
    const ip =
      event.headers["x-forwarded-for"] ||
      event.headers["client-ip"] ||
      event.headers["x-real-ip"] ||
      "unknown";

    await supabase.from("clicks").insert([
      {
        ad_id: campaign.name,
        redirect_url: redirectUrl,
        ip_address: ip,
        timestamp: new Date().toISOString(),
      },
    ]);

    return {
      statusCode: 302,
      headers: {
        Location: redirectUrl,
      },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error", error: err.message }),
    };
  }
};
