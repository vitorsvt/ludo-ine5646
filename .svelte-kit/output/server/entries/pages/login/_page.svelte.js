import { a as attr } from "../../../chunks/attributes.js";
import "vite-plugin-node-polyfills/shims/global";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import "../../../chunks/Auth.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const credentials = { username: "", password: "" };
    $$renderer2.push(`<main class="svelte-1xlzeuk"><form class="svelte-1xlzeuk"><h1>Entrar</h1> <label class="svelte-1xlzeuk">Nome de usuário: <input name="username" type="text"${attr("value", credentials.username)} class="svelte-1xlzeuk"/></label> <label class="svelte-1xlzeuk">Senha: <input name="password" type="password"${attr("value", credentials.password)} class="svelte-1xlzeuk"/></label> <button type="submit" class="svelte-1xlzeuk">Entrar</button> <a href="/register">Não tem uma conta? Cadastre-se</a></form></main>`);
  });
}
export {
  _page as default
};
