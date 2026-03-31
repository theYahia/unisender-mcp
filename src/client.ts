const BASE_URL = "https://api.unisender.com/ru/api/";
const TIMEOUT = 15_000;
const MAX_RETRIES = 3;

function getApiKey(): string {
  const key = process.env.UNISENDER_API_KEY;
  if (!key) {
    throw new Error("Переменная окружения UNISENDER_API_KEY не задана");
  }
  return key;
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);

      if (response.ok) return response;

      if (response.status >= 500 && attempt < retries) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(`[unisender-mcp] ${response.status} от ${url}, повтор через ${delay}мс (${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      const body = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}: ${response.statusText}. ${body}`);
    } catch (error) {
      clearTimeout(timer);
      if (attempt === retries) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        console.error(`[unisender-mcp] Таймаут ${url}, повтор (${attempt}/${retries})`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Все попытки исчерпаны");
}

export async function apiCall(method: string, params: Record<string, string> = {}): Promise<unknown> {
  const url = new URL(method, BASE_URL);
  url.searchParams.set("format", "json");
  url.searchParams.set("api_key", getApiKey());
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }
  const response = await fetchWithRetry(url.toString());
  const data = await response.json() as { error?: string; code?: string; result?: unknown };
  if (data.error) {
    throw new Error(`UniSender ошибка: ${data.error} (код: ${data.code || "неизвестно"})`);
  }
  return data.result;
}
