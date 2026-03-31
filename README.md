# @theyahia/unisender-mcp

MCP-сервер для API UniSender — списки рассылки, создание и отправка email, контакты. Требуется API-ключ.

[![npm](https://img.shields.io/npm/v/@theyahia/unisender-mcp)](https://www.npmjs.com/package/@theyahia/unisender-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "unisender": {
      "command": "npx",
      "args": ["-y", "@theyahia/unisender-mcp"],
      "env": {
        "UNISENDER_API_KEY": "ваш_ключ"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add unisender -e UNISENDER_API_KEY=ваш_ключ -- npx -y @theyahia/unisender-mcp
```

## Авторизация

`UNISENDER_API_KEY` — API-ключ UniSender.

## Инструменты (4)

| Инструмент | Описание |
|------------|----------|
| `get_lists` | Списки рассылки |
| `create_email` | Создать email-сообщение |
| `send_email` | Отправить рассылку |
| `get_contacts` | Контакты из списка |

## Примеры запросов

```
Покажи все списки рассылки
Создай письмо с темой "Новая акция" и отправь по списку 123
Сколько контактов в списке?
```

## Лицензия

MIT
