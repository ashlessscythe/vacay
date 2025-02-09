'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (error === 'PENDING_ACTIVATION') {
      router.replace('/auth/pending')
    }
  }, [error, router])

  return null // No need to render anything as we're redirecting
}
