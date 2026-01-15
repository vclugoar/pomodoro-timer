# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
python3 main.py      # Run the main script
pip install -r requirements.txt  # Install dependencies
open index.html      # Open chatbot landing page in browser
```

## Architecture

**Matrix Terminal Chatbot** (`index.html`, `styles.css`, `script.js`)
- Vanilla HTML/CSS/JS frontend for n8n chatbot
- Configure webhook URL in `script.js` at `N8N_WEBHOOK_URL`
- Sends POST requests with `{ message, timestamp }` to n8n webhook
- Expects response with `response`, `message`, or `output` field
