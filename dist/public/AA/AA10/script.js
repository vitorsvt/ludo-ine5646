// 1

function calculadora(a, b, f) {
    return f(a, b)
}

const soma = (a, b) => a + b
const subtrai = (a, b) => a - b

console.log(calculadora(31, 12, soma))
console.log(calculadora(11, 25, subtrai))

// 2

// var callback = function() {
//     console.log("Estou na função de callback");
// }    
// console.log("Iniciei")
// setTimeout(callback, 5000);
// console.log("Estou após o setTimeout")

// 3

// function consoleAtrasado(mensagem, atraso) {
//     setTimeout(console.log(mensagem), atraso)
// }
// console.log("Olá")
// consoleAtrasado("Teste", 10000)
// console.log("Bye")

// 4

// function consoleAtrasadoCorrigido(mensagem, atraso) {
//     setTimeout(() => console.log(mensagem), atraso)
// }
// console.log("Olá")
// consoleAtrasadoCorrigido("Teste", 10000)
// console.log("Bye")

// 5

const olaTchau = () => {
    console.log("Olá")
    setTimeout(() => console.log("Tchau"), 2000)
}
olaTchau()


const olaETchau = () => {
    setTimeout(() => console.log("Tchau"), 2000)
    console.log("Olá")
}
olaETchau()

// 6

// const resolverEm1s = new Promise(resolve => setTimeout(resolve, 1000));
// for (let i = 0; i < 10; i++) {
//     resolverEm1s.then(() => console.log("oi"))            
// }

// 7

// const resolverEm1s = new Promise(resolve => setTimeout(resolve, 1000));
// for (let i = 0; i < 10; i++) {
//     resolverEm1s.then(() => console.log(i))            
// }

// 8

// let i = 0
// let max = 10

// function p() {
//     pp = new Promise(resolve => setTimeout(resolve, 1000))
//     pp.then(() => {
//         console.log(i++)
//         if (i < max) {
//             return p()
//         }
//     })
//     return pp
// }

// p()

// 9

// let i=0
// let max = 10

// async function p() {
//     pp = new Promise(resolve => setTimeout(resolve, 1000))
//     await pp
//     console.log(i++)
//     if (i < max) {
//         return p()
//     }
//     return pp
// }        
// p()