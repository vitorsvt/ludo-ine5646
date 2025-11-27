export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["avatar.png","logo.png","screenshot.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.CYeEQfy8.js",app:"_app/immutable/entry/app.iwQFxoBB.js",imports:["_app/immutable/entry/start.CYeEQfy8.js","_app/immutable/chunks/e9RpqW7X.js","_app/immutable/chunks/CEefkVJu.js","_app/immutable/chunks/iauQH351.js","_app/immutable/entry/app.iwQFxoBB.js","_app/immutable/chunks/D5oHpU93.js","_app/immutable/chunks/CEefkVJu.js","_app/immutable/chunks/ZLn2ol7G.js","_app/immutable/chunks/iauQH351.js","_app/immutable/chunks/DQ58N-tK.js","_app/immutable/chunks/BwqhGqo2.js","_app/immutable/chunks/VIQ-nLd-.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/game",
				pattern: /^\/game\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/register",
				pattern: /^\/register\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/tree",
				pattern: /^\/tree\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
