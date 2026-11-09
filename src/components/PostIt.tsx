import type { Note } from '../data/repos'
import PostItDrop from '../motion/PostItDrop'
import Stamp from '../motion/Stamp'

export default function PostIt({
  note,
  fresh,
  stamping,
  onStamped,
  onDarBaixa,
}: {
  note: Note
  fresh?: boolean
  stamping?: boolean
  onStamped?: () => void
  onDarBaixa?: () => void
}) {
  return (
    <PostItDrop play={!!fresh}>
      <div className="postit" style={{ background: note.color }}>
        {note.text}
        {onDarBaixa && (
          <button type="button" className="baixa" aria-label={`Dar baixa em ${note.text}`} onClick={onDarBaixa}>✓</button>
        )}
        <Stamp play={!!stamping} onEnd={onStamped} />
      </div>
    </PostItDrop>
  )
}
