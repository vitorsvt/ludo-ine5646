import { tokenStore } from "$lib/Auth.svelte.ts";
import { send } from "$lib/Socket.svelte.ts";
import Peer from "peerjs";
import { get } from "svelte/store";
import { MessageType } from "../../common/models/message.ts";

export interface VideoStream {
    peerId: string;
    stream: MediaStream;
}

class VideoManager {
    localStream = $state<MediaStream | null>(null);
    remoteStreams = $state<VideoStream[]>([]);
    
    private peer: Peer.Peer | null = null;
    private calls = new Map<string, Peer.MediaConnection>();
    private initializing = false;

    async init() {
        if (this.initializing || this.peer) return;
        this.initializing = true

        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (e) {
            console.error("Erro da câmera:", e);
            return;
        }

        // Importar dinâmicamente para evitar problema com CommonJS (?)
        const peerLib = await import('peerjs');
        
        this.peer = new peerLib.Peer("", {
            host: "localhost",
            port: 9000,
            path: "/ludo",
            secure: false
        });

        this.peer.on("open", (myPeerId) => {
            console.log("[video] Conectado com id:", myPeerId);
            send(JSON.stringify({
                type: MessageType.VIDEO_READY,
                token: get(tokenStore),
                content: myPeerId
            }));
        });

        this.peer.on("call", (call) => {
            console.log("[video] Recebendo chamada de:", call.peer);
            if (!this.localStream) return;

            call.answer(this.localStream);
            this.handleCallEvents(call);
        });
    }

    sync(onlinePeerIds: string[]) {
        console.log(onlinePeerIds)

        if (!this.peer || !this.localStream) return;

        const myId = this.peer.id;

        for (const targetId of onlinePeerIds) {
            if (targetId === myId) continue;
            if (this.calls.has(targetId)) continue;

            console.log("[video] Iniciando chamada com:", targetId);
            const call = this.peer.call(targetId, this.localStream);
            this.handleCallEvents(call);
        }

        for (const [connectedId, call] of this.calls) {
            if (!onlinePeerIds.includes(connectedId)) {
                console.log("[video] Encerrando chamada com:", connectedId);
                call.close();
            }
        }

        console.log(this.calls)
    }

    private handleCallEvents(call: Peer.MediaConnection) {
        console.log(call.peer)
        
        this.calls.set(call.peer, call);

        call.on("stream", (stream) => {
            if (stream.getVideoTracks().length === 0) return
    
            this.remoteStreams = this.remoteStreams.filter(r => r.peerId !== call.peer);
            this.remoteStreams.push({ peerId: call.peer, stream });
        });

        const cleanup = () => {
            this.calls.delete(call.peer);
            this.remoteStreams = this.remoteStreams.filter(r => r.peerId !== call.peer);
        };

        call.on("close", cleanup);
        call.on("error", cleanup);
    }
}

export const video = new VideoManager();