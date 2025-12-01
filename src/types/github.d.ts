// src/types/github.d.ts
export interface Repo {
    name: string;
    description: string;
    stargazers_count: number;
    html_url: string;
    language: string | null;
    homepage: string | null;
    topics: string[];
}

export interface GitHubData {
    user: {
        login: string;
        name: string;
        avatar_url: string;
        bio: string;
        public_repos: number;
        followers: number;
        following: number;
    };
    repos: Repo[];
    languages: Record<string, number>;
}
