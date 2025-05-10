const { createClient } = require("@supabase/supabase-js");
const fetch = require("node-fetch");

const supabase = createClient(
  "https://nandqoilqwsepborxkrz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg"
);

exports.handler = async (event) => {
  const adName = event.queryStringParameters.ad_id;

  if (!adName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing ad_id" }),
    };
  }

  try {
    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("name", adName)
      .limit(1);

    const campaign = campaigns?.[0];

    if (error || !campaign) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Ad not found", error }),
      };
    }

    let redirectUrl = campaign.ad_url;
    const refOverride = campaign.referrer_override;

    if (refOverride) {
      const url = new URL(redirectUrl);
      url.searchParams.set("ref", refOverride);
      redirectUrl = url.toString();
    }

    // Extract IP and UA
    const ip =
      event.headers["x-forwarded-for"]?.split(",")[0] ||
      event.headers["client-ip"] ||
      "unknown";
    const ua = event.headers["user-agent"] || "";

    // Optional: bot filtering (basic)
    const isBot = /bot|crawl|spider|slurp|headless/i.test(ua);
    if (!isBot) {
      // Optional: add geo enrichment
      let country = null, region = null, city = null;
      try {
        const geoRes = await fetch(`https://ipinfo.io/${ip}?token=d9a93a74769916`);
        const geo = await geoRes.json();
        country = geo.country || null;
        region = geo.region || null;
        city = geo.city || null;
      } catch (geoErr) {}

      await supabase.from("clicks").insert([
        {
          ad_id: campaign.name,
          redirect_url: redirectUrl,
          ip_address: ip,
          user_agent: ua,
          country,
          region,
          city,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    return {
      statusCode: 302,
      headers: {
        Location: redirectUrl,
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*"
      },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error", error: err.message }),
    };
  }
};
