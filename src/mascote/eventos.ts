/** O que as telas contam para a mascote. Ela decide sozinha como reagir. */
export type EventoMascote = 'concluiu' | 'fechou-o-dia' | 'agendou' | 'anotou'

type Ouvinte = (evento: EventoMascote) => void
const ouvintes = new Set<Ouvinte>()

export function avisarMascote(evento: EventoMascote) {
  ouvintes.forEach((o) => o(evento))
}

/** Devolve a função que para de ouvir. */
export function ouvirMascote(ouvinte: Ouvinte): () => void {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}
