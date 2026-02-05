import dotenv from "dotenv";
dotenv.config();
import { promises as fs } from "fs";
import Firecrawl from "@mendable/firecrawl-js";

const app = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

// Synchronous Crawl
async function syncCrawl(baseUrl) {
    const response = await app.crawl(baseUrl, {
        limit: 2,
        scrapeOptions: { formats: ["markdown", "html"] },
    });

    await fs.writeFile(
        "./firecrawl_syncCrawl.json",
        JSON.stringify(response, null, 2),
        "utf8",
    );
}

// Ascynchronous Crawl
async function asyncCrawl(baseUrl) {
    const crawlStart = await app.startCrawl(baseUrl, {
        limit: 2,
        scrapeOptions: { formats: ["markdown", "html"] },
    });

    let status;
    while (true) {
        status = await app.getCrawlStatus(crawlStart.id);
        console.log(`Status: ${status.status}`);

        if (status.status === "completed") {
            await fs.writeFile(
                "./firecrawl_asyncCrawl.json",
                JSON.stringify(status, null, 2),
                "utf8",
            );
            break;
        } else if (status.status === "failed") {
            console.error("Crawl failed:", status.error);
            break;
        }
        // Wait 2 seconds before next poll
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
}

// Crawl With WebSockets
async function crawlWithWebSockets(baseUrl) {
    const response = await app.startCrawl(baseUrl, {
        excludePaths: ["blog/*"],
        limit: 2,
    });

    const watcher = app.watcher(response.id, {
        kind: "crawl",
        pollInterval: 2,
        timeout: 120,
    });

    watcher.on("document", async (doc) => {
        await fs.writeFile(
            "./firecrawl_crawlWebSockets_Doc.json",
            JSON.stringify(doc, null, 2),
            "utf8",
        );
    });

    watcher.on("error", async (err) => {
        await fs.writeFile(
            "./firecrawl_crawlWebSockets_Error.json",
            JSON.stringify(err, null, 2),
            "utf8",
        );
    });

    watcher.on("done", (state) => {
        console.log("DONE", state.status);
    });

    await watcher.start();

    await fs.writeFile(
        "./firecrawl_crawlWebSockets.json",
        JSON.stringify(response, null, 2),
        "utf8",
    );
}

async function main() {
    console.log("Operations Started");

    // await syncCrawl("https://firecrawl.dev");
    // console.log("Synchronous Crawl");

    await asyncCrawl("https://firecrawl.dev");
    console.log("Asynchronous Crawl");

    // await crawlWithWebSockets("https://mendable.ai");
    // console.log("Crawl With WebSockets");
}

main();
