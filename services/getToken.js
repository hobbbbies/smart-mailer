const jwt = require('jsonwebtoken');

const getToken = (req, res) => {
    try {
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== undefined) {
            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
            const id_token = jwt.decode(bearerToken);
            res.status(200).json({success: true, message: 'Login successful.', id_token: id_token});
        } else {
            res.status(403).json({ message: 'Error in getting JWT token' });
        }
    } catch(error) {
        res.status(400).json({ message: 'header missing' });
        return res.redirect('/login')
    }
}

module.exports = getToken;