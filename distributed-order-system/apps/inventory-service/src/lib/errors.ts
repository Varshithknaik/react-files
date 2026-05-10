import { Prisma } from '@prisma/client-inventory-service'

export enum DOMAIN_ERROR_CODE {
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  NOT_FOUND = 'NOT_FOUND',
  FOREIGN_KEY_VIOLATION = 'FOREIGN_KEY_VIOLATION',
  INTERNAL = 'INTERNAL',
}

export class DomainError extends Error {
  public readonly code: DOMAIN_ERROR_CODE
  public readonly details?: string

  constructor(code: DOMAIN_ERROR_CODE, message: string, details?: string) {
    super(message)
    this.name = 'DomainError'
    this.code = code
    this.details = details
  }
}

export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        const target = Array.isArray(error.meta?.target)
          ? error.meta.target.join(', ')
          : ((
              error.meta as {
                driverAdapterError?: {
                  cause?: {
                    constraint?: {
                      fields?: string[]
                    }
                  }
                }
              }
            )?.driverAdapterError?.cause?.constraint?.fields?.join(', ') ??
            'unknown field')
        throw new DomainError(
          DOMAIN_ERROR_CODE.DUPLICATE_ENTRY,
          `Duplicate value on: ${target}`,
          `A record with this ${target} already exists.`
        )
      case 'P2025':
        throw new DomainError(
          DOMAIN_ERROR_CODE.NOT_FOUND,
          `Record not found`,
          `The record you are trying to access does not exist.`
        )
      case 'P2003':
        throw new DomainError(
          DOMAIN_ERROR_CODE.FOREIGN_KEY_VIOLATION,
          'Foreign key violation',
          `Foreign key constraint failed on: ${error.meta?.field_name}`
        )
      default:
        throw new DomainError(
          DOMAIN_ERROR_CODE.INTERNAL,
          'Database Error',
          `Unhandled Prisma error code: ${error.code}`
        )
    }
  }

  throw new DomainError(
    DOMAIN_ERROR_CODE.INTERNAL,
    'Unexpected Error',
    error instanceof Error
      ? error.message
      : 'Something went wrong. Please try again later.'
  )
}
