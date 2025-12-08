import { useMutation, useQuery, type QueryKey } from '@tanstack/react-query'
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
  prefetch?: boolean
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

export function useValidatedMutation<Input, Output>({
  inputSchema,
  outputSchema,
  mutationFn,
}: {
  inputSchema: ZodType<Input>
  outputSchema: ZodType<Output>
  mutationFn: (input: Input) => Promise<Output>
}) {
  return useMutation({
    mutationFn: async (input: Input) => {
      const validated = safeValidate(inputSchema, input)
      if (!validated.ok) {
        throw {
          type: 'mutation_validation_error',
          issues: validated.error,
        }
      }
      const output = await mutationFn(validated.data)
      const validatedOutput = safeValidate(outputSchema, output)
      if (!validatedOutput.ok) {
        throw {
          type: 'mutation_validation_error',
          issues: validatedOutput.error,
        }
      }
      return validatedOutput.data
    },
  })
}
