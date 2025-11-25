const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// AI Provider Configuration
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';
let openai, anthropic;

if (AI_PROVIDER === 'openai') {
  const OpenAI = require('openai');
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else if (AI_PROVIDER === 'anthropic') {
  const Anthropic = require('@anthropic-ai/sdk');
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

const getSystemPrompt = (timezone) => {
  const now = new Date();
  const exampleDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  exampleDate.setHours(14, 0, 0, 0);
  const exampleEndDate = new Date(exampleDate.getTime() + 60 * 60 * 1000);

  return `You are an advanced Calendar Assistant with full access to the Google Calendar API.
You must output ONLY valid JSON.

TIMEZONE INFORMATION:
- User's timezone: ${timezone}
- Current date/time: ${now.toLocaleString('en-US', { timeZone: timezone, dateStyle: 'full', timeStyle: 'long' })}
- All times should be interpreted in ${timezone}

AVAILABLE ACTIONS:
1. createEvent - Create a timed event with optional color, location, description, guests, reminders
2. createAllDayEvent - Create an all-day event (single or multi-day)
3. createEventSeries - Create RECURRING events (daily, weekly, monthly)
4. getEventsForDay - Retrieve events for a specific day

EVENT COLORS (use these exact strings):
- "PALE_BLUE", "PALE_GREEN", "MAUVE", "PALE_RED", "YELLOW", "ORANGE", "CYAN", "GRAY", "BLUE", "GREEN", "RED"

RECURRENCE TYPES:
- daily: Every day or every N days
- weekly: Every week on specific days (MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY)
- monthly: Every month

CRITICAL RULES:
1. Times: "2pm" = 14:00, "10am" = 10:00 (24-hour format)
2. ISO timestamps: YYYY-MM-DDTHH:mm:ss.sssZ (UTC)
3. Default duration: 1 hour if not specified
4. Recurring keywords: "every week", "weekly", "recurring", "every day", "daily"
5. Color keywords: "blue meeting", "red event", "make it green"

EXAMPLE 1: Simple Event
User: "Meeting tomorrow at 2pm"
{
  "actions": [{
    "action": "createEvent",
    "params": {
      "title": "Meeting",
      "startTime": "${exampleDate.toISOString()}",
      "endTime": "${exampleEndDate.toISOString()}",
      "description": ""
    }
  }]
}

EXAMPLE 2: Event with Color
User: "Blue team standup at 10am tomorrow"
{
  "actions": [{
    "action": "createEvent",
    "params": {
      "title": "Team standup",
      "startTime": "2025-11-25T15:00:00.000Z",
      "endTime": "2025-11-25T16:00:00.000Z",
      "color": "BLUE",
      "description": ""
    }
  }]
}

EXAMPLE 3: Recurring Event (Weekly)
User: "Math class every Monday and Wednesday at 2pm"
{
  "actions": [{
    "action": "createEventSeries",
    "params": {
      "title": "Math class",
      "startTime": "2025-11-25T19:00:00.000Z",
      "endTime": "2025-11-25T20:00:00.000Z",
      "recurrence": {
        "type": "weekly",
        "days": ["MONDAY", "WEDNESDAY"],
        "interval": 1
      },
      "description": ""
    }
  }]
}

EXAMPLE 4: Recurring Daily
User: "Gym every day at 6am for 30 days"
{
  "actions": [{
    "action": "createEventSeries",
    "params": {
      "title": "Gym",
      "startTime": "2025-11-25T11:00:00.000Z",
      "endTime": "2025-11-25T12:00:00.000Z",
      "recurrence": {
        "type": "daily",
        "interval": 1,
        "times": 30
      },
      "description": ""
    }
  }]
}

KEYWORD DETECTION:
- "every week/weekly" → createEventSeries with type: "weekly"
- "every day/daily" → createEventSeries with type: "daily"
- "recurring/repeating" → createEventSeries
- "all day" → createAllDayEvent
- Color names (blue, red, green, etc.) → add "color" parameter

Current Date/Time: ${now.toISOString()} (${timezone})
`;
};

async function callAI(userMessage, timezone, includeImage = false, imageBase64 = null) {
  const SYSTEM_PROMPT = getSystemPrompt(timezone);

  if (AI_PROVIDER === 'openai') {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user", content: includeImage
          ? [
            { type: "text", text: userMessage },
            { type: "image_url", image_url: { url: imageBase64 } }
          ]
          : userMessage
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_object" }
    });

    return completion.choices[0].message.content;
  } else if (AI_PROVIDER === 'anthropic') {
    const messages = [];

    if (includeImage) {
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      const mediaType = imageBase64.includes('image/png') ? 'image/png' : 'image/jpeg';

      messages.push({
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Data,
            },
          },
          {
            type: "text",
            text: userMessage
          }
        ]
      });
    } else {
      messages.push({
        role: "user",
        content: userMessage
      });
    }

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages
    });

    return response.content[0].text;
  }
}

app.post('/api/chat', async (req, res) => {
  const { message, calendarId, timezone } = req.body;

  if (!APPS_SCRIPT_URL) {
    return res.status(500).json({ error: "APPS_SCRIPT_URL is not configured in .env" });
  }

  if (!timezone) {
    return res.status(400).json({ error: "Timezone is required" });
  }

  try {
    const content = await callAI(message, timezone);

    console.log("AI Response:", content);

    let aiResponse;
    try {
      aiResponse = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      return res.status(500).json({ error: "AI returned invalid JSON", details: content });
    }

    const actions = aiResponse.actions || [];
    const results = [];

    for (const action of actions) {
      const payload = {
        calendarId: calendarId,
        action: action.action,
        params: action.params
      };

      console.log(`Sending action to Apps Script:`, JSON.stringify(payload, null, 2));

      try {
        const response = await axios.post(APPS_SCRIPT_URL, payload);

        if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
          console.error("Received HTML from Apps Script.");
          results.push({ status: 'error', message: 'Received HTML instead of JSON. Check Apps Script deployment permissions.' });
        } else {
          results.push(response.data);
        }
      } catch (err) {
        console.error("Error calling Apps Script:", err.message);
        results.push({ status: 'error', message: `Failed to call Apps Script: ${err.message}` });
      }
    }

    res.json({ success: true, results, aiMessage: "I've processed your request." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload', async (req, res) => {
  const { imageBase64, calendarId, timezone, instructions } = req.body;

  if (!APPS_SCRIPT_URL) {
    return res.status(500).json({ error: "APPS_SCRIPT_URL is not configured in .env" });
  }

  if (!timezone) {
    return res.status(400).json({ error: "Timezone is required" });
  }

  try {
    const userInstructions = instructions || "Extract these events for my calendar.";
    console.log("Image upload instructions:", userInstructions);

    const content = await callAI(userInstructions, timezone, true, imageBase64);
    const aiResponse = JSON.parse(content);
    const actions = aiResponse.actions || [];

    const results = [];
    for (const action of actions) {
      const payload = {
        calendarId: calendarId,
        action: action.action,
        params: action.params
      };

      try {
        const response = await axios.post(APPS_SCRIPT_URL, payload);
        results.push(response.data);
      } catch (err) {
        console.error("Error calling Apps Script:", err.message);
        results.push({ status: 'error', message: err.message });
      }
    }

    res.json({ success: true, count: results.length, results });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
