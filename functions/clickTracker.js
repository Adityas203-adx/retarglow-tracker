const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://nandqoilqwsepborxkrz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg"
);

exports.handler = async (event) => {
  const { searchParams } = new URL(event.rawUrl);
  const ad_id = searchParams.get("ad_id");
  const user_id = searchParams.get("_r"); // pulled from tracking pixel
  const redirect = searchParams.get("redirect");

  if (!redirect) {
    return {
      statusCode: 400,
      body: "Missing redirect URL",
    };
  }

  const ip =
    event.headers["x-forwarded-for"]?.split(",")[0] ||
    event.headers["client-ip"] ||
    "unknown";

  try {
    await supabase.from("clicks").insert([
      {
        ad_id,
        user_id,
        redirect_url: redirect,
        ip_address: ip,
        timestamp: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error("Click log error:", err.message);
    // Fail silently and redirect anyway
  }

  return {
    statusCode: 302,
    headers: {
      Location: redirect,
    },
  };
};
