import type { SVGProps } from 'react'

export type IconName = 'home' | 'calendar' | 'check' | 'user' | 'plus' | 'pencil' | 'trash'

const PATHS: Record<IconName, string> = {
  home: 'M4 11l8-7 8 7M6 10v10h12V10',
  calendar: 'M6 5h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2zM4 10h16M9 3v4M15 3v4',
  check: 'M5 12.5l4.2 4.2L19 7',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 21c1-5.5 14-5.5 15 0',
  plus: 'M12 5v14M5 12h14',
  pencil: 'M4 20l1-4L16.5 4.5a2 2 0 012.8 2.8L7.8 19 4 20zM14 7l3 3',
  trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13M10 11v5M14 11v5',
}

/** Ícones de traço, desenhados à mão no mesmo peso. Decorativos: o nome fica no botão. */
export default function Icon({ name, ...rest }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg className="ic" viewBox="0 0 24 24" aria-hidden focusable="false" {...rest}>
      <path d={PATHS[name]} />
    </svg>
  )
}
