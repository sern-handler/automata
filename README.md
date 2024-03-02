# sern automata

sern Automata is a github bot used to automate stuff in the organization.  
It's written in Typescript and it's basically an express server that listens to github webhooks.

## Features

- [x] **Jobs**: Jobs are groups of bash scripts that are executed inside the docker container that runs the bot.
- [ ] **PR Automations**: Commands that can be executed to check if a PR is valid, to add labels, reviewers...
- [ ] **Issue Automations**: Commands that can be executed to check if an issue is valid, to add labels, assignees...

## Development

We use a devcontainer to develop the bot, but there will be no documentation to set up a development environment at the moment.

## Deployment

Everything is directly hosted at [Railway](https://railway.app/). The bot is deployed using a docker container (see `Dockerfile.api`).