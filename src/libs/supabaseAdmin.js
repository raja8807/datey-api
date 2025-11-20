const { createClient } = require('@supabase/supabase-js');

// const supabaseUrlx = process.env.SUPABASE_URL;
// const supabaseKeyx = process.env.SUPABASE_KEY;

const supabaseUrl = 'https://gxhnuzpfinqrbzsieend.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aG51enBmaW5xcmJ6c2llZW5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM3MzM1OCwiZXhwIjoyMDc4OTQ5MzU4fQ.0nUVeJm1lVqViMjUPdneOzHFA0e5-mfoEdxEk2csQxY';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

module.exports = supabaseAdmin;
