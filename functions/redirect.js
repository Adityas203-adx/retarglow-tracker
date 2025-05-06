const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://nandqoilqwsepborxkrz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg" // Use your full anon key
);

exports.handler = async (event) => {
  const ad_id = event.queryStringParameters.ad_id;

  if (!ad_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing ad_id in query" }),
    };
  }

  try {
    // Fetch the campaign's redirect URL
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("ad_url")
      .eq("id", ad_id)
      .single();

    if (error || !campaign) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Ad not found", error }),
      };
    }

    const redirect_url = campaign.ad_url;
    const ip_address = event.headers["x-forwarded-for"] || "unknown";
    const user_agent = event.headers["user-agent"] || "";
    const referrer = event.headers["referer"] || "";
    const timestamp = new Date().toISOString();

    // Insert into clicks table
    const { error: insertError } = await supabase.from("clicks").insert([
      {
        ad_id,
        redirect_url,
        ip_address,
        user_agent,
        referrer,
        timestamp,
        user_id: "", // Optional: populate if available
      },
    ]);

    if (insertError) {
      console.error("Failed to insert click:", insertError.message);
    }

    return {
      statusCode: 302,
      headers: {
        Location: redirect_url,
      },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Server error",
        error: err.message,
      }),
    };
  }
};
