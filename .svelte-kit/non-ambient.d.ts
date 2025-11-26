
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/game" | "/login" | "/register" | "/tree";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/game": Record<string, never>;
			"/login": Record<string, never>;
			"/register": Record<string, never>;
			"/tree": Record<string, never>
		};
		Pathname(): "/" | "/game" | "/game/" | "/login" | "/login/" | "/register" | "/register/" | "/tree" | "/tree/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/avatar.png" | "/logo.png" | "/screenshot.png" | string & {};
	}
}