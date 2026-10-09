import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { logger } from "@/server/logger";
import { subscribe, REALTIME_CHANNELS } from "./realtimePubSub";
import { verifyToken } from "@/server/core/tokens";

type Client = {
  ws: WebSocket;
  id: string;
  role: string;
  subscriptions: Set<string>;
};

const clients = new Map<WebSocket, Client>();

function generateId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function isRoleAllowed(channel: string, role: string): boolean {
  const adminRoles = ["super_admin", "authority", "admin"];
  if (adminRoles.includes(role as any)) return true;

  const citizenAllowed = new Set([
    REALTIME_CHANNELS.SOS_NEW,
    REALTIME_CHANNELS.RISK_HEATMAP_UPDATED,
    REALTIME_CHANNELS.FLEET_LOCATION,
    REALTIME_CHANNELS.ALERT_NEW,
    REALTIME_CHANNELS.ROAD_STATUS_CHANGE,
    REALTIME_CHANNELS.SHELTER_STATUS_CHANGE,
  ]);
  return citizenAllowed.has(channel as any);
}

export function createWebSocketServer(PORT: number) {
  const wss = new WebSocketServer({
    port: PORT,
    host: "0.0.0.0",
  });

  wss.on("connection", (ws, req: IncomingMessage) => {
    const url = new URL(`http://${req.headers.host || "localhost"}${req.url}`);
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(4001, "Missing authorization token");
      return;
    }

    verifyToken(token)
      .then((payload) => {
        if (!payload || !payload.sub) {
          ws.close(4003, "Invalid token");
          return;
        }

        const client: Client = {
          ws,
          id: generateId(),
          role: payload.role ?? "citizen",
          subscriptions: new Set(),
        };
        clients.set(ws, client);

        ws.send(JSON.stringify({
          type: "connected",
          client_id: client.id,
          message: "Connected to ASPIRE real-time pipeline",
        }));

        ws.on("message", (data: Buffer) => {
          try {
            const msg = JSON.parse(data.toString());
            if (msg.action === "subscribe" && Array.isArray(msg.channels)) {
              msg.channels.forEach((channel: string) => {
                if (isRoleAllowed(channel, client.role)) {
                  client.subscriptions.add(channel);
                  subscribe(channel, (pubmsg) => {
                    if (ws.readyState === WebSocket.OPEN) {
                      ws.send(JSON.stringify(pubmsg));
                    }
                  });
                  ws.send(JSON.stringify({ type: "subscribed", channel }));
                } else {
                  ws.send(JSON.stringify({ type: "error", channel, message: "Forbidden" }));
                }
              });
            }
          } catch (err) {
            logger.warn({ err }, "Invalid WebSocket message");
          }
        });

        ws.on("close", () => {
          clients.delete(ws);
        });

        ws.on("error", (err) => {
          logger.warn({ err }, "WebSocket error");
          clients.delete(ws);
        });
      })
      .catch((err) => {
        logger.warn({ err }, "WebSocket auth failed");
        ws.close(4003, "Invalid token");
      });
  });

  wss.on("error", (err) => logger.error({ err }, "WebSocket server error"));

  logger.info({ port: PORT }, "WebSocket server listening on port");
  return wss;
}

export function broadcastToAll(event: string, channel: string, payload: unknown) {
  const message = JSON.stringify({ event, channel, payload });
  clients.forEach((client) => {
    if (client.subscriptions.has(channel) && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

export function getActiveClientCount(): number {
  return clients.size;
}