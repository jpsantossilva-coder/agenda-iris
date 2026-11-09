import { useToday } from '../../app/context'
import FechamentoEditor from './FechamentoEditor'

export default function EuScreen() {
  const today = useToday()
  return (
    <section>
      <h1>Eu</h1>
      <FechamentoEditor month={today.slice(0, 7)} />
    </section>
  )
}
