/** Tela de carregamento: a agulha puxa a linha, costurando pontinhos. */
export default function SplashLoader() {
  return (
    <div className="splash" role="status">
      <div className="mi-sewing loop" aria-hidden>
        <i className="mi-thread" />
        <span className="mi-needle">🪡</span>
      </div>
      <small>Preparando seu dia…</small>
    </div>
  )
}
