const express = require("express");
const router = express.Router();
const controller = require('../controllers/emailController');
const llm = require('../services/llm');
const multer = require('multer');
const upload = multer();

router.post('/', llm.generateEmailContent_OpenAI);
router.post('/update', llm.updateEmailContent_OpenAI);
router.post('/send-gmail', upload.array('attachments'), controller.sendEmailGmailApi); // Change to upload.array for multiple extensions later
router.post('/send-thirdParty', controller.sendEmailResendAPI);

module.exports = router;