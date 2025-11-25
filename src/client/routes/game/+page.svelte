<script lang="ts">
    import { Renderer } from "$lib/render.svelte.ts";
    import { onMount } from "svelte";
    import { connect } from "../socket.svelte.ts";
    import Dice from "../Dice.svelte";
    import {
        game,
        getCurrentPlayer,
        getGameState,
        getResync,
        players,
        setResync,
    } from "$lib/game.svelte.ts";
    import Tabs from "../Tabs.svelte";
    import { tokenStore, userStore } from "$lib/auth.svelte.ts";
    import { goto } from "$app/navigation";
    import { GameState } from "../../../common/models/game.ts";

    let renderer: Renderer;
    let container: HTMLDivElement;
    let canvas: HTMLCanvasElement;

    let display = $derived.by(() => {
        const currentPlayer = getCurrentPlayer()

        switch (getGameState()) {
            case GameState.LOBBY:
                return {
                    color: "white",
                    message: `aguardando jogadores... (${players.queue.length}/4)`,
                };
            case GameState.DICE:
                return {
                    color: currentPlayer?.color || 'white',
                    message: `[${currentPlayer?.username}] rolar o dado`,
                };
            case GameState.PIECE:
                return {
                    color: currentPlayer?.color || 'white',
                    message: `[${currentPlayer?.username}] selecione uma peça`,
                };
            case GameState.END:
                return {
                    color: "white",
                    message: `fim de jogo`,
                };
        }
    });

    $effect(() => {
        if (getResync()) {
            renderer.sync();
            setResync(false);
        }
    });

    onMount(() => {
        if ($tokenStore === null || $userStore === null) {
            goto("/login");
        }

        renderer = new Renderer(game, container, canvas);

        window.addEventListener("click", (event) => {
            let { x, y, width, height } = canvas.getBoundingClientRect();

            x = ((event.clientX - x) / width) * 2 - 1;
            y = -((event.clientY - y) / height) * 2 + 1;

            renderer.click(x, y);
        });

        renderer.render();

        connect();
    });
</script>

<main>
    <div class="container" bind:this={container}>
        <canvas bind:this={canvas}></canvas>

        <p style="color: {display.color}">{display.message}</p>
    </div>

    <Dice />

    <Tabs />
</main>

<style>
    main {
        display: flex;
        flex-direction: row;

        width: 100vw;
    }

    p {
        color: white;
        position: absolute;
        font-size: 1.5rem;
        text-decoration: underline;
        font-weight: bold;
        top: 16px;
        left: 16px;
        user-select: none;
    }

    .container {
        position: relative;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }

    canvas {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
