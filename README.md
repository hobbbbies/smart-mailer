# *Smart Mailer*

**Smart Mailer** is an AI-powered email composer designed to simplify professional email writing for everyone. Whether you're using your personal Gmail account or (soon) a third-party SMTP provider, Smart Mailer helps you craft clear, effective email templates in seconds.  
Simply describe what you want to say, and the AI will generate a high-quality draft that you can edit—or refine further with follow-up prompts for a more tailored message.  
Smart Mailer also supports attachments for almost any file type, making it easy to send complete, professional emails without hassle.

🔗 **Live demo:** [Smart Mailer App](https://smart-mailer-fe-production.up.railway.app/)

---

## 🎥 Demo

### See It in Action

![Demo video](./public/email-sender-demo.gif)

### Example Output

Here's what the final email looks like:

![Email result](./public/email-result.png)

---
# *How it's Made*

## 🛠️ Tech Stack

- **Frontend:** React  
- **Backend:** Node.js, Express  
- Full-stack architecture with separate client and server repositories.

## Backend Overview
The backend mainly handles 3 responsibilities:
### 1. Authorization

Secure Gmail integration using **OAuth 2.0**:

- Users sign in with Google OAuth to grant email-sending permissions.
- A **refresh token** is securely stored to keep users signed in between sessions.
- The backend handles token refreshes and session security.

---

### 2. Text Generation

- Uses Open AI API to create responses
- Generates full email drafts from simple prompts.
- Supports **follow-up prompts** for iterative editing.
- Uses **Chat history**so that the model knows everything relevent to the prompt

---

### 3. Email Sending Logic

- Composes emails with subject, body, recipients, and attachments.
- Supports **attachments of almost any file type**.
- Sends email via the **Gmail API**.  
- *(Coming soon)*: Support for third-party SMTP providers like **Mailgun** and **Resend**.

---

## 🖥️ Frontend Overview

### 1. Main Page

- Utilizes React Library/Framework for responsive, pleasent UI
- User is presented with inputs for email data, as well as an option for attachments
- On submission of the form, user is shown a popup screen that provides an overview of what is to be sent

### 2. Popup
- The popup form is a chance for the user to review what has been composed. It shows the sender/receiver address, the email body, and any attachments.
- User can either manually edit body, or send a **follow up** query prompt to the backend, outling what they would like to be changed.
- Once the user is happy, they can press the send button, and *voila*


# *Lessons learned*

Building Smart Mailer was not just a technical project—it was a learning experience that clarified some key habits and principles I’ll carry into future development work:

### 🧠 1. Plan Before You Build

At first, I underestimated how much planning even small features needed. I often dove in thinking I'd "figure it out as I go," but that usually led to rewriting logic or redoing UI components. Taking a few minutes to sketch out what needs to be done—what goes where, what data is needed—would’ve saved me a lot of time and frustration.

### 🔍 2. Research Before You Code

The OAuth integration taught me this the hard way. I started implementing it with only a surface-level understanding, and ran into issues with scopes, consent screens, and token persistence. If I had read through Google's documentation more thoroughly before coding, I would have avoided hours of trial-and-error. Since then, I’ve learned to research a tool or API *before* trying to integrate it.

### 💾 3. Commit Frequently

Early on, I lost a working version of my app after experimenting with a few new changes that broke things—and I had no clean commit to revert to. That moment made me realize the value of committing more often, even for minor changes. Frequent commits provide a safety net and make debugging much easier.

