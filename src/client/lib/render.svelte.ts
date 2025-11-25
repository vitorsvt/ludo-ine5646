import * as THREE from 'three'
import { Color, Game, Tile, type Piece } from '../../common/models/game.ts';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { send } from '../routes/socket.svelte.ts';
import { CommandType, MessageType, type ChoosePiece } from '../../common/models/message.ts';
import { get } from 'svelte/store';
import { tokenStore } from './auth.svelte.ts';

interface RendererState {
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer
    controls: OrbitControls,
}

class Renderer {
    board: THREE.Mesh;
    pieces: THREE.Mesh[];
    state: RendererState;
    game: Game;

    constructor(game: Game, container: HTMLDivElement, canvas: HTMLCanvasElement) {
        this.state = Renderer.setup(container, canvas);
        this.game = game;
        this.board = Renderer.createBoard(this.state.scene);
        this.pieces = game.board.pieces.map(piece => Renderer.createPiece(this.state.scene, piece));

        this.sync();
    }

    static setup(container: HTMLDivElement, canvas: HTMLCanvasElement): RendererState {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;

        const camera = new THREE.PerspectiveCamera(
            60,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            1000,
        );
        camera.position.set(0, 3, 5);
        camera.lookAt(0, 1, 0);

        window.addEventListener("resize", () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(0, 10, 0);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        return {
            scene,
            camera,
            renderer,
            controls,
        }
    }

    static createBoard(scene: THREE.Scene): THREE.Mesh {
        const frameGeometry = new THREE.BoxGeometry(10, 0.5, 10);
        frameGeometry.translate(0, -0.26, 0);
        const frameMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
        scene.add(frameMesh);

        const boardGeometry = new THREE.PlaneGeometry(10, 10);
        boardGeometry.rotateX(-Math.PI / 2);
        const boardTexture = new THREE.TextureLoader().load(
            "https://upload.wikimedia.org/wikipedia/commons/a/ab/Ludo_board.png"
        );
        boardTexture.minFilter = THREE.LinearFilter;
        const boardMaterial = new THREE.MeshPhongMaterial({ map: boardTexture });
        const boardMesh = new THREE.Mesh(boardGeometry, boardMaterial);
        boardMesh.receiveShadow = true;
        frameMesh.add(boardMesh);

        return boardMesh;
    }

    static createPiece(scene: THREE.Scene, piece: Piece): THREE.Mesh {
        const colorMapping = {
            [Color.YELLOW]: 0xFFFF00,
            [Color.BLUE]: 0x0000FF,
            [Color.RED]: 0xFF0000,
            [Color.GREEN]: 0x00FF00
        };

        const material = new THREE.MeshPhongMaterial({
            color: colorMapping[piece.color],
        });

        const baseGeometry = new THREE.ConeGeometry(0.15, 0.3, 32);
        const base = new THREE.Mesh(baseGeometry, material);
        base.translateY(0.15);

        const topGeometry = new THREE.SphereGeometry(0.075, 32, 32);
        const top = new THREE.Mesh(topGeometry, material);
        top.translateY(0.15);

        base.add(top);
        scene.add(base);

        base.userData.piece = piece;

        return base;
    }

    computePos(tile: Tile): [number, number] {
        const imageSize = 1024;
        const boardSize = 10;
        const tileSize = 64;
        const borderSize = 32;

        return [
            boardSize * ((borderSize + tileSize * tile.x - tileSize / 2) / imageSize),
            boardSize * ((borderSize + tileSize * tile.z - tileSize / 2) / imageSize)
        ]
    }

    setPiecePos(piece: Piece, [x, z]: [number, number]) {
        const mesh = this.pieces.find(p => p.userData.piece === piece);

        if (mesh === undefined) {
            throw Error("Piece mesh not found")
        }

        mesh.position.x = x
        mesh.position.z = z
    }

    sync() {
        for (const piece of this.pieces) {
            const tile: Tile | null = piece.userData.piece.tile;

            if (tile === null) {
                throw Error("Piece without a tile")
            }

            const [xPos, zPos] = this.computePos(tile);

            if (tile.pieces.length > 1) {
                const positions = [
                    [-1, -1],
                    [-1, 1],
                    [1, -1],
                    [1, 1],
                ];
                tile.pieces.forEach((piece, i) => {
                    const [xOff, zOff] = positions[i % 4]!;

                    this.setPiecePos(piece, [
                        xPos + xOff! * 0.15,
                        zPos + zOff! * 0.15
                    ])
                });
            } else if (tile.pieces.length === 1) {
                this.setPiecePos(tile.pieces[0]!, [xPos, zPos])
            }
        }
    }

    click(x: number, y: number) {
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.state.camera)        

        const intersects = raycaster.intersectObjects(this.state.scene.children, true);

        if (intersects.length > 0 && intersects[0]) {
            let possiblePiece = intersects[0].object;

            if (possiblePiece.children.length === 0) {
                possiblePiece != possiblePiece.parent;
            }

            const piece: Piece = possiblePiece.userData.piece;

            if (piece) {
                const { valid } = this.game.isPieceValidChoice(piece);

                if (valid) {
                    send(JSON.stringify({
                        type: MessageType.COMMAND,
                        token: get(tokenStore),
                        content: {
                            command: CommandType.CHOOSE_PIECE,
                            data: {
                                id: piece.id
                            } as ChoosePiece
                        }
                    }))
                }
            }
        }

    }

    render() {
        requestAnimationFrame(() => this.render());
        this.state.controls.update();
        this.state.renderer.render(this.state.scene, this.state.camera);
    }
}

export { Renderer }