import dotenv from "dotenv";
dotenv.config();
import { promises as fs } from "fs";
import Firecrawl from "@mendable/firecrawl-js";

const app = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

async function crawlMap(url) {
    const res = await app.map(url, {
        limit: 3,
        sitemap: "include",
    });

    await fs.writeFile(
        `./firecrawl_map.json`,
        JSON.stringify(res, null, 2),
        "utf8",
    );
}

async function main() {
    console.log("Operations started");

    await crawlMap("https://firecrawl.dev");
    console.log("Mapping Done");
}

// main();
