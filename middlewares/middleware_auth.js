const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).send({ msg: "Token não encontrado"}); // Unauthorized

    jwt.verify(token, process.env.SEGREDO, (err, user) => {
        if (err) return res.status(403).send({ msg: "Token inválido"}); // Forbidden

        req.user = { _id: user._id, email: user.email };
        next(); // Pass to the next middleware or route
    });
}

module.exports = { autenticarToken };