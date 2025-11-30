// scripts/prebuild.js
console.log("DEBUG: Starting prebuild script");
import fs from 'fs';
import https from 'https';

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const FALLBACK_FILE = './src/data/github.sample.json';
const OUTPUT_FILE = './src/data/github.json';

if (!GITHUB_USERNAME) {
  console.log('⚠️ GITHUB_USERNAME not set. Using fallback data.');
  fs.copyFileSync(FALLBACK_FILE, OUTPUT_FILE);
  process.exit(0);
}

const fetchGitHub = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      headers: {
        'User-Agent': 'jeremyjr-portfolio-builder',
        'Accept': 'application/vnd.github.v3+json',
        ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` }),
      },
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to fetch ${path}. Status: ${res.statusCode}. Body: ${data}`));
        }
      });
    }).on('error', (err) => reject(err));
  });
};

async function getGitHubData() {
  try {
    console.log(`Fetching GitHub data for user: ${GITHUB_USERNAME}...`);

    const [profile, repos] = await Promise.all([
      fetchGitHub(`/users/${GITHUB_USERNAME}`),
      fetchGitHub(`/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`),
    ]);

    const topRepos = repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 10); // Get top 10 for the projects page

    const languages = repos.reduce((acc, repo) => {
      if (repo.language) {
        acc[repo.language] = (acc[repo.language] || 0) + 1;
      }
      return acc;
    }, {});

    const githubData = {
      profile: {
        name: profile.name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        followers: profile.followers,
        html_url: profile.html_url,
      },
      repos: topRepos,
      languages: Object.fromEntries(
        Object.entries(languages).sort(([, a], [, b]) => b - a)
      ),
    };

    fs.mkdirSync('./src/data', { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(githubData, null, 2));

    console.log(`✅ GitHub data saved to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('❌ Error fetching GitHub data:', error.message);
    console.log('Using fallback data instead.');
    fs.mkdirSync('./src/data', { recursive: true });
    fs.copyFileSync(FALLBACK_FILE, OUTPUT_FILE);
  }
}

getGitHubData();
