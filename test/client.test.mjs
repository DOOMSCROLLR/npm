import assert from "node:assert/strict";
import { test } from "node:test";
import { DoomscrollrApi, DoomscrollrApiError } from "../dist/index.js";

function mockFetch(handler) {
  return async (input, init = {}) => handler(String(input), init);
}

test("sends bearer auth and query params for GET requests", async () => {
  const client = new DoomscrollrApi({
    apiKey: "test-key",
    baseUrl: "https://example.test/api/v1/",
    fetch: mockFetch((url, init) => {
      assert.equal(url, "https://example.test/api/v1/posts?per_page=5&q=porsche");
      assert.equal(init.method, "GET");
      assert.equal(init.headers.Authorization, "Bearer test-key");
      return Response.json({ data: [] });
    }),
  });

  await client.listPosts({ per_page: 5, q: "porsche" });
});

test("serializes JSON bodies for write requests", async () => {
  const client = new DoomscrollrApi({
    apiKey: "test-key",
    baseUrl: "https://example.test/api/v1",
    fetch: mockFetch((url, init) => {
      assert.equal(url, "https://example.test/api/v1/products");
      assert.equal(init.method, "POST");
      assert.equal(init.headers["Content-Type"], "application/json");
      assert.deepEqual(JSON.parse(String(init.body)), {
        title: "Tie Dye Pants",
        price: 50,
        type: "physical",
      });
      return Response.json({ id: 123, title: "Tie Dye Pants" }, { status: 201 });
    }),
  });

  const product = await client.createProduct({ title: "Tie Dye Pants", price: 50, type: "physical" });
  assert.equal(product.id, 123);
});

test("wraps owned flow and affiliate endpoints", async () => {
  const calls = [];
  const client = new DoomscrollrApi({
    apiKey: "test-key",
    baseUrl: "https://example.test/api/v1",
    fetch: mockFetch((url, init) => {
      calls.push({ url, init });
      return Response.json({ ok: true });
    }),
  });

  await client.buildLinktree({
    title: "Links",
    links: [{ label: "Shop", url: "https://example.test/shop" }],
  });
  await client.postShopmyProducts({
    products: [{ url: "https://shopmy.us/example" }],
    status: "draft",
  });

  assert.equal(calls[0].url, "https://example.test/api/v1/flows/linktree");
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), {
    title: "Links",
    links: [{ label: "Shop", url: "https://example.test/shop" }],
  });
  assert.equal(calls[1].url, "https://example.test/api/v1/affiliate/shopmy/posts");
  assert.deepEqual(JSON.parse(String(calls[1].init.body)), {
    products: [{ url: "https://shopmy.us/example" }],
    status: "draft",
  });
});

test("throws DoomscrollrApiError with rate limit metadata", async () => {
  const client = new DoomscrollrApi({
    apiKey: "test-key",
    baseUrl: "https://example.test/api/v1",
    fetch: mockFetch(() => Response.json(
      { error: "Monthly API limit reached" },
      {
        status: 429,
        headers: {
          "x-ratelimit-limit": "1000",
          "x-ratelimit-remaining": "0",
          "x-ratelimit-reset": "1777600000",
        },
      },
    )),
  });

  await assert.rejects(client.getProfile(), (error) => {
    assert.ok(error instanceof DoomscrollrApiError);
    assert.equal(error.status, 429);
    assert.equal(error.rateLimit?.limit, 1000);
    assert.equal(error.rateLimit?.remaining, 0);
    assert.equal(error.rateLimit?.reset, 1777600000);
    return true;
  });
});
