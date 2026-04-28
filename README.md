# @doomscrollr/api

Official typed JavaScript/TypeScript SDK for the [DOOMSCROLLR](https://doomscrollr.com?utm_source=github&utm_medium=readme&utm_campaign=developer_funnel&utm_content=api_homepage) REST API.

Use it when your app, automation, or AI workflow needs owned-audience primitives: posts, pages, products, subscribers, capture widgets, domains, analytics, and replacement flows. For public inspiration, see [`doomscrollr.com/featured`](https://doomscrollr.com/featured?utm_source=github&utm_medium=readme&utm_campaign=developer_funnel&utm_content=api_featured_examples).

Use it from Node.js, serverless functions, workers, and modern runtimes that provide `fetch`. If you are connecting an AI agent over MCP, use [`@doomscrollr/mcp-server`](https://www.npmjs.com/package/@doomscrollr/mcp-server) instead.

## Installation

```bash
npm install @doomscrollr/api
```

Requirements: Node.js 18+ or any runtime with a compatible `fetch` implementation.

## Authentication

Create an API key in the [DOOMSCROLLR dashboard](https://doomscrollr.com/register?free=1&utm_source=github&utm_medium=readme&utm_campaign=developer_funnel&utm_content=api_get_api_key) and pass it as a Bearer token through the client:

```ts
import { DoomscrollrApi } from "@doomscrollr/api";

const doomscrollr = new DoomscrollrApi({
  apiKey: process.env.DOOMSCROLLR_API_KEY,
});
```

You can also read configuration from environment variables:

```ts
const doomscrollr = DoomscrollrApi.fromEnv();
```

Supported variables:

- `DOOMSCROLLR_API_KEY` — dashboard API key
- `DOOMSCROLLR_API_BASE` — optional API base URL override; defaults to `https://doomscrollr.com/api/v1`

The SDK sends authenticated requests as:

```http
Authorization: Bearer <DOOMSCROLLR_API_KEY>
```

`register()` is the only method that does not require an existing API key.

## Quick start

```ts
import { DoomscrollrApi } from "@doomscrollr/api";

const doomscrollr = DoomscrollrApi.fromEnv();

const profile = await doomscrollr.getProfile();
console.log(`Connected to @${profile.username}`);

await doomscrollr.createLinkPost({
  url: "https://example.com/article",
  title: "Useful read",
  tags: "links,research",
  status: "draft",
});
```

## Common workflows

### List posts with pagination and filters

```ts
const page = await doomscrollr.listPosts({
  page: 1,
  per_page: 20,
  status: "published",
  tag: "research",
  q: "porsche",
});

for (const post of page.data) {
  console.log(post.id, post.title);
}

console.log(`Page ${page.current_page} of ${page.last_page ?? "?"}`);
```

List methods return API pagination metadata when available:

- `data`
- `current_page`
- `last_page`
- `per_page`
- `total`

Supported filters include:

- `listPosts({ page, per_page, q, status, tag })`
- `listAudience({ page, per_page, q, tag, bounced })`
- `listProducts({ page, per_page, q, type, min_price, max_price })`

### Create an image post

```ts
await doomscrollr.createImagePost({
  image: "https://example.com/photo.jpg",
  title: "New drop",
  description: "Behind the scenes.",
  tags: "drop,bts",
  status: "scheduled",
  publish_at: "2026-05-01T17:00:00Z",
});
```

### Manage audience records

```ts
await doomscrollr.addSubscriber({
  email: "subscriber@example.com",
  first_name: "Ada",
  tags: ["launch", "vip"],
  source: "website",
});

const csv = await doomscrollr.exportAudience({ tag: "launch" });
console.log(csv);
```

### Create a product

```ts
await doomscrollr.createProduct({
  title: "Tie Dye Pants",
  price: 50,
  type: "physical",
  cover_photo_url: "https://example.com/tie-dye-pants.jpg",
  inventory_count: 10,
  shipping_required: true,
});
```

### Build owned replacement flows

```ts
await doomscrollr.buildLinktree({
  title: "Links",
  intro: "Everything in one owned place.",
  style_preset: "brutalist",
  add_to_navigation: true,
  links: [
    { label: "Shop", url: "https://example.com/shop" },
    { label: "Newsletter", url: "https://example.com/newsletter" },
  ],
});

await doomscrollr.buildSocialFeed({
  title: "Moodboard",
  source_query: "air cooled Porsche",
  limit: 6,
});
```

Available flow helpers:

- `buildLinktree()`
- `buildKomi()`
- `buildShopify()`
- `buildEcommerce()`
- `buildSubstack()`
- `buildNewsletter()`
- `buildWebsite()`
- `buildSocialFeed()`
- `buildMembership()`

### Post ShopMy affiliate recommendations

```ts
await doomscrollr.postShopmyProducts({
  collection_title: "Holiday gifts under $100",
  use_case: "gift guide",
  status: "draft",
  products: [
    {
      url: "https://shopmy.us/example-product",
      note: "Great texture, easy gift.",
    },
  ],
});
```

### Get embed/capture settings

```ts
const embed = await doomscrollr.getEmbedCode();
await doomscrollr.updateCaptureSettings({
  headline: "Join the list",
  enabled: true,
});
```

## Error handling and rate limits

Failed responses throw `DoomscrollrApiError` with the HTTP status, response payload, and rate-limit metadata when the API provides it.

```ts
import { DoomscrollrApiError } from "@doomscrollr/api";

try {
  await doomscrollr.getProfile();
} catch (error) {
  if (error instanceof DoomscrollrApiError) {
    console.error(error.status);
    console.error(error.data);

    if (error.status === 429) {
      console.error(`Rate limit resets at ${error.rateLimit?.reset}`);
    }
  } else {
    throw error;
  }
}
```

The API returns `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers on rate-limited responses; the SDK exposes them as `error.rateLimit`.

## Request cancellation

Every method accepts an optional `{ signal }` request option:

```ts
const controller = new AbortController();
const posts = await doomscrollr.listPosts({ per_page: 10 }, { signal: controller.signal });
```

## Low-level requests

For new API endpoints that are not yet wrapped by a helper, use `request()` directly:

```ts
const result = await doomscrollr.request("GET", "/profile");
```

`textRequest()` is available for text responses such as CSV exports.

## API coverage

The SDK covers the DOOMSCROLLR API v1 surfaces for:

- account registration
- profile and settings
- posts, image posts, and bulk post operations
- audience/subscribers, bulk operations, and CSV export
- products, variants, inventory, and bulk product operations
- domains
- Pinterest, Instagram, and RSS integrations
- embed code and capture widget settings
- pages/contact pages/navigation
- top-liked-post analytics
- curation theme
- owned replacement flows
- ShopMy affiliate recommendations

## License

MIT
