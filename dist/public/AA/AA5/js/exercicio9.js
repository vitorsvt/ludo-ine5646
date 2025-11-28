function haOnzeDigitos(cpf) {
    return cpf.length === 11
}

function todosOsOnzeDigitosSaoNumeros(cpf) {
    for (const c of cpf) {
        if (!(c >= '0' && c <= '9')) {
            return false
        }
    }
    return true
}

function osOnzeNumerosSaoDiferentes(cpf) {
    let allEqual = true
    const first = cpf[0]
    
    for (const other of cpf) {
        if (other !== first) {
            allEqual = false
        }
    }

    return !allEqual;
}

function oPrimeiroDigitoVerificadorEhValido(cpf) {
    let sum = 0
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf[i] * (10 - i))
    }

    sum *= 10
    sum %= 11
    sum = sum === 10 ? 0 : sum

    return parseInt(cpf[9]) === sum
}

function oSegundoDigitoVerificadorEhValido(cpf) {
    let sum = 0
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf[i] * (11 - i))
    }

    sum *= 10
    sum %= 11
    sum = sum === 10 ? 0 : sum

    return parseInt(cpf[10]) === sum
}




//------------------- Não edite abaixo ----------------------------
function validarCPF(validacao, cpf) {
    switch (validacao) {
        case "onzeDigitos": return haOnzeDigitos(cpf)
        case "onzeSaoNumeros": return todosOsOnzeDigitosSaoNumeros(cpf) && validarCPF("onzeDigitos", cpf)
        case "naoSaoTodosIguais": return osOnzeNumerosSaoDiferentes(cpf) && validarCPF("onzeSaoNumeros", cpf)
        case "verificador10": return oPrimeiroDigitoVerificadorEhValido(cpf) && validarCPF("naoSaoTodosIguais", cpf)
        case "verificador11": return oSegundoDigitoVerificadorEhValido(cpf) && validarCPF("verificador10", cpf)

        default:
            console.error(validacao+" é um botão desconhecido...")
            return false
    }
}


function tratadorDeCliqueExercicio9(nomeDoBotao) {
    const cpf = document.getElementById("textCPF").value

    const validacao = (nomeDoBotao === "validade") ? "verificador11": nomeDoBotao
    const valido = validarCPF(validacao, cpf)
    const validoString = valido ? "valido": "inválido"
    const validadeMensagem = "O CPF informado ("+cpf+") é "+ validoString
    console.log(validadeMensagem)

    if (nomeDoBotao !== "validade") {
        let divResultado = document.getElementById(validacao);
        divResultado.textContent = validoString
        divResultado.setAttribute("class", valido ? "divValidadeValido": "divValidadeInvalido")    
    } else {
        window.alert(validadeMensagem)
    }

    
}