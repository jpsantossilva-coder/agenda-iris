import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Etiqueta from './Etiqueta'
import { mkTask } from '../test/factories'

describe('Etiqueta (peça do dia)', () => {
  it('mostra título, tempo estimado e a hora na peça', () => {
    render(<Etiqueta task={mkTask({ title: 'Lançar atestados', time: '09:00', estimateMin: 40 })} />)
    expect(screen.getByText('Lançar atestados')).toBeInTheDocument()
    expect(screen.getByText('40 min')).toBeInTheDocument()
    expect(screen.getByText('9h')).toBeInTheDocument()
  })

  it('sem horário não mostra hora', () => {
    render(<Etiqueta task={mkTask({ title: 'Ideia solta', time: null })} />)
    expect(screen.queryByText(/\dh/)).not.toBeInTheDocument()
  })

  it('concluída mostra a palavra "feito" no lugar da hora', () => {
    render(<Etiqueta task={mkTask({ title: 'A', time: '10:30' })} done />)
    expect(screen.getByText('feito')).toBeInTheDocument()
    expect(screen.queryByText('10h30')).not.toBeInTheDocument()
  })

  it('a cor da área vai por variável, sem cor fixa no código', () => {
    const { container } = render(<Etiqueta task={mkTask({ area: 'costura' })} />)
    expect(container.querySelector('.etiqueta')?.getAttribute('style')).toContain('--area-costura')
  })
})
