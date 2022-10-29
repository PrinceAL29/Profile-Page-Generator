const fs = require("fs");
const chalk = require("chalk");
const { build } = require("esbuild");
const esbuildSvelte = require("esbuild-svelte");

const mode = process.env.mode || "prod";

build({
  entryPoints: [ "./client/app.js" ],
  outfile: './dist/bundle.js',
  minify: mode === "prod",
  bundle: true,
	sourcemap: mode === "dev" ? 'inline' : false,
	watch: mode === "dev",
	plugins: [
		esbuildSvelte(),
		{
   	 name: 'start/end',
	    setup(build) {
				let lastBuild;
				let firstBuild = 0;

				const messages = [
					"compiling...",
					"change detected reloading...",
				]

				const header = chalk.greenBright.italic("client") + " - ";
				
	      build.onStart(() => {
					console.log(header + chalk.blue("wait ") + " - " + messages[firstBuild]);
					lastBuild = Date.now();
					firstBuild = 1;
				})
				
	      build.onEnd(result => {
					if (result.errors.length === 0) {
						process.send("");
						return console.log(header + chalk.magenta("event") + ` - compiled successfully in ${chalk.greenBright.bold((Date.now() - lastBuild) + "ms")}.`);
					}
					
					console.log(header + chalk.red("error") + " - " + `compilation failed.`);
				})
	    },
	  }
	]
})
.catch(() => process.exit(1))