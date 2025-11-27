function inversorDeString() {
    const entrada = prompt("Escreva um texto:")
    const invertida = entrada.split('').reverse().join('')
    console.log(invertida)
}