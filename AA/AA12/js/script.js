const home = document.getElementById("divHome")
const login = document.getElementById("login-body")
const conta = document.getElementById("nova-conta")

// Ocultar elementos através do display

function mostrarApenasHome() {
    home.style.display = 'block';
    login.style.display = 'none';
    conta.style.display = 'none';
}

function mostrarApenasLogin() {
    home.style.display = 'none';
    login.style.display = 'block';
    conta.style.display = 'none';

    const form = document.getElementById('form-login');
    form.reset();
}

function mostrarApenasConta() {
    home.style.display = 'none';
    login.style.display = 'none';
    conta.style.display = 'block';

    const form = document.getElementById("criarForm")
    form.reset();
}

const botaoEnviar = document.getElementById('botaoLogin'); // ID do seu botão
const campo1 = document.getElementById('login-password'); // ID do primeiro campo
const campo2 = document.getElementById('login-email'); // ID do segundo campo

function verificarCampos() {
  if (campo1.value.trim() !== '' && campo2.value.trim() !== '') {
    botaoEnviar.disabled = false; // Habilita o botão
  } else {
    botaoEnviar.disabled = true; // Desabilita o botão
  }
}

// Adiciona ouvintes de evento para monitorar mudanças nos campos
campo1.addEventListener('input', verificarCampos);
campo2.addEventListener('input', verificarCampos);

// Verifica os campos inicialmente
verificarCampos();

const formulario = document.getElementById('form-login');

formulario.addEventListener('submit', function(event) {
    if (campo2.value.includes('@')) {
        event.preventDefault(); // Evita o envio padrão do formulário
        formulario.reset();
        verificarCampos(); // Verifica os campos após o reset      // Lógica para enviar o formulário
    } else {
        event.preventDefault(); // Evita o envio padrão do formulário
        alert('Por favor, insira um e-mail válido.');
    }
});

// Criação de nova conta

class Conta {
    constructor(nome, sobrenome, cpf, email, senha) {
        this.nome = nome
        this.sobrenome = sobrenome
        this.cpf = cpf
        this.email = email
        this.senha = senha
    }
}

function criarConta() {
    let valid = true;

    const nome = document.getElementById("nome");
    valid &= validaTextoEmBranco(nome, "statusNome", "Nome")

    const sobrenome = document.getElementById("sobrenome");
    valid &= validaTextoEmBranco(sobrenome, "statusSobrenome", "Sobrenome")

    const cpf = document.getElementById("cpf");
    valid &= validarCPF(cpf)

    const email = document.getElementById("email");
    valid &= validarEmail(email);

    const senha1 = document.getElementById("senha");
    const senha2 = document.getElementById("repitaSenha");

    valid &= validarSenha(senha1, senha2)

    if (valid) {
        console.log(new Conta(
            nome.value,
            sobrenome.value,
            new CPF(cpf.value),
            email.value,
            senha1.value
        ));

        const form = document.getElementById("criarForm");
        form.reset();
    }
}

function validarSenha(senha1, senha2) {
    const status1 = document.getElementById("statusSenha");
    const status2 = document.getElementById("statusRepitaSenha");

    if (senha1.value !== senha2.value) {
        status1.innerText = "As senhas não batem"
        status1.classList.add("status-fail");
        status1.classList.remove("status-ok");
        status2.innerText = "As senhas não batem"
        status2.classList.add("status-fail");
        status2.classList.remove("status-ok");
    
        return false
    }

    status1.innerText = "Ok"
    status1.classList.add("status-ok");
    status1.classList.remove("status-fail");
    status2.innerText = "Ok"
    status2.classList.add("status-ok");
    status2.classList.remove("status-fail");

    return true
}

function validarEmail(email) {
    const status = document.getElementById("statusEmail");

    let count = 0;
    for (let i = 0; i < email.value.length; i++) {
        if (email.value[i] === '@') {
            count++;
        }
    }

    if (count !== 1) {
        status.innerText = "E-mail inválido"
        status.classList.add("status-fail");
        status.classList.remove("status-ok");
    } else {
        status.innerText = "Ok"
        status.classList.add("status-ok");
        status.classList.remove("status-fail");
    }

    return count === 1
}

function validaTextoEmBranco(elemento, statusID, rotulo) {
    const status = document.getElementById(statusID);

    if (elemento.value.length === 0) {
        status.innerText = `${rotulo} está vazio`
        status.classList.add("status-fail");
        status.classList.remove("status-ok");
    } else {
        status.innerText = "Ok"
        status.classList.add("status-ok");
        status.classList.remove("status-fail");
    }

    return elemento.value.length > 0
}

function validarCPF(elemento) {
    const status = document.getElementById("statusCPF");

    try {
        cpf = new CPF(elemento.value);
        status.innerText = "Ok"
        status.classList.add("status-ok");
        status.classList.remove("status-fail");
    } catch (err) {
        status.innerText = err
        status.classList.add("status-fail");
        status.classList.remove("status-ok");
        return false
    }

    return true
}

class CPF {
    constructor(valor) {
        this.valor = valor;
        this.validado = false;
        this.problemas = [];

        this.validar();
    }

    valido() {
        if (!this.validado) {
            throw Error("ERRO: CPF não validado");
        }

        return this.problemas.length === 0
    }

    validar() {
        this.validado = false;
        this.problemas = [];

        if (!this.haOnzeDigitos()) {
            this.problemas.push("CPF não possui 11 digitos")
        }

        if (!this.todosOsOnzeDigitosSaoNumeros()) {
            this.problemas.push("CPF não é composto somente por números")
        }

        if (!this.osOnzeNumerosSaoDiferentes()) {
            this.problemas.push("CPF é composto por números completamente iguais")
        }

        if (!this.oPrimeiroDigitoVerificadorEhValido()) {
            this.problemas.push("Primeiro digito verificador inválido")
        }

        if (!this.oSegundoDigitoVerificadorEhValido()) {
            this.problemas.push("Segundo digito verificador inválido")
        }

        this.validado = true;

        if (!this.valido()) {
            throw Error(this.problemas.join("\n"))
        }

        return this.valido()
    }

    haOnzeDigitos() {
        return this.valor.length === 11
    }

    todosOsOnzeDigitosSaoNumeros() {
        for (const c of this.valor) {
            if (!(c >= '0' && c <= '9')) {
                return false
            }
        }
        return true
    }

    osOnzeNumerosSaoDiferentes() {
        let allEqual = true
        const first = this.valor[0]

        for (const other of this.valor) {
            if (other !== first) {
                allEqual = false
            }
        }

        return !allEqual;
    }

    oPrimeiroDigitoVerificadorEhValido() {
        let sum = 0
        for (let i = 0; i < 9; i++) {
            sum += parseInt(this.valor[i] * (10 - i))
        }

        sum *= 10
        sum %= 11
        sum = sum === 10 ? 0 : sum

        return parseInt(this.valor[9]) === sum
    }

    oSegundoDigitoVerificadorEhValido() {
        let sum = 0
        for (let i = 0; i < 10; i++) {
            sum += parseInt(this.valor[i] * (11 - i))
        }

        sum *= 10
        sum %= 11
        sum = sum === 10 ? 0 : sum

        return parseInt(this.valor[10]) === sum
    }
}



 // Exemplo de APIs (troque pelos seus endpoints reais)
const estadosAPI = "https://servicodados.ibge.gov.br/api/v1/localidades/estados";

// Função para preencher um select com os dados da API
async function preencherSelect(url, selectId) {
const select = document.getElementById(selectId);
try {
    const resposta = await fetch(estadosAPI);
    const dados = await resposta.json();
    let listnova = dados.map(item => ({ nome: item.nome, sigla: item.sigla })); // Ordena os dados por nome
    listnova.sort((a, b) => a.nome.localeCompare(b.nome));
    // Limpa as opções anteriores
    select.innerHTML = "";

    // Cria novas opções
    listnova.forEach(item => {
    const option = document.createElement("option");
    option.value = item.sigla; // depende da estrutura da API
    option.textContent = item.nome || item.label || item;
    select.appendChild(option);
    });

} catch (erro) {
    console.error("Erro ao carregar opções:", erro);
    select.innerHTML = "<option>Erro ao carregar</option>";
}
}

// Chama as funções
preencherSelect(estadosAPI, "dropdownestado");


dropdownestado.addEventListener("change", async () => {
    const estadoSelecionado = dropdownestado.value;
    
    if (!estadoSelecionado) {
        dropdowncidade.innerHTML = "<option>Selecione um estado primeiro</option>";
        return;
      }

    const cidadesAPI = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelecionado}/municipios`;

    try {
        const resposta = await fetch(cidadesAPI);
        const dados = await resposta.json();
        let listnova = dados.map(item => item.nome); // Ordena os dados por nome
        listnova.sort((a, b) => a.localeCompare(b));
        // Limpa as opções anteriores
        dropdowncidade.innerHTML = "";

        // Cria novas opções
        listnova.forEach(item => {
        const option = document.createElement("option");
        option.value = item; // depende da estrutura da API
        option.textContent = item;
        dropdowncidade.appendChild(option);
        });

    } catch (erro) {
        console.error("Erro ao carregar opções:", erro);
        dropdowncidade.innerHTML = "<option>Erro ao carregar</option>";
    }
});