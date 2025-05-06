import type { ConfigInput } from "testplane";
import { readFileSync } from "node:fs";

export default {
  gridUrl: "http://127.0.0.1:4444/wd/hub",
  baseUrl: "file:///",
  pageLoadTimeout: 1000,
  httpTimeout: 10000,
  testTimeout: 70000,
  waitTimeout: 500,
  waitInterval: 500,
  resetCursor: false,
  headless: true,
  browsers: {
    "chrome": {
      automationProtocol: "devtools",
      headless: true,
      sessionsPerBrowser: 1,
      desiredCapabilities: {
        browserName: "chrome",
        "goog:chromeOptions": {
          args: ["--no-sandbox"],
      },
      },
    },
  },
  prepareBrowser: (browser) => {
    browser.url(readFileSync(".entry-point", "utf-8"));
  },
} satisfies ConfigInput;
