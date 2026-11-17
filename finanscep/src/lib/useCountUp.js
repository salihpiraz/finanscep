import { useState, useEffect, useRef } from 'react'

export function useCountUp(target, duration = 850) {
  const [value, setValue] = useState(target)
  const from = useRef(target)

  useEffect(() => {
    const start = performance.now()
    const f = from.current
    let raf
    const step = now => {
      const k = Math.min((now - start) / duration, 1)
      const e = 1 - Math.pow(1 - k, 3)
      const x = f + (target - f) * e
      from.current = x
      setValue(x)
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}
