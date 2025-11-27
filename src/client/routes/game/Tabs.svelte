<script lang="ts">
    import Chat from "./Chat.svelte";
    import Players from "./Queue.svelte";
    import { userStore } from "$lib/Auth.svelte.ts";
    import Options from "./Capture.svelte";
    import Ranking from "./Ranking.svelte";

    interface Tab {
        label: string;
        component: typeof Chat | typeof Players | typeof Options;
    }

    let items: Tab[] = [
        {
            label: "Jogadores",
            component: Players,
        },
        {
            label: "Chat",
            component: Chat,
        },
        {
            label: "Gravação",
            component: Options,
        },
        {
            label: "Ranking",
            component: Ranking
        }
    ];

    let activeTabValue = 0;

    const handleClick = (tabValue: number) => () => (activeTabValue = tabValue);
</script>

<aside>
    <nav>
        <span>LUDO</span>
        <ul>
            <li>{$userStore}</li>
            <li><a href="/">Página inicial</a></li>
        </ul>
    </nav>

    <ul class="tabs">
        {#each items as item, i}
            <li class={activeTabValue === i ? "active" : ""}>
                <button onclick={handleClick(i)}>{item.label}</button>
            </li>
        {/each}
    </ul>

    {#each items as item, i}
        {#if activeTabValue == i}
            <div>
                <svelte:component this={item.component} />
            </div>
        {/if}
    {/each}
</aside>

<style>
    aside {
        width: 50%;
        height: 100vh;
        padding: 1rem;

        display: flex;
        flex-direction: column;
    }

    nav {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 1rem;

        span, li {
            font-weight: bold;
        }

        > ul {
            display: flex;
            flex-direction: row-reverse;
            gap: 1rem;
            align-items: center;
            justify-content: right;
        }
    }

    div {
        border: 1px solid black;
        padding: 0.5rem;
        flex-grow: 1;
        overflow: scroll;
    }

    .tabs {
        display: flex;
        flex-direction: row;
    }

    button {
        border: 1px solid transparent;
        padding: 0.25rem;
    }

    button:hover {
        border-color: black black white;
    }

    .tabs li.active > button {
        background-color: white;
        border-color: black black white;
    }
</style>
