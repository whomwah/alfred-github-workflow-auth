# Alfred GitHub Workflow Authentication Handler

A simple OAuth flow handler for GitHub authentication in Alfred workflows. This project provides a Deno-based server that handles the OAuth callback from GitHub, exchanges the authorization code for an access token, and redirects back to Alfred with either the token or an error message.

## Overview

This authentication handler serves as a middleware between Alfred workflows and GitHub's OAuth API. It allows Alfred workflows to authenticate users with their GitHub accounts without having to implement the OAuth flow themselves.

## Requirements

- [Deno](https://deno.land/) (for running the server)
- [Alfred](https://www.alfredapp.com/) with Powerpack (for running workflows)
- A GitHub OAuth App (for client ID and secret)

## Setup

1. Register a new OAuth application on GitHub:
   - Go to GitHub Settings > Developer settings > OAuth Apps > New OAuth App
   - Set the Authorization callback URL to where this server will be hosted

2. Configure environment variables:
   - `STATE`: A random string used to prevent CSRF attacks
   - `CLIENTID`: Your GitHub OAuth app client ID
   - `SECRET`: Your GitHub OAuth app client secret
   - `REDIRECT_URL`: Alfred URL scheme to redirect back to (e.g., `alfred://runtrigger/com.yourid.workflow/auth/`)

3. Deploy this server to handle OAuth callbacks

## Usage

This server is designed to be used as part of an Alfred workflow that requires GitHub authentication. In your workflow:

1. Direct users to the GitHub OAuth authorization page
2. When GitHub redirects to this server with the authorization code
3. The server exchanges the code for an access token
4. The server redirects back to Alfred with the token or error information

## How It Works

1. GitHub redirects to this server with a code and state parameter
2. The server verifies the state parameter to prevent CSRF attacks
3. The server exchanges the code for an access token with GitHub's API
4. The server redirects back to Alfred with either:
   - A success message and token: `alfred://...?argument=@@@token@@@YOUR_TOKEN`
   - An error message: `alfred://...?argument=@@@error@@@ERROR_DESCRIPTION`

## Development

Run the server locally with:

```bash
deno run --allow-net --allow-env main.ts
```

## License

[MIT](LICENSE)
