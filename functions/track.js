const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
const cookie = require('cookie');

// Supabase config
const SUPABASE_URL = 'https://nandqoilqwsepborxkrz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// GA4 config
const GA4_MEASUREMENT_ID = 'G-L2EXMRLXBT';
const GA4_API_SECRET = 'p7mHsi_yTd-nz20MDvrk3Q';

exports.handler = async (event) => {
  const headers = event.headers;
  const params = event.queryStringParameters;
  const body = JSON.parse(event.body || '{}');
  const ip = headers['x-forwarded-for'] || '0.0.0.0';
  const userAgent = headers['user-agent'] || '';
  const cookies = cookie.parse(headers.cookie || '');
  
  let userId = cookies.retarglow_id;
  if (!userId) userId = uuidv4();

  // Set cookie
  const setCookie = `retarglow_id=${userId}; Path=/; HttpOnly; Max-Age=31536000`;

  const metadata = {
    ...body,
    ...params,
  };

  const insertData = {
    user_id: userId,
    event: params.event || 'page_view',
    timestamp: new Date().toISOString(),
    page_url: headers.referer || '',
    referrer: headers.origin || '',
    user_agent: userAgent,
    ip_address: ip,
    country: '', region: '', city: '',
    custom_metadata: metadata,
  };

  await supabase.from('events').insert(insertData);

  // Send to GA4
  await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`, {
    method: 'POST',
    body: JSON.stringify({
      client_id: userId,
      events: [{ name: insertData.event, params: metadata }],
    }),
  });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': setCookie,
    },
    body: JSON.stringify({ status: 'tracked', user_id: userId }),
  };
};
