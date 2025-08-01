import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://d512f1a1-eb68-4d6e-98c8-3d2819c5eaf4.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImQ1MTJmMWExLWViNjgtNGQ2ZS05OGM4LTNkMjgxOWM1ZWFmNCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzU0MDY4NTU3LCJleHAiOjIwNjk2NDQ1NTd9.PVnTy6g6lKJdmLSQfUODk82H9Bym8PJ_zlKGLuBs8N0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)