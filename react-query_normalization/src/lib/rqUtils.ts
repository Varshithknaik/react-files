import { useQuery, type QueryKey } from '@tanstack/react-query'
import { ZodError, type ZodType } from 'zod'

// ----------------------
// 1. VALIDATION HELPERS
// ----------------------

type ValidationReturn<T> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      error: ZodError['issues']
    }

export function safeValidate<T>(
  schema: ZodType<T>,
  data: unknown
): ValidationReturn<T> {
  const parsed = schema.safeParse(data)

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues,
    }
  }
  return {
    ok: true,
    data: parsed.data,
  }
}

// ----------------------
// 2. QUERY FACTORY
// ----------------------

export function useCreateValidatedQuery<TQuery, TSelected = TQuery>({
  key,
  queryFn,
  schema,
  select,
}: {
  key: QueryKey
  queryFn: () => Promise<TQuery>
  schema: ZodType<TQuery>
  select?: (data: TQuery) => TSelected
}) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const raw = await queryFn()
      const validated = safeValidate(schema, raw)
      if (!validated.ok) {
        throw {
          type: 'query_validation_error',
          issues: validated.error,
        }
      }
      return validated.data
    },
    select,
  })
}
