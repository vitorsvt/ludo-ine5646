function tratadorDeCliqueExercicio3() {
    let valorComoString = window.prompt("Insira uma string: ")

    let valorCortado = valorComoString.substring(1, valorComoString.length-1)

    console.log("O valor cortado é: "+valorCortado)

    alert(valorCortado)

}