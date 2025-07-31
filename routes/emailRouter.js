const express = require("express");
const router = express.Router();
const controller = require('../controllers/emailController');
const llm = require('../services/llm');

router.post('/', llm.generateEmailContent, controller.sendEmail);
router.post('/test', llm.generateEmailContent, (req, res) => {
    console.log(req.generatedEmail);
    res.status(200);
})

module.exports = router;