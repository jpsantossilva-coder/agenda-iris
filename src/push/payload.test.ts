import { describe, it, expect } from 'vitest'
import { parsePushPayload } from './payload'

describe('parsePushPayload', () => {
  it('lê título, texto e endereço', () => {
    expect(parsePushPayload('{"title":"Conferir folha","body":"Daqui a 15 min","url":"/tarefas"}')).toEqual({
      title: 'Conferir folha', body: 'Daqui a 15 min', url: '/tarefas',
    })
  })
  it('sem endereço abre a tela Hoje', () => {
    expect(parsePushPayload('{"title":"x","body":"y"}').url).toBe('/')
  })
  it('texto que não é JSON vira o corpo da notificação', () => {
    expect(parsePushPayload('oi')).toEqual({ title: 'Agenda da Iris', body: 'oi', url: '/' })
  })
  it('sem dados devolve uma notificação genérica', () => {
    expect(parsePushPayload(null)).toEqual({ title: 'Agenda da Iris', body: '', url: '/' })
  })
})
