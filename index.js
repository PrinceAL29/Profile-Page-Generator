const fork = require("child_process").fork;
const { createServer } = require("http");
const express = require("express");
const chalk = require("chalk");
const path = require("path");
const app = express();
const server = createServer(app);
const mode = process.env.mode || "prod";
const fetch = require("node-fetch");

if (mode === "dev") {
	const { WebSocketServer } = require("ws");
	const builder = fork("./build.js");

	const wss = new WebSocketServer({ server });
	const clients = [];

	wss.on("connection", (sock) => clients.push(sock))

	builder.on("message", () => {
	  for (let i = 0; i < clients.length; i++)
			clients[i].send("change");
	});
}
else {
	fork("./build.js");
}

const page = path.join(__dirname, mode === 'dev' ? "dist/dev.html" : "dist/prod.html");
const dist = path.join(__dirname, "dist/");
const public = path.join(__dirname, "public");

const fetchReplInfo = (username, repl) => {
	return new Promise(async (res, rej) => {
		fetch("https://replit.com/graphql", {
			method: "POST",
			headers: {
				"Referer": "https://replit.com/",
				"Content-Type": "application/json",
				"X-Requested-With": "XMLHttpRequest",
				"User-Agent": "mozilla/5.0"
			},
			body: JSON.stringify({
				query: `query ReplView($url: String!) {
  repl(url: $url) {
    ... on Repl {
      title
      description
      iconUrl
      url
    }
  }
}`,
				variables: { url: `/@${username}/${repl.replace(/ /g, "-")}` }
			})
		})
			.then(r => r.json())
			.then(data => {
				if (!data.errors)
					return res(data.data.repl);
				
				// console.error("Error fetching repl info:", data.errors);
				res({})
			})
	})
}

const fetchUserInfo = (username) => {
	return new Promise(async (res, rej) => {
		fetch("https://replit.com/graphql", {
			method: "POST",
			headers: {
				"Referer": "https://replit.com/",
				"Content-Type": "application/json",
				"X-Requested-With": "XMLHttpRequest",
				"User-Agent": "mozilla/5.0"
			},
			body: JSON.stringify({
				query: `query userByUsername($name: String!) {
  user: userByUsername(username: $name) {
		image
	}
}`,
				variables: { name: username }
			})
		})
			.then(r => r.json())
			.then(data => {
				if (!data.errors)
					return res(data.data.user);
				
				// console.error("Error fetching repl info:", data.errors);
				res({})
			})
	})
}

app.use("/app_static", express.static(dist));
app.use("/static", express.static(public));
app.use(express.json());

app.get("/", (req, res) => {
	res.sendFile(page);
});

app.post("/api/get_user", async (req, res) => {
	if (!req.body.username)
		return res.status(400).send("Missing username");

	res.json(
		await fetchUserInfo(req.body.username)
	)
})

app.post("/api/get_repls", async (req, res) => {
	if (!Array.isArray(req.body.repls) || !req.body.username)
		return res.status(400).send("Invalid request.");

	const repls = await Promise.all(
		req.body.repls.map((repl) => fetchReplInfo(req.body.username, repl))
	)

	res.json(repls);
})

server.listen(3000, () => {
	console.log(chalk.greenBright.bold("server") + " - " + chalk.magenta("event") + " - Listening on :3000")
});