import type { Note } from '../data/repos'

export default function PostIt({ note }: { note: Note }) {
  return (
    <div className="postit" style={{ background: note.color }}>
      {note.text}
    </div>
  )
}
