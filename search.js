import dotenv from "dotenv";
dotenv.config();
import { promises as fs } from "fs";
import Firecrawl from "@mendable/firecrawl-js";

const app = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

async function search(query) {
    const results = await app.search(query, {
        limit: 3,
        scrapeOptions: { formats: ["markdown"] },
    });
    await fs.writeFile(
        `./firecrawl_search.json`,
        JSON.stringify(results, null, 2),
        "utf8",
    );
}

async function main() {
    console.log("Operations Started");

    await search("firecrawl");
    console.log("Searching Done");
}

// main();
