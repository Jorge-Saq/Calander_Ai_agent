# 📅 AI Calendar Agent

A bridge between your Google Calendar and an AI chatbot/image uploader. This project uses a "Hand, Brain, Face" architecture to interpret natural language and images into calendar events.

## Architecture

1.  **The Hand (Google Apps Script)**: A Web App deployed on Google's servers that acts as the API listener. It executes the actual calendar changes (`createEvent`, `getEvents`, etc.).
2.  **The Brain (Node.js Backend)**: An Express server using OpenAI (GPT-4o) to process text and images into structured JSON commands for the Apps Script.
3.  **The Face (React Frontend)**: A sleek user interface for chatting and uploading schedule screenshots.

## Prerequisites

- Node.js installed.
- A Google Account (for Apps Script and Calendar).
- An OpenAI API Key.

## 🚀 Quick Start Guide

### Part 1: The "Hand" (Google Apps Script)

1.  Go to [script.google.com](https://script.google.com) and create a **New Project**.
2.  Copy the content of `google_apps_script/Code.gs` (found in this repo) and paste it into the editor.
3.  Click **Deploy** -> **New Deployment**.
4.  **Select type**: Web App.
5.  **Description**: "Calendar Agent API".
6.  **Execute as**: "Me" (your account).
7.  **Who has access**: "Anyone" (Crucial for the backend to access it without complex OAuth).
8.  Click **Deploy**.
9.  **Copy the Web App URL**. You will need this for the backend.

### Part 2: The "Brain" (Backend)

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file:
    ```env
    OPENAI_API_KEY=sk-...
    APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
    ```
4.  Start the server:
    ```bash
    node server.js
    ```

### Part 3: The "Face" (Frontend)

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open the URL shown (usually `http://localhost:5173`).

## Usage

1.  **Enter Calendar ID**: In the UI, enter your Google Calendar ID (usually your email address).
2.  **Select Timezone**: Choose your timezone from the dropdown. The app auto-detects your system timezone by default.
3.  **Chat**: Type "Schedule a meeting with Sam tomorrow at 2pm" and click Send.
4.  **Upload**: Take a screenshot of a schedule or flyer and upload it. The AI will extract events and add them to your calendar.

> **Note**: The AI will interpret all times relative to your selected timezone. For example, "2pm" will be understood as 2pm in your chosen timezone.

