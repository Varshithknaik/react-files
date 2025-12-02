import {
  QueryClient,
  type QueryFunction,
  type QueryKey,
} from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    },
  },
})

// prefetch helper
export async function prefetch({
  key,
  fn,
}: {
  key: QueryKey
  fn: QueryFunction
}) {
  await queryClient.prefetchQuery({
    queryKey: key,
    queryFn: fn,
  })
}
