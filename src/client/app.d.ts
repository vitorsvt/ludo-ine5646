declare global {
	namespace App {
	}
}

declare module '*.svelte' {
	import type { Component } from 'svelte';
	const component: Component;
	export default component;
}

export {};
