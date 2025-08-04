const express = require("express");
const router = express.Router();
const controller = require('../controllers/emailController');
const llm = require('../services/llm');
const multer = require('multer');
const upload = multer();

router.post('/', llm.generateEmailContent);
router.post('/update', llm.updateEmailContent);
router.post('/send-gmail', upload.array('attachment'), controller.sendEmailGmailApi); // Change to upload.array for multiple extensions later
router.post('/send-thirdParty', controller.sendEmailResendAPI);

module.exports = router;