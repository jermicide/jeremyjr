// scripts/prebuild.js
// Runs before every build → fresh GitHub data or safe fallback

console.log("DEBUG: Starting prebuild script");

import fs from 'node:fs';
import https from 'node:https';

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const FALLBACK_FILE = './src/data/github.sample.json';
const OUTPUT_FILE = './src/data/github.json';

/** Simple HTTPS GET wrapper */
const fetchGitHub = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path,
      method: 'GET',
      headers: {
        'User-Agent': 'jeremyjr-portfolio-builder',
        Accept: 'application/vnd.github.v3+json',
        ...(GITHUB_TOKEN && { Authorization: `token ${GITHUB_TOKEN}` }),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Invalid JSON from ${path}`));
          }
        } else {
          reject(
            new Error(
              `GitHub API error ${res.statusCode}: ${res.statusMessage}\n${data}`
            )
          );
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

/** Main function */
async function generateGitHubData() {
  if (!GITHUB_USERNAME) {
    console.warn('Warning: GITHUB_USERNAME not set. Using fallback data.');
    fs.mkdirSync('./src/data', { recursive: true });
    fs.copyFileSync(FALLBACK_FILE, OUTPUT_FILE);
    console.log(`Fallback data copied → ${OUTPUT_FILE}`);
    return;
  }

  try {
    console.log(`Fetching GitHub data for @${GITHUB_USERNAME}...`);

    const [profile, reposRaw] = await Promise.all([
      fetchGitHub(`/users/${GITHUB_USERNAME}`),
                                                  fetchGitHub(`/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`),
    ]);

    // Sort by stars and take top 10
    const topRepos = [...reposRaw]
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 10);

    // Language stats
    const languageMap = topRepos.reduce((acc, repo) => {
      const lang = repo.language;
      if (lang) acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {});

    const languages = Object.fromEntries(
      Object.entries(languageMap).sort(([, a], [, b]) => b - a)
    );

    const githubData = {
      generatedAt: new Date().toISOString(),
      profile: {
        name: profile.name || profile.login,
        avatar_url: profile.avatar_url,
        bio: profile.bio || null,
        location: profile.location || null,
        followers: profile.followers || 0,
        html_url: profile.html_url,
      },
      languages,
      repos: topRepos.map((repo) => ({
        name: repo.name,
        description: repo.description || 'No description provided.',
        stargazers_count: repo.stargazers_count || 0,
        html_url: repo.html_url,
        language: repo.language || null,
        homepage: repo.homepage || null,
        topics: repo.topics || [],
      })),
    };

    fs.mkdirSync('./src/data', { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(githubData, null, 2));

    console.log(`Success: Fresh GitHub data saved → ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Error: Failed to fetch GitHub data:', error.message);
    console.log('Falling back to static sample data...');
    fs.mkdirSync('./src/data', { recursive: true });
    fs.copyFileSync(FALLBACK_FILE, OUTPUT_FILE);
    console.log(`Fallback data copied → ${OUTPUT_FILE}`);
  }
}

// Run it
generateGitHubData();
