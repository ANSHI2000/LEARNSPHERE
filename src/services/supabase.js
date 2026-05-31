import { createClient } from '@supabase/supabase-js'

// Hardcoded values (use these directly for now)
const supabaseUrl = 'https://lzhtblgdhisyfimbszxo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6aHRibGdkaGlzeWZpbWJzenhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjcyMTgsImV4cCI6MjA4OTI0MzIxOH0.kxYYQpDmdzQSNpw6biiNOV13QcOWqj7f7zFRWXpKy0w'

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', supabaseAnonKey ? 'YES' : 'NO')

// Create the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
console.log('Supabase client created successfully')