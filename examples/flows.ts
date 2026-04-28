import { DoomscrollrApi } from "@doomscrollr/api";

const doomscrollr = DoomscrollrApi.fromEnv();

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
