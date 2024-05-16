import http from "node:http";

import { parse } from "cookie";

const backend = http.createServer((req, res) => {
  if (req.url === "/api/auth/validate") {
    console.log({
      set_cookies: parse(req.headers.cookie || ""),
    });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(
      JSON.stringify({
        id: 42,
        email: "someone@example.com",
        permissions: 2,
        suspended: false,
      }),
    );
    res.end();
    return;
  }
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello World\n");
});

backend.listen(8180, "0.0.0.0", () => {
  console.log("Backend running at http://0.0.0.0:8180/");
});

const frontend = http.createServer((req, res) => {
  if (req.url?.startsWith("/haddock30")) {
    const proxyReq = http.request(
      {
        host: "localhost",
        port: 3000,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );

    req.pipe(proxyReq);
  } else if (req.url === "/login" || req.url === "/registration") {
    console.log("Setting cookie");
    const setCookie = "bonvinlab_auth_token=sometoken; Path=/; HttpOnly";
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "set-cookie": setCookie,
    });
    res.end("Logged in or registed\n");
  } else if (req.url === "/logout") {
    console.log("Clearing cookie");
    const setCookie =
      'bonvinlab_auth_token=""; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "set-cookie": setCookie,
    });
    res.end("Logged out\n");
  } else if (req.url === "/dashboard") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Dashboard\n");
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found\n");
  }
});

frontend.listen(8000, "0.0.0.0", () => {
  console.log("Frontend running at http://0.0.0.0:8000/");
});
