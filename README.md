# @doomscrollr/api

Typed JavaScript/TypeScript client for the [DOOMSCROLLR](https://doomscrollr.com) REST API.

Use this when you want a normal SDK for app/server code. If you are connecting an AI agent over MCP, use [`@doomscrollr/mcp-server`](https://www.npmjs.com/package/@doomscrollr/mcp-server) instead.

## Install

```bash
npm install @doomscrollr/api
```

## Quick start

```ts
import { DoomscrollrApi } from "@doomscrollr/api";

const doomscrollr = new DoomscrollrApi({
  apiKey: process.env.DOOMSCROLLR_API_KEY,
});

const profile = await doomscrollr.getProfile();
console.log(profile.username);

await doomscrollr.createLinkPost({
  url: "https://example.com/article",
  title: "Useful read",
  tags: "links,research",
  status: "draft",
});
```

Or use environment variables:

```ts
import { DoomscrollrApi } from "@doomscrollr/api";

const doomscrollr = DoomscrollrApi.fromEnv();
```

Supported env vars:

- `DOOMSCROLLR_API_KEY` — dashboard API key
- `DOOMSCROLLR_API_BASE` — optional override, defaults to `https://doomscrollr.com/api/v1`

## Common workflows

### Search Pinterest and create DOOMSCROLLR posts

```ts
await doomscrollr.searchPinterestAndPost({
  query: "air cooled Porsche",
  limit: 3,
  status: "draft",
  tags: "porsche,cars,inspiration",
});
```

### Create a product from a photo

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

### See which posts are getting the most likes

```ts
const analytics = await doomscrollr.topLikedPosts({ days: 30, limit: 10 });
console.log(analytics);
```

### Create a LinkTree-style contact page and add it to navigation

```ts
await doomscrollr.createContactPage({
  title: "Contact",
  intro: "Find me here.",
  add_to_navigation: true,
  links: [
    { label: "Instagram", url: "https://instagram.com/doomscrollr" },
    { label: "Shop", url: "https://doomscrollr.com" },
    { label: "Email", url: "mailto:hello@doomscrollr.com" },
  ],
});
```

### Update styling/settings

```ts
await doomscrollr.updateSettings({
  user_theme: "light",
  desktop_grid: 3,
  mobile_grid: 2,
  text_alignment: "center",
  post_spacing: 36,
  buy_button_background_color: "#111111",
  buy_button_text_color: "#F6F1EA",
});
```

## API surface

The client covers the authenticated API v1 surfaces used by DOOMSCROLLR MCP and dashboard AI:

- profile/settings
- posts and image posts
- audience/subscribers and CSV export
- products, variants, inventory, and bulk operations
- domains
- Pinterest/RSS/Instagram integrations
- capture widget/embed code
- pages/contact pages/navigation
- top-liked-post analytics
- curation theme

## Errors and rate limits

Failed responses throw `DoomscrollrApiError`:

```ts
try {
  await doomscrollr.getProfile();
} catch (error) {
  if (error instanceof DoomscrollrApiError) {
    console.log(error.status);
    console.log(error.data);
    console.log(error.rateLimit?.remaining);
  }
}
```

## Auth

The REST API uses:

```http
Authorization: Bearer <DOOMSCROLLR_API_KEY>
```

Get an API key from the DOOMSCROLLR dashboard.

## License

MIT
