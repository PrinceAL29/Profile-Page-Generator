import App from "./src/App.svelte";

// Dev reload support
document.body.innerHTML = "";

new App({
	target: document.body
})