import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://siwatqcfmopzjdfykhqv.supabase.co';
const supabaseKey = 'sb_publishable_OHQnLWjqug_VHiGWCvqu6A_T9G_LZkg';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };