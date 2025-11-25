<script lang="ts">
    import { goto } from '$app/navigation'
    import { saveAuth } from '$lib/auth.svelte.ts';

    const credentials = {
        username: "",
        password: "",
    };

    async function login(event: Event) {
        event.preventDefault()

        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials),
        });

        if (response.ok) {
            const { token } = await response.json()
            saveAuth(token, credentials.username)
            goto('/game')
        }
    }
</script>

<main>
    <form onsubmit={login}>
        <h1>Entrar</h1>

        <label>
            Nome de usuário:
            <input
                name="username"
                type="text"
                bind:value={credentials.username}
            />
        </label>

        <label>
            Senha:
            <input
                name="password"
                type="password"
                bind:value={credentials.password}
            />
        </label>

        <button type="submit">Entrar</button>

        <a href="/register">Não tem uma conta? Cadastre-se</a>
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
