/** Mantém a sessão no aparelho e a renova sozinha, para ela não precisar entrar de novo. */
export const authOptions = {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: false,
} as const
