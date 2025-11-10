// api/chat.js
export default {
  // Vercel Node.js Runtime kompatibel
  async fetch(request) {
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      const body = await request.json();
      const messages = body.messages;

      if (!Array.isArray(messages)) {
        return new Response(
          JSON.stringify({ error: 'Invalid payload' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'API key not configured' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Hier Beispiel für OpenAI Chat Completions API.
      // Sieh offizielle Doku für aktuelle Modelle. :contentReference[oaicite:2]{index=2}
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini', // günstig + stark, bei Bedarf anpassen
          messages,
          temperature: 0.4
        })
      });

      if (!openaiRes.ok) {
        const errorText = await openaiRes.text();
        console.error('OpenAI API error:', errorText);
        return new Response(
          JSON.stringify({ error: 'AI request failed' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const result = await openaiRes.json();
      const reply =
        result.choices?.[0]?.message?.content?.trim() ||
        'Keine Antwort erhalten.';

      return new Response(
        JSON.stringify({ reply }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (err) {
      console.error('Server error:', err);
      return new Response(
        JSON.stringify({ error: 'Server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
};
