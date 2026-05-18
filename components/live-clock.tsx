'use client'

import { useEffect, useState } from 'react'

interface LiveClockProps {
  className?: string
  prefix?: string
}

export function LiveClock({ className, prefix = 'Last updated:' }: LiveClockProps) {
  const [time, setTime] = useState<string>('—')

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className={className} suppressHydrationWarning>
      {prefix} {time}
    </span>
  )
}
