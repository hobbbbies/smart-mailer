const axios = require('axios');

async function generateEmailContent(req, res) {
  const { descriptionPrompt, senderName, receiverName, subject, sender, receiver } = req.body
  const prompt = `
    Write a professional, polite email from ${senderName} to ${receiverName}.
    The message should: ${descriptionPrompt},
    Don't Include the subject

    Start the email with "Dear ${receiverName}," and end with "Best regards, ${senderName}".
    `;

  try {
    var response = await axios.post('http://localhost:11434/api/generate', {
        model: 'gemma:2b',
        prompt,
        stream: false
    });
  } catch(error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Model request failed:' });
  }

  req.generatedEmail = response.data.response.trim();
  res.json({ success: true, email: {sender, receiver, subject, body: req.generatedEmail} });
}

async function updateEmailContent(req, res) {
    const { descriptionPrompt, currentBody, previousPrompt } = req.body;

    const prompt = `
    Generate an updated, new professional, polite email, based off this prompt: ${descriptionPrompt}
    This is the original email that you should update:
    ${currentBody}

    -And this is the prompt that the user used for that email: ${previousPrompt}
    `
    try {
        var response = await axios.post('http://localhost:11434/api/generate', {
            model: 'gemma:2b',
            prompt,
            stream: false
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Model request failed:' });
    } 

    const generatedEmail = response.data.response.trim();
    res.json({ success: true, body: generatedEmail});
}
module.exports = { generateEmailContent, updateEmailContent };