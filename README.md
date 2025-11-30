# Jeremy Jr - Static Portfolio

A fully static personal portfolio website built with [Astro](https://astro.build/) and [Tailwind CSS](https://tailwindcss.com/). All dynamic data from GitHub is fetched at **build time**, meaning the deployed site consists of only static HTML, CSS, and JavaScript, with no runtime API calls.

## Core Features

- **100% Static**: No server-side rendering or serverless functions. Perfect for any static hosting platform.
- **Build-Time Data Fetching**: A Node.js script fetches GitHub profile info, top repos, and languages before the build, saving them to a local JSON file.
- **Styling**: Styled with Tailwind CSS, featuring a green, Matrix-inspired dark theme.
- **Animations**: Lightweight, vanilla JS "Matrix Rain" animated background with a fallback for reduced motion.
- **Azure Ready**: Includes a sample `azure-pipelines.yml` for easy deployment.

## Project Setup

1.  **Clone the repository.**

2.  **Environment Variables:**

    The build script requires your GitHub username to fetch data. Create a `.env` file in the root of your project:

    ```env
    GITHUB_USERNAME=your-github-username
    ```

    For a higher API rate limit during the build, you can provide a [Personal Access Token](https://github.com/settings/tokens):

    ```env
    GITHUB_TOKEN=your-github-personal-access-token
    ```
    The token only needs `public_repo` and `read:user` permissions. If `GITHUB_USERNAME` is not set, a fallback sample data file will be used.

3.  **Install dependencies:**
    ```bash
    npm install
    ```

## Local Development

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local dev server. **Note:** This does not run the prebuild script. The site will use the existing `src/data/github.json` or fail if it doesn't exist. |
| `npm run prebuild` | Manually runs the script to fetch GitHub data. |
| `npm run build` | Builds the static site for production to `./dist/`. This automatically runs the prebuild script first. |
| `npm run preview` | Previews your static build locally. |


## Azure Pipeline Deployment

This project is configured for static deployment on services like Azure Static Web Apps.

1.  **Set Secret Variables in Azure DevOps**:
    In your Azure Pipeline settings, create two secret variables: `GITHUB_USERNAME` and `GITHUB_TOKEN`.

2.  **`azure-pipelines.yml`**:
    Use the following pipeline configuration. It installs Node.js, installs dependencies, runs the build (which includes the prebuild script), and publishes the static `dist` folder as an artifact named `www`.

    ```yaml
    # azure-pipelines.yml
    trigger:
    - main

    pool:
      vmImage: 'ubuntu-latest'

    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
      displayName: 'Install Node.js'

    - script: npm ci
      displayName: 'Install Dependencies'

    - script: npm run build
      displayName: 'Build Static Site'
      env:
        # Map Azure secret variables to environment variables for the prebuild script
        GITHUB_USERNAME: $(GITHUB_USERNAME)
        GITHUB_TOKEN: $(GITHUB_TOKEN)

    - task: CopyFiles@2
      inputs:
        SourceFolder: '$(System.DefaultWorkingDirectory)/dist'
        TargetFolder: '$(Build.ArtifactStagingDirectory)'
      displayName: 'Copy build output to artifacts'

    - task: PublishBuildArtifacts@1
      inputs:
        PathtoPublish: '$(Build.ArtifactStagingDirectory)'
        ArtifactName: 'www' # Required for Azure Static Web Apps
      displayName: 'Publish Artifact'
    ```