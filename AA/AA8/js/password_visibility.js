function mostrarSenha() {
    if (document.getElementById('login-password').type == 'text') {
        ocultarSenha()
        return;
    }

    document.getElementById('login-password').type = 'text';
    document.getElementById('olho').src = 'https://cdn0.iconfinder.com/data/icons/evericons-16px/16/circle-x-512.png'
}

function ocultarSenha() {
    document.getElementById('login-password').type = 'password';

    document.getElementById('olho').src = 'https://cdn0.iconfinder.com/data/icons/ui-icons-pack/100/ui-icon-pack-14-512.png'
}