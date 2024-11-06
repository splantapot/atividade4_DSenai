function goToTab(tab) {
    window.location.href=`/home?tab=${tab}`;
}

function exit() {
    window.location.href='/logout';
}

function showTab() {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    const nowTab = document.getElementById(tab);

    if (!tab || !nowTab) {
        alert('Aba inexistente. Voltando ao menu...');
        window.location.href=`/home?tab=menu`;
    } else {
        nowTab.classList.toggle('hide');
    }
}

showTab();

function showStatus() {    
    const urlParams = new URLSearchParams(window.location.search);
    const success = Number(urlParams.get('s'));
    const error = Number(urlParams.get('e'));

    switch (success) {
        case 1:
            alert('Cadastro realizado com sucesso!');
        break;

        case 2:
            alert('Evento Cadastrado!');
        break;
        
        case 3:
            alert('Sucesso ao se inscrever!');
        break;

        case 9:
            alert('Convite enviado!');
        break;
    }

    switch (error) {
        case 10:
            alert('Este contato não possui email.');
        break;

        case 11:
            alert('Este contato não é um usuário cadastrado no sistema.');
        break;

        case 12:
            alert('Este usuário já possui solicitação de inscrição.');
        break;
    }
}

showStatus();