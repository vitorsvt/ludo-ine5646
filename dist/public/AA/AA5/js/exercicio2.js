function tratadorDeCliqueExercicio2() {
    const now = new Date()

    let hours = now.getHours()
    const am_or_pm = hours >= 12 ? 'PM' : 'AM'
    hours %= 12

    alert(`${hours} ${am_or_pm} : ${now.getMinutes()}m : ${now.getSeconds()}s`)

    // atualize esta função para
    // exibir um alerta com a hora 
    // atual no seguinte formato:
    // Horário: 8 PM : 40m : 28s
    console.log('adicionar código na função tratadorDeCliqueExercicio2() em ./js/exercicio2.js')
}