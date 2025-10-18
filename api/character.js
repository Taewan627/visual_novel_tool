// /api/character.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { description } = req.body || {};
  if (!description) return res.status(400).json({ error: 'missing description' });
  try {
    const r = await fetch(
      `https://api-inference.huggingface.co/models/${process.env.MODEL_CHAR}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: description,
          parameters: { max_new_tokens: 300, temperature: 0.6 }
        })
      }
    );
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}