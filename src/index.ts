export * from "./types.js";

import type {
  BuildFlowParams,
  BuildLinksFlowParams,
  BulkIdsParams,
  CaptureSettingsUpdate,
  CreateContactPageParams,
  CreateImagePostParams,
  CreateLinkPostParams,
  CreatePageParams,
  CreateProductParams,
  DoomscrollrClientOptions,
  ListAudienceParams,
  ListPostsParams,
  ListProductsParams,
  FlowResponse,
  Paginated,
  PinterestPin,
  Post,
  Product,
  PostShopmyProductsParams,
  PostShopmyProductsResponse,
  Profile,
  RateLimitInfo,
  RegisterParams,
  RegisterResponse,
  RequestOptions,
  SearchPinterestAndPostParams,
  SearchPinterestParams,
  SettingsUpdate,
  Subscriber,
  SubscriberParams,
  TopLikedPostsParams,
  UpdateProductParams,
} from "./types.js";

export const DEFAULT_BASE_URL = "https://doomscrollr.com/api/v1";
export const DOOMSCROLLR_API_CLIENT = "@doomscrollr/api";
export const DOOMSCROLLR_API_CLIENT_VERSION = "0.1.3";

export class DoomscrollrApiError extends Error {
  readonly status: number;
  readonly data: unknown;
  readonly rateLimit: RateLimitInfo | undefined;

  constructor(message: string, status: number, data: unknown, rateLimit?: RateLimitInfo) {
    super(message);
    this.name = "DoomscrollrApiError";
    this.status = status;
    this.data = data;
    this.rateLimit = rateLimit;
  }
}

export class DoomscrollrApi {
  readonly baseUrl: string;
  private readonly apiKey: string | undefined;
  private readonly fetchImpl: typeof fetch;

  constructor(options: DoomscrollrClientOptions = {}) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.fetchImpl = options.fetch || globalThis.fetch;

    if (!this.fetchImpl) {
      throw new Error("No fetch implementation available. Use Node 18+ or pass { fetch }.");
    }
  }

  static fromEnv(env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {}): DoomscrollrApi {
    const options: DoomscrollrClientOptions = {};
    if (env.DOOMSCROLLR_API_KEY) options.apiKey = env.DOOMSCROLLR_API_KEY;
    if (env.DOOMSCROLLR_API_BASE) options.baseUrl = env.DOOMSCROLLR_API_BASE;
    return new DoomscrollrApi(options);
  }

  async request<T = unknown>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = this.buildUrl(path, method === "GET" || method === "HEAD" ? body : undefined);
    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-Doomscrollr-Client": DOOMSCROLLR_API_CLIENT,
      "X-Doomscrollr-Client-Version": DOOMSCROLLR_API_CLIENT_VERSION,
    };

    const init: RequestInit = { method, headers };
    if (options.signal) init.signal = options.signal;

    if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`;
    if (body && method !== "GET" && method !== "HEAD") {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    const response = await this.fetchImpl(url, init);
    const data = await this.parseResponse(response);

    if (!response.ok) {
      throw this.toError(response, data);
    }

    return data as T;
  }

  async textRequest(
    method: string,
    path: string,
    body?: Record<string, unknown>,
    options: RequestOptions = {},
  ): Promise<string> {
    const url = this.buildUrl(path, method === "GET" || method === "HEAD" ? body : undefined);
    const headers: Record<string, string> = {
      Accept: "text/csv, text/plain, application/json",
      "X-Doomscrollr-Client": DOOMSCROLLR_API_CLIENT,
      "X-Doomscrollr-Client-Version": DOOMSCROLLR_API_CLIENT_VERSION,
    };

    const init: RequestInit = { method, headers };
    if (options.signal) init.signal = options.signal;
    if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`;
    if (body && method !== "GET" && method !== "HEAD") {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    const response = await this.fetchImpl(url, init);
    const text = await response.text();

    if (!response.ok) {
      throw this.toError(response, safeJson(text) ?? text);
    }

    return text;
  }

  // Registration (no auth required)
  register(params: RegisterParams, options?: RequestOptions) {
    return this.request<RegisterResponse>("POST", "/register", params as unknown as Record<string, unknown>, options);
  }

  // Hub/profile
  getProfile(options?: RequestOptions) {
    return this.request<Profile>("GET", "/profile", undefined, options);
  }

  // Settings
  getSettings(options?: RequestOptions) {
    return this.request<Record<string, unknown>>("GET", "/settings", undefined, options);
  }

  updateSettings(params: SettingsUpdate, options?: RequestOptions) {
    return this.request<Record<string, unknown>>("PATCH", "/settings", params, options);
  }

  // Posts
  listPosts(params?: ListPostsParams, options?: RequestOptions) {
    return this.request<Paginated<Post>>("GET", "/posts", params as Record<string, unknown> | undefined, options);
  }

  createLinkPost(params: CreateLinkPostParams, options?: RequestOptions) {
    return this.request<Post>("POST", "/posts", params as unknown as Record<string, unknown>, options);
  }

  createImagePost(params: CreateImagePostParams, options?: RequestOptions) {
    return this.request<Post>("POST", "/posts/image", params as unknown as Record<string, unknown>, options);
  }

  showPost(id: number, options?: RequestOptions) {
    return this.request<Post>("GET", `/posts/${id}`, undefined, options);
  }

  getPost(id: number, options?: RequestOptions) {
    return this.showPost(id, options);
  }

  updatePost(id: number, params: Partial<CreateLinkPostParams & CreateImagePostParams>, options?: RequestOptions) {
    return this.request<Post>("PATCH", `/posts/${id}`, params as Record<string, unknown>, options);
  }

  deletePost(id: number, options?: RequestOptions) {
    return this.request<{ ok?: boolean }>("DELETE", `/posts/${id}`, undefined, options);
  }

  bulkUpdatePosts(params: Record<string, unknown>, options?: RequestOptions) {
    return this.request("PATCH", "/posts/bulk", params, options);
  }

  bulkDeletePosts(idsOrParams: number[] | BulkIdsParams, options?: RequestOptions) {
    const params = Array.isArray(idsOrParams) ? { ids: idsOrParams } : idsOrParams;
    return this.request("DELETE", "/posts/bulk", params as unknown as Record<string, unknown>, options);
  }

  // Audience
  listAudience(params?: ListAudienceParams, options?: RequestOptions) {
    return this.request<Paginated<Subscriber>>("GET", "/audience", params as Record<string, unknown> | undefined, options);
  }

  exportAudience(params?: Omit<ListAudienceParams, "page" | "per_page">, options?: RequestOptions) {
    return this.textRequest("GET", "/audience/export", params as Record<string, unknown> | undefined, options);
  }

  addSubscriber(params: SubscriberParams, options?: RequestOptions) {
    return this.request<Subscriber>("POST", "/audience", params, options);
  }

  showSubscriber(id: number, options?: RequestOptions) {
    return this.request<Subscriber>("GET", `/audience/${id}`, undefined, options);
  }

  getSubscriber(id: number, options?: RequestOptions) {
    return this.showSubscriber(id, options);
  }

  updateSubscriber(id: number, params: SubscriberParams, options?: RequestOptions) {
    return this.request<Subscriber>("PATCH", `/audience/${id}`, params, options);
  }

  removeSubscriber(id: number, options?: RequestOptions) {
    return this.request<{ ok?: boolean }>("DELETE", `/audience/${id}`, undefined, options);
  }

  bulkUpdateSubscribers(params: Record<string, unknown>, options?: RequestOptions) {
    return this.request("PATCH", "/audience/bulk", params, options);
  }

  bulkDeleteSubscribers(idsOrParams: number[] | BulkIdsParams, options?: RequestOptions) {
    const params = Array.isArray(idsOrParams) ? { ids: idsOrParams } : idsOrParams;
    return this.request("DELETE", "/audience/bulk", params as unknown as Record<string, unknown>, options);
  }

  // Products
  listProducts(params?: ListProductsParams, options?: RequestOptions) {
    return this.request<Paginated<Product>>("GET", "/products", params as Record<string, unknown> | undefined, options);
  }

  createProduct(params: CreateProductParams, options?: RequestOptions) {
    return this.request<Product>("POST", "/products", params, options);
  }

  showProduct(id: number, options?: RequestOptions) {
    return this.request<Product>("GET", `/products/${id}`, undefined, options);
  }

  getProduct(id: number, options?: RequestOptions) {
    return this.showProduct(id, options);
  }

  updateProduct(id: number, params: UpdateProductParams, options?: RequestOptions) {
    return this.request<Product>("PATCH", `/products/${id}`, params, options);
  }

  deleteProduct(id: number, options?: RequestOptions) {
    return this.request<{ ok?: boolean }>("DELETE", `/products/${id}`, undefined, options);
  }

  bulkUpdateProducts(params: Record<string, unknown>, options?: RequestOptions) {
    return this.request("PATCH", "/products/bulk", params, options);
  }

  bulkDeleteProducts(idsOrParams: number[] | BulkIdsParams, options?: RequestOptions) {
    const params = Array.isArray(idsOrParams) ? { ids: idsOrParams } : idsOrParams;
    return this.request("DELETE", "/products/bulk", params as unknown as Record<string, unknown>, options);
  }

  // Domains
  searchDomains(name: string, options?: RequestOptions) {
    return this.request("POST", "/domain/search", { name }, options);
  }

  connectDomain(domain: string, options?: RequestOptions) {
    return this.request("POST", "/domain/connect", { domain }, options);
  }

  buyDomain(domain: string, options?: RequestOptions) {
    return this.request("POST", "/domain/buy", { domain }, options);
  }

  domainStatus(options?: RequestOptions) {
    return this.request("GET", "/domain/status", undefined, options);
  }

  disconnectDomain(domain: string, options?: RequestOptions) {
    return this.request("DELETE", `/domain/${encodeURIComponent(domain)}`, undefined, options);
  }

  // Integrations
  searchPinterest(params: SearchPinterestParams, options?: RequestOptions) {
    return this.request<{ query: string; pins: PinterestPin[] }>("GET", "/integrations/pinterest/search", params as unknown as Record<string, unknown>, options);
  }

  searchPinterestAndPost(params: SearchPinterestAndPostParams, options?: RequestOptions) {
    return this.request<{ query: string; created: number; posts: Post[] }>("POST", "/integrations/pinterest/search-post", params as unknown as Record<string, unknown>, options);
  }

  connectPinterest(boardUrl: string, options?: RequestOptions) {
    return this.request("POST", "/integrations/pinterest/connect", { board_url: boardUrl }, options);
  }

  pinterestStatus(options?: RequestOptions) {
    return this.request("GET", "/integrations/pinterest/status", undefined, options);
  }

  disconnectPinterest(integrationId?: number, options?: RequestOptions) {
    return this.request("DELETE", "/integrations/pinterest", integrationId ? { integration_id: integrationId } : undefined, options);
  }

  connectInstagram(options?: RequestOptions) {
    return this.request("POST", "/integrations/instagram", {}, options);
  }

  connectRss(feedUrl: string, options?: RequestOptions) {
    return this.request("POST", "/integrations/rss", { feed_url: feedUrl }, options);
  }

  rssStatus(options?: RequestOptions) {
    return this.request("GET", "/integrations/rss/status", undefined, options);
  }

  disconnectRss(integrationId?: number, options?: RequestOptions) {
    return this.request("DELETE", "/integrations/rss", integrationId ? { integration_id: integrationId } : undefined, options);
  }

  // Analytics
  topLikedPosts(params?: TopLikedPostsParams, options?: RequestOptions) {
    return this.request("GET", "/analytics/top-liked-posts", params as Record<string, unknown> | undefined, options);
  }

  // Pages/navigation
  listPages(options?: RequestOptions) {
    return this.request("GET", "/pages", undefined, options);
  }

  createPage(params: CreatePageParams, options?: RequestOptions) {
    return this.request("POST", "/pages", params as unknown as Record<string, unknown>, options);
  }

  createContactPage(params: CreateContactPageParams, options?: RequestOptions) {
    return this.request("POST", "/pages/contact", params as unknown as Record<string, unknown>, options);
  }

  // Capture/embed
  getEmbedCode(options?: RequestOptions) {
    return this.request("GET", "/embed", undefined, options);
  }

  getCaptureSettings(options?: RequestOptions) {
    return this.request("GET", "/capture", undefined, options);
  }

  updateCapture(params: CaptureSettingsUpdate, options?: RequestOptions) {
    return this.request("PATCH", "/capture", params, options);
  }

  updateCaptureSettings(params: CaptureSettingsUpdate, options?: RequestOptions) {
    return this.updateCapture(params, options);
  }

  // Replacement flows
  buildLinktree(params: BuildLinksFlowParams, options?: RequestOptions) {
    return this.request<FlowResponse>("POST", "/flows/linktree", params as unknown as Record<string, unknown>, options);
  }

  buildKomi(params: BuildLinksFlowParams, options?: RequestOptions) {
    return this.request<FlowResponse>("POST", "/flows/komi", params as unknown as Record<string, unknown>, options);
  }

  buildShopify(params: BuildFlowParams = {}, options?: RequestOptions) {
    return this.request<FlowResponse>("POST", "/flows/shopify", params, options);
  }

  buildEcommerce(params: BuildFlowParams = {}, options?: RequestOptions) {
    return this.request<FlowResponse>("POST", "/flows/ecommerce", params, options);
  }

  buildSubstack(params: BuildFlowParams = {}, options?: RequestOptions) {
    return this.request<FlowResponse>("POST", "/flows/substack", params, options);
  }

  buildNewsletter(params: BuildFlowParams = {}, options?: RequestOptions) {
    return this.request<FlowResponse>("POST", "/flows/newsletter", params, options);
  }

  buildWebsite(params: BuildFlowParams = {}, options?: RequestOptions) {
    return this.request<FlowResponse>("POST", "/flows/website", params, options);
  }

  buildSocialFeed(params: BuildFlowParams = {}, options?: RequestOptions) {
    return this.request<FlowResponse>("POST", "/flows/social-feed", params, options);
  }

  buildMembership(params: BuildFlowParams = {}, options?: RequestOptions) {
    return this.request<FlowResponse>("POST", "/flows/membership", params, options);
  }

  // Affiliate
  postShopmyProducts(params: PostShopmyProductsParams, options?: RequestOptions) {
    return this.request<PostShopmyProductsResponse>("POST", "/affiliate/shopmy/posts", params as unknown as Record<string, unknown>, options);
  }

  // Curation theme
  getCurationTheme(options?: RequestOptions) {
    return this.request("GET", "/curation-theme", undefined, options);
  }

  updateCurationTheme(theme: string | null, options?: RequestOptions) {
    return this.request("PUT", "/curation-theme", { theme }, options);
  }

  private buildUrl(path: string, query?: Record<string, unknown>): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === "") continue;
        if (Array.isArray(value)) {
          for (const item of value) url.searchParams.append(key, String(item));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private async parseResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type") || "";
    if (response.status === 204) return {};
    if (contentType.includes("application/json")) return response.json().catch(() => ({}));
    const text = await response.text();
    return safeJson(text) ?? text;
  }

  private toError(response: Response, data: unknown): DoomscrollrApiError {
    const message =
      data && typeof data === "object"
        ? String((data as Record<string, unknown>).error || (data as Record<string, unknown>).message || `HTTP ${response.status}`)
        : String(data || `HTTP ${response.status}`);

    const rateLimit: RateLimitInfo = {};
    const limit = numberHeader(response, "x-ratelimit-limit");
    const remaining = numberHeader(response, "x-ratelimit-remaining");
    const reset = numberHeader(response, "x-ratelimit-reset");
    if (limit !== undefined) rateLimit.limit = limit;
    if (remaining !== undefined) rateLimit.remaining = remaining;
    if (reset !== undefined) rateLimit.reset = reset;

    return new DoomscrollrApiError(
      message,
      response.status,
      data,
      Object.keys(rateLimit).length ? rateLimit : undefined,
    );
  }
}

export const DoomscrollrClient = DoomscrollrApi;
export default DoomscrollrApi;

function numberHeader(response: Response, name: string): number | undefined {
  const value = response.headers.get(name);
  if (!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function safeJson(text: string): unknown | undefined {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
