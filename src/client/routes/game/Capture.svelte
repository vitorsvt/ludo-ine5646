<script lang="ts">
    import { tokenStore, userStore } from "$lib/Auth.svelte.ts";
    import { players } from "$lib/Game.svelte.ts";
    import {
        MessageType,
        type Message,
    } from "../../../common/models/message.ts";
    import { send } from "$lib/Socket.svelte.ts";
    import type { SavedVideo, User } from "../../../common/models/model.ts";
    import { onMount } from "svelte";

    let videos = $state<SavedVideo[]>([]);

    let mediaRecorder = $state<MediaRecorder>();
    let isRecording = $state(false);

    async function startRecording() {
        try {
            if (mediaRecorder !== undefined) return;

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: "browser",
                },
                audio: true,
                preferCurrentTab: true,
                selfBrowserSurface: "include",
            } as any);

            mediaRecorder = new MediaRecorder(stream, {
                mimeType: "video/webm;codecs=vp8",
                videoBitsPerSecond: 1000000,
                audioBitsPerSecond: 64000,
                videoKeyFrameIntervalDuration: 1000, // keyframe a cada 300ms
            } as any);

            send(
                JSON.stringify({
                    type: MessageType.START_RECORDING,
                    token: $tokenStore,
                } as Message),
            );

            mediaRecorder.ondataavailable = async (event) => {
                if (event.data.size > 0) {
                    const buffer = await event.data.arrayBuffer();
                    send(buffer);
                }
            };

            mediaRecorder.onstop = () => {
                send(
                    JSON.stringify({
                        type: MessageType.STOP_RECORDING,
                        token: $tokenStore,
                    } as Message),
                );
            };

            isRecording = true;

            // Delay para iniciar a gravação no servidor, garantindo
            // a recepção do primeiro pacote, contendo o header
            await new Promise((r) => setTimeout(r, 500));

            mediaRecorder.start(1000);
        } catch (err) {
            console.error("Erro ao iniciar gravação:", err);
        }
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach((t) => {
                t.stop();
            });
        }
        syncVideos();
        mediaRecorder = undefined;
        isRecording = false;
    }

    async function syncVideos() {
        const response = (await fetch("/api/user", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${$tokenStore}`,
            },
        })) as any;

        const data = await response.json() as User

        videos = data.videos;
    }

    $effect(() => {
        if (!players.isPlaying($userStore)) {
            stopRecording();
        }
    });

    onMount(() => {
        syncVideos();
    });
</script>

<section class="options">
    {#if players.isPlaying($userStore)}
        {#if mediaRecorder !== undefined || isRecording}
            <button onclick={stopRecording}>Parar gravação</button>
        {:else}
            <button onclick={startRecording}>Iniciar gravação</button>
        {/if}
    {/if}

    {#each videos as video}
        <ul>
            <li><a href={video.location}>Partida {video.matchId}</a></li>
        </ul>
    {/each}
</section>

<style>
    section {
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    button {
        background-color: lightcoral;
    }
</style>
