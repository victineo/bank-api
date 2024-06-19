const mongoose = require('mongoose'); // Run 'npm install mongoose' on project directory terminal
const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        minLength: 3,
        trim: true
    },
    cpf: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'O CPF deve estar no formato 999.999.999-99'],
        trim: true
    },
    telefone: {
        type: String,
        required: true,
        match: [/^\(\d{2}\) \d{5}-\d{4}$/, 'O telefone deve estar no formato (99) 99999-9999'],
        trim: true
    },
    idade: {
        type: Number,
        min: 0,
        default: 0
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    senha: {
        type: String,
        required: true,
        minLength: 8
    },
    salt: {
        type: String,
        required: true
    },
    saldo: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Usuario', userSchema);