import { DOMAIN_ERROR_CODE, DomainError } from './errors.js'
import grpc from '@grpc/grpc-js'

const DOMAIN_TO_GRPC: Record<DOMAIN_ERROR_CODE, grpc.status> = {
  [DOMAIN_ERROR_CODE.DUPLICATE_ENTRY]: grpc.status.ALREADY_EXISTS,
  [DOMAIN_ERROR_CODE.NOT_FOUND]: grpc.status.NOT_FOUND,
  [DOMAIN_ERROR_CODE.FOREIGN_KEY_VIOLATION]: grpc.status.FAILED_PRECONDITION,
  [DOMAIN_ERROR_CODE.INTERNAL]: grpc.status.INTERNAL,
}

export function toGrpcError(error: unknown): {
  code: grpc.status
  message: string
} {
  if (error instanceof DomainError) {
    return {
      code: DOMAIN_TO_GRPC[error.code] || grpc.status.INTERNAL,
      message: error.details ?? error.message,
    }
  }
  return {
    code: grpc.status.INTERNAL,
    message: error instanceof Error ? error.message : 'Internal server error',
  }
}
