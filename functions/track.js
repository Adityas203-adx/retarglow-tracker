const { createClient } = require("@supabase/supabase-js");
const fetch = require("node-fetch");

const supabase = createClient(
  "https://nandqoilqwsepborxkrz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg"
);

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: "Method Not Allowed",
    };
  }

  try {
    const body = JSON.parse(event.body);

    // Obfuscated keys from pixelserve.js
    const {
      a: custom_id,
      b: page_url,
      c: referrer,
      d: user_agent,
      e: device_type,
      f: browser,
      g: os,
      h: screen_resolution,
      i: custom_metadata,
    } = body;

    // Extract IP address
    const ip =
      event.headers["x-forwarded-for"]?.split(",")[0] ||
      event.headers["client-ip"] ||
      "unknown";

    // Location lookup via ipinfo.io
    let country = null,
      region = null,
      city = null;

    try {
      const res = await fetch(`https://ipinfo.io/${ip}?token=d9a93a74769916`);
      const geo = await res.json();
      country = geo.country || null;
      region = geo.region || null;
      city = geo.city || null;
    } catch (geoErr) {
      console.error("Geo lookup failed:", geoErr);
    }

    const { data, error } = await supabase.from("events").insert([
      {
        event: i?.event || "viewPage",
        page_url,
        referrer,
        user_agent,
        ip_address: ip,
        custom_id: custom_id || null,
        device_type,
        browser,
        os,
        screen_resolution,
        country,
        region,
        city,
        custom_metadata: i,
        device_info: {
          device_type,
          browser,
          os,
          screen_resolution,
          ...i,
        },
        os_name: os || null,
        browser_name: browser || null,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Database error", error }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Event logged", data }),
    };
  } catch (err) {
    console.error("Request error:", err);
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Invalid request", error: err.message }),
    };
  }
};
