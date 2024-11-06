CREATE TABLE IF NOT EXISTS usuarios (
    usuario_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    senha TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contatos (
    contato_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id)
);

CREATE TABLE IF NOT EXISTS eventos (
    evento_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    nome TEXT UNIQUE NOT NULL,
    entrada_id INTEGER NOT NULL, /* 0:PUBLIC, 1:PRIVATE */
    data_inicio TEXT NOT NULL,
    data_fim TEXT NOT NULL,
    link TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id),
    FOREIGN KEY (entrada_id) REFERENCES entradas(entrada_id)
);

CREATE TABLE IF NOT EXISTS inscricoes (
    inscricao_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    evento_id INTEGER NOT NULL,
    status_id INTEGER NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id),
    FOREIGN KEY (evento_id) REFERENCES eventos(evento_id),
    FOREIGN KEY (status_id) REFERENCES status(status_id)
);

CREATE TABLE IF NOT EXISTS status (
    status_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entradas (
    entrada_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL
);