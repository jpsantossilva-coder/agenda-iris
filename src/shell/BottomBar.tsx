import { NavLink } from 'react-router-dom'
import Icon, { type IconName } from '../components/Icon'

function Item({ to, label, icon, end }: { to: string; label: string; icon: IconName; end?: boolean }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `bar-item${isActive ? ' on' : ''}`}>
      <Icon name={icon} />
      {label}
    </NavLink>
  )
}

export default function BottomBar({ onNovo }: { onNovo: () => void }) {
  return (
    <nav className="bottom-bar" aria-label="Principal">
      <Item to="/" label="Hoje" icon="home" end />
      <Item to="/agenda" label="Agenda" icon="calendar" />
      <button type="button" className="bar-item bar-plus" aria-label="Novo" onClick={onNovo}>
        <span className="circ" aria-hidden>
          <Icon name="plus" />
        </span>
      </button>
      <Item to="/tarefas" label="Tarefas" icon="check" />
      <Item to="/eu" label="Eu" icon="user" />
    </nav>
  )
}
