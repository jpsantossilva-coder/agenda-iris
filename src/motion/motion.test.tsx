import { render, act, screen } from '@testing-library/react'
import { describe, it, expect, vi, afterEach, type Mock } from 'vitest'
import type { ComponentType, ReactNode } from 'react'
import { clearMatchMedia, mockReducedMotion } from '../test/motion'
import { MOTION_MS } from './useMotion'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import Strike from './Strike'
import Stamp from './Stamp'
import NeedleSewing from './NeedleSewing'
import HomeBounce from './HomeBounce'
import PostItDrop from './PostItDrop'
import ButtonRain from './ButtonRain'
import ScissorsCut from './ScissorsCut'
import SplashLoader from './SplashLoader'

type Motion = ComponentType<{ play: boolean; onEnd?: () => void; children?: ReactNode }>
const todas: [string, Motion, number][] = [
  ['Strike', Strike, MOTION_MS.strike],
  ['Stamp', Stamp, MOTION_MS.stamp],
  ['NeedleSewing', NeedleSewing, MOTION_MS.sewing],
  ['HomeBounce', HomeBounce, MOTION_MS.home],
  ['PostItDrop', PostItDrop, MOTION_MS.postit],
  ['ButtonRain', ButtonRain, MOTION_MS.rain],
  ['ScissorsCut', ScissorsCut, MOTION_MS.cut],
]

afterEach(() => {
  vi.useRealTimers()
  clearMatchMedia()
})

describe('microinterações', () => {
  it.each(todas)('%s: com "reduzir movimento" chama onEnd na hora e não anima', (_n, C) => {
    mockReducedMotion(true)
    const onEnd = vi.fn()
    const { container } = render(<C play onEnd={onEnd}>x</C>)
    expect(onEnd).toHaveBeenCalledTimes(1)
    expect(container.querySelector('.go')).toBeNull()
  })

  it.each(todas)('%s: sem a preferência, anima e só chama onEnd depois da duração', (_n, C, ms) => {
    vi.useFakeTimers()
    mockReducedMotion(false)
    const onEnd: Mock = vi.fn()
    const { container } = render(<C play onEnd={onEnd}>x</C>)
    expect(container.querySelector('.go')).not.toBeNull()
    act(() => { vi.advanceTimersByTime(ms - 50) })
    expect(onEnd).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(100) })
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it.each(todas)('%s: com play falso não faz nada', (_n, C) => {
    const onEnd = vi.fn()
    const { container } = render(<C play={false} onEnd={onEnd}>x</C>)
    expect(onEnd).not.toHaveBeenCalled()
    expect(container.querySelector('.go')).toBeNull()
  })

  it('todas as animações duram menos de 1 segundo, exceto a chuva de botões', () => {
    for (const [k, ms] of Object.entries(MOTION_MS)) {
      if (k !== 'rain') expect(ms).toBeLessThan(1000)
    }
  })

  it('usePrefersReducedMotion lê a preferência do sistema', () => {
    function Probe() {
      return <p>{usePrefersReducedMotion() ? 'reduzido' : 'normal'}</p>
    }
    mockReducedMotion(true)
    render(<Probe />)
    expect(screen.getByText('reduzido')).toBeInTheDocument()
  })

  it('SplashLoader mostra "Preparando seu dia…"', () => {
    render(<SplashLoader />)
    expect(screen.getByText('Preparando seu dia…')).toBeInTheDocument()
  })

  it('ButtonRain mostra a mensagem "Dia fechado!" enquanto cai', () => {
    mockReducedMotion(false)
    render(<ButtonRain play />)
    expect(screen.getByText('Dia fechado! ♡')).toBeInTheDocument()
  })
})
