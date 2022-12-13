import { serve } from "https://deno.land/std@0.145.0/http/server.ts";

async function handler(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (Deno.env.get("STATE") != state) {
    return new Response("Not authorized", { status: 401 });
  }

  console.log("CODE:", code);
  console.log("STATE:", state);
  console.log(`Referer: ${req.headers.get("Referer")}`);

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
  let returnUrl: string;

  // alfred://runtrigger/com.whomwah.alfred.github/auth/?argument=test
  if (jsonData.error) {
    const error =
      `${jsonData.error.error}: ${jsonData.error.error_description}`;
    returnUrl = `${Deno.env.get("REDIRECT_URL")}?argument=@@@error@@@${error}`;
  } else {
    returnUrl = `${
      Deno.env.get("REDIRECT_URL")
    }?argument=@@@token@@@${jsonData.access_token}`;
  }

  return Response.redirect(returnUrl, 302);
}

serve(handler);
