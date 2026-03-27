import grpc from '@grpc/grpc-js'
import { OrderServiceClient } from '@core/proto'

const credentials = grpc.credentials.createInsecure();
const orderServiceAddress = 'localhost:50051';

export const orderClient = new OrderServiceClient(
  orderServiceAddress,
  credentials,
)