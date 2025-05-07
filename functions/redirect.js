const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://nandqoilqwsepborxkrz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg"
);

exports.handler = async (event) => {
  const ad_id = event.queryStringParameters?.ad_id;

  if (!ad_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing ad_id in query" }),
    };
  }

  try {
    // Fetch ad_url by matching on 'name' column
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("ad_url")
      .eq("name", ad_id)
      .single();

    if (error || !campaign) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Ad not found", error }),
      };
    }

    const redirect_url = campaign.ad_url;
    const ip_address = event.headers["x-forwarded-for"] || null;
    const user_agent = event.headers["user-agent"] || null;
    const referrer = event.headers["referer"] || null;

    // Insert the click record
    await supabase.from("clicks").insert([
      {
        ad_id,
        redirect_url,
        ip_address,
        user_agent,
        referrer,
      },
    ]);

    return {
      statusCode: 302,
      headers: {
        Location: redirect_url,
      },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error", error: err.message }),
    };
  }
};
