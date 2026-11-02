'use client'

import { Button } from '@payloadcms/ui'
import { useState } from 'react'

/** Lets staff clear the storefront cache when content was changed outside the admin panel. */
export function RefreshCacheButton() {
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'error'>('idle')

  const refresh = async () => {
    setState('working')
    try {
      const response = await fetch('/api/revalidate', { method: 'POST', credentials: 'include' })
      setState(response.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  const label = {
    idle: 'Refresh site cache',
    working: 'Refreshing…',
    done: 'Site cache refreshed',
    error: 'Could not refresh — try again',
  }[state]

  return (
    <Button
      buttonStyle="secondary"
      size="small"
      onClick={refresh}
      disabled={state === 'working'}
      margin={false}
    >
      {label}
    </Button>
  )
}
