const regioes = [
    "RS",
    "DF, GO, MT, MS e TO",
    "AC, AP, AM, PA, RO e RR",
    "CE, MA e PI",
    "AL, PB, PE e RN",
    "BA e SE",
    "MG",
    "ES e RJ",
    "SP",
    "PR e SC",
]

function obterRegiaoFiscalAtravesDoCPFInformado(cpfInformado) {
    const nonoDigito = cpfInformado[8]
    return regioes[nonoDigito]
}

function tratadorDeCliqueExercicio8() {
    let textCPF = document.getElementById("textCPF")
	let textRegiao = document.getElementById("regiaoFiscal")

    const regiaoFiscal = obterRegiaoFiscalAtravesDoCPFInformado(textCPF.value);
    textRegiao.textContent = "Região fiscal: "+regiaoFiscal
}
