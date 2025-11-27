// Depuração
const debugInfo = document.getElementById('debugInfo');
const debugToggle = document.getElementById('debugToggle');
let debugMode = false;

// URL para o gerenciador do servidor
const managerUrl = '/AA/AA11/cgi-bin/server_manager.py';

// Define o websocket (ws)
const websocketUrl = `ws://${window.location.hostname}:8082`; // URL para o WebSocket

debugToggle.addEventListener('click', () => {
    debugMode = !debugMode;
    debugInfo.style.display = debugMode ? 'block' : 'none';
    debugToggle.textContent = debugMode ? 'Ocultar Informações de Depuração' : 'Exibir Informações de Depuração';
});

function logDebug(message) {
    const now = new Date().toISOString();
    debugInfo.innerHTML += `[${now}] ${message}\n`;
    debugInfo.scrollTop = debugInfo.scrollHeight;
    console.log(`[DEBUG] ${message}`);
}

// Seleção de abas
let messages = []

const messageList = document.getElementById("messageList")
const noMessages = document.getElementById("noMessages")

const allMessages = document.getElementById("allMessages")
const tcpMessages = document.getElementById("tcpMessages")
const udpMessages = document.getElementById("udpMessages")

const tcpCount = document.getElementById('tcpCount')
const udpCount = document.getElementById('udpCount')
const totalCount = document.getElementById('totalCount')

let filter = "all"

function updateFilter(newFilter) {
    filter = newFilter
    messageList.classList.remove("filter-udp")
    messageList.classList.remove("filter-tcp")

    if (filter !== "all") {
        messageList.classList.add(`filter-${filter}`)
    }
}

function switchTab(tab) {
    allMessages.classList.remove("active")
    tcpMessages.classList.remove("active")
    udpMessages.classList.remove("active")
    tab.classList.add("active")

    switch (tab) {
        case allMessages:
            updateFilter("all")
            break
        case tcpMessages:
            updateFilter("tcp")
            break
        case udpMessages:
            updateFilter("udp")
            break
    }
}

allMessages.addEventListener('click', () => switchTab(allMessages))
tcpMessages.addEventListener('click', () => switchTab(tcpMessages))
udpMessages.addEventListener('click', () => switchTab(udpMessages))

// Websocket
let ws;

// Manter estado
let connected = false;
let statusTimeout = null;

const serverStatus = document.getElementById("serverStatus")
const statusIcon = document.getElementById("statusIcon")

function getStatus() {
    if (connected && !statusTimeout) {
        clearTimeout(statusTimeout)

        ws.send("status")
        updateStatus("waiting")
    
        statusTimeout = setTimeout(() => {
            logDebug("Sem resposta do servidor")
            updateStatus("offline")
            statusTimeout = null;
            connected = false;
        }, 5000);
    }
}

function updateStatus(status) {
    switch (status) {
        case "online":
            connected = true
            logDebug("Status recebido: servidor online");
            serverStatus.innerText = "Servidor online"
            statusIcon.classList.add("status-online")
            statusIcon.classList.remove("status-offline")
            statusIcon.classList.remove("status-waiting")
            break
        case "offline":
            connected = false
            logDebug("Status recebido: servidor offline");
            serverStatus.innerText = "Servidor offline"
            statusIcon.classList.add("status-offline")
            statusIcon.classList.remove("status-online")
            statusIcon.classList.remove("status-waiting")
            break
        case "waiting":
            logDebug("Verificando status do servidor...");
            serverStatus.innerText = "Verificando status do servidor..."
            statusIcon.classList.add("status-waiting")
            statusIcon.classList.remove("status-offline")
            statusIcon.classList.remove("status-online")
            break
        case "starting":
            logDebug("Iniciando servidor...");
            serverStatus.innerText = "Iniciando servidor..."
            statusIcon.classList.add("status-waiting")
            statusIcon.classList.remove("status-offline")
            statusIcon.classList.remove("status-online")
            break
        case "stopping":
            logDebug("Parando servidor...");
            serverStatus.innerText = "Parando servidor..."
            statusIcon.classList.add("status-waiting")
            statusIcon.classList.remove("status-offline")
            statusIcon.classList.remove("status-online")
            break
    }
}

function addMessage(message) {
    messages.push(message)

    tcpCount.innerText = messages.filter(m => m.protocol === "tcp").length
    udpCount.innerText = messages.filter(m => m.protocol === "udp").length
    totalCount.innerText = messages.length

    const html = `<div class="message ${message.protocol}">
        <h4 class="message-header">
            <div>
                <span class="protocol-badge ${message.protocol}-badge">${message.protocol.toUpperCase()}</span>
                <span>${message.ip}:${message.port}</span>
            </div>
            <span>${message.timestamp}</span>
        </h4>
        <p class="message-content">${message.message}</p>
    </div>`

    messageList.innerHTML += html
}

function loadMessages(sync) {
    messages = []

    tcpCount.innerText = 0
    udpCount.innerText = 0
    totalCount.innerText = 0

    messageList.innerHTML = '<p id="noMessages" class="no-messages">Nenhuma mensagem recebida ainda. Conecte clientes TCP/UDP para receber mensagens</p>'

    for (const message of sync.messages) {
        addMessage(message)
    }
}

function connectWebSocket() {
    if (ws && ws.readyState !== WebSocket.CLOSED) {
        return
    }

    logDebug(`Conectando ao WebSocket: ${websocketUrl}`);
    ws = new WebSocket(websocketUrl);

    ws.onmessage = (event) => {
        logDebug(`Mensagem recebida: ${event.data}`)

        const message = JSON.parse(event.data);

        switch (message.type) {
            case "status":
                clearTimeout(statusTimeout);
                statusTimeout = null;
                updateStatus(message.status)
                break;
            case "message":
                addMessage(message)
                break;
            case "sync":
                loadMessages(message)
                break;
        }
    };

    ws.onerror = (error) => {
        logDebug(`Erro ao conectar no WebSocket: ${JSON.stringify(error)}`);
        connected = false
    };

    ws.onopen = () => {
        logDebug(`WebSocket conectado`);
        getStatus()
    }

    ws.onclose = () => {
        logDebug(`WebSocket desconectado, tentando reconectar em 5s`);
        connected = false
        updateStatus("offline")
        clearTimeout(statusTimeout)
        statusTimeout = null;

        setTimeout(connectWebSocket, 5000);
    }
}

window.addEventListener('load', connectWebSocket);
setInterval(getStatus, 10000);

// Controles do servidor
const startServer = document.getElementById("startServer")
const stopServer = document.getElementById("stopServer")
const clearMessages = document.getElementById("clearMessages")

startServer.addEventListener("click", () => {
    if (!connected) {
        connectWebSocket()
        updateStatus("starting")
        fetch(managerUrl)
    } else {
        getStatus()
    }
})
stopServer.addEventListener("click", () => {
    ws.send("stop")
    updateStatus("stopping")
})
clearMessages.addEventListener("click", () => ws.send("clear"))
