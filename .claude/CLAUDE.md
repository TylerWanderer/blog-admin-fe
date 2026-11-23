# Project Overview

## About me
I'm a backend software engineer with 2 years of experience in .NET, mostly building APIs. I'm new to Python, Vue and AWS. My main learning goals are prompting AI tools and AWS. Python, Vue comes second, and I only need to understand Vue at the architecture level.

## The project
A personal blog engine built with Python 3, Vue 3, and AWS. I plan to share it publicly, so it should be built properly from the start: production-quality code, clear structure, and an architecture that can scale. We are in Vue 3 Project

## Repositories
The app is split into three repos:
- **Blog site** (frontend, Vue 3): the public-facing blog
- **Admin site** (frontend, Vue 3): content management and administration
- **Backend API** (Python 3): serves both frontends

## Goals
4. **Vue (architecture only).** Understand how the frontends are organised: component structure, Pinia state, routing, the API client, CORS, and the build and deploy pipeline. I don't need to learn the syntax line by line.

## How to work with me
- **Prompting AI tools.** When a task would work well as a skill, sub-agent, hook or `CLAUDE.md` rule, point it out, and let me write the first draft so I get the practice. Then review it like a code review: what's unclear, what's missing, what the model will misread, and why. When I give you a vague or ambiguous prompt, do the work, then briefly tell me how I could have phrased it better. Explain how you use context and tools when it helps me write better prompts.
- **Vue.** You build the frontends. Explain the architecture as you go, such as how components are organised, how Pinia stores work, how the app talks to the API and how CORS and the pipeline fit in, but keep syntax explanations minimal.


## Git workflow

The API repo uses GitHub Flow: create a short-lived branch from `main`, open a pull request, and merge once CI is green. Commit or push only when the user asks. The repo is private, so required checks may not be enforced: don't merge on a red check.

CI is in `blog-engine-api/.github/workflows/ci.yml`. It runs Ruff and pytest on pull requests and on pushes to `main`, using a temporary MySQL 8.4 service container rather than RDS.

## Rules

- Follow current best practices and briefly explain why when you choose an approach.
- Prefer clean, maintainable solutions over quick hacks, since this will be shared and grow over time.
- When there are meaningful trade-offs (e.g. AWS services, architecture choices), outline the options before implementing.
- Follow standard Python app structure, conventions and best practices.
- Be my sparring partner: don't simply follow my instructions. If anything doesn't make sense, raise your opinion.