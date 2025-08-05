const axios = require('axios');

/*
 ------------------------
 Local model (development)
 ------------------------
 */
async function generateEmailContent(req, res) {
  const { descriptionPrompt, senderName, receiverName, subject, sender, receiver, tone } = req.body
  const prompt = `
You are an expert email assistant.

Task: Write a ${tone || 'professional, polite'} email from ${senderName} to ${receiverName}.

Email subject (for context): "${subject}"

User's request:
"${descriptionPrompt}"

Instructions:
- Write the email body only - do NOT include the subject line.
- Start the email with "Dear ${receiverName}," and end with "Best regards, ${senderName}".
- Keep the tone ${tone || 'professional and polite'}.
- Focus on fulfilling the user's specific request while maintaining clarity and appropriate formatting.
- Use the subject as additional context to understand the topic and purpose of the email.
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

/* 
-------------------------
 OPEN AI API (Production)
-------------------------
*/
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4.1-nano';

async function generateEmailContent_OpenAI(req, res) {
  const { descriptionPrompt, senderName, receiverName, subject, sender, receiver, tone } = req.body;
  const prompt = `
You are an expert email assistant.

Task: Write a ${tone || 'professional, polite'} email from ${senderName} to ${receiverName}.

Email subject (for context): "${subject}"

User's request:
"${descriptionPrompt}"

Instructions:
- Write the email body only - do NOT include the subject line.
- Start the email with "Dear ${receiverName}," and end with "Best regards, ${senderName}".
- Keep the tone ${tone || 'professional and polite'}.
- Focus on fulfilling the user's specific request while maintaining clarity and appropriate formatting.
- Use the subject as additional context to understand the topic and purpose of the email.
`;

  try {
    const response = await axios.post(
      OPENAI_URL,
      {
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const generatedEmail = response.data.choices[0].message.content.trim();
    res.json({
      success: true,
      email: { sender, receiver, subject, body: generatedEmail, senderName },
    });
  } catch (error) {
    console.error('OpenAI error:', error?.response?.data || error.message);
    res.status(500).json({ success: false, message: 'OpenAI request failed' });
  }
}

async function updateEmailContent_OpenAI(req, res) {
  const { descriptionPrompt, responseHistory, promptHistory } = req.body;

  const formattedHistory = Array.isArray(responseHistory)
    ? responseHistory.map((email, i) => `${i + 1}. ${email.body}`).join('\n')
    : responseHistory.body;

  const formattedPrompts = Array.isArray(promptHistory)
    ? promptHistory.map((prompt, i) => `${i + 1}. ${prompt}`).join('\n')
    : promptHistory;

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
`;

  try {
    const response = await axios.post(
      OPENAI_URL,
      {
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const updatedEmail = response.data.choices[0].message.content.trim();
    res.json({ success: true, body: updatedEmail });
  } catch (error) {
    console.error('OpenAI error:', error?.response?.data || error.message);
    res.status(500).json({ success: false, message: 'OpenAI update failed' });
  }
}

module.exports = { generateEmailContent, updateEmailContent, generateEmailContent_OpenAI, updateEmailContent_OpenAI };