<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<title>Ludo</title>
</svelte:head>

{@render children()}

<style>
	:global(*, *:before, *:after) {
		box-sizing: border-box;
	}

	:global(*) {
		margin: 0;
		padding: 0;
		font-family: Arial, Helvetica, sans-serif;
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
