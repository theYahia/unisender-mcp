#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getListsSchema, handleGetLists } from "./tools/lists.js";
import { createEmailSchema, handleCreateEmail } from "./tools/create-email.js";
import { sendEmailSchema, handleSendEmail } from "./tools/send-email.js";
import { getContactsSchema, handleGetContacts } from "./tools/contacts.js";

const server = new McpServer({
  name: "unisender-mcp",
  version: "1.0.0",
});

server.tool(
  "get_lists",
  "Списки рассылки UniSender: ID, название, количество подписчиков.",
  getListsSchema.shape,
  async (params) => ({
    content: [{ type: "text", text: await handleGetLists(params) }],
  }),
);

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
  "get_contacts",
  "Контакты из списка рассылки: email, статус подписки.",
  getContactsSchema.shape,
  async (params) => ({
    content: [{ type: "text", text: await handleGetContacts(params) }],
  }),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[unisender-mcp] Сервер запущен. 4 инструмента. Требуется UNISENDER_API_KEY.");
}

main().catch((error) => {
  console.error("[unisender-mcp] Ошибка запуска:", error);
  process.exit(1);
});
