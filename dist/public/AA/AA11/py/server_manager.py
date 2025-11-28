#!/var/www/html/AA/AA11/venv/bin/python

from datetime import datetime
from websockets.asyncio.server import serve

import sys
import json
import asyncio
import socket
import websockets


BUFFER_SIZE = 1024
HOST = "0.0.0.0"
TCP_PORT = 8080
UDP_PORT = 8081
SERVER_PORT = 8082


ws_clients: set[websockets.ServerConnection] = set()
messages: list[dict] = []


def accept_tcp_connection():
    conn, addr = tcp.accept()
    conn.setblocking(False)
    loop.add_reader(conn.fileno(), handle_tcp_data, conn)


def handle_tcp_data(conn: socket.socket):
    global messages

    addr = conn.getpeername()

    try:
        data = conn.recv(BUFFER_SIZE)

        if not data:
            loop.remove_reader(conn.fileno())
            conn.close()
            return

        message = data.decode()

        tcp_count = len([m for m in messages if m["protocol"] == "tcp"])
        conn.sendall(f"[{tcp_count}] OK ::: {message}".encode("utf-8"))

        messages.append(
            {
                "type": "message",
                "protocol": "tcp",
                "ip": addr[0],
                "port": addr[1],
                "message": message,
                "timestamp": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
            }
        )
        asyncio.create_task(broadcast(messages[-1]))
    except (ConnectionResetError, BrokenPipeError):
        loop.remove_reader(conn.fileno())
        conn.close()


def handle_udp_data():
    global messages

    data, addr = udp.recvfrom(BUFFER_SIZE)
    message = data.decode()

    udp_count = len([m for m in messages if m["protocol"] == "udp"])
    udp.sendto(
        f"[{udp_count}] OK ::: {message}".encode("utf-8"),
        addr,
    )

    messages.append(
        {
            "type": "message",
            "protocol": "udp",
            "ip": addr[0],
            "port": addr[1],
            "message": message,
            "timestamp": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        }
    )
    asyncio.create_task(broadcast(messages[-1]))


async def broadcast(message):
    for client in ws_clients:
        await client.send(json.dumps(message))


async def websocket_controls(websocket):
    global messages

    ws_clients.add(websocket)
    await websocket.send(
        json.dumps(
            {
                "type": "status",
                "status": "online",
            }
        )
    )

    await websocket.send(json.dumps({"type": "sync", "messages": messages}))

    try:
        async for message in websocket:
            match message:
                case "stop":
                    loop.remove_reader(tcp.fileno())
                    loop.remove_reader(udp.fileno())

                    await broadcast({"type": "status", "status": "offline"})

                    sys.exit()
                case "status":
                    await websocket.send(
                        json.dumps(
                            {
                                "type": "status",
                                "status": "online",
                            }
                        )
                    )
                case "clear":
                    messages.clear()
                    await broadcast({"type": "sync", "messages": messages})
    finally:
        ws_clients.remove(websocket)


async def main():
    global loop, tcp, udp

    loop = asyncio.get_running_loop()

    tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    tcp.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    tcp.setblocking(False)
    tcp.bind((HOST, TCP_PORT))
    tcp.listen(5)

    udp = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    udp.setblocking(False)
    udp.bind((HOST, UDP_PORT))

    loop.add_reader(tcp.fileno(), accept_tcp_connection)
    loop.add_reader(udp.fileno(), handle_udp_data)

    await serve(websocket_controls, HOST, SERVER_PORT)

    await asyncio.Future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
