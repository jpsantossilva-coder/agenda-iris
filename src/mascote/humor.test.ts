import { describe, it, expect } from 'vitest'
import { reacaoPara, SONO_MS } from './humor'

describe('reacaoPara', () => {
  it('ao abrir o app dá oi pelo nome', () => {
    expect(reacaoPara('abriu', 'parada', 'Iris')).toMatchObject({ humor: 'oi', fala: 'Oi, Iris!' })
  })

  it('sem nome, dá só oi', () => {
    expect(reacaoPara('abriu', 'parada', '')).toMatchObject({ humor: 'oi', fala: 'Oi!' })
  })

  it('agendar uma atividade faz a reverência com "Tudo certo, agendado!"', () => {
    expect(reacaoPara('agendou', 'parada')).toMatchObject({ humor: 'reverencia', fala: 'Tudo certo, agendado!' })
  })

  it('guardar uma anotação responde "Anotado!"', () => {
    expect(reacaoPara('anotou', 'parada')).toMatchObject({ humor: 'reverencia', fala: 'Anotado!' })
  })

  it('concluir uma tarefa dá o pulinho', () => {
    expect(reacaoPara('concluiu', 'parada')).toMatchObject({ humor: 'pulo', fala: 'Feito!' })
  })

  it('fechar o dia ergue a espada', () => {
    expect(reacaoPara('fechou-o-dia', 'parada')).toMatchObject({ humor: 'vitoria', fala: 'Missão cumprida!' })
  })

  it('um toque na tela acorda a gata que dormia, sem falar nada', () => {
    const r = reacaoPara('tocou', 'dorme')
    expect(r).toMatchObject({ humor: 'acorda' })
    expect(r?.fala).toBeUndefined()
  })

  it('um toque na tela com ela acordada não muda nada', () => {
    expect(reacaoPara('tocou', 'parada')).toBeNull()
    expect(reacaoPara('tocou', 'pulo')).toBeNull()
  })

  it('tocar nela faz dar oi de novo', () => {
    expect(reacaoPara('tocou-na-gata', 'parada', 'Iris')).toMatchObject({ humor: 'oi', fala: 'Oi, Iris!' })
  })

  it('o sono chega depois de 1 minuto parada', () => {
    expect(SONO_MS).toBe(60_000)
  })
})
