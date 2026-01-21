
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fztpicsblwudjeehssfm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6dHBpY3NibHd1ZGplZWhzc2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTEwMDQsImV4cCI6MjA4NDQ4NzAwNH0.2FdsIjTLnvVzs_hNL8EfjT0VGnGHV-EhCgm9hamc-oc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
