const express = require("express");
const router = express.Router();
const controller = require('../controllers/emailController');
const llm = require('../services/llm');

router.post('/', llm.generateEmailContent);
router.post('/update', llm.updateEmailContent);
router.post('/send-gmail', controller.sendEmailGmailApi);
router.post('/send-thirdParty', controller.sendEmailResendAPI);

module.exports = router;