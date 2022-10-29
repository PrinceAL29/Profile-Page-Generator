<script>
	import "../colors.css"
	import "../style.css"

	let username = "";
	let description = "";
	let projects = [ "" ];
	let socials = {
		twitter: "",
		discord: "",
		linkedin: "",
		github: "",
		youtube: ""
	}
	let aboutMe = "";
	let fetchedRepls = [];
	let copyValue = "";
	let fetchedImage = "";

	let previousAbort;

	$: {
		const controller = new AbortController()

		if (previousAbort)
			previousAbort.abort();
		
		previousAbort = controller;
		
		fetch("/api/get_user", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username }),
			signal: controller.signal
		})
			.then(r => r.json())
			.then(user => {
				fetchedImage = user.image;
			})
	}

	async function fetchProjects() {
		try {
				fetchedRepls = await fetch("/api/get_repls", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, repls: projects })
			})
				.then(r => r.json())
		} catch(e) {
			alert("Please add a valid username.")
		}
	}

	function removeProject(projecti) {
		projects.pop(projecti)
		projects = [ ...projects ]
	}

	const addProject = () => projects = [ ...projects, "" ]

	let previewFrame;

	$: {
		if (previewFrame) {
			previewFrame.contentWindow.postMessage(JSON.stringify({
				username,
				socials,
				description,
				projects: fetchedRepls,
				aboutMe,
				profileImage: fetchedImage
			}), "*")
		}
	}

	const windowMessage = (event) => {
		copyValue = event.data;
	}

	const copySource = () => {
		previewFrame.contentWindow.postMessage("copy", "*");
	}

	const copySourceText = () => {
		navigator.clipboard.writeText(copyValue)
			.then(() => alert("Copied text!"))
	}
</script>

<svelte:window on:message="{windowMessage}"></svelte:window>
<svelte:head>
	<title>Profile Page Generator</title>
</svelte:head>

<main>
	<div class="header">Replit Profile Page Generator</div>
	
	<div class="input-group">
		<span class="input-for">Username</span>
		<input class="user-input" type="text" placeholder="JustCoding123" bind:value="{username}" spellcheck="false" autocomplete="off">
	</div>

	<div class="input-group">
		<span class="input-for">Description</span>
		<input class="user-input" type="text" placeholder="Programmer" bind:value="{description}" spellcheck="false" autocomplete="off">
	</div>

	<div class="input-group">
		<span class="input-for">About Me</span>
		<textarea class="user-input multiline" type="text" placeholder="..." bind:value="{aboutMe}" spellcheck="false" autocomplete="off"></textarea>
	</div>

	<div class="input-group">
		<span class="input-for">Projects</span>
		<span class="help">(enter the repl's name. note: case sensitive)</span>
		<div class="projects">
			{#each projects as project, i}
				<div class="project-group">
					<input class="user-input" type="text" placeholder="{`Project #${i+1}`}" bind:value="{projects[i]}" spellcheck="false" autocomplete="off">
					<button class="negative" on:click="{() => removeProject(i)}">Remove</button>
				</div>
			{/each}
			<button class="add-new" on:click="{addProject}">New</button>
			<span class="help">(click fetch projects after entering all of the repls you want to showcase)</span>
			<button class="add-new" on:click="{fetchProjects}">Fetch Projects</button>
		</div>
	</div>

	<div class="input-group">
		<span class="input-for">Socials</span>
		<div class="projects">
			{#each Object.entries(socials) as [name, social]}
				<div class="project-group">
					<input class="user-input" type="text" placeholder="{name}" bind:value="{socials[name]}" spellcheck="false" autocomplete="off">
				</div>
			{/each}
		</div>
	</div>
	<iframe allow="clipboard-read; clipboard-write" bind:this="{previewFrame}" title="preview" class="preview" src="https://profile-site.justcoding123.repl.co"></iframe>
	<button class="add-new copysource" on:click="{copySource}">Copy Source</button>
	<textarea class="user-input multiline copy-area" on:click="{copySourceText}" bind:value="{copyValue}" spellcheck="false"></textarea>
</main>

<style>
	main {
		width: 80vw;
		padding-top: 2rem;
		max-width: 600px;
		display: flex;
		flex-direction: column;
	}

	.input-group {
		margin-top: 1.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	
	.header {
		text-align: center;
		font-size: 2rem;
	}

	.help {
		text-align: center;
		font-size: 14px;
		color: var(--foreground-dimmer);
	}
	
	.user-input {
		border: none;
		border-radius: .7rem;
		outline: none;
		background: var(--background-default);
		color: inherit;
		outline: 1px solid var(--background-default);
		height: 35px;
		padding-left: .6rem;
		
		transition: .2s;
	}
	
	.user-input.multiline {
		transition: outline .2s;
		resize: vertical;
	}
	
	.user-input:hover {
		outline: 1px solid var(--outline-default);
	}

	.user-input:active {
		outline: 1px solid var(--accent-blue-default); 
	}

	.projects {
		display: flex;
		flex-direction: column;
		gap: .5rem;
	}

	.project-group {
		display: flex;
		gap: 1rem;
	}

	.project-group .user-input {
		flex-grow: 1;
	}
	
	button {
		border: none;
		border-radius: .7rem;
		outline: none;
		background: var(--background-default);
		color: inherit;
		height: 35px;
		cursor: pointer;
		outline: 1px solid var(--background-default);
		
		transition: .2s;
	}

	.add-new { display: block; width: 100%; }

	button:hover {
		outline: 1px solid var(--outline-default);
	}

	button:active {
		outline: 1px solid var(--accent-blue-default);
	}

	button.negative {
		border: none;
		border-radius: .7rem;
		outline: none;
		background: var(--accent-negative-default);
		color: inherit;
		height: 35px;
		cursor: pointer;
		outline: 1px solid var(--accent-negative-default);
		
		transition: .2s;
	}

	button.negative:hover {
		outline: 1px solid var(--accent-negative-stronger);
	}

	button.negative:active {
		background: var(--accent-negative-dimmer);
	}

	.preview {
		width: 100%;
		margin-top: 1.5rem;
		border: none;
		height: 100vh;
	}

	.copysource {
		margin-top: 2rem;
		transform: translateY(-0.5rem);
	}

	.copy-area {
		flex-grow: 1;
		height: 20vh;
	}
</style>
