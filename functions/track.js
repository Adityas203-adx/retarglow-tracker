const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://nandqoilqwsepborxkrz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg'
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const data = JSON.parse(event.body);

    const {
      event_type = 'view',
      page_url,
      referrer,
      user_agent,
      device_type,
      browser,
      os,
      screen_resolution,
      custom_id,
      metadata = {},
    } = data;

    const ip =
      event.headers['x-forwarded-for'] ||
      event.headers['client-ip'] ||
      event.headers['x-real-ip'] ||
      'unknown';

    const geo = {
      country: event.headers['x-country'] || null,
      region: event.headers['x-region'] || null,
      city: event.headers['x-city'] || null,
    };

    const insertData = {
      event: event_type,
      timestamp: new Date().toISOString(),
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
      custom_metadata: metadata,
    };

    const { error } = await supabase.from('events').insert([insertData]);

    if (error) {
      console.error('Supabase insert error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Database error', error }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('Error parsing request:', err);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Bad Request', error: err.message }),
    };
  }
};
