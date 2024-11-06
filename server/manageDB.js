const sqlite3 = require('sqlite3').verbose();

const DB_NAME = 'database';
const DB_PATH = `./${DB_NAME}.db`;

// START ------------------------------------------------------
function openDB(path = DB_PATH) {
    const db = new sqlite3.Database(path, (error) => {
        if (error) {
            console.error('OpenDB => ', error);
        } else {
            console.log(`DB '${DB_PATH}' aberto!`);
        }
    });
    return db;
}

const DB_DEFAULT = openDB();

function closeDB(db = DB_DEFAULT) {
    db.close((error) => {
        if (error) {
            console.error('CloseDB => ', error);
        } else {
            console.log(`DB '${DB_PATH}' fechado!`);
        }
    })
}

// INSERT -----------------------------------------------------

function registrarUsuario(nome, email, telefone, senha, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO usuarios(nome, email, telefone, senha) VALUES (?,?,?,?);";
        db.run(query, [nome, email, telefone, senha], (error) => {
            if (error) {
                console.error('REG-USER => ', error);
                reject(error)
            } else {
                console.log(`user ${nome} added.`)
                resolve()
            }
        })
    });
}

function registrarContato(usuario_id, nome, email, telefone, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO contatos(usuario_id, nome, email, telefone) VALUES (?,?,?,?);";
        db.run(query, [usuario_id, nome, email, telefone], (error) => {
            if (error) {
                console.error('REG-CTN => ', error);
                reject(error);
            } else {
                console.log(`contato ${nome} added.`)
                resolve();
            }
        })
    });
}

function registrarEvento(usuario_id, nome, entrada_id, data_inicio, data_fim, link, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO eventos(usuario_id, nome, entrada_id, data_inicio, data_fim, link) VALUES (?,?,?,?,?,?);";
        db.run(query, [usuario_id, nome, entrada_id, data_inicio, data_fim, link], (error) => {
            if (error) {
                console.error('REG-EVT => ', error);
                reject(error);
            } else {
                console.log(`evento ${nome} added.`)
                resolve();
            }
        })
    });
}

function registrarInscricao(usuario_id, evento_id, status_id, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO inscricoes(usuario_id, evento_id, status_id) VALUES (?,?,?);";
        db.run(query, [usuario_id, evento_id, status_id], (error) => {
            if (error) {
                console.error('REG-INSC => ', error);
                reject(error);
            } else {
                resolve();
            }
        })
    });
}

const STATUS = {
    Pendente:1,
    Aprovada:2,
    Negada:3,
    ConvitePendente:4
}

const ENTRADA = {
    Publica:1,
    Privada:2
}

// GET --------------------------------------------------------
function buscarUsuarioPorEmail(email, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM usuarios WHERE email = ?";
        db.get(query, [email], (error, found) => {
            if (error) {
                console.error('GET-USER-EMAIL => ', error);
                reject(error);
            } else {
                resolve(found);
            }
        });
    });
}

function buscarUsuarioPorTelefone(telefone, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM usuarios WHERE telefone = ?";
        db.get(query, [telefone], (error, found) => {
            if (error) {
                console.error('GET-USER-TEL => ', error);
                reject(error);
            } else {
                resolve(found);
            }
        });
    });
}

function buscarContatoPorId(contato_id, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM contatos WHERE contato_id = ?";
        db.get(query, [contato_id], (error, found) => {
            if (error) {
                console.error('GET-CTN-ID => ', error);
                reject(error);
            } else {
                resolve(found);
            }
        });
    });
}

function buscarContatosPorUsuario(usuario_id, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM contatos WHERE usuario_id = ? ORDER BY nome ASC";
        db.all(query, [usuario_id], (error, values) => {
            if (error) {
                console.error('GET-CTN => ', error);
                reject(error);
            } else {
                resolve(values);
            }
        });
    });
}

function buscarEventosPorUsuario(usuario_id, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM eventos WHERE usuario_id = ? ORDER BY nome ASC";
        db.all(query, [usuario_id], (error, values) => {
            if (error) {
                console.error('GET-CTN => ', error);
                reject(error);
            } else {
                resolve(values);
            }
        });
    });
}

function buscarEventosPub(usuario_id, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT e.*, u.nome AS username, u.email FROM eventos AS e 
            JOIN usuarios AS u ON e.usuario_id = u.usuario_id
            JOIN inscricoes AS i ON e.evento_id = i.evento_id
            WHERE e.usuario_id != ? AND e.entrada_id = ? AND NOT EXISTS (
                SELECT 1 FROM inscricoes WHERE inscricoes.evento_id = e.evento_id 
                AND inscricoes.usuario_id = ?
            )
            ORDER BY e.nome ASC
        `;
        db.all(query, [usuario_id, ENTRADA.Publica, usuario_id], (error, values) => {
            if (error) {
                console.error('GET-PUB-EVNTS => ', error);
                reject(error);
            } else {
                resolve(values);
            }
        });
    });
}


function obterStatus(db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM status;";
        db.all(query, [], (error, values) => {
            if (error) {
                console.error('GET-STS => ', error);
                reject(error);
            } else {
                resolve(values);
            }
        });
    });
}

function obterEntradas(db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM entradas;";
        db.all(query, [], (error, values) => {
            if (error) {
                console.error('GET-ENT => ', error);
                reject(error);
            } else {
                resolve(values);
            }
        });
    });
}

function obterInscricoesDeUsuario(usuario_id, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT i.status_id as i_status, 
                    i.usuario_id as i_usuario,
                    i.inscricao_id, 
                    e.usuario_id as admin_id, 
                    e.nome as e_nome, 
                    e.data_inicio as e_data_inicio, 
                    e.data_fim as e_data_fim, 
                    e.link as e_link, 
                    u.nome AS admin_nome 
            FROM inscricoes AS i 
                JOIN eventos AS e ON i.evento_id = e.evento_id
                JOIN usuarios AS u ON admin_id = u.usuario_id
            WHERE i.usuario_id = ?;
        `;
        db.all(query, [usuario_id], (error, values) => {
            if (error) {
                console.error('GET-INSC-USER => ', error);
                reject(error);
            } else {
                resolve(values);
            }
        });
    });
}

function obterInscricaoDeUsuarioEmEvento(usuario_id, evento_id, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM inscricoes WHERE usuario_id = ? AND evento_id = ?;";
        db.get(query, [usuario_id, evento_id], (error, values) => {
            if (error) {
                console.error('GET-INSC-USER-EV => ', error);
                reject(error);
            } else {
                resolve(values);
            }
        });
    });
}

function obterInscricoesEmEvento(evento_id, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "SELECT i.* , u.*, s.nome AS status FROM inscricoes AS i JOIN usuarios AS u ON i.usuario_id = u.usuario_id JOIN status AS s ON i.status_id = s.status_id WHERE i.evento_id = ?;";
        db.all(query, [evento_id], (error, values) => {
            if (error) {
                console.log("GET-INSC-IN-EV => ", error);
                reject(error)
            } else {
                resolve(values);
            }
        });
    });
}

//DELETE ------------------------------------------------------
function excluirContatoPorId(contato_id, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM contatos WHERE contato_id = ?";
        db.run(query, [contato_id], (error, values) => {
            if (error) {
                console.error('DEL-CTN => ', error);
                reject(error);
            } else {
                resolve(values);
            }
        });
    });
}
function excluirEventoPorId(evento_id, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM eventos WHERE evento_id = ?";
        db.run(query, [evento_id], (error, values) => {
            if (error) {
                console.error('DEL-CTN => ', error);
                reject(error);
            } else {
                resolve(values);
            }
        });
    });
}

function excluirInscricoesDoEvento(evento_id, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM inscricoes WHERE evento_id = ?";
        db.run(query, [evento_id], (error, values) => {
            if (error) {
                console.error('DEL-CTN => ', error);
                reject(error);
            } else {
                resolve(values);
            }
        });
    });
}

function excluirInscricao(inscricao_id, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM inscricoes WHERE inscricao_id = ?";
        db.run(query, [inscricao_id], (error, values) => {
            if (error) {
                console.error('DEL-ISNC => ', error);
                reject(error);
            } else {
                resolve(values);
            }
        });
    });
}

//UPDATE ------------------------------------------------------
function atualizarContatoPorId(contato_id, nome, email, telefone, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "UPDATE contatos SET nome = ?, email = ?, telefone = ? WHERE contato_id = ?";
        db.run(query, [nome, email, telefone, contato_id], (error, values) => {
            if (error) {
                console.error('ATL-CTN => ', error);
                reject(error);
            } else {
                resolve(values);
            }
        });
    });
}
function atualizarStatusInscricao(status_id, inscricao_id, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "UPDATE inscricoes SET status_id = ? WHERE inscricao_id = ?";
        db.run(query, [status_id, inscricao_id], (error) => {
            if (error) {
                console.error('ATL-STS-INSC => ', error);
                reject(error);
            } else {
                resolve();
            }
        });
    });
}
function atualizarEvento(evento_id, nome, entrada_id, data_inicio, data_fim, link, db = DB_DEFAULT) {
    return new Promise((resolve, reject) => {
        const query = "UPDATE eventos SET nome = ?, entrada_id = ?, data_inicio = ?, data_fim = ?, link = ? WHERE evento_id = ?";
        db.run(query, [nome, entrada_id, data_inicio, data_fim, link, evento_id], (error) => {
            if (error) {
                console.error('ATL-EVNT => ', error);
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

// EXPORT -----------------------------------------------------
module.exports = {
    STATUS,
    ENTRADA,
    openDB,
    closeDB,
    registrarUsuario,
    registrarContato,
    registrarEvento,
    registrarInscricao,
    buscarUsuarioPorEmail,
    buscarUsuarioPorTelefone,
    buscarContatosPorUsuario,
    buscarContatoPorId,
    buscarEventosPorUsuario,
    buscarEventosPub,
    obterStatus,
    obterEntradas,
    obterInscricoesDeUsuario,
    obterInscricaoDeUsuarioEmEvento,
    obterInscricoesEmEvento,
    excluirContatoPorId,
    excluirEventoPorId,
    excluirInscricoesDoEvento,
    excluirInscricao,
    atualizarContatoPorId,
    atualizarStatusInscricao,
    atualizarEvento
}