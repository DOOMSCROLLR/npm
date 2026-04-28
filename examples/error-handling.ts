import { DoomscrollrApi, DoomscrollrApiError } from "@doomscrollr/api";

const doomscrollr = DoomscrollrApi.fromEnv();

try {
  const audience = await doomscrollr.listAudience({ per_page: 20, tag: "launch" });
  console.log(`Loaded ${audience.data.length} subscribers`);
} catch (error) {
  if (error instanceof DoomscrollrApiError) {
    console.error(`DOOMSCROLLR API error ${error.status}: ${error.message}`);

    if (error.status === 429) {
      console.error(`Rate limit resets at ${error.rateLimit?.reset}`);
    }
  } else {
    throw error;
  }
}
