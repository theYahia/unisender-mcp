#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import http from "node:http";
import { getListsSchema, handleGetLists } from "./tools/lists.js";
import { createListSchema, handleCreateList } from "./tools/create-list.js";
import { createEmailSchema, handleCreateEmail } from "./tools/create-email.js";
import { sendEmailSchema, handleSendEmail } from "./tools/send-email.js";
import { getContactsSchema, handleGetContacts } from "./tools/contacts.js";
import { subscribeSchema, handleSubscribe } from "./tools/subscribe.js";
import {
  getCampaignStatsSchema, handleGetCampaignStats,
  getCampaignDeliveryStatsSchema, handleGetCampaignDeliveryStats,
} from "./tools/campaign-stats.js";
import {
  getTemplatesSchema, handleGetTemplates,
  getTemplateSchema, handleGetTemplate,
} from "./tools/templates.js";

const TOOL_COUNT = 10;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "unisender-mcp",
    version: "1.1.0",
  });

  // === Lists ===
  server.tool(
    "get_lists",
    "Списки рассылки UniSender: ID, название, количество подписчиков.",
    getListsSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleGetLists(params) }],
    }),
  );

  server.tool(
    "create_list",
    "Создать новый список рассылки.",
    createListSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleCreateList(params) }],
    }),
  );

  // === Contacts ===
  server.tool(
    "get_contacts",
    "Контакты из списка рассылки: email, статус подписки.",
    getContactsSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleGetContacts(params) }],
    }),
  );

  server.tool(
    "subscribe",
    "Подписать контакт на список(и) рассылки.",
    subscribeSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleSubscribe(params) }],
    }),
  );

  // === Campaigns ===
  server.tool(
    "create_email",
    "Создать email-сообщение для рассылки: тема, тело, отправитель.",
    createEmailSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleCreateEmail(params) }],
    }),
  );

  server.tool(
    "send_email",
    "Отправить рассылку по созданному письму.",
    sendEmailSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleSendEmail(params) }],
    }),
  );

  server.tool(
    "get_campaign_status",
    "Статус кампании: отправлено, доставлено, открыто, клики.",
    getCampaignStatsSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleGetCampaignStats(params) }],
    }),
  );

  server.tool(
    "get_campaign_delivery_stats",
    "Детальная статистика доставки кампании.",
    getCampaignDeliveryStatsSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleGetCampaignDeliveryStats(params) }],
    }),
  );

  // === Templates ===
  server.tool(
    "get_templates",
    "Список шаблонов писем.",
    getTemplatesSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleGetTemplates(params) }],
    }),
  );

  server.tool(
    "get_template",
    "Получить конкретный шаблон по ID.",
    getTemplateSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleGetTemplate(params) }],
    }),
  );

  return server;
}

async function main() {
  const transport = process.argv.includes("--http")
    ? await startHttp()
    : new StdioServerTransport();

  const server = createServer();
  await server.connect(transport);
  console.error(`[unisender-mcp] Server started. ${TOOL_COUNT} tools. UNISENDER_API_KEY required.`);
}

async function startHttp(): Promise<StreamableHTTPServerTransport> {
  const port = parseInt(process.env.PORT || "3000", 10);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  const httpServer = http.createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/mcp") {
      const body = await collectBody(req);
      const fakeReq = Object.assign(req, { body: JSON.parse(body) });
      await transport.handleRequest(fakeReq, res);
    } else if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", tools: TOOL_COUNT }));
    } else if (req.method === "DELETE" && req.url === "/mcp") {
      await transport.handleRequest(req, res);
    } else {
      res.writeHead(404);
      res.end("Not Found");
    }
  });

  httpServer.listen(port, () => {
    console.error(`[unisender-mcp] HTTP on port ${port}`);
  });

  return transport;
}

function collectBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

main().catch((error) => {
  console.error("[unisender-mcp] Startup error:", error);
  process.exit(1);
});
