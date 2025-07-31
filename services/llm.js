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
  res.json({ success: true, email: {sender, receiver, subject, body: req.generatedEmail, senderName} });
}

async function updateEmailContent(req, res) {
    const { descriptionPrompt, responseHistory, previousPrompt } = req.body;
    const formattedHistory = Array.isArray(responseHistory)
        ? responseHistory.map((email, i) => `${i + 1}. ${email.body}`).join('\n')
        : responseHistory.body;

    console.log("response history: ", responseHistory);
    console.log(formattedHistory);

    const prompt = `
    Generate an updated, professional, polite email, based off this prompt: ${descriptionPrompt}
    Below is a list of all the emails you've generated so far (Highest number is the most recent).
    ${formattedHistory}

    And this is the prompt that the user used for the last email: ${previousPrompt}. 
    Don't include the subject
    Try to maintain the original idea / message of the previous email as much as possible, only changing what the prompt is asking you to change.
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