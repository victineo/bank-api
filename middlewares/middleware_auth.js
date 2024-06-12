const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).send({ msg: "Token não encontrado"}); // If there is no token, return 'Unauthorized'

    jwt.verify(token, process.env.SEGREDO, (err, user) => {
        if (err) return res.status(403).send({ msg: "Token inválido"}); // If the token is invalid, return 'Forbidden'
        req.user = user;
        next(); // Pass to the next middleware or route
    });
}

module.exports = { autenticarToken };