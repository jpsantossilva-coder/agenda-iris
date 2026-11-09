/** Minúsculas e sem acento, para busca e sugestões. */
export function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}
