const crypto = require('crypto'); // Run 'npm install crypto' on project directory terminal
const jwt = require('jsonwebtoken'); // Run 'npm install jsonwebtoken' on project directory terminal
const Usuario = require('../models/model_users'); // Make sure the path goes to the right file

function cifrarSenha(senha, salt) {
    const hash = crypto.createHmac('sha256', salt);
    hash.update(senha);
    return hash.digest('hex');
}

async function criar(req, res) {
    const salt = crypto.randomBytes(16).toString('hex');
    const senhaCifrada = cifrarSenha(req.body.senha, salt);
    const novoUsuario = {email: req.body.email, senha: senhaCifrada, salt: salt, saldo: 0};
    await Usuario.create(novoUsuario);
    res.status(201).json(novoUsuario);
}
/*
Include a JSON body with email and password on this requisition
*/

async function entrar(req, res) {
    const usuario = await Usuario.findOne({email: req.body.email});
    if (usuario) {
        const senhaCifrada = cifrarSenha(req.body.senha, usuario.salt);
        if (senhaCifrada === usuario.senha) {
            res.json({ token: jwt.sign({ email: usuario.email }, process.env.SEGREDO, { expiresIn: '10m' }) });
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

module.exports = { criar, entrar, renovar, deletar, verSaldo, depositar, sacar };