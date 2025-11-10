// api/chat.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;

    // Falls der Body noch nicht geparst ist
    if (!body || !body.messages) {
      try {
        body = JSON.parse(req.body);
      } catch (e) {}
    }

    const messages = body?.messages;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY fehlt');
      return res.status(500).json({ error: 'API key not configured' });
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini', // Stelle sicher, dass dein Account dieses Modell nutzen darf
        messages,
        temperature: 0.4
      })
    });

    const text = await openaiRes.text();

    if (!openaiRes.ok) {
      console.error('OpenAI API error:', text);
      return res.status(500).json({ error: 'AI request failed' });
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error('JSON parse error:', e, text);
      return res.status(500).json({ error: 'Invalid AI response' });
    }

    const reply =
      result.choices?.[0]?.message?.content?.trim() ||
      'Keine Antwort erhalten.';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
