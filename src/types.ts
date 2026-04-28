export type PostStatus = "published" | "draft" | "scheduled";
export type ProductType = "physical" | "digital" | "ticket" | "subscription";
export type TextAlignment = "left" | "center" | "right";
export type BuyButtonPosition = "above" | "below";
export type BuyButtonMode = "smart" | "always" | "manual";
export type StylePreset = "skims" | "brutalist" | "editorial" | "minimal";

export interface DoomscrollrClientOptions {
  /** DOOMSCROLLR API key from the dashboard. Not required for register(). */
  apiKey?: string;
  /** Defaults to https://doomscrollr.com/api/v1 */
  baseUrl?: string;
  /** Inject a custom fetch implementation for tests/edge runtimes. */
  fetch?: typeof fetch;
}

export interface RequestOptions {
  signal?: AbortSignal;
}

export interface PaginationParams {
  per_page?: number;
  page?: number;
}

export interface Paginated<T> {
  data: T[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  [key: string]: unknown;
}

export interface RegisterParams {
  email: string;
  username: string;
  password: string;
  name?: string;
}

export interface RegisterResponse {
  username?: string;
  api_key?: string;
  hub_url?: string;
  dashboard_url?: string;
  message?: string;
  [key: string]: unknown;
}

export interface Profile {
  id?: number;
  username?: string;
  name?: string;
  bio?: string | null;
  url?: string;
  feed_url?: string;
  posts_count?: number;
  subscribers_count?: number;
  products_count?: number;
  [key: string]: unknown;
}

export interface SettingsUpdate {
  name?: string;
  bio?: string;
  title?: string;
  description?: string;
  logo?: string;
  favicon?: string;
  og_image?: string;
  font_id?: number;
  user_theme?: string;
  desktop_grid?: number;
  mobile_grid?: number;
  text_alignment?: TextAlignment;
  post_spacing?: number;
  cookie_banner_show?: boolean;
  draft_mode?: boolean;
  google_analytics_account_id?: string;
  facebook_pixel_id?: string;
  cta_bar_text?: string;
  cta_bar_url?: string;
  cta_bar_scroll?: boolean;
  popup_number_posts?: number;
  popup_options_enabled?: boolean;
  popup_show_to_users?: boolean;
  popup_time_delay?: number;
  buy_button_max_width?: number;
  buy_button_position?: BuyButtonPosition;
  buy_button_mode?: BuyButtonMode;
  buy_button_background_color?: string;
  buy_button_text_color?: string;
  buy_button_outline_color?: string;
  [key: string]: unknown;
}

export interface Post {
  id: number;
  title?: string | null;
  description?: string | null;
  url?: string | null;
  image?: string | null;
  status?: PostStatus | string;
  tags?: unknown[];
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface ListPostsParams extends PaginationParams {
  q?: string;
  status?: PostStatus | "published" | "draft";
  tag?: string;
}

export interface CreateLinkPostParams {
  url: string;
  title?: string;
  description?: string;
  tags?: string;
  status?: PostStatus;
  publish_at?: string;
}

export interface CreateImagePostParams {
  image: string;
  title?: string;
  description?: string;
  tags?: string;
  status?: PostStatus;
  publish_at?: string;
}

export interface BulkIdsParams {
  ids: number[];
}

export interface Subscriber {
  id: number;
  email?: string | null;
  email_md5?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  tags?: unknown[];
  [key: string]: unknown;
}

export interface ListAudienceParams extends PaginationParams {
  q?: string;
  tag?: string;
  bounced?: boolean;
}

export interface SubscriberParams {
  email?: string;
  email_md5?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  source?: string;
  city?: string;
  state?: string;
  country?: string;
  bio?: string;
  username?: string;
  followers?: number;
  tags?: string | string[];
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  [key: string]: unknown;
}

export interface ProductVariantOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  variant_data: Record<string, string>;
  price: number;
  inventory_count: number;
  sku?: string;
}

export interface Product {
  id: number;
  title: string;
  description?: string | null;
  price?: number;
  type?: ProductType | string;
  cover_photo_url?: string | null;
  url?: string | null;
  [key: string]: unknown;
}

export interface ListProductsParams extends PaginationParams {
  q?: string;
  type?: ProductType;
  min_price?: number;
  max_price?: number;
}

export interface CreateProductParams {
  title: string;
  description?: string;
  price: number;
  type: ProductType;
  cover_photo_url?: string;
  url?: string;
  inventory_count?: number;
  shipping_required?: boolean;
  shipping_cost?: number;
  variant_options?: ProductVariantOption[];
  variants?: ProductVariant[];
  [key: string]: unknown;
}

export type UpdateProductParams = Partial<CreateProductParams>;

export interface PinterestPin {
  id?: string;
  title?: string;
  description?: string;
  link?: string;
  image_url?: string;
  pinterest_url?: string;
  search_query?: string;
  [key: string]: unknown;
}

export interface SearchPinterestParams {
  query: string;
  limit?: number;
}

export interface SearchPinterestAndPostParams extends SearchPinterestParams {
  status?: PostStatus;
  publish_at?: string;
  tags?: string;
}

export interface PageLink {
  label: string;
  url: string;
}

export interface CreatePageParams {
  title: string;
  content: string;
  add_to_navigation?: boolean;
  navigation_label?: string;
}

export interface CreateContactPageParams {
  title?: string;
  intro?: string;
  links: PageLink[];
  add_to_navigation?: boolean;
  navigation_label?: string;
}

export interface TopLikedPostsParams {
  limit?: number;
  days?: number;
}

export interface CaptureSettingsUpdate {
  [key: string]: unknown;
}

export interface FlowProduct {
  title: string;
  price: number;
  description?: string;
  type?: ProductType;
  cover_photo_url?: string;
}

export interface FlowPage {
  title: string;
  content: string;
}

export interface BuildFlowParams {
  title?: string;
  intro?: string;
  style_preset?: StylePreset;
  add_to_navigation?: boolean;
  navigation_label?: string;
  links?: PageLink[];
  products?: FlowProduct[];
  pages?: FlowPage[];
  feed_url?: string;
  source_query?: string;
  /** Number of imported/created items for supported flows. API accepts 1-10. */
  limit?: number;
  price?: number;
  cover_photo_url?: string;
  [key: string]: unknown;
}

export interface BuildLinksFlowParams extends BuildFlowParams {
  links: PageLink[];
}

export interface FlowResponse {
  message?: string;
  ownership_message?: string;
  next_steps?: string[];
  urls?: Record<string, string>;
  artifacts?: Record<string, unknown>;
  posts?: Post[];
  products?: Product[];
  pages?: unknown[];
  [key: string]: unknown;
}

export interface ShopmyProductRecommendation {
  /** ShopMy affiliate/product URL. */
  url: string;
  title?: string;
  description?: string;
  /** Creator recommendation note. */
  note?: string;
}

export interface PostShopmyProductsParams {
  /** 1-20 ShopMy affiliate/product URLs. */
  products: ShopmyProductRecommendation[];
  collection_title?: string;
  use_case?: string;
  /** Comma-separated tags. The API also adds ShopMy/affiliate recommendation tags. */
  tags?: string;
  status?: PostStatus;
  publish_at?: string;
}

export interface PostShopmyProductsResponse {
  created?: number;
  posts?: Post[];
  message?: string;
  [key: string]: unknown;
}

export interface RateLimitInfo {
  limit?: number;
  remaining?: number;
  reset?: number;
}
