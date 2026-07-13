// Animación tipo tragamonedas: pasa rápido por los items, desacelera
// y frena en el ganador. Se usa en el sorteo de grupo y en el robo.
import { useEffect, useRef, useState, type ReactNode } from 'react'

export function SlotMachine({
  items, targetIndex, onDone, spins = 26,
}: {
  items: ReactNode[]
  targetIndex: number
  onDone: () => void
  spins?: number // cuántos pasos da antes de frenar
}) {
  const [step, setStep] = useState(0)
  const doneRef = useRef(false)

  // El índice mostrado avanza de a 1 y está alineado para terminar en el target
  const shown = (targetIndex - spins + step + items.length * 100) % items.length
  const finished = step >= spins

  useEffect(() => {
    if (finished) {
      if (!doneRef.current) {
        doneRef.current = true
        const id = setTimeout(onDone, 650)
        return () => clearTimeout(id)
      }
      return
    }
    // desaceleración: arranca rápido y frena al final
    const progress = step / spins
    const delay = 55 + progress * progress * 380
    const id = setTimeout(() => setStep(s => s + 1), delay)
    return () => clearTimeout(id)
  }, [step, finished, spins, onDone])

  return (
    <div className={`slot-machine ${finished ? 'slot-done' : ''}`}>
      <div className="slot-window">{items[shown]}</div>
    </div>
  )
}
