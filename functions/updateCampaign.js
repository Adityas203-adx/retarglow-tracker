const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://YOUR_SUPABASE_PROJECT.supabase.co",
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { id, ...fieldsToUpdate } = body;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing campaign ID" }),
      };
    }

    const { data, error } = await supabase
      .from("campaigns")
      .update(fieldsToUpdate)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Update error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to update campaign" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Campaign updated", data }),
    };
  } catch (err) {
    console.error("Parse error:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON payload" }),
    };
  }
};
