'use client'

import { useRouter } from 'next/navigation'

export default function ModalBackDrop({ children }) {
  const router = useRouter()
  return (
    <div className="modal-backdrop" onClick={() => router.back()}>
      {children}
    </div>
  )
}
