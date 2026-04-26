import grpc from '@grpc/grpc-js'

const server = new grpc.Server()

export const startInventoryGrpc = async () => {
  server.bindAsync(
    '0.0.0.0:50052',
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('Error starting Inventory Service:', err)
        process.exit(1)
      }
      console.log('Inventory Service is running on port', port)
    }
  )

  return { shutdown: () => server.forceShutdown() }
}

const { shutdown } = await startInventoryGrpc()

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
