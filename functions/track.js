const { createClient } = require("@supabase/supabase-js");
const fetch = require("node-fetch");

const supabase = createClient(
  "https://nandqoilqwsepborxkrz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg"
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body);
    const { cid, u, r, ua, dt, b, os, sr, cm } = body;

    const ip =
      event.headers["x-forwarded-for"]?.split(",")[0] ||
      event.headers["client-ip"] ||
      "unknown";

    let country = null, region = null, city = null;
    try {
      const res = await fetch(`https://ipinfo.io/${ip}?token=d9a93a74769916`);
      const geo = await res.json();
      country = geo.country || null;
      region = geo.region || null;
      city = geo.city || null;
    } catch (geoErr) {
      console.error("Geo lookup failed:", geoErr.message);
    }

    
    const { data, error } = await supabase.from("events").insert([
      {
        event: "viewPage",
        page_url: u,
        referrer: r,
        user_agent: ua,
        ip_address: ip,
        custom_id: cid || null,
        device_type: dt === "M" ? "Mobile" : "Desktop",
        browser: b || null,
        os: os || null,
        screen_resolution: sr || null,
        country,
        region,
        city,
        custom_metadata: cm || {},
        device_info: {
          device_type: dt === "M" ? "Mobile" : "Desktop",
          browser: b || null,
          os: os || null,
          screen_resolution: sr || null,
          ...cm
        },
        os_name: os || null,
        browser_name: b || null
      }
    ]);

    if (error) {
      console.error("Supabase insert error:", error.message);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Database error", error: error.message })
      };
    }

    
    try {
      const adRes = await fetch("https://retarglow.com/getad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ u, country, cm })
      });

      const { ad_url } = await adRes.json();

      if (ad_url) {
        await fetch(`https://retarglow.com/redirect?url=${encodeURIComponent(ad_url)}`);
      }
    } catch (adErr) {
      console.error("Ad injection failed:", adErr.message);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Event logged", data })
    };
  } catch (err) {
    console.error("Request error:", err.message);
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Invalid request", error: err.message })
    };
  }
};
