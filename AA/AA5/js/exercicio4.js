function tratadorDeCliqueExercicio4() {
    checkIntervalFromPrompt()
    checkIntervalFromPrompt()
}

function checkIntervalFromPrompt() {
    const valorDeEntrada = prompt("Digite um número para checar o intervalo:")
    const valorNumerico = parseFloat(valorDeEntrada)

    console.log(`Número informado: ${valorNumerico}`)

    if (valorNumerico >= 30 && valorNumerico <= 50) {
        console.log(`${valorNumerico} está no intervalo [30,50].`)
    } else if (valorNumerico >= 60 && valorNumerico <= 100) {
        console.log(`${valorNumerico} está no intervalo [60,100].`)
    } else {
        console.log("O número informado não está em nenhum dos dois intervalos.")
    }
}