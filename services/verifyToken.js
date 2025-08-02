const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        jwt.verify(req.token, process.env.JWT_SECRET_KEY, ((err, authData) => {
            if(err) {
                res.status(403).json({ message: 'Error in verifying JWT token: ', err });
            } else {
                req.user = authData;
                next();
            }
        }));
    } catch(error) {
        console.error(error);
        res.status(400).json({ message: 'Token expired' });
        return res.redirect("/login")
    }

}

module.exports = verifyToken;