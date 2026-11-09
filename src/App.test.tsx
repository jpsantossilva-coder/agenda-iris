import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('mostra a aba Hoje', () => {
    render(<App />)
    expect(screen.getByText('Hoje')).toBeInTheDocument()
  })
})
