import { e as ensure_array_like } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import { a as attr } from "../../../chunks/attributes.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { U as escape_html } from "../../../chunks/utils2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let countries = [];
    let selectedCountry = "BR";
    let states = [];
    let selectedState = "SC";
    let cities = [];
    let selectedCity = "Florianópolis";
    async function updateStates() {
      states = [];
      const response = await fetch(`/api/states?country=${selectedCountry}`);
      const stateList = await response.json();
      states = stateList.map((state) => ({ code: state.iso2, name: state.name }));
    }
    async function updateCities() {
      cities = [];
      const response = await fetch(`/api/cities?country=${selectedCountry}&state=${selectedState}`);
      cities = await response.json();
    }
    let credentials = { username: "", password: "", repeatedPassword: "" };
    $$renderer2.push(`<main class="svelte-hdsh4k"><form class="svelte-hdsh4k"><h1>Cadastro</h1> <label class="svelte-hdsh4k">Nome de usuário: <input name="username"${attr("value", credentials.username)} type="text" class="svelte-hdsh4k"/></label> <label class="svelte-hdsh4k">País: `);
    $$renderer2.select({ value: selectedCountry, onchange: updateStates }, ($$renderer3) => {
      $$renderer3.push(`<!--[-->`);
      const each_array = ensure_array_like(countries);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let country = each_array[$$index];
        $$renderer3.option({ value: country.iso2, selected: country.iso2 === "BR" }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(country.emoji)} ${escape_html(country.name)}`);
        });
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`</label> <label class="svelte-hdsh4k">Estado: `);
    $$renderer2.select({ value: selectedState, onchange: updateCities }, ($$renderer3) => {
      $$renderer3.push(`<!--[-->`);
      const each_array_1 = ensure_array_like(states);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let state = each_array_1[$$index_1];
        $$renderer3.option({ value: state.code }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(state.name)}`);
        });
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`</label> <label class="svelte-hdsh4k">Cidade: `);
    $$renderer2.select({ value: selectedCity }, ($$renderer3) => {
      $$renderer3.push(`<!--[-->`);
      const each_array_2 = ensure_array_like(cities);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let city = each_array_2[$$index_2];
        $$renderer3.option({ value: city.name }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(city.name)}`);
        });
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`</label> <label class="svelte-hdsh4k">Avatar: <input name="avatar" type="file" accept=".jpg, .png, image/gif, .webp" class="svelte-hdsh4k"/></label> <label class="svelte-hdsh4k">Senha: <input name="password"${attr("value", credentials.password)} type="password" class="svelte-hdsh4k"/></label> <label class="svelte-hdsh4k">Repetir senha: <input name="repeatedPassword"${attr("value", credentials.repeatedPassword)} type="password" class="svelte-hdsh4k"/></label> <button type="submit" class="svelte-hdsh4k">Cadastrar</button> <a href="/login">Já tem uma conta? Entre!</a></form></main>`);
  });
}
export {
  _page as default
};
