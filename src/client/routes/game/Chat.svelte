<script lang="ts">
    import { tokenStore, userStore } from "$lib/Auth.svelte.ts";
    import { players } from "$lib/Game.svelte.ts";
    import { MessageType, type Message } from "../../../common/models/message.ts";
    import { messages } from "$lib/Chat.svelte.ts";
    import { send } from "$lib/Socket.svelte.ts";

    let globalChatValue = $state("");
    let matchChatValue = $state("");

    let playing = $derived(
        players.active.find((p) => p.username === $userStore) !== undefined,
    );

    function sendMessage(body: string, global = true) {
        const message: Message = {
            type: MessageType.CHAT,
            token: $tokenStore as string, // Token deve estar definido aqui (caso contrário redirect)
            content: {
                timestamp: Date.now(),
                global,
                body,
            },
        };

        send(JSON.stringify(message));
    }
</script>

<section class="chat">
    <div>
        <h2>Global</h2>
        <ul>
            {#each messages.global as message}
                <li>
                    <figure class="sender">
                        <img src="/avatar.png" alt="avatar" />
                        <figcaption>{message.author}</figcaption>
                    </figure>
                    <blockquote>
                        <p>{message.body}</p>
                    </blockquote>
                </li>
            {/each}
        </ul>
        <form
            onsubmit={(event) => {
                event.preventDefault();
                (event.target as HTMLFormElement).reset();
                sendMessage(globalChatValue);
            }}
        >
            <input bind:value={globalChatValue} type="text" />
            <button type="submit">Enviar</button>
        </form>
    </div>

    {#if playing}
        <div>
            <h2>Partida</h2>
            <ul>
                {#each messages.match as message}
                    <li>
                        <figure>
                            <img src="/avatar.png" alt="avatar" />
                            <figcaption>{message.author}</figcaption>
                        </figure>
                        <blockquote>
                            <p>{message.body}</p>
                        </blockquote>
                    </li>
                {/each}
            </ul>
            <form
                onsubmit={(event) => {
                    event.preventDefault();
                    (event.target as HTMLFormElement).reset();
                    sendMessage(matchChatValue, false);
                }}
            >
                <input bind:value={matchChatValue} type="text" />
                <button type="submit">Enviar</button>
            </form>
        </div>
    {/if}
</section>

<style>
    section {
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 1rem;

        > div {
            border: 1px solid black;

            display: flex;
            flex-direction: column;
            flex-grow: 1;
            min-height: 0;
            padding: 0.5rem;
        }
    }

    ul {
        display: block;
        overflow: auto;
        min-height: 0;
        flex-grow: 1;
        background-color: #eeeeee;
        margin: 0.5rem 0;
    }

    li {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;

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

    form {
        width: 100%;
        display: flex;
        flex-direction: row;
    }

    input {
        width: 100%;
    }
</style>
