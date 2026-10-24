# CyberTutor AI 🛡️

CyberTutor AI is an intelligent, beginner-friendly cybersecurity, digital literacy, and computer troubleshooting assistant. It is powered by **Gemma 4** through the Google AI Studio Gemini API, with a local fallback using **Ollama**.

---

## 🌟 What It Does

1. **Defensive Cybersecurity & Scam Analysis**
   - Helps you spot phishing emails, fake text messages (SMS), fake job offers, and crypto investment scams.
   - Explains how scams work without asking for your passwords, OTP codes, or personal details.
2. **Interactive Tutor Chat**
   - Teaches networking, IP addresses, DNS, Linux/Windows security, coding, and hardware in plain English.
   - Adapts to your level (Beginner, Intermediate, Advanced).
3. **TRACE Mode for Pasted Code & Errors**
   - Automatically breaks down errors or technical projects into 5 clear stages:
     - **T — Target:** The goal to achieve.
     - **R — Review:** Prerequisites, inputs, and security risks.
     - **A — Architect:** Step-by-step roadmap.
     - **C — Carry Out:** Copy-ready commands and code.
     - **E — Evaluate:** How to test and verify the fix.
4. **Hardware & System Doctor**
   - Troubleshoots overheating, crashing (BSOD), black screens, and internet issues.
   - Always gives safe, non-destructive checks first and warns before risky commands.
5. **Gemma 4 Fine-Tuning Studio**
   - Demonstrates how open-weight AI models are trained using Supervised Fine-Tuning (SFT) and LoRA.
   - Exports clean `train.jsonl` dataset files ready for training.

---

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Open `.env` and set your key and provider:
```bash
# GEMINI_API_KEY: In Google AI Studio, this is automatically injected from your Secrets.
GEMINI_API_KEY="your-gemini-api-key-here"

# PROVIDER: 'api' (Gemini API with Gemma 4) or 'local' (Ollama)
PROVIDER="api"
```

---

## 💻 Running the App

### Option A: Run with Google AI Studio / Gemini API (Gemma 4)
This is the default cloud mode. It uses model `gemma-4-31b-it`.

```bash
# Start the web app on http://localhost:3000
npm run dev
```

### Option B: Run Locally with Ollama
If you want to run completely offline on your own computer:

1. Install and run Ollama:
   ```bash
   ollama serve
   ```
2. Pull the Gemma 4 model:
   ```bash
   ollama pull gemma4:e2b
   ```
3. Run the app with `PROVIDER=local`:
   ```bash
   PROVIDER=local npm run dev
   ```
*(You can also switch between API and Ollama anytime inside the app by clicking the status pill in the top-right corner!)*

---

## 🧪 Running the Smoke Test

We include an automated smoke test script that sends a realistic cybersecurity prompt through your active provider and verifies the response:

```bash
# Test the active provider
npm run smoke-test

# Or explicitly test Gemini API
PROVIDER=api npm run smoke-test

# Or explicitly test local Ollama
PROVIDER=local npm run smoke-test
```

### What You Will See on PASS:
```
====================================================
       🛡️  CYBERTUTOR AI - SMOKE TEST SUITE          
====================================================

[Config] Active Provider : API
[Config] API Model       : gemma-4-31b-it
[Config] API Key Status  : Present (configured)

[Test 1/1] Dispatching realistic cybersecurity inquiry...
----------------------------------------------------
Sample Prompt: "Explain how two-factor authentication (2FA) protects an account in 2 short bullet points, and mention one red flag of OTP fraud."
----------------------------------------------------
Latency       : 840ms
Used Model    : gemma-4-31b-it

[Response Received]:
• 2FA adds a second verification layer...
• An unsolicited text asking for your OTP is a red flag...
----------------------------------------------------

>> RESULT: PASS

All safety checks and teaching pipeline tests passed successfully.
```

---

## 🔒 Security Best Practices

- **Server-Side API Key:** The `GEMINI_API_KEY` stays on the server side and is never bundled into client browser code.
- **Zero-Knowledge Scam Defense:** The tutor analyzes scam text patterns without asking for passwords, bank accounts, or real OTPs.
- **Git Protection:** `.gitignore` excludes `.env` to prevent accidental credential commits.
