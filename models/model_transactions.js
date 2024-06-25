const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        required: true,
        enum: ['deposito', 'saque', 'pix']
    },
    valor: {
        type: Number,
        required: true,
        min: 0
    },
    descricao: {
        type: String,
        maxLength: 60
    },
    data: {
        type: Date,
        default: Date.now
    },
    nomeRemetente: {
        type: String,
        required: function() { return this.tipo == 'pix'; } // This field is only required on 'pix' transactions
    },
    emailDestinatario: {
        type: String,
        required: function() { return this.tipo == 'pix'; } // This field is only required on 'pix' transactions
    },
    nomeDestinatario: {
        type: String,
        required: function() { return this.tipo == 'pix'; } // This field is only required on 'pix' transactions
    }
});

module.exports = mongoose.model('Transacao', transactionSchema);