'use client'

import { Suspense } from 'react'
import ErrorContent from './error-content'

export default function ErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  )
}
