import { serve } from "https://deno.land/std@0.145.0/http/server.ts";
import * as queryString from "https://deno.land/x/querystring@v1.0.2/mod.js";

async function handler(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  console.log("CODE:", code);
  console.log("STATE:", state);

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

  const resp = await fetch(request);
  const jsonData = await resp.json();
  console.log(jsonData);
  const query = queryString.stringify(jsonData, { arrayFormat: "comma" });
  let returnUrl: string;

  if (Deno.env.get("STATE") != state) {
    return new Response("Not authorized", { status: 401 });
  } else if (jsonData.error) {
    returnUrl = `${Deno.env.get("REDIRECT_URL")}?${query}`;
  } else {
    returnUrl = `${Deno.env.get("REDIRECT_URL")}?access_token=${jsonData.access_token}`;
  }

  return Response.redirect(returnUrl, 302);
}

serve(handler);
