<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
	<title>Ludo</title>
</svelte:head>

{@render children()}

<style>
	:global(body) {
        font-family: sans-serif;
        font-size: 12pt;
	}

	:global(*, *:before, *:after) {
		box-sizing: border-box;
	}

	:global(*) {
		margin: 0;
		padding: 0;
	}

	:global(ul) {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	:global(a, a:hover, a:active, a:visited) {
		color: inherit;
	}
</style>
