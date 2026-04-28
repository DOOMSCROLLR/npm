import { DoomscrollrApi } from "@doomscrollr/api";

const doomscrollr = DoomscrollrApi.fromEnv();

const profile = await doomscrollr.getProfile();
console.log(`Connected to @${profile.username ?? "unknown"}`);

const posts = await doomscrollr.listPosts({ per_page: 5 });
console.log(posts.data?.map((post) => post.title));
