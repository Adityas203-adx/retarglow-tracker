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

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("name", ad_name)
    .single();

  if (error || !campaign) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Ad not found",
        error,
      }),
    };
  }

  const ip = event.headers["x-forwarded-for"] || event.headers["client-ip"] || "unknown";
  const user_agent = event.headers["user-agent"] || "unknown";
  const user_id = event.headers["x-user-id"] || null; // optional custom header

  // Log click to Supabase `clicks` table
  await supabase.from("clicks").insert([
    {
      ad_id: campaign.name,
      redirect_url: campaign.ad_url,
      user_id,
      ip_address: ip,
      timestamp: new Date().toISOString(),
    },
  ]);

  return {
    statusCode: 302,
    headers: {
      Location: campaign.ad_url,
    },
    body: "",
  };
};
