function loadContatos(contatos = [], asc=true) {
    const listaContatos = document.getElementById("lista-contatos");
    const ordemButton = document.getElementById('ordem-lista-contatos');

    const errorEmailMsg = 'Email não declarado';
    const errorTelMsg = 'Telefone não declarado';

    ordemButton.remove();
    
    //Edição e salvar
    const excluirContato = (nome, id) => {
        if (confirm(`Deseja excluir o contato "${nome}"?`)) {
            window.location.href = `/rmv-contato?id=${id}`;
        }
    }
    const salvarContato = (nome, id) => {
        const nomeValue = document.getElementById(`lbl-nome-${id}`).textContent;

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+$/;
        const emailValue = document.getElementById(`lbl-email-${id}`).textContent;
        const emailIsValid = emailRegex.test(emailValue);

        const telRegex = /^\d{11}$/;
        const telValue = document.getElementById(`lbl-tel-${id}`).textContent;
        const telIsValid = telRegex.test(telValue);

        if (nomeValue.trim() == '') {
            alert('Erro ao salvar:\nO nome não pode ser vazio.')
        } else if (!emailIsValid && emailValue != errorEmailMsg) {
            alert('Erro ao salvar:\nO email indicado não está no formato adequado. \n->[seu_email@email.com]')
        } else if (!telIsValid && telValue != errorTelMsg) {
            alert('Erro ao salvar:\nO telefone indicado não está no formato adequado. \n->[00900000000]');
        } else if (confirm(`Deseja salvar as alterações a "${nome}"?`)) {
            //Can save data
            const idInput = document.getElementById("save-id");
            idInput.value = id;
            
            const nomeInput = document.getElementById("save-nome");
            nomeInput.value = nomeValue;
            
            const emailInput = document.getElementById("save-email");
            emailInput.value = emailValue == errorEmailMsg? '' : emailValue;
            
            const telefoneInput = document.getElementById("save-telefone");
            telefoneInput.value = telValue == errorTelMsg? '' : telValue;
            
            const forms = document.getElementById("save-editions");
            forms.submit();
        }
    }

    const executarOperacao = (nome, id) => {
        const rmvBtnOperation = Boolean(Number(document.getElementById(`rmv-btn-${id}`).value));
        if (rmvBtnOperation) {
            salvarContato(nome, id);
        } else {
            excluirContato(nome, id)
        }
    }

    let handler = null;
    
    function getClickPos(e = Event, id) {
        const srcClickName = e.target.id.trim().split('-') || [''];
        const srcIdCode = srcClickName[srcClickName.length-1];
        if (!(srcIdCode == id)) {
            alternarEdicao(id)
        }
    }

    let originalNome, originalEmail, originalTel;

    const alternarEdicao = (id) => {
        const cardToEdit = document.getElementById(`contato-card-${id}`);
        cardToEdit.classList.toggle('editable');

        const isEditing = cardToEdit.classList.contains('editable');
        
        //Buttons update
        const editBtn = cardToEdit.querySelector(".editBtn");
        editBtn.innerHTML = isEditing? 'Cancelar' : 'Editar';
        
        const rmvBtn = cardToEdit.querySelector(".rmvBtn");
        rmvBtn.innerHTML = isEditing? 'Salvar' : 'Excluir';
        rmvBtn.value = isEditing? '1' : '0';

        //Labels edit update
        const lblNome = document.getElementById(`lbl-nome-${id}`);
        lblNome.contentEditable = isEditing;

        const lblEmail = document.getElementById(`lbl-email-${id}`);
        lblEmail.contentEditable = isEditing;

        const lblTel = document.getElementById(`lbl-tel-${id}`);
        lblTel.contentEditable = isEditing;

        if (isEditing) {
            handler = (e) => getClickPos(e, id);
            window.addEventListener('click', handler);

            editBtn.classList.add('r');
            rmvBtn.classList.add('g');

            //Salvar dados originais
            originalNome = lblNome.textContent;
            originalEmail = lblEmail.textContent;
            originalTel = lblTel.textContent;
        } else {
            window.removeEventListener('click', handler)

            editBtn.classList.remove('r');
            rmvBtn.classList.remove('g');

            lblNome.textContent = originalNome;
            lblEmail.textContent = originalEmail;
            lblTel.textContent = originalTel;
        }
    }

    if (contatos.length > 0) {
        listaContatos.innerHTML = '';
        for (const contato of contatos) {
            const id = contato.contato_id;

            const newCard = document.createElement('div');
            newCard.id = `contato-card-${id}`
            newCard.className = 'contato-card';
            newCard.innerHTML = `
                <div>
                    <label id="lbl-nome-${id}" class='title' >${contato.nome}</label>
                    <label id="lbl-email-${id}" >${contato.email || errorEmailMsg}</label>
                    <label id="lbl-tel-${id}" >${contato.telefone || errorTelMsg}</label>
                </div>
                <div class="buttons">
                    <button id="edit-btn-${id}" class="y editBtn">Editar</button>
                    <button id="rmv-btn-${id}" class="r rmvBtn" value="0">Excluir</button>
                </div>
            `;
            
            newCard.querySelector(".editBtn").addEventListener('click', () => alternarEdicao(id));
            newCard.querySelector(".rmvBtn").addEventListener('click', () => executarOperacao(contato.nome, id));

            if (!asc) {
                listaContatos.prepend(newCard);
            } else {
                listaContatos.appendChild(newCard);
            }
        }
    
        listaContatos.prepend(ordemButton);
    } else {
        listaContatos.innerHTML = '<label class="emptyLabel">Você não possui contatos cadastrados.<label>'
    }
}

function loadEntradas(entradas = []) {
    const entradaSelector = document.getElementById('entrada_id_selector');
    const entradaDefaultOption = document.getElementById('entrada_id_defaultOption');

    entradaDefaultOption.remove();

    for (const entrada of entradas) {
        const id = entrada.entrada_id;

        const newOption = document.createElement('option');
        newOption.value = id;
        newOption.textContent = entrada.nome;

        entradaSelector.appendChild(newOption);
    }

    entradaSelector.prepend(entradaDefaultOption);
}

function loadEventos(eventos = [], entradas = [], contatos = [], inscricoes = {}, asc=true) {
    const listaEventos = document.getElementById("lista-eventos");
    const ordemButton = document.getElementById('ordem-lista-eventos');
    ordemButton.remove();

    const excluirEvento = (nome, id) => {
        if (confirm(`Deseja excluir o evento "${nome}"?`)) {
            if (inscricoes[id] <= 0 || confirm(`O evento "${nome}" possui inscricoes. Deseja realmente excluir?\nOBS: Esta é uma ação irreversível!`)) {
                window.location.href = `/rmv-evento?id=${id}`
            }
        }
    }
    
    //View boxes
    const convitesMenu = document.getElementById('convidar-eventos');
    const inscricoesMenu = document.getElementById('inscricoes-em-evento');

    const alternarMenuConvite = (nome, id, contatos = []) => {
        const title = convitesMenu.querySelector('.subtitle');
        const nameTitle = convitesMenu.querySelector('.named');
        const idEventoInput = document.getElementById('input_evento_id');
        idEventoInput.value = id;

        if (nameTitle.textContent == nome && !convitesMenu.classList.contains('hide')) {
            convitesMenu.classList.add('hide');
        } else {
            convitesMenu.classList.remove('hide');
        }

        if (!inscricoesMenu.classList.contains('hide')) {
            inscricoesMenu.classList.toggle('hide');
        }

        title.textContent = `Convidar a:`
        nameTitle.textContent = `${nome}`

        const contatoSelector = document.getElementById('search-box-contatos-eventos');
        const contatoDefaultOption = contatoSelector.querySelector('.default');

        contatoDefaultOption.remove();
        contatoSelector.innerHTML = '';

        if (contatos.length > 0) {
            for (const contato of contatos) {
                const newOption = document.createElement('option');
                newOption.value = contato.contato_id;
                newOption.textContent = `${contato.nome}`;
                
                contatoSelector.appendChild(newOption);
            }

            contatoSelector.prepend(contatoDefaultOption);
        } else {
            contatoSelector.innerHTML = '<option class="default" value="" selected disabled>Você não possui contatos.</option>'
        }
    }

    const alternarMenuVerInscricoes = (nome, id) => {
        const title = inscricoesMenu.querySelector('.title');
        const nameTitle = inscricoesMenu.querySelector('.named');
        const list = inscricoesMenu.querySelector('.list');

        if (!convitesMenu.classList.contains('hide')) {
            convitesMenu.classList.toggle('hide');
        }

        if (nameTitle.textContent == nome && !inscricoesMenu.classList.contains('hide')) {
            inscricoesMenu.classList.add('hide');
        } else {
            inscricoesMenu.classList.remove('hide');
        }

        const form = document.getElementById('form-atualizar-inscricao');
        const input_inscricao_id = document.getElementById('input_inscricao_id');
        const input_status_id = document.getElementById('input_status_id');
        const aceitarBtn = (inscricao_id) => {
            input_inscricao_id.value = inscricao_id;
            input_status_id.value = 2;
            form.submit()
        }
        const negarBtn = (inscricao_id) => {
            input_inscricao_id.value = inscricao_id;
            input_status_id.value = 3;
            form.submit()
        }
        
        title.textContent = 'Inscritos em:'
        nameTitle.textContent = `${nome}`;

        if (inscricoes[id].length > 0) {
            list.innerHTML = '';
            for (const inscricao of inscricoes[id]) {
                const newCard = document.createElement("div");
                const statusColor = ['none', 'y', 'g', 'r', 'y'];
                newCard.classList = `inscricao-card ${statusColor[inscricao.status_id]}`;
                newCard.innerHTML = `
                    <div>
                        <label>${inscricao.nome}</label>
                        <label>${inscricao.email}</label>
                        <label class='bold'>Status: ${inscricao.status}</label>
                    </div>
                    ${  
                        inscricao.status_id == 1? 
                            '<button class="accBtn">Aceitar</button> <button class="endBtn">Negar</button>' : 
                        inscricao.status_id == 2? 
                            '<button class="endBtn">Cancelar</button>' :
                            ''
                    }
                `;
                const accBtn = newCard.querySelector('.accBtn');
                const endBtn = newCard.querySelector('.endBtn');
                if (accBtn) {
                    accBtn.addEventListener('click', () => aceitarBtn(inscricao.inscricao_id));
                }
                if (endBtn) {
                    newCard.querySelector('.endBtn').addEventListener('click', () => negarBtn(inscricao.inscricao_id));
                }

                list.appendChild(newCard);
            }
        } else {
            list.innerHTML = 'Este evento não possui inscrições.'
        }
    }

    const editarMenu = document.getElementById('editar-eventos');
    const alternarMenuEdicao = (evento_id, nome, entrada_id, data_inicio, data_fim, link) => {
        const formCadastroEventos = document.getElementById('eventoForms');
        editarMenu.classList.remove('hide');

        formCadastroEventos.querySelector('.title').textContent = 'Edição de Evento';
        formCadastroEventos.querySelector('[name="nome"]').value = nome;
        formCadastroEventos.querySelector('[name="entrada_id"]').value = entrada_id;
        formCadastroEventos.querySelector('[name="data_inicio"]').value = data_inicio;
        formCadastroEventos.querySelector('[name="data_fim"]').value = data_fim;
        formCadastroEventos.querySelector('[name="link"]').value = link;
        formCadastroEventos.querySelector('input[type="submit"]').value = "Salvar";

        const inputEventoID = document.createElement("input");
        inputEventoID.type = 'hidden';
        inputEventoID.value = evento_id;
        inputEventoID.name = 'evento_id';
        formCadastroEventos.appendChild(inputEventoID);

        formCadastroEventos.action = '/atualizar-evento';
        formCadastroEventos.method = 'post';

        if (!formCadastroEventos.querySelector('input[type="button"]')) {
            const voltarButton = document.createElement('input');
            voltarButton.type = 'button';
            voltarButton.value = "Cancelar"
            voltarButton.onclick = () => {
                editarMenu.classList.add('hide');
            }
    
            formCadastroEventos.appendChild(voltarButton);
        }

        editarMenu.appendChild(formCadastroEventos);
    }

    //Geração de card
    listaEventos.innerHTML = '';
    if (eventos.length > 0) {
        listaEventos.prepend(ordemButton);

        for (const evento of eventos) {
            const id = evento.evento_id;
            const newBox = document.createElement('div');
            newBox.classList = 'evento-card';

            newBox.innerHTML = `
                <label class='title'>${evento.nome}</label> ${entradas[evento.entrada_id-1].nome}
                <label>Data de início: ${evento.data_inicio}</label>
                <label>Data de término: ${evento.data_fim}</label>
                ${evento.link == ''? '' : `<a href="${evento.link}" target="_blank">Link de detalhes</a>`}
                <div>
                    <button class="y edtBtn">Editar</button>
                    <button class="b invBtn">Convidar contato</button>
                    <button class="b showBtn">Ver inscrições</button>
                    <button class="r rmvBtn">Excluir</button>
                <div>
            `;

            newBox.querySelector('.edtBtn').addEventListener('click', () => alternarMenuEdicao(
                evento.evento_id, evento.nome, evento.entrada_id, evento.data_inicio, evento.data_fim, evento.link
            ));
            newBox.querySelector('.invBtn').addEventListener('click', () => alternarMenuConvite(evento.nome, id, contatos));
            newBox.querySelector('.showBtn').addEventListener('click', () => alternarMenuVerInscricoes(evento.nome, id));
            newBox.querySelector('.rmvBtn').addEventListener('click', () => excluirEvento(evento.nome, id));

            if (asc) {
                listaEventos.appendChild(newBox);
            } else {
                listaEventos.prepend(newBox);
            }
        }
        listaEventos.prepend(ordemButton);

    } else {
        listaEventos.innerHTML = '<label class="emptyLabel">Você não possui eventos cadastrados.<label>'
    }
}

function loadEventosPublicos(eventos = [], usuario, asc = true){
    const listaEventos = document.getElementById("lista-eventos-publicos");
    const ordemButton = document.getElementById('ordem-lista-eventos-publicos');
    ordemButton.remove();

    const ingressarEmEvento = (evento_id, usuario_id) => {
        document.getElementById(`formIngEv-${evento_id}-${usuario_id}`).submit();
    }

    if (eventos.length > 0) {
        listaEventos.innerHTML = '';
        for (const evento of eventos) {
            const id = evento.evento_id;
            const userId = usuario.usuario_id;
            const newBox = document.createElement('div');
            newBox.classList = 'evento-card';

            newBox.innerHTML = `
                <label class='title'>${evento.nome}</label> ${entradas[evento.entrada_id-1].nome}
                <label>Data de início: ${evento.data_inicio}</label>
                <label>Data de término: ${evento.data_fim}</label>
                ${evento.link == ''? '' : `<a href="${evento.link}" target="_blank">Link de detalhes</a>`}
                <label class='title' style="font-size:13px">Organizado por:</label>
                <label style="font-size:13px">${evento.username} / ${evento.email}</label>
                <div>
                    <button class="ingBtn">Ingressar</button>
                <div>
                <form action="/ingressar-evento" method="post" id="formIngEv-${id}-${userId}">
                    <input type="hidden" name="evento_id" value="${id}">
                    <input type="hidden" name="usuario_id" value="${userId}">
                </form>
            `;

            newBox.querySelector('.ingBtn').addEventListener('click', () => ingressarEmEvento(id, userId))

            if (asc) {
                listaEventos.appendChild(newBox);
            } else {
                listaEventos.prepend(newBox);
            }
        }

        listaEventos.prepend(ordemButton);
    } else {
        listaEventos.innerHTML = '<label class="emptyLabel">Não há eventos disponíveis para você no momento.</label>'
    }
}