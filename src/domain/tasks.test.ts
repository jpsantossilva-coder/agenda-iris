import { describe, it, expect } from 'vitest'
import { mkTask } from '../test/factories'
import { occursOn, isDoneOn, tasksForDay, postponed, dayLoad, allDoneOn } from './tasks'

describe('occursOn', () => {
  const curso = mkTask({ date: '2026-11-07', repeat: { freq: 'weekly', weekdays: [6] } })
  it('tarefa semanal de sábado ocorre no sábado e não na sexta', () => {
    expect(occursOn(curso, '2026-11-14')).toBe(true)
    expect(occursOn(curso, '2026-11-13')).toBe(false)
  })
  it('respeita until e não ocorre antes da data inicial', () => {
    const t = mkTask({ date: '2026-11-07', repeat: { freq: 'weekly', weekdays: [6], until: '2026-11-14' } })
    expect(occursOn(t, '2026-11-14')).toBe(true)
    expect(occursOn(t, '2026-11-21')).toBe(false)
    expect(occursOn(t, '2026-10-31')).toBe(false)
  })
  it('tarefa simples só ocorre na própria data', () => {
    const t = mkTask({ date: '2026-11-10' })
    expect(occursOn(t, '2026-11-10')).toBe(true)
    expect(occursOn(t, '2026-11-11')).toBe(false)
  })
})

describe('isDoneOn', () => {
  it('concluir um sábado não conclui os outros (Review Focus 2)', () => {
    const curso = mkTask({ date: '2026-11-07', repeat: { freq: 'weekly', weekdays: [6] }, doneDates: ['2026-11-07'] })
    expect(isDoneOn(curso, '2026-11-07')).toBe(true)
    expect(isDoneOn(curso, '2026-11-14')).toBe(false)
  })
  it('tarefa simples usa doneAt', () => {
    expect(isDoneOn(mkTask({ date: '2026-11-10', doneAt: '2026-11-10T12:00:00Z' }), '2026-11-10')).toBe(true)
  })
})

describe('tasksForDay', () => {
  it('ordena por horário, sem horário por último, ignora apagadas', () => {
    const a = mkTask({ date: '2026-11-10', time: '10:30' })
    const b = mkTask({ date: '2026-11-10', time: '09:00' })
    const c = mkTask({ date: '2026-11-10' })
    const d = mkTask({ date: '2026-11-10', time: '08:00', deletedAt: '2026-11-10T00:00:00Z' })
    expect(tasksForDay([a, b, c, d], '2026-11-10').map((t) => t.id)).toEqual([b.id, a.id, c.id])
  })
})

describe('postponed', () => {
  const today = '2026-11-12'
  it('devolve a vencida não concluída', () => {
    const t = mkTask({ date: '2026-11-10' })
    expect(postponed([t], today)).toEqual([t])
  })
  it('não devolve repetida, sem data, concluída, apagada ou de hoje (Review Focus 1 e 2)', () => {
    const rep = mkTask({ date: '2026-11-07', repeat: { freq: 'weekly', weekdays: [6] } })
    const semData = mkTask()
    const feita = mkTask({ date: '2026-11-10', doneAt: '2026-11-10T10:00:00Z' })
    const apagada = mkTask({ date: '2026-11-10', deletedAt: '2026-11-11T10:00:00Z' })
    const hoje = mkTask({ date: today })
    expect(postponed([rep, semData, feita, apagada, hoje], today)).toEqual([])
  })
})

describe('dayLoad', () => {
  it('60 + 360 min = 420 e fica apertado', () => {
    const ts = [mkTask({ date: '2026-11-10', estimateMin: 60 }), mkTask({ date: '2026-11-10', estimateMin: 360 })]
    expect(dayLoad(ts, '2026-11-10')).toEqual({ totalMin: 420, tight: true })
  })
  it('419 min não fica apertado', () => {
    const ts = [mkTask({ date: '2026-11-10', estimateMin: 419 })]
    expect(dayLoad(ts, '2026-11-10').tight).toBe(false)
  })
  it('ignora tarefas concluídas e sem estimativa', () => {
    const ts = [
      mkTask({ date: '2026-11-10', estimateMin: 300, doneAt: '2026-11-10T10:00:00Z' }),
      mkTask({ date: '2026-11-10' }),
    ]
    expect(dayLoad(ts, '2026-11-10').totalMin).toBe(0)
  })
})

describe('allDoneOn', () => {
  it('só é verdadeiro quando há tarefas e todas estão feitas', () => {
    const feita = mkTask({ date: '2026-11-10', doneAt: 'x' })
    const aberta = mkTask({ date: '2026-11-10' })
    expect(allDoneOn([], '2026-11-10')).toBe(false)
    expect(allDoneOn([feita], '2026-11-10')).toBe(true)
    expect(allDoneOn([feita, aberta], '2026-11-10')).toBe(false)
  })
})
