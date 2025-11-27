<script lang="ts">
    import { Renderer } from "$lib/Render.svelte.ts";
    import { onMount } from "svelte";
    import { connect } from "$lib/Socket.svelte.ts";
    import Dice from "./Dice.svelte";
    import {
        game,
        getCurrentPlayer,
        getGameState,
        getResync,
        players,
        setResync,
    } from "$lib/Game.svelte.ts";
    import Tabs from "./Tabs.svelte";
    import { tokenStore, userStore } from "$lib/Auth.svelte.ts";
    import { goto } from "$app/navigation";
    import { GameState } from "../../../common/models/game.ts";
    import Webcam from "./Webcam.svelte";

    let renderer: Renderer;
    let container: HTMLDivElement;
    let canvas: HTMLCanvasElement;

    let display = $derived.by(() => {
        const currentPlayer = getCurrentPlayer();

        switch (getGameState()) {
            case GameState.LOBBY:
                return {
                    color: "black",
                    message: `aguardando jogadores... (${players.queue.length}/4)`,
                };
            case GameState.DICE:
                return {
                    color: currentPlayer?.color || "black",
                    message: `[${currentPlayer?.username}] rolar o dado`,
                };
            case GameState.PIECE:
                return {
                    color: currentPlayer?.color || "black",
                    message: `[${currentPlayer?.username}] selecione uma peça`,
                };
            case GameState.END:
                return {
                    color: "black",
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

        <p style="background-color: {display.color}">{display.message}</p>

        <Dice />
        <Webcam />
    </div>

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
        background-color: black;
        border-radius: 0.5rem;
        padding: 0.5rem;
        position: absolute;
        font-size: 1.5rem;
        font-weight: bold;
        bottom: 16px;
        right: 16px;
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
