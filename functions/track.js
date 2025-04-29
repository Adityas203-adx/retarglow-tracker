const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const UAParser = require('ua-parser-js');

// Supabase config
const SUPABASE_URL = 'https://nandqoilqwsepborxkrz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg'; // ← safer to use environment variables
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// GA4 config
const GA4_MEASUREMENT_ID = 'G-L2EXMRLXBT';
const GA4_API_SECRET = 'p7mHsi_yTd-nz20MDvrk3Q';

exports.handler = async (event) => {
  const headers = event.headers;
  const params = event.queryStringParameters || {};
  const body = JSON.parse(event.body || '{}');
  const ip = headers['x-forwarded-for'] || '0.0.0.0';
  const userAgent = headers['user-agent'] || '';

  // Retrieve or generate user ID from localStorage (browser side)
  let userId = '';  
  if (typeof window !== 'undefined' && window.localStorage) {
    userId = localStorage.getItem('retarglow_id');
  }

  if (!userId) {
    userId = uuidv4();
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('retarglow_id', userId); // Save to localStorage
    }
  }

  // Parse user-agent for OS, device, browser
  const ua = new UAParser(userAgent);
  const deviceType = ua.getDevice().type || 'desktop';
  const os = ua.getOS();
  const browser = ua.getBrowser();

  // Get website the pixel was loaded on
  const website = headers.referer || '';

  const metadata = {
    ...body,
    ...params,
    website,
    os_name: os.name || '',
    os_version: os.version || '',
    browser_name: browser.name || '',
    browser_version: browser.version || '',
    device_type: deviceType,
  };

  // Check device type and assign values
  const deviceInfo = {
    device_type: deviceType,
    device_model: ua.getDevice().model || '',
    os_name: os.name || '',
    os_version: os.version || '',
    browser_name: browser.name || '',
    browser_version: browser.version || '',
    is_mobile: deviceType === 'mobile',
    is_tablet: deviceType === 'tablet',
    is_desktop: deviceType === 'desktop',
  };

  // Collect event data
  const eventData = {
    event: params.event || 'page_view', 
    uxid: userId,
    page_url: website,
    referrer: headers.referer || '',
    user_agent: userAgent,
    ip_address: ip,
    country: '', region: '', city: '', // Optional GeoIP lookup
    timestamp: new Date().toISOString(),
    custom_metadata: metadata,
    device_info: deviceInfo, // Capture device info
  };

  // Insert the event into Supabase
  try {
    const { data, error } = await supabase.from('events').insert([{
      user_id: userId,
      event: eventData.event,
      timestamp: eventData.timestamp,
      page_url: eventData.page_url,
      referrer: eventData.referrer,
      user_agent: eventData.user_agent,
      ip_address: eventData.ip_address,
      country: eventData.country,
      region: eventData.region,
      city: eventData.city,
      custom_metadata: eventData.custom_metadata,
      device_info: eventData.device_info, // Save device info
    }]);

    if (error) {
      console.error('Error inserting data into Supabase:', error);
    } else {
      console.log('Event data successfully logged to Supabase:', data);
    }

  } catch (err) {
    console.error('Error logging to Supabase:', err);
  }

  // Send to Google Analytics (GA4)
  try {
    const response = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`, {
      method: 'POST',
      body: JSON.stringify({
        client_id: userId,
        events: [{
          name: eventData.event,
          params: eventData.custom_metadata,
        }],
      }),
    });
    const result = await response.json();
    console.log('GA4 tracking response:', result);
  } catch (error) {
    console.error('Error sending data to GA4:', error);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'tracked', user_id: userId }),
  };
};
