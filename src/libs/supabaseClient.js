const { createClient } = require('@supabase/supabase-js');

function supabaseClient(accessToken) {
  return createClient(
    'https://gxhnuzpfinqrbzsieend.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aG51enBmaW5xcmJ6c2llZW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzMzNTgsImV4cCI6MjA3ODk0OTM1OH0.fdrIEjjJ6w9XJ06518vyx8fXBg3xKj8GfLhynbDuoI0',
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    },
  );
}

module.exports = supabaseClient;
