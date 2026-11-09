import { NavLink } from 'react-router-dom'

function Item({ to, label, end }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `bar-item${isActive ? ' on' : ''}`}>
      <span className="botao" aria-hidden />
      {label}
    </NavLink>
  )
}

export default function BottomBar({ onNovo }: { onNovo: () => void }) {
  return (
    <nav className="bottom-bar" aria-label="Principal">
      <Item to="/" label="Hoje" end />
      <Item to="/agenda" label="Agenda" />
      <button type="button" className="bar-item bar-plus" aria-label="Novo" onClick={onNovo}>
        <span className="botao grande" aria-hidden>+</span>
      </button>
      <Item to="/tarefas" label="Tarefas" />
      <Item to="/eu" label="Eu" />
    </nav>
  )
}
