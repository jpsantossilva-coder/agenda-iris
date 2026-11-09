/** Limpa uma chave colada na Vercel: espaços, quebras de linha, aspas, rótulo e "=" do fim. */
export function cleanKey(raw: string | undefined): string {
  let v = (raw ?? '').trim()
  v = v.replace(/^(?:[A-Za-z ]+:|[A-Z_]{3,}=)\s*/, '') // "Public Key: ..." ou "VAPID_PUBLIC_KEY=..."
  v = v.replace(/^["']+|["']+$/g, '').trim()
  return v.replace(/=+$/, '')
}

/** Mensagem de ajuda que diz o tamanho da chave, nunca o valor. */
export function describeKey(name: string, value: string, expected: number): string {
  return `${name} inválida: tem ${value.length} caracteres, o esperado é ${expected}. Gere um par novo e cole só o texto da chave, sem rótulo, aspas ou espaços.`
}
