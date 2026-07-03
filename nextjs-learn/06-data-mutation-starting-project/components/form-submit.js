'use client'

import { useFormStatus } from 'react-dom'

export default function () {
  const status = useFormStatus()

  console.log(status)

  return (
    <>
      <button type="reset">Reset</button>
      <button disabled={status?.pending}>
        {status.pending ? 'Creating Post...' : 'Create Post'}
      </button>
    </>
  )
}
