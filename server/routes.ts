import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Create a new order
  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // List all orders
  app.get(api.orders.list.path, async (req, res) => {
    try {
      const orders = await storage.listOrders();
      res.status(200).json(orders);
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get order by id
  app.get(api.orders.get.path, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.status(200).json(order);
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update order
  app.put(api.orders.update.path, async (req, res) => {
    try {
      const existing = await storage.getOrder(req.params.orderId);
      if (!existing) {
        return res.status(404).json({ message: 'Order not found' });
      }
      const input = api.orders.update.input.parse(req.body);
      
      // Ensure the orderId parameter matches the body's orderId if provided
      if (input.numeroPedido !== req.params.orderId) {
          return res.status(400).json({ message: "Order ID in body does not match URL parameter" });
      }
      
      const order = await storage.updateOrder(req.params.orderId, input);
      res.status(200).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete order
  app.delete(api.orders.delete.path, async (req, res) => {
    try {
      const existing = await storage.getOrder(req.params.orderId);
      if (!existing) {
        return res.status(404).json({ message: 'Order not found' });
      }
      await storage.deleteOrder(req.params.orderId);
      res.status(204).send();
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed data function
  async function seedDatabase() {
    const ordersList = await storage.listOrders();
    if (ordersList.length === 0) {
      await storage.createOrder({
        numeroPedido: "v10089015vdb-01",
        valorTotal: 10000,
        dataCriacao: "2023-07-19T12:24:11.529Z",
        items: [
          {
            idItem: 2434,
            quantidadeItem: 1,
            valorItem: 1000
          }
        ]
      });
      await storage.createOrder({
        numeroPedido: "v10089016vdb-02",
        valorTotal: 5500,
        dataCriacao: new Date().toISOString(),
        items: [
          {
            idItem: 1010,
            quantidadeItem: 2,
            valorItem: 2750
          }
        ]
      });
    }
  }

  // Run seed function on startup
  seedDatabase().catch(console.error);

  return httpServer;
}
