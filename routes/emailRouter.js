const express = require("express");
const router = express.Router();
const controller = require('../controllers/emailController');
const llm = require('../services/llm');
const multer = require('multer');
const upload = multer();
require('dotenv').config();


if (process.env.NODE_ENV !== 'production') {
    // --DEVELOPMENT MODEL (Local Ollama)--
    router.post('/', llm.generateEmailContent);
    router.post('/update', llm.updateEmailContent);    
} else {
    // --PRODUCTION MODEL (OpenAI)--
    router.post('/', llm.generateEmailContent_OpenAI);
    router.post('/update', llm.updateEmailContent_OpenAI);
}
router.post('/send-gmail', upload.array('attachments'), controller.sendEmailGmailApi); // Change to upload.array for multiple extensions later
router.post('/send-third-party', controller.sendEmailResendAPI);

module.exports = router;