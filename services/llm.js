const axios = require('axios');

async function generateEmailContent(req, res) {
  const { descriptionPrompt, senderName, receiverName, subject, sender, receiver, tone } = req.body
  const prompt = `
    Write a ${tone || 'professional, polite'} email from ${senderName} to ${receiverName}.
    The message should: ${descriptionPrompt}.
    Do not include the subject.

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
    const { descriptionPrompt, responseHistory, promptHistory } = req.body;
    const formattedHistory = Array.isArray(responseHistory)
        ? responseHistory.map((email, i) => `${i + 1}. ${email.body}`).join('\n')
        : responseHistory.body;

    const formattedPrompts = Array.isArray(promptHistory)
        ? promptHistory.map((prompt, i) => `${i + 1}. ${prompt}`).join('\n')
        : promptHistory;

    console.log("response history: ", responseHistory);
    console.log("prompt history: ", promptHistory);
    console.log("formatted email history: ", formattedHistory);
    console.log("formatted prompt history: ", formattedPrompts);

    const prompt = `
        You are an expert email assistant.

        Task: Update the most recent email based on the new prompt below, while keeping the original intent and style. Only change what the new prompt asks.

        --- Email History (most recent last) ---
        ${formattedHistory}
        ----------------------------------------

        --- User Prompt History (most recent last) ---
        ${formattedPrompts}
        ---------------------------------------------

        New user prompt for the update:
        "${descriptionPrompt}"

        Instructions:
        - Do NOT include the subject line.
        - Keep the email professional and polite.
        - Only change what the new prompt requests; keep the rest as similar as possible.
    `
    // - Start with "Dear [recipient]," and end with "Best regards, [sender]".

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