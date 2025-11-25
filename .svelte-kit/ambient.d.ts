
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```sh
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const SHELL: string;
	export const npm_command: string;
	export const npm_config_userconfig: string;
	export const COLORTERM: string;
	export const npm_package_devDependencies__types_node: string;
	export const npm_config_cache: string;
	export const npm_package_main: string;
	export const npm_package_scripts_build_server: string;
	export const WSL2_GUI_APPS_ENABLED: string;
	export const TERM_PROGRAM_VERSION: string;
	export const npm_package_scripts_build_client: string;
	export const npm_package_dependencies_bcrypt: string;
	export const npm_package_dependencies_mongodb: string;
	export const WSL_DISTRO_NAME: string;
	export const NODE: string;
	export const npm_config_ignore_scripts: string;
	export const COLOR: string;
	export const npm_config_local_prefix: string;
	export const npm_config_argv: string;
	export const npm_config_bin_links: string;
	export const npm_package_scripts_dev_server: string;
	export const npm_package_devDependencies__types_three: string;
	export const npm_package_devDependencies__types_express: string;
	export const npm_config_globalconfig: string;
	export const npm_package_devDependencies_nodemon: string;
	export const EDITOR: string;
	export const NAME: string;
	export const npm_package_devDependencies__types_bcrypt: string;
	export const PWD: string;
	export const npm_package_dependencies_class_validator: string;
	export const npm_config_save_prefix: string;
	export const npm_package_devDependencies_vite: string;
	export const LOGNAME: string;
	export const npm_package_dependencies_cors: string;
	export const npm_config_init_module: string;
	export const npm_package_scripts_build: string;
	export const _: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const npm_package_devDependencies_concurrently: string;
	export const npm_package_dependencies_mongoose: string;
	export const HOME: string;
	export const npm_config_version_git_tag: string;
	export const LANG: string;
	export const WSL_INTEROP: string;
	export const npm_package_devDependencies_typescript: string;
	export const npm_config_init_license: string;
	export const npm_package_version: string;
	export const npm_package_devDependencies__types_cors: string;
	export const WAYLAND_DISPLAY: string;
	export const npm_config_version_commit_hooks: string;
	export const FORCE_COLOR: string;
	export const npm_package_dependencies_three: string;
	export const GIT_ASKPASS: string;
	export const npm_package_dependencies_express: string;
	export const npm_package_dependencies_jsonwebtoken: string;
	export const npm_package_scripts_dev_client: string;
	export const INIT_CWD: string;
	export const npm_lifecycle_script: string;
	export const npm_package_description: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const VSCODE_PYTHON_AUTOACTIVATE_GUARD: string;
	export const npm_config_version_tag_prefix: string;
	export const npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
	export const YARN_WRAP_OUTPUT: string;
	export const npm_config_npm_version: string;
	export const npm_package_devDependencies__types_ws: string;
	export const TERM: string;
	export const npm_package_name: string;
	export const npm_config_prefix: string;
	export const npm_package_type: string;
	export const USER: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const npm_package_dependencies__countrystatecity_countries: string;
	export const DISPLAY: string;
	export const npm_lifecycle_event: string;
	export const SHLVL: string;
	export const npm_config_version_git_sign: string;
	export const npm_config_version_git_message: string;
	export const npm_package_devDependencies_ts_node: string;
	export const npm_package_devDependencies__types_jsonwebtoken: string;
	export const npm_config_user_agent: string;
	export const npm_execpath: string;
	export const npm_package_devDependencies__sveltejs_adapter_auto: string;
	export const npm_package_devDependencies_svelte: string;
	export const XDG_RUNTIME_DIR: string;
	export const npm_config_strict_ssl: string;
	export const DEBUGINFOD_URLS: string;
	export const WSLENV: string;
	export const npm_package_json: string;
	export const npm_package_scripts_dev: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const npm_package_dependencies_ws: string;
	export const npm_package_scripts_start: string;
	export const npm_config_noproxy: string;
	export const PATH: string;
	export const npm_config_node_gyp: string;
	export const npm_package_devDependencies_tsx: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const npm_package_license: string;
	export const npm_config_global_prefix: string;
	export const npm_config_registry: string;
	export const HOSTTYPE: string;
	export const npm_config_ignore_optional: string;
	export const PULSE_SERVER: string;
	export const npm_node_execpath: string;
	export const npm_package_dependencies_class_transformer: string;
	export const TERM_PROGRAM: string;
	export const VSCODE_IPC_HOOK_CLI: string;
	export const npm_config_init_version: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		SHELL: string;
		npm_command: string;
		npm_config_userconfig: string;
		COLORTERM: string;
		npm_package_devDependencies__types_node: string;
		npm_config_cache: string;
		npm_package_main: string;
		npm_package_scripts_build_server: string;
		WSL2_GUI_APPS_ENABLED: string;
		TERM_PROGRAM_VERSION: string;
		npm_package_scripts_build_client: string;
		npm_package_dependencies_bcrypt: string;
		npm_package_dependencies_mongodb: string;
		WSL_DISTRO_NAME: string;
		NODE: string;
		npm_config_ignore_scripts: string;
		COLOR: string;
		npm_config_local_prefix: string;
		npm_config_argv: string;
		npm_config_bin_links: string;
		npm_package_scripts_dev_server: string;
		npm_package_devDependencies__types_three: string;
		npm_package_devDependencies__types_express: string;
		npm_config_globalconfig: string;
		npm_package_devDependencies_nodemon: string;
		EDITOR: string;
		NAME: string;
		npm_package_devDependencies__types_bcrypt: string;
		PWD: string;
		npm_package_dependencies_class_validator: string;
		npm_config_save_prefix: string;
		npm_package_devDependencies_vite: string;
		LOGNAME: string;
		npm_package_dependencies_cors: string;
		npm_config_init_module: string;
		npm_package_scripts_build: string;
		_: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		npm_package_devDependencies_concurrently: string;
		npm_package_dependencies_mongoose: string;
		HOME: string;
		npm_config_version_git_tag: string;
		LANG: string;
		WSL_INTEROP: string;
		npm_package_devDependencies_typescript: string;
		npm_config_init_license: string;
		npm_package_version: string;
		npm_package_devDependencies__types_cors: string;
		WAYLAND_DISPLAY: string;
		npm_config_version_commit_hooks: string;
		FORCE_COLOR: string;
		npm_package_dependencies_three: string;
		GIT_ASKPASS: string;
		npm_package_dependencies_express: string;
		npm_package_dependencies_jsonwebtoken: string;
		npm_package_scripts_dev_client: string;
		INIT_CWD: string;
		npm_lifecycle_script: string;
		npm_package_description: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		VSCODE_PYTHON_AUTOACTIVATE_GUARD: string;
		npm_config_version_tag_prefix: string;
		npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
		YARN_WRAP_OUTPUT: string;
		npm_config_npm_version: string;
		npm_package_devDependencies__types_ws: string;
		TERM: string;
		npm_package_name: string;
		npm_config_prefix: string;
		npm_package_type: string;
		USER: string;
		VSCODE_GIT_IPC_HANDLE: string;
		npm_package_dependencies__countrystatecity_countries: string;
		DISPLAY: string;
		npm_lifecycle_event: string;
		SHLVL: string;
		npm_config_version_git_sign: string;
		npm_config_version_git_message: string;
		npm_package_devDependencies_ts_node: string;
		npm_package_devDependencies__types_jsonwebtoken: string;
		npm_config_user_agent: string;
		npm_execpath: string;
		npm_package_devDependencies__sveltejs_adapter_auto: string;
		npm_package_devDependencies_svelte: string;
		XDG_RUNTIME_DIR: string;
		npm_config_strict_ssl: string;
		DEBUGINFOD_URLS: string;
		WSLENV: string;
		npm_package_json: string;
		npm_package_scripts_dev: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		npm_package_dependencies_ws: string;
		npm_package_scripts_start: string;
		npm_config_noproxy: string;
		PATH: string;
		npm_config_node_gyp: string;
		npm_package_devDependencies_tsx: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		npm_package_license: string;
		npm_config_global_prefix: string;
		npm_config_registry: string;
		HOSTTYPE: string;
		npm_config_ignore_optional: string;
		PULSE_SERVER: string;
		npm_node_execpath: string;
		npm_package_dependencies_class_transformer: string;
		TERM_PROGRAM: string;
		VSCODE_IPC_HOOK_CLI: string;
		npm_config_init_version: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
