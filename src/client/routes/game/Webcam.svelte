<script lang="ts">
    import { video } from "$lib/Webcam.svelte.ts";
    import { players } from "$lib/Game.svelte.ts";
    import { userStore } from "$lib/Auth.svelte.ts";

    $effect(() => {
        if (!video.localStream && $userStore && players.isPlaying($userStore)) {
            video.init();
        }
    });

    function srcObject(node: HTMLVideoElement, stream: MediaStream) {
        node.srcObject = stream;
        return {
            update(newStream: MediaStream) {
                if (node.srcObject !== newStream) node.srcObject = newStream;
            },
        };
    }
</script>

<div class="cameras">
    {#if video.localStream}
        <div class="video-box my-camera">
            <video use:srcObject={video.localStream} autoplay muted playsinline
            ></video>
            <span>Eu</span>
        </div>
    {/if}

    {#each video.remoteStreams as remote (remote.peerId)}
        <div class="video-box">
            <!-- svelte-ignore a11y_media_has_caption -->
            <video use:srcObject={remote.stream} autoplay playsinline></video>
        </div>
    {/each}
</div>

<style>
    .cameras {
        display: flex;
        flex-direction: row-reverse;
        gap: 1rem;
        position: absolute;
        right: 16px;
        top: 16px;
    }

    .video-box {
        width: 100px;
        position: relative;
    }
    
    video {
        width: 100%;
        background: black;
    }
    
    span {
        position: absolute;
        bottom: 5px;
        left: 5px;
        color: white;
        background: rgba(0, 0, 0, 0.5);
        font-size: 10px;
        padding: 2px;
    }
</style>
