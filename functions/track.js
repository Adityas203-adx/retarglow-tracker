const { createClient } = require("@supabase/supabase-js");
const fetch = require("node-fetch");

const supabase = createClient(
  "https://nandqoilqwsepborxkrz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg"
);

async function getGeoFromIP(ip) {
  try {
    const res = await fetch(`https://ipinfo.io/${ip}?token=d9a93a74769916`);
    if (!res.ok) return {};
    const json = await res.json();
    return {
      country: json.country || null,
      region: json.region || null,
      city: json.city || null
    };
  } catch (err) {
    return {};
  }
}

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

    const {
      custom_id,
      page_url,
      referrer,
      user_agent,
      device_type,
      browser,
      os,
      screen_resolution,
      custom_metadata,
      device_info,
      event: eventName
    } = body;

    const ip =
      event.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      event.headers["client-ip"] ||
      null;

    const geo = ip ? await getGeoFromIP(ip) : {};

    const { data, error } = await supabase.from("events").insert([
      {
        event: eventName || "viewPage",
        page_url,
        referrer,
        user_agent,
        ip_address: ip,
        custom_id,
        device_type,
        browser,
        os,
        screen_resolution,
        country: geo.country,
        region: geo.region,
        city: geo.city,
        custom_metadata: custom_metadata || {},
        device_info: device_info || {},
        os_name: device_info?.os_name || null,
        os_version: device_info?.os_version || null,
        browser_name: device_info?.browser_name || null,
        browser_version: device_info?.browser_version || null
      }
    ]);

    if (error) {
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
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Invalid request", error: err.message }),
    };
  }
};
