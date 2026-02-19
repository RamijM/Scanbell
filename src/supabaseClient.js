import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Your Project URL (Found in Settings > API)
const supabaseUrl = 'https://cutfmrazvrjbdxlfyhrk.supabase.co'; 

// 2. Your Long Anon Key (Paste the eyJhbG... string here)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1dGZtcmF6dnJqYmR4bHlmcmhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMTgwNzcsImV4cCI6MjA4Njg5NDA3N30.bJ_IQJUtzgmi9kI5od6jLmPqsxbTgllyHFxLdrToP3o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});