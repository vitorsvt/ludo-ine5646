<script lang="ts">
    import { onMount } from "svelte";
    import type { PageProps } from "./$types.ts";
    import type { Country } from "./+page.server.ts";
    import { goto } from '$app/navigation';

    interface State {
        code: string;
        name: string;
    }

    interface City {
        name: string
    }

    let { data }: PageProps = $props();

    let countries = $state<Country[]>([]);
    let selectedCountry = $state("BR");

    let states = $state<State[]>([]);
    let selectedState = $state("SC");

    let cities = $state<City[]>([]);
    let selectedCity = $state("Florianópolis");

    async function updateStates() {
        states = []

        const response = await fetch(`/api/states?country=${selectedCountry}`);
        const stateList = await response.json();

        states = stateList.map((state: any) => ({
            code: state.iso2,
            name: state.name
        }))
    }

    async function updateCities() {
        cities = []

        const response = await fetch(`/api/cities?country=${selectedCountry}&state=${selectedState}`);
        cities = await response.json();
    }

    onMount(async () => {
        countries = data.countries;
        await updateStates();
        await updateCities();
    });

    let credentials = $state({
        username: '',
        password: '',
        repeatedPassword: ''
    })

    async function register(event: Event) {
        event.preventDefault()

        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                country: selectedCountry,
                state: selectedState,
                city: selectedCity,
                ...credentials
            }),
        });

        if (response.ok) {
            goto('/login')
        }
    }
</script>

<main>
    <form onsubmit={register}>
        <h1>Cadastro</h1>

        <label>
            Nome de usuário:
            <input name="username" bind:value={credentials.username} type="text" />
        </label>

        <label>
            País:
            <select bind:value={selectedCountry} onchange={updateStates}>
                {#each countries as country}
                    <option
                        value={country.iso2}
                        selected={country.iso2 === "BR"}
                        >{country.emoji} {country.name}</option
                    >
                {/each}
            </select>
        </label>

        <label>
            Estado:
            <select bind:value={selectedState} onchange={updateCities}>
                {#each states as state}
                    <option value={state.code}>{state.name}</option>
                {/each}
            </select>
        </label>

        <label>
            Cidade:
            <select bind:value={selectedCity}>
                {#each cities as city}
                    <option value={city.name}>{city.name}</option>
                {/each}
            </select>
        </label>

        <label>
            Avatar:
            <input
                name="avatar"
                type="file"
                accept=".jpg, .png, image/gif, .webp"
            />
        </label>

        <label>
            Senha:
            <input name="password" bind:value={credentials.password} type="password" />
        </label>

        <label>
            Repetir senha:
            <input name="repeatedPassword" bind:value={credentials.repeatedPassword} type="password" />
        </label>

        <button type="submit">Cadastrar</button>

        <a href="/login">Já tem uma conta? Entre!</a>
    </form>
</main>

<style>
    main {
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        background-color: rgb(47, 47, 200);
    }

    form {
        background-color: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        max-width: 400px;
        width: 90%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    label {
        display: flex;
        flex-direction: column;
        font-weight: 500;
        gap: 0.25rem;
    }

    input,
    button {
        padding: 0.75rem;
        border-radius: 0.25rem;
        border: 1px solid #ccc;
    }

    button {
        background-color: rgb(47, 47, 200);
        color: white;
        font-weight: bold;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    button:hover {
        background-color: rgb(30, 30, 160);
    }
</style>
