import { preview, type PreviewServer } from "vite";

let server: PreviewServer;

export async function setup() {
  server = await preview({
    preview: {
      port: 4173,
      strictPort: true,
    },
  });
}

export async function teardown() {
  await new Promise<void>((resolve, reject) => {
    server.httpServer.close((err) => {
      if (err) {
        console.error("Failed to close preview server:", err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
