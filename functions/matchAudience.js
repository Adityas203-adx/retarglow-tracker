// netlify/functions/matchAudience.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://nandqoilqwsepborxkrz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg');

export async function handler(event, context) {
  try {
    const { user_id, device, browser, country, region, city } = JSON.parse(event.body);

    // Fetch relevant audiences from Supabase based on user attributes
    const { data: audiences, error } = await supabase
      .from('audiences')
      .select('*')
      .eq('device', device)
      .eq('browser', browser)
      .eq('country', country)
      .eq('region', region)
      .eq('city', city);

    if (error) {
      console.error('Error fetching audiences:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error matching audience' }),
      };
    }

    if (audiences.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No audience match found' }),
      };
    }

    const matchedAudience = audiences[0]; // Assuming you want to return the first match

    console.log(`User ${user_id} matched to audience ${matchedAudience.id}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Audience matched successfully',
        audience: matchedAudience,
      }),
    };
  } catch (err) {
    console.error('Error matching audience:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
}
