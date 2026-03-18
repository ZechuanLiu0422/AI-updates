import { defineConfig } from "@trigger.dev/sdk/v3";
import { puppeteer } from "@trigger.dev/build/extensions/puppeteer";

export default defineConfig({
  project: "proj_vzwhsvqkierkorhivzgq",
  maxDuration: 300,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./src/trigger"],
  build: {
    extensions: [puppeteer()],
  },
});
