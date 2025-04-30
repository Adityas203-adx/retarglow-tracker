// netlify/functions/matchAudience.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://nandqoilqwsepborxkrz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmRxb2lscXdzZXBib3J4a3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTkwODAsImV4cCI6MjA2MDkzNTA4MH0.FU7khFN_ESgFTFETWcyTytqcaCQFQzDB6LB5CzVQiOg');

export async function handler(req, res) {
  try {
    const { user_id, device, browser, country, region, city } = JSON.parse(req.body);

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
      return res.status(500).json({ message: 'Error matching audience' });
    }

    if (audiences.length === 0) {
      return res.status(404).json({ message: 'No audience match found' });
    }

    const matchedAudience = audiences[0]; // Assuming you want to return the first match

    console.log(`User ${user_id} matched to audience ${matchedAudience.id}`);

    return res.status(200).json({
      message: 'Audience matched successfully',
      audience: matchedAudience,
    });
  } catch (err) {
    console.error('Error matching audience:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
