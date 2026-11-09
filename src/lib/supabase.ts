import { createClient } from '@supabase/supabase-js'
import { authOptions } from './authOptions'

// Sem as variáveis (ex.: nos testes) usa valores de mentira só para o cliente não quebrar ao carregar.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'anon-key-ausente',
  { auth: { ...authOptions } },
)
