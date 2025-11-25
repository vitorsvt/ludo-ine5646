<script lang="ts">
    import { tokenStore, userStore } from "$lib/auth.svelte.ts";
    import {
        getCurrentPlayer,
        getDice,
        getGameState,
        setDice,
    } from "$lib/game.svelte.ts";
    import { GameState } from "../../common/models/game.ts";
    import { CommandType, MessageType } from "../../common/models/message.ts";
    import { send } from "./socket.svelte.ts";

    let button = $state<HTMLButtonElement>();

    let serverDice = $derived(getDice());
    let currentPlayer = $derived(getCurrentPlayer());
    let gameState = $derived(getGameState());

    let isRolling = $derived(serverDice === 0 && gameState === GameState.DICE);
    let diceDisplay = $state(getDice() === 0 ? 3 : getDice());

    let isMyTurn = $derived(
        currentPlayer?.username === $userStore && gameState === GameState.DICE,
    );

    $effect(() => {
        if (isRolling) {
            const interval = setInterval(() => {
                const value = Math.ceil(Math.random() * 6);
                diceDisplay =
                    value === diceDisplay
                        ? value === 6
                            ? 1
                            : value + 1
                        : value;
            }, 100);

            return () => clearInterval(interval);
        } else {
            diceDisplay = serverDice;
        }
    });

    function rollDice() {
        if (currentPlayer?.username !== $userStore) return;

        setDice(0);

        send(
            JSON.stringify({
                type: MessageType.COMMAND,
                token: $tokenStore as string,
                content: {
                    command: CommandType.ROLL_DICE,
                },
            }),
        );
    }
</script>

{#if getGameState() !== GameState.LOBBY}
    <button
        bind:this={button}
        onclick={rollDice}
        class="face"
        class:shaking={isRolling}
        class:disabled={!isMyTurn}
        disabled={!isMyTurn}
        title="Roll the dice"
    >
        {#each { length: diceDisplay }}
            <span class="pip"></span>
        {/each}
    </button>
{/if}

<style>
    .face {
        transition: background-color 0.2s;
        position: absolute;
        left: 16px;
        bottom: 16px;
        padding: 4px;
        background-color: #ffffff;
        width: 96px;
        height: 96px;
        border-radius: 10%;
        display: grid;
        grid-template-areas:
            "a . c"
            "e g f"
            "d . b";
        justify-content: space-around;
        align-content: space-around;
        border: 2px solid #000;
        cursor: pointer;
    }

    .face:hover {
        background-color: #eeeeee;
    }

    .face.disabled {
        opacity: 0.7;
        cursor: not-allowed;
        background-color: #f0f0f0;
    }

    .face.shaking {
        animation: shake 0.5s infinite;
        background-color: #fff8e1;
    }

    @keyframes shake {
        0% {
            transform: translate(1px, 1px) rotate(0deg);
        }
        10% {
            transform: translate(-1px, -2px) rotate(-1deg);
        }
        20% {
            transform: translate(-3px, 0px) rotate(1deg);
        }
        30% {
            transform: translate(3px, 2px) rotate(0deg);
        }
        40% {
            transform: translate(1px, -1px) rotate(1deg);
        }
        50% {
            transform: translate(-1px, 2px) rotate(-1deg);
        }
        60% {
            transform: translate(-3px, 1px) rotate(0deg);
        }
        70% {
            transform: translate(3px, 1px) rotate(-1deg);
        }
        80% {
            transform: translate(-1px, -1px) rotate(1deg);
        }
        90% {
            transform: translate(1px, 2px) rotate(0deg);
        }
        100% {
            transform: translate(1px, -2px) rotate(-1deg);
        }
    }

    .pip {
        display: block;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        margin: 4px;
        background-color: #000000;
    }

    .pip:nth-child(2) {
        grid-area: b;
    }
    .pip:nth-child(3) {
        grid-area: c;
    }
    .pip:nth-child(4) {
        grid-area: d;
    }
    .pip:nth-child(5) {
        grid-area: e;
    }
    .pip:nth-child(6) {
        grid-area: f;
    }
    .pip:nth-child(odd):last-child {
        grid-area: g;
    }
</style>
