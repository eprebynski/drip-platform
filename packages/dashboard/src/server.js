import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createDashboardStore } from "./dashboard-store.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "..", "public");
const store = createDashboardStore();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8"
};

export function createDashboardServer() {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);

      if (request.method === "GET" && url.pathname === "/api/dashboard") {
        return json(response, 200, store.getSnapshot());
      }

      if (
        request.method === "POST" &&
        url.pathname.startsWith("/api/codex-review/") &&
        url.pathname.endsWith("/status")
      ) {
        const reviewItemId = decodeURIComponent(
          url.pathname.replace("/api/codex-review/", "").replace("/status", "")
        );
        const patch = await readJsonBody(request);
        return json(response, 200, store.updateCodexReviewItem(reviewItemId, patch));
      }

      if (
        request.method === "POST" &&
        url.pathname.startsWith("/api/human-review/") &&
        url.pathname.endsWith("/status")
      ) {
        const taskId = decodeURIComponent(
          url.pathname.replace("/api/human-review/", "").replace("/status", "")
        );
        const patch = await readJsonBody(request);
        return json(response, 200, store.updateHumanReviewTask(taskId, patch));
      }

      if (request.method === "GET") {
        const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
        return serveStatic(pathname, response);
      }

      return json(response, 405, { error: "Method not allowed" });
    } catch (error) {
      return json(response, 400, { error: error.message });
    }
  });
}

async function serveStatic(pathname, response) {
  const safeName = pathname.replace(/^\/+/, "");
  if (safeName.includes("..")) {
    return json(response, 404, { error: "Not found" });
  }
  const filePath = join(publicDir, safeName);
  const body = await readFile(filePath);
  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath)] ?? "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(body);
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) {
    return {};
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function json(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 5174);
  createDashboardServer().listen(port, "127.0.0.1", () => {
    console.log(`Drip Admin Dashboard local server: http://127.0.0.1:${port}`);
  });
}
