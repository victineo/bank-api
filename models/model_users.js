const mongoose = require('mongoose'); // Run 'npm install mongoose' on project directory terminal
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    senha: {
        type: String,
        required: true
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