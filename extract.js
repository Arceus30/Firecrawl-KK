import dotenv from "dotenv";
dotenv.config();
import { promises as fs } from "fs";
import Firecrawl from "@mendable/firecrawl-js";

const app = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

// Synchronous extract job
async function syncExtract(urls) {
    const result = await app.extract({
        urls,
        prompt: "Extract the page title, meta description, main features list, and primary API endpoints from the documentation homepage.",
        schema: {
            type: "object",
            properties: {
                title: { type: "string" },
                description: { type: "string" },
                features: {
                    type: "array",
                    items: { type: "string" },
                },
                api_endpoints: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            description: { type: "string" },
                        },
                    },
                },
            },
            required: ["title", "description", "features"],
        },
    });

    await fs.writeFile(
        "./firecrawl-syncExtract.json",
        JSON.stringify(result, null, 2),
        "utf8",
    );
}

// asynchronous extract job
async function asyncExtract(urls) {
    const started = await app.startExtract({
        urls,
        prompt: "Extract the page title, meta description, main features list, and primary API endpoints from the documentation homepage.",
        schema: {
            type: "object",
            properties: {
                title: { type: "string" },
                description: { type: "string" },
                features: {
                    type: "array",
                    items: { type: "string" },
                },
                api_endpoints: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            description: { type: "string" },
                        },
                    },
                },
            },
            required: ["title", "description", "features"],
        },
    });

    // Poll until completed
    let status;
    while (true) {
        status = await app.getExtractStatus(started.id);
        console.log("Status:", status.status);

        if (status.status === "completed") {
            await fs.writeFile(
                "./firecrawl-asyncExtract.json",
                JSON.stringify(status, null, 2),
                "utf8",
            );
            break;
        } else if (status.status === "failed") {
            console.error("Failed:", status.error);
            break;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
}

async function main() {
    console.log("Operations Started");

    await syncExtract(["https://docs.firecrawl.dev"]);
    console.log("Synchronous Extraction Done");

    await asyncExtract(["https://docs.firecrawl.dev"]);
    console.log("Asynchronous Extraction Done");
}

// main();
