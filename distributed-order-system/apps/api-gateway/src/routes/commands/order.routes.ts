import { Router } from "express";
import { orderClient } from "../../grpcClients.js";

export const orderRouter = Router();

orderRouter.get('/', (req, res) => {

  orderClient.getOrder({ id: '1' }, (err, response) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(response);
    }
  })
})