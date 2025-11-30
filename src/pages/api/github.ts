// src/pages/api/github.ts

import type { APIRoute } from 'astro';

interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  html_url: string;
  language: string | null;
  homepage: string | null;
}

interface GitHubProfile {
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  followers: number;
}

interface FetchedData {
  profile: GitHubProfile;
  repos: GitHubRepo[];
}

// In-memory cache (clears on server restart — perfect for Vercel/Netlify/Azure)
let cache: { data: FetchedData; timestamp: number } | null = null;
const CACHE_DURATION_MS = 1000 * 60 * 60; // 1 hour

export const GET: APIRoute = async () => {
  const GITHUB_USERNAME = import.meta.env.GITHUB_USERNAME as string | undefined;
  const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN as string | undefined;

  // Fail fast if no username
  if (!GITHUB_USERNAME) {
    return new Response(
      JSON.stringify({ error: 'GITHUB_USERNAME environment variable is not set.' }),
                        { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const now = Date.now();

  // Return cached data if still fresh
  if (cache && now - cache.timestamp < CACHE_DURATION_MS) {
    return new Response(JSON.stringify(cache.data), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 's-maxage=3600' },
    });
  }

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'jeremyjr-portfolio',
  };

  if (GITHUB_TOKEN) {
    headers.Authorization = `token ${GITHUB_TOKEN}`;
  }

  try {
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, { headers }),
                                                     fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`, { headers }),
    ]);

    if (!profileRes.ok || !reposRes.ok) {
      throw new Error('GitHub API request failed');
    }

    const profileData = await profileRes.json();
    const allRepos: unknown[] = await reposRes.json();

    // Sort by stars and take top 5
    const topRepos = (allRepos as any[])
    .sort((a: any, b: any) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)
    .map((repo: any): GitHubRepo => ({
      name: repo.name,
      description: repo.description ?? 'No description provided.',
      stargazers_count: repo.stargazers_count,
      html_url: repo.html_url,
      language: repo.language ?? null,
      homepage: repo.homepage ?? null,
    }));

    const data: FetchedData = {
      profile: {
        name: profileData.name ?? GITHUB_USERNAME,
        avatar_url: profileData.avatar_url,
        bio: profileData.bio ?? null,
        location: profileData.location ?? null,
        followers: profileData.followers ?? 0,
      },
      repos: topRepos,
    };

    // Cache the result
    cache = { data, timestamp: now };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('GitHub API fetch failed:', error);

    // Optional: fall back to static file if you want
    // try { const fallback = await import('../../public/data/github.json'); return Response... }

    return new Response(
      JSON.stringify({ error: 'Failed to fetch GitHub data' }),
                        { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
