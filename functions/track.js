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
    const {
      page_url,
      referrer,
      user_agent,
      device_info,
      event: eventName,
      custom_id,
      screen_resolution,
    } = body;

    // Extract IP address from headers
    const ip =
      event.headers["x-forwarded-for"]?.split(",")[0] ||
      event.headers["client-ip"] ||
      null;

    // Get geolocation data from IP
    let geo = {};
    if (ip) {
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
        geo = await geoRes.json();
      } catch (geoErr) {
        console.error("Geo lookup failed:", geoErr.message);
      }
    }

    const { country_name, region, city } = geo;

    const { data, error } = await supabase.from("events").insert([
      {
        event: eventName || "viewPage",
        page_url,
        referrer,
        user_agent,
        ip_address: ip,
        custom_id,
        screen_resolution,
        country: country_name || null,
        region: region || null,
        city: city || null,
        device_info: device_info || {},
        device_type: device_info?.device_type || null,
        os_name: device_info?.os_name || null,
        browser_name: device_info?.browser_name || null,
        browser_version: device_info?.browser_version || null,
      },
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
