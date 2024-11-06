// IMPORTS ----------------------------------------------------
const manageDB = require('./server/manageDB.js');

const bodyParser = require('body-parser');
const path = require('path')

const express = require('express');
const app = express();
const session = require('express-session');
const PORT = 1101;

// SETUP ------------------------------------------------------
app.use('/html', express.static(path.join(__dirname, 'html')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
//ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'html'));
//body parser
app.use(bodyParser.urlencoded({extended: true}));
//session
app.use(session({
    secret: 'log_key',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

// ROUTES -----------------------------------------------------

//Login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'autenticar.html'));
});
app.post('/', async (req, res) => {
    const {email , senha} = req.body;
    const usuario = await manageDB.buscarUsuarioPorEmail(email);
    if (!usuario || usuario.senha != senha) {
        res.redirect('/?e=1');
    } else {
        req.session.usuario = usuario;
        res.redirect('/home?tab=menu');
    }
})

//Logout
app.get('/logout', async (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('LOGOUT => ', error)
            res.redirect('/home');
        } else {
            res.redirect('/');
        }
    });
});

//Cadastro
app.get('/registrar-usuario', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'registrarUsuario.html'));
});
app.post('/registrar-usuario', async (req, res) => {
    const { nome, email, telefone, senha } = req.body;
    const emailCadastrado = await manageDB.buscarUsuarioPorEmail(email);

    if (emailCadastrado) {
        res.redirect('/registrar-usuario?e=1')
    } else {
        await manageDB.registrarUsuario(nome, email, telefone, senha);
        res.redirect('/?s=1');
    }
});

//Home
app.get('/home', async (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        res.redirect('/');
    } else {
        const contatos = await manageDB.buscarContatosPorUsuario(usuario.usuario_id);
        const eventos = await manageDB.buscarEventosPorUsuario(usuario.usuario_id);
        const status = await manageDB.obterStatus();
        const entradas = await manageDB.obterEntradas();

        const eventosPublicos = await manageDB.buscarEventosPub(usuario.usuario_id);

        let inscricoes = {};

        for (const evento of eventos) {
            const id = evento.evento_id;
            inscricoes[id] = await manageDB.obterInscricoesEmEvento(id);
        }

        const user = {
            usuario_id: usuario.usuario_id,
            nome: usuario.nome,
            email: usuario.email,
            telefone: usuario.telefone
        }

        res.render('home', {
            usuario:user, 
            contatos:contatos, 
            eventos:eventos, 
            status:status, 
            entradas:entradas, 
            inscricoes:inscricoes,
            eventosPublicos:eventosPublicos
        });
    }
});

//Add Contatos
app.post('/add-contato', async (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        res.redirect('/');
    } else {
        const {usuario_id, nome, email, telefone} = req.body;
        await manageDB.registrarContato(usuario_id, nome, email, telefone);
        res.redirect('/home?tab=add-contato&s=1');
    }
});
//Rmv Contatos
app.get('/rmv-contato', async (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        res.redirect('/');
    } else {
        const contato_id = req.query.id
        await manageDB.excluirContatoPorId(contato_id);
        res.redirect('/home?tab=contatos');
    }
});
//Salvar contato após a edição
app.post('/salvar-contato', async (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        res.redirect('/');
    } else {
        const {contato_id, nome, email, telefone} = req.body;
        await manageDB.atualizarContatoPorId(contato_id, nome, email, telefone);
        res.redirect('/home?tab=contatos');
    }
});
//Add evento
app.post('/add-evento', async(req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        res.redirect('/');
    } else {
        const {usuario_id, nome, entrada_id, data_inicio, data_fim, link} = req.body;
        await manageDB.registrarEvento(usuario_id, nome, entrada_id, data_inicio, data_fim, link);
        res.redirect('/home?tab=add-evento&s=2');
    }
});
//Rmv evento
app.get('/rmv-evento', async (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        res.redirect('/');
    } else {
        const evento_id = req.query.id;
        await manageDB.excluirInscricoesDoEvento(evento_id);
        await manageDB.excluirEventoPorId(evento_id);
        res.redirect('/home?tab=eventos');
    }
});
//Convidar para evento
app.post('/convidar-evento', async (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        res.redirect('/');
    } else {
        const { contato_id, evento_id } = req.body;
        const contato = await manageDB.buscarContatoPorId(contato_id);

        if (contato.email == "") {
            // e = 10: 'este contato não possui email.'
            res.redirect('/home?tab=eventos&e=10');
        } else {
            const usuario_encontradoPorEmail = await manageDB.buscarUsuarioPorEmail(contato.email);
            if (!usuario_encontradoPorEmail) {
                // e = 11: 'este contato não é um usuário cadastrado no sistema.'
                res.redirect('/home?tab=eventos&e=11');
            } else {
                if ((await manageDB.obterInscricaoDeUsuarioEmEvento(usuario_encontradoPorEmail.usuario_id, evento_id))) {
                    // e = 12: 'este usuário já possui incrição solicitada'
                    res.redirect('/home?tab=eventos&e=12');
                } else {
                    await manageDB.registrarInscricao(usuario_encontradoPorEmail.usuario_id, evento_id, manageDB.STATUS.ConvitePendente);
                    res.redirect('/home?tab=eventos&s=9');
                }
            }
        }
    }
});
//Atualizar evento
app.post('/atualizar-evento', async (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        res.redirect('/');
    } else {
        const {evento_id, nome, entrada_id, data_inicio, data_fim, link} = req.body;
        console.log(evento_id)
        await manageDB.atualizarEvento(evento_id, nome, entrada_id, data_inicio, data_fim, link);
        res.redirect('/home?tab=eventos');
    }
});
//Atualizar inscrição via admin
app.post('/atualizar-inscricao', async (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        res.redirect('/');
    } else {
        const { inscricao_id, status_id } = req.body;
        await manageDB.atualizarStatusInscricao(status_id, inscricao_id);
        res.redirect('/home?tab=eventos');
    }
});
//Inscrever
app.post('/ingressar-evento', async (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        res.redirect('/');
    } else {
        const { evento_id, usuario_id } = req.body;
        await manageDB.registrarInscricao(usuario_id, evento_id, manageDB.STATUS.Aprovada);
        res.redirect('/home?tab=go-eventos&s=3');
    }
});


// START ------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Servidor em: http://localhost:${PORT}`);
})