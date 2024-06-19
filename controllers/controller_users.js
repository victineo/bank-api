const crypto = require('crypto'); // Run 'npm install crypto' on project directory terminal
const jwt = require('jsonwebtoken'); // Run 'npm install jsonwebtoken' on project directory terminal
const Usuario = require('../models/model_users'); // Make sure the path goes to the right file
const Transacao = require('../models/model_transactions'); // Make sure the path goes to the right file

function cifrarSenha(senha, salt) {
    const hash = crypto.createHmac('sha256', salt);
    hash.update(senha);
    return hash.digest('hex');
}

function formatarCpf(cpf) {
    return cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarTelefone(telefone) {
    return telefone.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

function validarSenha(senha) {
    const mensagens = {
        maiuscula: 'Ao menos 1 letra maiúscula',
        minuscula: 'Ao menos 1 letra minúscula',
        numero: 'Ao menos 1 número',
        especial: 'Ao menos 1 caractere especial',
        tamanho: 'Ao menos 8 caracteres'
    };

    const resultados = {
        maiuscula: /[A-Z]/.test(senha),
        minuscula: /[a-z]/.test(senha),
        numero: /\d/.test(senha),
        especial: /[@$!%*?&_\-#^(){}[\]:;'"<>,.~|]/.test(senha),
        tamanho: senha.length >= 8
    };

    let statusMensagens = [];

    for (const [key, mensagem] of Object.entries(mensagens)) {
        if (resultados[key]) {
            statusMensagens.push(`[ ✓ ] ${mensagem}`);
        } else {
            statusMensagens.push(`[ X ] ${mensagem}`);
        }
    }

    return statusMensagens;
}

async function criar(req, res) {
    try {
        const { nome, cpf, telefone, idade, email, senha } = req.body;

        if (!nome) {
            return res.status(400).json({ msg: 'Nome é obrigatório' });
        } else if (nome.length < 3) {
            return res.status(400).json({ msg: 'O nome deve ter ao menos 3 caracteres' })
        } else if (!cpf) {
            return res.status(400).json({ msg: 'CPF é obrigatório' });
        } else if (cpf.toString().length != 11) {
            return res.status(400).json({ msg: 'CPF inválido' });
        } else if (!telefone) {
            return res.status(400).json({ msg: 'Telefone é obrigatório' });
        } else if (telefone.toString().length != 11) {
            return res.status(400).json({ msg: 'O telefone deve ter 11 dígitos, incluindo DDD' })
        } else if (!email) {
            return res.status(400).json({ msg: 'E-mail é obrigatório' });
        } else if (!senha) {
            return res.status(400).json({ msg: 'Senha é obrigatória' });
        }

        const emailExistente = await Usuario.findOne({ email });
        if (emailExistente) {
            return res.status(400).json({ msg: 'Este e-mail já está em uso' });
        }

        const cpfFormatado = formatarCpf(cpf.toString());
        const cpfExistente = await Usuario.findOne({ cpf: cpfFormatado });
        if (cpfExistente) {
            return res.status(400).json({ msg: 'Este CPF já está em uso' });
        }

        const validacaoSenha = validarSenha(senha);
        const senhaValida = validacaoSenha.every(mensagem => mensagem.startsWith('[ ✓ ]'));

        if (!senhaValida) {
            return res.status(400).json({ msg: 'A senha não atende aos requisitos:', detalhes: validacaoSenha });
        }

        const telefoneFormatado = formatarTelefone(telefone.toString());

        const salt = crypto.randomBytes(16).toString('hex');
        const senhaCifrada = cifrarSenha(senha, salt);

        const novoUsuario = {
            nome,
            cpf: cpfFormatado,
            telefone: telefoneFormatado,
            idade,
            email,
            senha: senhaCifrada,
            salt,
            saldo: 0
        };

        await Usuario.create(novoUsuario);
        res.status(201).json({ msg: 'Usuário criado com sucesso!', usuario: novoUsuario });
    } catch (error) {
        res.status(400).json({ msg: `Erro ao criar usuário: ${error.message}` });
    }
}
/*
Inclua um JSON com AO MENOS 'nome', 'cpf', 'email' e 'senha' que atenda aos requisitos
Os campos 'telefone' e 'idade' são opcionais
*/

async function entrar(req, res) {
    const usuario = await Usuario.findOne({ email: req.body.email });
    if (usuario) {
        const senhaCifrada = cifrarSenha(req.body.senha, usuario.salt);
        if (senhaCifrada === usuario.senha) {
            res.json({ token: jwt.sign({ _id: usuario._id, email: usuario.email }, process.env.SEGREDO, { expiresIn: '10m' }) });
        } else {
            res.status(401).json({ msg: 'Acesso negado' });
        }
    } else {
        res.status(400).json({ msg: 'Credenciais inválidas' });
    }
}
/*
Include a JSON body with email and password on this requisition
*/

function renovar(req, res) {
    const token = req.headers['authorization'];
    if (token) {
        try {
            const payload = jwt.verify(token, process.env.SEGREDO);
            res.json({token: jwt.sign({ email: payload.email }, process.env.SEGREDO)});
        } catch(err) {
            res.status(401).json({ msg: 'Token inválido' });
        }
    } else {
        res.status(400).json({ msg: 'Token não encontrado' });
    }
}
/*
Include a 'Authorization' HTTP Header on this requisition. Its value should be ONLY the token
It's not necessary to include a JSON body on this requisition
*/

async function atualizar(req, res) { // NÃO ESTÁ FUNCIONANDO
    try {
        const userId = req.user._id;
        const usuario = await Usuario.findById(userId);

        if (!usuario) {
            res.status(404).json({ msg: 'Usuário não encontrado' });
        }

        const { nome, cpf, telefone, idade, email, senha } = req.body;
        const updates = {};

        if (nome) {
            if (nome.length < 3) {
                return res.status(400).json({ msg: 'O nome deve ter ao menos 3 caracteres'});
            }
            updates.nome = nome;
        }

        if (cpf) {
            if (cpf.toString().length !== 11) {
                return res.status(400).json({ msg: 'CPF inválido' });
            }
            const cpfFormatado = formatarCpf(cpf.toString());
            const cpfExistente = await Usuario.findOne({ cpf: cpfFormatado });
            if (cpfExistente && cpfExistente._id.toString() !== userId.toString()) {
                return res.status(400).json({ msg: 'Este CPF já está em uso' });
            }
            updates.cpf = cpfFormatado;
        }

        if (telefone) {
            if (telefone.toString().length !== 11) {
                return res.status(400).json({ msg: 'O telefone deve ter 11 dígitos, incluindo DDD' });
            }
            updates.telefone = formatarTelefone(telefone.toString());
        }

        if (idade) {
            if (idade < 0) {
                return res.status(400).json({ msg: 'Idade inválida' });
            }
            updates.idade = idade;
        }

        if (email) {
            const emailExistente = await Usuario.findOne({ email });
            if (emailExistente && emailExistente._id.toString() !== userId.toString()) {
                return res.status(400).json({ msg: 'Este e-mail já está em uso' });
            }
            updates.email = email;
        }

        if (senha) {
            const validacaoSenha = validarSenha(senha);
            const senhaValida = validacaoSenha.every(mensagem => mensagem.startsWith('[✓]'));

            if (!senhaValida) {
                return res.status(400).json({ msg: 'A senha não atende aos requisitos:', detalhes: validacaoSenha });
            }

            const salt = crypto.randomBytes(16).toString('hex');
            updates.senha = cifrarSenha(senha, salt);
            updates.salt = salt;
        }

        const usuarioAtualizado = await Usuario.findByIdAndUpdate(userId, updates, { new: true });
        res.status(200).json({ msg: 'Informações atualizadas com sucesso!', usuario: usuarioAtualizado });
    } catch (error) {
        res.status(400).json({ msg: `Erro ao atualizar usuário: ${error.message}` });
    }
}
/*
Inclua um JSON com um ou mais campos a serem alterados
Também inclua um Header HTTP 'Authorization' nessa requisição. Seu valor deve ser `Bearer: <token>`
*/

async function deletar(req, res) {
    try {
        const usuario = await Usuario.findByIdAndDelete(req.params.id);
        if (usuario) {
            res.json({ msg: 'Usuário deletado com sucesso' });
        } else {
            res.status(404).json({ msg: 'Usuário não encontrado' });
        }
    } catch (err) {
        res.status(500).json({ msg: 'Erro ao deletar usuário', error: err.message });
    }
}
/*
Include a user's ID on the URL for this requisition
The URL should look like `http://localhost:3000/users/deletar/<id>`
It's not necessary to include any new Header or JSON body on this requisition
*/

async function verSaldo(req, res) {
    try {
        const usuario = await Usuario.findOne({ email: req.user.email }); // Email is already on token
        if (usuario) {
            res.json({ msg: `Saldo: R$${usuario.saldo}` });
        } else {
            res.status(404).json({ msg: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao buscar saldo', error });
    }
}
/*
Include a 'Authorization' HTTP Header on this requisition. Its value should be `Bearer: <token>`
It's not necessary to include a JSON body on this requisition
*/

async function depositar(req, res) {
    const { valor } = req.body;
    if (typeof valor !== 'number' || valor <= 0) {
        return res.status(400).json({ msg: 'Valor inválido para depósito' });
    }
    try {
        const usuario = await Usuario.findOneAndUpdate(
            { email: req.user.email },
            { $inc: { saldo: valor } },
            { new: true }
        );
        if (usuario) {
            await Transacao.create({ email: req.user.email, tipo: 'deposito', valor }); // Registering transaction
            res.json({ msg: `Depósito realizado com sucesso. Novo saldo: R$${usuario.saldo}` });
        } else {
            res.status(404).json({ msg: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao realizar depósito', error });
    }
}
/*
Include a JSON body with email and value on this requisition
Also include a 'Authorization' HTTP Header on this requisition. Its value should be `Bearer: <token>`
*/

async function sacar(req, res) {
    const { valor } = req.body;
    if (typeof valor !== 'number' || valor <= 0) {
        return res.status(400).json({ msg: 'Valor inválido para saque' });
    }
    try {
        const usuario = await Usuario.findOne({ email: req.body.email });
        if (usuario) {
            if (usuario.saldo >= valor) {
                usuario.saldo -= valor;
                await usuario.save();
                await Transacao.create({ email: req.user.email, tipo: 'saque', valor}); // Registering transaction
                res.json({ msg: `Saque realizado com sucesso. Novo saldo: R$${usuario.saldo}` });
            } else {
                res.status(400).json({ msg: 'Saldo insuficiente' });
            }
        } else {
            res.status(404).json({ msg: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao realizar saque', error });
    }
}
/*
Include a JSON body with email and value on this requisition
Also include a 'Authorization' HTTP Header on this requisition. Its value should be `Bearer: <token>`
*/

async function verTransacoes(req, res) {
    try {
        const usuario = await Usuario.findOne({ email: req.user.email });
        if (usuario) {
            const transacoes = await Transacao.find({ email: req.user.email });
            res.json(transacoes);
        } else {
            res.status(404).json({ msg: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao buscar transações', error });
    }
}
/*
Include a 'Authorization' HTTP Header on this requisition. Its value should be `Bearer: <token>`
It's not necessary to include a JSON body on this requisition
*/

async function realizarPix(req, res) {
    const { valor, destinatarioEmail } = req.body;

    if (typeof valor !== 'number' || valor <= 0) {
        return res.status(400).json({ msg: 'Valor inválido para Pix' });
    }

    try {
        const remetente = await Usuario.findOne({ email: req.user.email });
        const destinatario = await Usuario.findOne({ email: destinatarioEmail });

        if (!destinatario) {
            return res.status(404).json({ msg: 'Destinatário não encontrado' });
        }

        if (remetente.saldo < valor) {
            return res.status(400).json({ msg: 'Saldo insuficiente' });
        }

        remetente.saldo -= valor;
        destinatario.saldo += valor;

        await remetente.save();
        await destinatario.save();

        const transacao = new Transacao({
            tipo: 'pix',
            valor: valor,
            from: remetente.email,
            to: destinatario.email
        });

        await transacao.save();

        res.json({ msg: 'Pix realizado com sucesso' });
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao realizar Pix', error });
    }
}

module.exports = { criar, entrar, renovar, atualizar, deletar, verSaldo, depositar, sacar, verTransacoes, realizarPix };