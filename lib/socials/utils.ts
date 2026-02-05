import type { NormalizedPost } from "./types";

export function attachUserId<T extends Omit<NormalizedPost, "user_id">>(
  posts: T[],
  user_id: string
): NormalizedPost[] {
  return posts.map((p) => ({ ...p, user_id }));
}