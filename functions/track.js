const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
const cookie = require('cookie');
const UAParser = require('ua-parser-js');

// Supabase config
const SUPABASE_URL = 'https://nandqoilqwsepborxkrz.supabase.co';
const SUPABASE_KEY = 'your_supabase_key_here'; // ← safer with env vars
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// GA4 config
const GA4_MEASUREMENT_ID = 'G-L2EXMRLXBT';
const GA4_API_SECRET = 'p7mHsi_yTd-nz20MDvrk3Q';

exports.handler = async (event) => {
  const headers = event.headers;
  const params = event.queryStringParameters || {};
  const body = JSON.parse(event.body || '{}');
  const ip = headers['x-forwarded-for'] || '0.0.0.0';
  const userAgent = headers['user-agent'] || body.user_agent || '';
  const cookies = cookie.parse(headers.cookie || '');

  // Generate or retrieve user ID
  let userId = cookies.retarglow_id;
  if (!userId) userId = uuidv4();

  // Set cookie
  const setCookie = `retarglow_id=${userId}; Path=/; HttpOnly; Max-Age=31536000`;

  // Parse user-agent for OS, device, browser
  const ua = new UAParser(userAgent);
  const deviceType = ua.getDevice().type || 'desktop';
  const os = ua.getOS();
  const browser = ua.getBrowser();

  // Use body.page_url if provided, else fallback
  const website = body.page_url || headers.referer || '';

  const metadata = {
    ...body,
    website,
    os_name: os.name || '',
    os_version: os.version || '',
    browser_name: browser.name || '',
    browser_version: browser.version || '',
    device_type: deviceType,
  };

  const insertData = {
    user_id: userId,
    event: params.event || 'page_view',
    timestamp: new Date().toISOString(),
    page_url: website,
    referrer: body.referrer || headers.origin || '',
    user_agent: userAgent,
    ip_address: ip,
    country: '', region: '', city: '', // Later GeoIP upgrade
    custom_metadata: metadata,
  };

  // Save to Supabase
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
