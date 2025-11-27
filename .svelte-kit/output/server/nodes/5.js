import * as server from '../entries/pages/register/_page.server.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/register/_page.svelte.js')).default;
export { server };
export const server_id = "src/client/routes/register/+page.server.ts";
export const imports = ["_app/immutable/nodes/5.Dxb8U4On.js","_app/immutable/chunks/VIQ-nLd-.js","_app/immutable/chunks/CEefkVJu.js","_app/immutable/chunks/iauQH351.js","_app/immutable/chunks/DQ58N-tK.js","_app/immutable/chunks/BwqhGqo2.js","_app/immutable/chunks/Be8ClsNr.js","_app/immutable/chunks/D965Rs-M.js","_app/immutable/chunks/C_8uDaM3.js"];
export const stylesheets = ["_app/immutable/assets/5.B64tVDq-.css"];
export const fonts = [];
