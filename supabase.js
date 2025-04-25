// Ensure Supabase client is initialized
const SUPABASE_URL = 'https://your-supabase-url.supabase.co';
const SUPABASE_KEY = 'your-supabase-key';

const supabase = window.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('Supabase client initialized:', supabase);