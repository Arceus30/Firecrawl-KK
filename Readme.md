# FireCrawl

It takes a URL, crawls it, and converts it into clean markdown or structured
data. It crawls all accessible subpages and gives a clean data for each. No
sitemap required.

## Key Features
- **Handles dynamic content**: Dynamic websites, JS-rendered sites, PDFs, images
- **Core APIs:**
  - **Scrape:** Scrapes a URL and return its content
  - **Crawl:** Scrapes all the URLs of a web page and returns its content
  - **Map:** Input a website and get all the website URLs – extremely fast
  - **Search:** Search the web and get full content from the results
  - **Extract:** Get structured data from single page, multiple pages, or
entire websites with AI.

## Document Parsing
- Document parsing in Firecrawl works automatically when you
provide a URL that points to a supported document type. The
system will detect the file type based on the URL extension or
content-type header and process it accordingly.
  - **Excel Spreadsheets (.xlsx, .xls):** Each worksheet is converted to an
HTML table. Preserves cell formatting and data types
  - **Word Documents (.docx, .doc, .odt, .rtf):** Extracts text content while
preserving document structure. Maintains headings, paragraphs,
lists, and tables. Preserves basic formatting and styling
  - **PDF Documents (.pdf):** Extracts text content with layout
information. Preserves document structure including sections and
paragraphs. Handles both text-based and scanned PDFs (with OCR
support).

## Proxy
- Firecrawl supports three types of proxies:
  - **basic:** Proxies for scraping most sites. Fast and usually works.
  - **enhanced:** Enhanced proxies for scraping complex sites while
maintaining privacy. Slower, but more reliable on certain
sites. Cost of enhanced proxy is 5 credits.
  - **auto:** Firecrawl will automatically retry scraping with
enhanced proxies if the basic proxy fails. Default proxy: auto.
- Using Enhanced as a Retry Mechanism:
A common pattern is to first try scraping with the default
proxy settings, and then retry with enhanced mode if you
encounter specific error status codes (401, 403, or 500) in the
metadata.statusCode field of the response. These status
codes can be indicative of the website blocking your request.

## Scraping Formats
- Markdown (markdown)
- Summary (summary)
- HTML (html)
- Raw HTML (rawHtml) (with no modifications)
- Screenshot (screenshot, with options like fullPage, quality,
viewport)
- Links (links)
- JSON (Json) - structured output
- Images (images) - extract all image URLs from the page
- Branding (branding) - extract brand identity and design system

## Branding Format
- It extracts comprehensive brand identity information from a
webpage, including colors, fonts, typography, spacing, UI
components, and more.

## Change tracking
- Using the changeTracking format, you can monitor changes on a
website
- It returns:
  - `previousScrapeAt`: The timestamp of the previous scrape that
the current page is being compared against (null if no
previous scrape)
  - `changeStatus`: The result of the comparison between the two
page versions
    - `new`: This page did not exist or was not discovered
   before (usually has a null previousScrapeAt)
    - `same`: This page’s content has not changed since the
   last scrape
    - `changed`: This page’s content has changed since the
   last scrape
    - `removed`: This page was removed since the last scrape
  - `visibility`:
    - `visible`: This page is visible, meaning that its URL was
   discovered through an organic route (through links on
   other visible pages or the sitemap)
    - `hidden`: This page is not visible, meaning it is still
   available on the web, but no longer discoverable via
   the sitemap or crawling the site. We can only identify
   invisible links if they had been visible, and captured,
   during a previous crawl or scrape

- **Advanced Options:** changeTracking can be configured by passing an
object in the format array. Eg:
```
{ type: 'changeTracking',
modes: ['git-diff', 'Json'], // Enable specific change tracking
modes
}
```
  - The git-diff mode provides a traditional diff format like Git’s output.
It shows line-by-line changes with additions and deletions marked.
The structured JSON representation of the diff includes:
    - files: Array of changed files (in web context, typically just one)
    - chunks: Sections of changes within a file
    - changes: Individual line changes with type (add, delete,
normal)
  - JSON mode:
    - The Json mode provides a structured comparison of specific
fields extracted from the content. This is useful for tracking
changes in specific data points rather than the entire content.
  - Matching Previous Scrapes: Previous scrapes to compare against
are currently matched on the source URL, the team ID, the
markdown format, and the tag parameter.
    - For an effective comparison, the input URL should be the
same as the previous request for the same content.
    - Crawling the same URLs with different includePaths/
excludePaths/ includeTags/ excludeTags/ onlyMainContent
will have inconsistencies when using changeTracking.
    - Compared pages will also be compared against previous
scrapes that only have the markdown format without the
changeTracking format.
    - Comparisons are scoped to your team. If you scrape a URL for
the first time with your API key, its changeStatus will always
be new, even if other Firecrawl users have scraped it before.

## Caching
- Avoid storing: Set storeInCache to false if you do not want Firecrawl
to cache/store results for this request.
- When to Use Caching: Documentation, articles, product pages, Bulk
processing jobs, Development, and testing, Building knowledge
bases
- When caching should be skipped: Real-time data (stock prices, live
scores, breaking news), Frequently updated content, Time-sensitive
applications.

# SCRAPE
- `const doc = await app.scrape(URL, scrapeOptions);`
- The above API function scrapes a single webpage and it returns an object
containing clean data in the format specified by scrapeOptions
- scrapeOptions: It is an optional parameter containing
  - format: It is an array specifying the format of the resultant data.
    - The array contains strings like “markdown” or object like:
      - JSON: `{ type: "Json", prompt, schema }`
      - Screenshot: `{ type: "screenshot", fullPage?, quality?,
   viewport? }`
      - Change tracking: `{ type: "changeTracking", modes?,
   prompt?, schema?, tag? }` (requires markdown)
    - Default: [‘markdown’]
  - onlyMainContent: Boolean value; False returns full page content
   and true returns only main page content. Default: true.
  - includeTags: An array of HTML tags/classes/ids to include in the
   scrape.
  - excludeTags: An array of HTML tags/classes/ids to exclude from the
   scrape.
  - waitFor: Milliseconds of extra wait time before scraping (use
   sparingly). This waiting time is in addition to Firecrawl’s smart wait
   feature. Default: 0
  - maxAge: If a cached version of the page is newer than maxAge,
   Firecrawl returns it instantly; otherwise it scrapes fresh and updates
   the cache. Set 0 to always fetch fresh. Default: 172800000 (2 days)
  - timeout: Max duration in milliseconds before aborting. Default:
   30000 (30 seconds)
  - location: {country: <country>(default: “US”), languages: Array of
   languages (default: language of that country [“en”])}
  - storeInCache: It is a Boolean value, if true it stores the result in
cache (speeds up repeat scrapes via maxAge) otherwise not.
  - PDF parsing: Control parsing behavior. To parse PDFs, ```parsers:
["pdf"]```.
    - Cost: PDF parsing costs 1 credit per PDF page. To skip PDF
parsing and receive the file as base64 (1 credit flat),
```parsers: []```.
    - Limit pages: To limit PDF parsing to a specific number of
pages, use parsers: ```[{"type": "pdf", "maxPages": 10}]```.
  - Actions:
    - Perform various actions on a web page before scraping its
content.
    - It is important to almost always use the wait action
before/after executing other actions to give enough time for
the page to load.
    - Supported actions:
      - wait - Wait for page to load: ```{ 'type': 'wait',
   'milliseconds': 1000}``` or ```{ type: "wait", selector: string }```
   (wait for a specific element to be visible using wait with
   a selector parameter)
      - click - Click an element: ```{ 'type': 'click', 'selector':
   '#accept', all?: Boolean }```
      - write - Type text into a field: ```{ 'type': 'write', 'text':
   'FireCrawl' }``` (element must be focused first with click)
      - press - Press a keyboard key: ```{ 'type': 'press', 'key':
   'Enter' }```
      - scroll: Scroll the page: ```{ type: "scroll", direction: "up" |
   "down", selector?: string }``` (if a specific element is to be
   scrolled, provide that element using selector)
      - screenshot - Capture screenshot: ```{ type: "screenshot",
   fullPage?: Boolean, quality?: number, viewport?: {
   width: number, height: number } }```
      - scrape - Scrape sub-element: ```{ type: "scrape" }```
      - executeJavascript - Run JS code: ```{ type:
   "executeJavascript", script: string }```
      - pdf - Generate PDF: ```{ type: "pdf", format?: string,
   landscape?: Boolean, scale?: number }```
- Synchronous Batch Scraping:
  - The synchronous method will return the results of the batch scrape
job
  - `const job = await app.batchScrape(array_of_URLS, params);`
  - params: It is an optional parameter containing
    - options: optional scrapeOptions
    - pollInterval: Seconds between internal status polls
    - timeout: Max seconds to wait for completion before erroring.
    - pagination: It is an optional parameter object containing:
      - autoPaginate: Boolean value.
        - If true: fetches all pages automatically merges
   into single data array
        - If false: next page is stored in the next attribute.
- Asynchronous Batch Scraping:
  - The asynchronous method will return a job ID that you can
use to check the status of the batch scrape. We can use an
infinite loop and check at regular intervals when this job gets
completed.
  - `const batchStart = await app.startBatchScrape(array_of_URLS, params);`
  - params: It is an optional parameter containing:
    - options: optional scrapeOptions
    - webhook: Webhook Config (gets notified on
   completed, failed, or per-page events.)
  - Use getBatchScrapeStatus(id) to check manually.
  - Manual Pagination:
    - `const status = app.getBatchScrapeStatus(id);`
    - Next page is stored in the status.next
  - We have to manually poll for the first page but for the
subsequent pages there is no need of polling they are already
fetched.

# CRAWL
- `const res = await app.crawl(baseUrl, crawlerOptions);`
- The above API function scrapes a webpage and its subpages and it returns
an object containing clean data in the format specified by crawlOptions
- Calling the crawl method will submit a crawl job, wait for it to finish, and
return the complete results for the entire site.
- Crawl Status:
  - The crawl() returns a job ID which can be used to check status.
  - `const status = await app.getCrawlStatus(“<crawl-id>”);`
  - returns either “scraping” or “completed” or “cancellation”
- Cancel Crawl: ```const ok = await app.cancelCrawl("<crawl-id>");```
- If the content is larger than 10MB or if the crawl job is still running, the
response may include a next parameter, a URL to the next page of results.
- crawlerOptions: It is an optional parameter containing all the
scrapeOptions attributes and:
  - includePaths: An array of regex patterned paths to include in the
crawl
  - excludePaths: An array of regex patterned paths not to be included
in the crawl
  - maxDiscoveryDepth: It determines the maximum discovery depth
for finding new URLs
  - crawlEntireDomain: Boolean value determining whether to explore
across siblings/parents to cover entire domain. Default: false
  - allowExternalLinks: Boolean value determining whether to Follow
links to external domains. Default: false
  - allowSubdomains: Boolean value determining whether to Follow
subdomains of the main domain. Default: false
  - limit: Max number of pages to crawl. Default: 10000
  - delay: delay in seconds between scrapes
- Crawl a website with Web Sockets:
  - `crawlUrlAndWatch(url [,params]);`
  - Event Types:
    - “document”: Fires each time Firecrawl successfully crawls
and processes a new page.
    - “error”: Fires when any crawl error occurs (network failure,
page timeout, parsing issue).
    - “done”: Fires once when the entire crawl completes (hits
limit, exhausts links, or times out).
```
const response = await app.startCrawl(baseUrl, { limit: 2 });
const watcher = app.watcher(response.id, {
kind: "crawl",
pollInterval: 2,
timeout: 120,
});
watcher.on("document", async (doc) => console.log(doc)};
watcher.on("error", async (err) => console.log(err));
watcher.on("done", (state) => console.log("DONE",
state.status));
await watcher.start();
```

# SEARCH
- ` app.search(query, searchOptions)`
- Perform web searches and optionally scrape the search results in one
operation.
  - Choose specific sources (web, news, images)
  - Search the web with customizable parameters (location, etc.)
- searchOptions: Optional parameter conataining scrapeOptions and:
  - limit: limit the number of searches
  - location: string
  - categories: filter search results by specific categories, It is an array
of:
    - “github”: Search within GitHub repositories, code, issues, and
documentation
    - “research”: Search academic and research websites (arXiv,
Nature, IEEE, PubMed, etc.)
    - “pdf”: Search for PDFs
  - sources: array like [‘web’, ‘news’, ‘images’]
    - web: standard web results (default)
    - news: news-focused results
    - images: image search results
  - timeouts: time spent per request
  - Time based Search: Use the tbs parameter to filter results by time:
    - qdr:h - Past hour
    - qdr:d - Past 24 hours
    - qdr:w - Past week
    - qdr:m - Past month
    - qdr:y - Past year
    - Custom date range format: tbs: "cdr: 1, cd_min: 12/1/2024,
cd_max: 12/31/2024"

# MAP
- `app.map(URL, mapOptions);`
- It takes the starting URL as a parameter and returns all the links on the
website.
- mapOptions:
  - search: Filter Links containing search
  - limit: Maximum number of links to return
  - sitemap: control sitemap usage during mapping. Values: only,
include or skip. Default: ‘include’
  - includeSubdomains: Boolean value whether to include subdomains
of the website or not. Default: false
  - Location and Language: Specify country and preferred languages to
get relevant content based on your target location and language
preferences.

# EXTRACT
- `app.extract({urls, prompt, schema, ...otherExtractOptions})`
- It extracts specific data. Data can be extracted with pre-defined schema
or without schema.
- If extract is called without schema. The llm chooses the structure of the
data.
  - Urls: List of urls from where data will be extracted.
  - prompt: Help guide extraction.
  - schema: JSON Schema for the structured output.
  - required: an array of required fields from the schema
- Calling the extract method will submit an extraction job, wait for it to
finish, and return the complete results for the entire site.

# Webhook
- Webhooks let you receive real-time notifications as your operations
progress, instead of polling for status.

| Operation    | Events |
| -------- | ------- |
| Crawl  | started, page, completed    |
| Batch | started, page, completed     |
| Extract    | started, completed, failed    |


- Add a webhook Object to the request, `webhook: {url, metadata: {any_key}
,events}`

| Field    | Type   | Required | Description                           |
| -------- | ------ | -------- | ------------------------------------  |
| url      | String | Yes      | URL Endpoint                          |
| headers  | object | No       | Custom headers to include             |
| metadata | object | No       | Custom data to include                |
| events   | array  | No       | Event Types to receive (default: all) |

- Timeouts & Retries
  - Endpoint must respond with a 2xx status within 10 seconds.
  - If delivery fails (timeout, non-2xx, or network error), Firecrawl
retries automatically:

| Retry | Delay After Failure |
| ----- | ------------------- |
| 1st   | 1 minute            |
| 2nd   | 5 minute            |
| 3rd   | 15 minutes          |
- After 3 failed retries, the webhook is marked as failed and no
further attempts are made.
```
curl -X POST https://api.firecrawl.dev/v2/crawl \
- H 'Content-Type: application/json' \
- H 'Authorization: Bearer YOUR_API_KEY' \
- d '{
  "url": "https://docs.firecrawl.dev",
  "limit": 100,
  "webhook": {
  "url": "https://your-domain.com/webhook",
  "metadata": {
  "any_key": "any_value"
  },
  "events": ["started", "page", "completed"]
  }
  }'
```
