import ky from "ky";

export const githubApi = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_BASE_URL,
});
