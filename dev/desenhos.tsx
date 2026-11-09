// Desenhos próprios em SVG (no lugar dos emojis): lápis, agulha, tesoura, carimbo e botão de costura.
import type { SVGProps } from 'react'

/** Lápis com a ponta na origem (0,0), inclinado. */
export function Lapis(props: SVGProps<SVGGElement>) {
  return (
    <g {...props}>
      <g transform="rotate(38)">
        <rect x="-3.2" y="-26" width="6.4" height="4.5" rx="1.4" fill="#e9726b" />
        <rect x="-3.2" y="-21.5" width="6.4" height="2.4" fill="#c9cdd8" />
        <rect x="-3.2" y="-19.1" width="6.4" height="16" fill="#f0c04a" />
        <path d="M-1 -19.1V-3.1M1.2 -19.1V-3.1" stroke="#c9972a" strokeWidth="0.8" />
        <path d="M-3.2 -3.1L3.2 -3.1L0 4.2Z" fill="#f4d6ae" />
        <path d="M-1.1 1.2L1.1 1.2L0 4.2Z" fill="#1f2d57" />
      </g>
    </g>
  )
}

/** Agulha com a ponta na origem, apontando para a direita, com linha saindo do fundo. */
export function Agulha({ cor = '#e9726b', ...props }: { cor?: string } & SVGProps<SVGGElement>) {
  return (
    <g {...props}>
      <path d="M-46 0L0 0" stroke="#9aa3b8" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="-42" cy="0" rx="1.3" ry="2.6" fill="#f6f3ea" stroke="#9aa3b8" strokeWidth="1" />
      <path d="M-42 0C-60 -8 -64 10 -82 4" fill="none" stroke={cor} strokeWidth="1.8" strokeLinecap="round" />
    </g>
  )
}

/** Tesoura com o pivô na origem; `abertura` em graus abre as lâminas. */
export function Tesoura({ abertura = 0, ...props }: { abertura?: number } & SVGProps<SVGGElement>) {
  return (
    <g {...props}>
      <g transform={`rotate(${-abertura})`}>
        <path d="M0 0L30 -2.5L30 0.6L0 2.4Z" fill="#c9cdd8" stroke="#8a93a8" strokeWidth="0.8" strokeLinejoin="round" />
        <circle cx="-9" cy="-6" r="5.4" fill="none" stroke="#e9726b" strokeWidth="2.4" />
        <path d="M-5 -3L0 0" stroke="#e9726b" strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <g transform={`rotate(${abertura})`}>
        <path d="M0 0L30 2.5L30 -0.6L0 -2.4Z" fill="#dfe2ea" stroke="#8a93a8" strokeWidth="0.8" strokeLinejoin="round" />
        <circle cx="-9" cy="6" r="5.4" fill="none" stroke="#e9726b" strokeWidth="2.4" />
        <path d="M-5 3L0 0" stroke="#e9726b" strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <circle r="2" fill="#1f2d57" />
    </g>
  )
}

/** Carimbo: a base fica na origem (0,0). */
export function Carimbo(props: SVGProps<SVGGElement>) {
  return (
    <g {...props}>
      <rect x="-8" y="-46" width="16" height="26" rx="7" fill="#8a5a3c" />
      <rect x="-22" y="-20" width="44" height="10" rx="3" fill="#5a3b27" />
      <rect x="-19" y="-10" width="38" height="8" rx="2" fill="#e9726b" />
    </g>
  )
}

/** Botão de costura de quatro furos. */
export function BotaoCostura({ cor = '#d9c9ad', tamanho = 36 }: { cor?: string; tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 40 40" aria-hidden>
      <circle cx="20" cy="20" r="18" fill={cor} stroke="#0003" strokeWidth="1" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="#fff8" strokeWidth="1.4" />
      {[[15, 15], [25, 15], [15, 25], [25, 25]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="2.3" fill="#1f2d57" opacity="0.75" />
      ))}
    </svg>
  )
}
