import dotenv from "dotenv";
dotenv.config();
import { promises as fs } from "fs";
import Firecrawl from "@mendable/firecrawl-js";

const app = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

// Single Scraping
async function scrape(url) {
    const doc = await app.scrape(url, {
        formats: ["markdown", "html", "branding", "changeTracking"],
        location: { country: "US", languages: ["en"] },
    });

    await fs.writeFile(
        "./firecrawl_scrape.json",
        JSON.stringify(doc, null, 2),
        "utf8",
    );
}

// Single Scraping with action
async function scrapeWithAction(url) {
    const doc = await app.scrape(url, {
        formats: ["markdown"],
        actions: [
            {
                type: "click",
                selector: 'input[type="email"]',
            },
            {
                type: "write",
                selector: 'input[type="email"]',
                text: process.env.FIRECRAWL_EMAIL,
            },
            {
                type: "click",
                selector: 'input[type="password"]',
            },
            {
                type: "write",
                selector: 'input[type="password"]',
                text: process.env.FIRECRAWL_PASSWORD,
            },
            { type: "click", selector: 'button[type="submit"]' },
            { type: "wait", milliseconds: 3000 },
            { type: "screenshot", fullPage: true },
        ],
    });

    await fs.writeFile(
        `./firecrawl_scrapeWithAction.json`,
        JSON.stringify(doc, null, 2),
        "utf8",
    );
}

// Synchronous Batch Scraping
async function syncBatchScrape(urls) {
    const doc = await app.batchScrape(urls, {
        options: { formats: ["markdown"] },
        pollInterval: 2,
        timeout: 120,
    });

    await fs.writeFile(
        `./firecrawl_syncBatchScrape.json`,
        JSON.stringify(doc, null, 2),
        "utf8",
    );
}

// Asynchronous Batch Scraping
async function asyncBatchScrape(urls) {
    const doc = await app.startBatchScrape(urls, {
        options: { formats: ["markdown"] },
    });

    await fs.writeFile(
        `./firecrawl_asyncBatchScrape.json`,
        JSON.stringify(doc, null, 2),
        "utf8",
    );
}

// Synchronouse Batch Scraping with Manual Pagination
async function syncBatchScrapeWithManualPagination(urls) {
    const firstPage = await app.batchScrape(urls, {
        pagination: { autoPaginate: false },
    });
    let allData = [...firstPage.data];
    let nextUrl = firstPage.next;
    while (nextUrl) {
        const nextPage = await app.getBatchScrapeStatusPage(nextUrl);
        allData.push(...nextPage.data);
        nextPage.next ? (nextUrl = nextPage.next) : (nextUrl = null);
    }

    await fs.writeFile(
        `./firecrawl_syncBatchScrapeManualPagination.json`,
        JSON.stringify(allData, null, 2),
        "utf8",
    );
}

// Asynchronous Batch Scraping With Manual Pagination
async function asyncBatchScrapeWithManualPagination(urls) {
    const doc = await app.startBatchScrape(urls, {
        options: { formats: ["markdown"] },
    });

    let status;
    do {
        status = await app.getBatchScrapeStatus(doc.id);
        await new Promise((r) => setTimeout(r, 10000));
    } while (status.status !== "completed" && !status.error);

    let pageData = status.data;
    while (status.next) {
        status = await app.getBatchScrapeStatusPage(status.next);
        pageData.push(...status.data);
    }

    await fs.writeFile(
        `./firecrawl_asyncBatchScrapeManualPagination.json`,
        JSON.stringify(pageData, null, 2),
        "utf8",
    );
}

async function main() {
    console.log("Operations Started");

    await scrape("https://docs.firecrawl.dev/introduction");
    console.log("Scraping Done");

    await scrapeWithAction("https://www.firecrawl.dev/signin?view=signin");
    console.log("Scraping with Actions Done");

    await syncBatchScrape([
        "https://firecrawl.dev",
        "https://docs.firecrawl.dev",
    ]);
    console.log("Synchronous Batch Scraping Done");

    await asyncBatchScrape([
        "https://firecrawl.dev",
        "https://docs.firecrawl.dev",
    ]);
    console.log("Asynchronous Batch Scraping Done");

    await syncBatchScrapeWithManualPagination([
        "https://firecrawl.dev",
        "https://docs.firecrawl.dev",
    ]);
    console.log("Synchronous Batch Scraping With Manual Pagination Done");

    await asyncBatchScrapeWithManualPagination([
        "https://firecrawl.dev",
        "https://docs.firecrawl.dev",
    ]);
    console.log("Asynchronous Batch Scraping With Manual Pagination Done");
}

// main();
