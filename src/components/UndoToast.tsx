import { useCallback, useEffect, useState, type ReactNode } from 'react'

export function UndoToast({
  message,
  onUndo,
  onExpire,
  durationMs = 5000,
}: {
  message: string
  onUndo: () => void
  onExpire: () => void
  durationMs?: number
}) {
  useEffect(() => {
    const id = setTimeout(onExpire, durationMs)
    return () => clearTimeout(id)
  }, [onExpire, durationMs])

  return (
    <div className="undo-toast" role="status">
      <span>{message}</span>
      <button type="button" onClick={onUndo}>Desfazer</button>
    </div>
  )
}

/** Mostra "Desfazer" por 5 segundos depois de excluir. */
export function useUndo(): { show: (message: string, undo: () => void | Promise<void>) => void; node: ReactNode } {
  const [item, setItem] = useState<{ id: number; message: string; undo: () => void | Promise<void> } | null>(null)
  const show = useCallback(
    (message: string, undo: () => void | Promise<void>) => setItem((cur) => ({ id: (cur?.id ?? 0) + 1, message, undo })),
    [],
  )
  const expire = useCallback(() => setItem(null), [])
  const node = item ? (
    <UndoToast
      key={item.id}
      message={item.message}
      onExpire={expire}
      onUndo={() => {
        void item.undo()
        setItem(null)
      }}
    />
  ) : null
  return { show, node }
}
