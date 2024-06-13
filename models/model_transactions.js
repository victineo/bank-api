const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        required: true,
        enum: ['deposito', 'saque']
        
    },
    valor: {
        type: Number,
        required: true
    },
    data: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transacao', transactionSchema);