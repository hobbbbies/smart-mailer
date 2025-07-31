const axios = require('axios');

async function generateEmailContent(req, res, next) {
  const { sender, receiver, subject, descriptionPrompt } = req.body
  const prompt = `
    Write a professional, polite email from ${sender} to ${receiver}.
    The message should: ${descriptionPrompt},
    Don't Include the subject


    Start the email with "Dear ${receiver}," and end with "Best regards, ${sender}".
    `;

  const response = await axios.post('http://localhost:11434/api/generate', {
    model: 'gemma:2b',
    prompt,
    stream: false
  });

  req.generatedEmail = response.data.response.trim();
  next();
}
module.exports = { generateEmailContent };