/**
 * Alfred GitHub Workflow Authentication Handler
 *
 * This script implements a simple OAuth flow handler for GitHub authentication
 * in an Alfred workflow. It processes the OAuth callback from GitHub,
 * exchanges the authorization code for an access token, and redirects back
 * to Alfred with either the token or an error message.
 *
 * Environment variables required:
 * - STATE: A random string used to prevent CSRF attacks
 * - CLIENTID: GitHub OAuth app client ID
 * - SECRET: GitHub OAuth app client secret
 * - REDIRECT_URL: Alfred URL scheme to redirect back to (usually alfred://runtrigger/...)
 */
async function handler(req: Request) {
  // Parse the incoming request URL
  const url = new URL(req.url);
  // Extract authorization code and state from the callback URL query parameters
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // Verify the state parameter to prevent CSRF attacks
  if (Deno.env.get("STATE") != state) {
    return new Response("Not authorized", { status: 401 });
  }

  // Log debugging information
  console.log("CODE:", code);
  console.log("STATE:", state);
  console.log(`Referer: ${req.headers.get("Referer")}`);

  // Create request to exchange authorization code for access token
  const request = new Request("https://github.com/login/oauth/access_token", {
    method: "POST",
    body: JSON.stringify({
      client_id: Deno.env.get("CLIENTID"),
      client_secret: Deno.env.get("SECRET"),
      code: code,
    }),
    headers: {
      "content-type": "application/json",
      "Accept": "application/json",
    },
  });

  // Send request to GitHub OAuth endpoint and parse response
  const resp = await fetch(request);
  const jsonData = await resp.json();
  let returnUrl: string;

  // Example URL format: alfred://runtrigger/com.whomwah.alfred.github/auth/?argument=test
  if (jsonData.error) {
    // Handle error case - pass error details back to Alfred
    const error = `${jsonData.error}: ${jsonData.error_description}`;
    returnUrl = `${Deno.env.get("REDIRECT_URL")}?argument=@@@error@@@${error}`;
  } else {
    // Success case - pass access token back to Alfred
    returnUrl = `${
      Deno.env.get("REDIRECT_URL")
    }?argument=@@@token@@@${jsonData.access_token}`;
  }

  // Redirect back to Alfred with the result
  return Response.redirect(returnUrl, 302);
}

// Start the Deno HTTP server using the handler function
Deno.serve(handler);
