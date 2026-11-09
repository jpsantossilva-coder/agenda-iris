import { describe, it, expect } from 'vitest'
import { mkTask } from '../test/factories'
import { dueReminders, morningSummary, isMorningTime } from './reminders'

const task = mkTask({ title: 'Conferir folha', date: '2026-11-12', time: '10:00', remindMinBefore: 15 })

describe('dueReminders', () => {
  it('dispara às 09:45 locais (12:45Z) dentro da janela', () => {
    const r = dueReminders([task], new Date('2026-11-12T12:45:20Z'), 1)
    expect(r).toHaveLength(1)
    expect(r[0].task.id).toBe(task.id)
    expect(new Date(r[0].fireAt).getTime()).toBe(Date.parse('2026-11-12T09:45:00-03:00'))
  })
  it('não dispara antes nem depois da janela', () => {
    expect(dueReminders([task], new Date('2026-11-12T12:44:00Z'), 1)).toEqual([])
    expect(dueReminders([task], new Date('2026-11-12T12:47:00Z'), 1)).toEqual([])
  })
  it('anotação sem horário nunca dispara (Review Focus 1)', () => {
    const nota = mkTask({ date: '2026-11-12' })
    const semData = mkTask()
    expect(dueReminders([nota, semData], new Date('2026-11-12T12:45:10Z'), 1)).toEqual([])
  })
  it('não dispara para concluída nem apagada', () => {
    const feita = { ...task, doneAt: 'x' }
    const apagada = { ...task, deletedAt: 'x' }
    expect(dueReminders([feita, apagada], new Date('2026-11-12T12:45:10Z'), 1)).toEqual([])
  })
  it('tarefa que se repete dispara no dia certo', () => {
    const curso = mkTask({ date: '2026-11-07', time: '14:00', repeat: { freq: 'weekly', weekdays: [6] } })
    expect(dueReminders([curso], new Date('2026-11-14T16:45:10Z'), 1)).toHaveLength(1)
    expect(dueReminders([curso], new Date('2026-11-13T16:45:10Z'), 1)).toEqual([])
  })
  it('lembrete antes da meia-noite para tarefa logo depois dela', () => {
    const t = mkTask({ date: '2026-11-13', time: '00:10', remindMinBefore: 15 })
    expect(dueReminders([t], new Date('2026-11-13T02:55:10Z'), 1)).toHaveLength(1)
  })
})

describe('morningSummary', () => {
  it('conta só as tarefas do dia ainda não concluídas', () => {
    const a = mkTask({ title: 'A', date: '2026-11-12' })
    const b = mkTask({ title: 'B', date: '2026-11-12', doneAt: 'x' })
    const c = mkTask({ title: 'C', date: '2026-11-13' })
    expect(morningSummary([a, b, c], '2026-11-12')).toEqual({ count: 1, titles: ['A'] })
  })
})

describe('isMorningTime', () => {
  it('07:00 locais é 10:00Z', () => {
    expect(isMorningTime('07:00', new Date('2026-11-12T10:00:30Z'), 1)).toBe(true)
    expect(isMorningTime('07:00', new Date('2026-11-12T10:02:00Z'), 1)).toBe(false)
    expect(isMorningTime('07:00', new Date('2026-11-12T09:59:30Z'), 1)).toBe(false)
  })
})
