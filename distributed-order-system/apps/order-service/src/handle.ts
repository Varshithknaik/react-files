import { OrderServiceServer } from "@core/proto";

export const orderSerice: OrderServiceServer = {
 getOrder: (call, callback) => {
    const { id } = call.request;
    callback(null, { order: `Order ${id}` });
  },
}