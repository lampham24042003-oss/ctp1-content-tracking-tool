export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server chưa được cấu hình biến môi trường GEMINI_API_KEY. Vui lòng vào Vercel để thêm.' });
  }

  const MAX_RETRIES = 3;
  let attempt = 0;
  
  while (attempt < MAX_RETRIES) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      
      const data = await response.json();
      
      if (data.error && data.error.message && data.error.message.toLowerCase().includes('high demand') && attempt < MAX_RETRIES - 1) {
        attempt++;
        await new Promise(r => setTimeout(r, 2000 * attempt));
        continue;
      }
      
      return res.status(200).json(data);
    } catch (error) {
      if (attempt < MAX_RETRIES - 1) {
        attempt++;
        await new Promise(r => setTimeout(r, 2000 * attempt));
        continue;
      }
      return res.status(500).json({ error: error.message });
    }
  }
}
