import { unstable_noStore as noStore } from 'next/cache'
import Messages from '@/components/messages'

// export const revalidate = 5 // 5 seconds

// export const dynamic = 'force-static' // auto is default value , force-dynamic or force-static , force-dynamic is same as no-store
// 'force-static' means build time
// 'force-dynamic' means run time

export default async function MessagesPage() {
  noStore()

  const response = await fetch('http://localhost:9090/messages', {
    // cache: 'no-store', // force-cache , no-store
    // next: {
    //   revalidate: 5,
    // },
    headers: {
      'X-ID': 'page',
    },
  })
  const messages = await response.json()

  if (!messages || messages.length === 0) {
    return <p>No messages found</p>
  }

  return <Messages messages={messages} />
}
