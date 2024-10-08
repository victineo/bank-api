var express = require('express'); // Run 'npm install express' on project directory terminal
const controller = require('../controllers/controller_users'); // Make sure the path goes to the right file
const { autenticarToken } = require('../middlewares/middleware_auth');
var router = express.Router();

router.post('/criar', controller.criar);
router.post('/login', controller.entrar);
router.post('/renovar', controller.renovar);
router.post('/atualizar', autenticarToken, controller.atualizar);
router.delete('/deletar/:id', autenticarToken, controller.deletar);
router.get('/saldo/ver', autenticarToken, controller.verSaldo);
router.post('/saldo/depositar', autenticarToken, controller.depositar);
router.post('/saldo/sacar', autenticarToken, controller.sacar);
router.get('/transacoes', autenticarToken, controller.verTransacoes);
router.post('/pix', autenticarToken, controller.realizarPix);

module.exports = router;