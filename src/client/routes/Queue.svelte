<script lang="ts">
    import { tokenStore, userStore } from "$lib/auth.svelte.ts";
    import {
        CommandType,
        MessageType,
        type Command,
        type Message,
    } from "../../common/models/message.ts";
    import { getGameState, players } from "$lib/game.svelte.ts";
    import { send } from "./socket.svelte.ts";
    import { GameState, PlayerController } from "../../common/models/game.ts";

    let enqueued = $derived(
        players.queue.includes($userStore === null ? "" : $userStore),
    );

    let playing = $derived(
        players.active.find((p) => p.username === $userStore) !== undefined,
    );

    $effect(() => {});

    function enqueue() {
        if (!enqueued) {
            send(
                JSON.stringify({
                    type: MessageType.COMMAND,
                    token: $tokenStore,
                    content: {
                        command: CommandType.ENQUEUE,
                    } as Command,
                } as Message),
            );
        }
    }

    function dequeue() {
        if (enqueued) {
            send(
                JSON.stringify({
                    type: MessageType.COMMAND,
                    token: $tokenStore,
                    content: {
                        command: CommandType.DEQUEUE,
                    } as Command,
                } as Message),
            );
        }
    }

    function fillBots() {
        send(
            JSON.stringify({
                type: MessageType.FILL_BOTS,
                token: $tokenStore,
            } as Message),
        );
    }
</script>

<section>
    {#if enqueued && getGameState() === GameState.LOBBY}
        <div>
            <button onclick={fillBots}>Iniciar com BOTS</button>
            <button onclick={dequeue}>Sair da fila</button>
        </div>
    {:else if !enqueued && !playing}
        <button onclick={enqueue}>Entrar na fila</button>
    {/if}

    <h2>Partida</h2>
    <ul>
        {#if players.active.length === 0}
            <li>Ninguém jogando...</li>
        {:else}
            {#each players.active as player}
                <li>
                    <figure>
                        <img src="/avatar.png" alt="avatar" />
                        <figcaption>
                            {#if player.controller === PlayerController.HUMAN}
                                <a href="/users?name={player.username}" style="color: {player.color}">{player.username}</a>
                            {:else}
                                <span style="color: {player.color}">{player.username}</span>
                            {/if}
                        </figcaption>
                    </figure>
                </li>
            {/each}
        {/if}
    </ul>

    <h2>Fila</h2>
    <ul>
        {#if players.queue.length === 0}
            <li>Nenhum jogador na fila...</li>
        {:else}
            {#each players.queue as user}
                <li>
                    <figure>
                        <img src="/avatar.png" alt="avatar" />
                        <figcaption>
                            <a href="/users?name={user}">{user}</a>
                        </figcaption>
                    </figure>
                </li>
            {/each}
        {/if}
    </ul>

    <h2>Espectadores</h2>
    <ul>
        {#if players.spectators.length === 0}
            <li>Nenhum jogador como espectador...</li>
        {:else}
            {#each players.spectators as user}
                <li>
                    <figure>
                        <img src="/avatar.png" alt="avatar" />
                        <figcaption>
                            <a href="/users?name={user}">{user}</a>
                        </figcaption>
                    </figure>
                </li>
            {/each}
        {/if}
    </ul>
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        > div {
            display: flex;
            flex-direction: row;

            > button {
                width: 100%;
            }
        }
    }

    ul {
        display: block;
        background-color: #eeeeee;
        padding: 0.5rem;
    }

    li {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;

        figure {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;

            img {
                width: 1.5rem;
            }

            figcaption {
                font-weight: bold;
            }
        }
    }
</style>
