import type { APIRoute } from 'astro';

interface GitHubRepo {
  name: string;
  description: string;
  stargazers_count: number;
  html_url: string;
  language: string;
  homepage?: string; // <-- added
}

interface GitHubProfile {
  name: string;
  avatar_url: string;
  bio: string;
  location: string;
  followers: number;
}

interface FetchedData {
  profile: GitHubProfile;
  repos: GitHubRepo[];
}

// Simple in-memory cache to avoid rate limits
let cache: { data: FetchedData; timestamp: number } | null = null;
const CACHE_DURATION_MS = 1000 * 60 * 60; // 1 hour

export const GET: APIRoute = async ({ request }) => {
  const GITHUB_USERNAME = import.meta.env.GITHUB_USERNAME;
  const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;

  if (!GITHUB_USERNAME) {
    return new Response(
      JSON.stringify({
        error: 'GITHUB_USERNAME environment variable is not set.',
      }),
      { status: 500 }
    );
  }

  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_DURATION_MS) {
    return new Response(JSON.stringify(cache.data));
  }

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'jeremyjr-portfolio',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  try {
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, { headers }),
                                                     fetch(
                                                       `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
                                                       { headers }
                                                     ),
    ]);

    if (!profileRes.ok || !reposRes.ok) {
      throw new Error('Failed to fetch data from GitHub API');
    }

    const profile: GitHubProfile = await profileRes.json();
    const allRepos: GitHubRepo[] = await reposRes.json();

    const topRepos = allRepos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

    const data = {
      profile: {
        name: profile.name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        followers: profile.followers,
      },
      repos: topRepos.map((repo) => ({
        name: repo.name,
        description: repo.description,
        stargazers_count: repo.stargazers_count,
        html_url: repo.html_url,
        language: repo.language,
        homepage: repo.homepage ?? null, // <-- pass homepage through
      })),
    };

    cache = { data, timestamp: now };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch data from GitHub API' }),
                        { status: 500 }
    );
  }
};
