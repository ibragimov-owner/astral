/**
 * FILE: server.ts
 * ASTRAL - Full-stack Backend (Express + Vite)
 */
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  // Note: Most AI logic will be on the client to follow GenAI SDK guidelines,
  // but we provide server-side structure for potential database integrations.
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ASTRAL Online", timestamp: new Date() });
  });

  // Example backend-only logic for zodiac calculations if needed
  app.post("/api/zodiac", (req, res) => {
    const { month, day } = req.body;
    // Basic logic could go here, but we will handle most of this on frontend for responsiveness
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\x1b[35m[ASTRAL]\x1b[0m Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
