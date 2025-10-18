// /api/dialogue.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { utterance, context } = req.body || {};
  if (!utterance) return res.status(400).json({ error: 'missing utterance' });
  try {
    const r = await fetch(
      `https://api-inference.huggingface.co/models/${process.env.MODEL_DIALOGUE}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `${context ? `[CTX] ${context}\n` : ''}${utterance}`,
          parameters: { max_new_tokens: 200, temperature: 0.8 }
        })
      }
    );
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}