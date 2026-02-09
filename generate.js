export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const prompt = req.body?.prompt;
    if (prompt === undefined || prompt === null || (typeof prompt === 'string' && !prompt.trim())) {
        return res.status(400).json({ error: 'Missing or empty prompt' });
    }

    const API_KEY = process.env.DASHSCOPE_API_KEY || "sk-43ed3d1350764028bc8592ca5dc1880a";
    const APP_ID = "2ad8881cc5a5492b9636afd2832fe4e3";

    try {
        const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/apps/${APP_ID}/completion`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: { prompt: typeof prompt === 'string' ? prompt.trim() : String(prompt) },
                parameters: {},
                debug: {}
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status >= 500 ? 502 : response.status).json({
                error: data.message || data.code || "DashScope API error"
            });
        }

        if (data.output && data.output.text) {
            return res.status(200).json({ text: data.output.text });
        }
        return res.status(200).json({ error: data.message || "AI returned no text" });
    } catch (error) {
        return res.status(500).json({ error: "Backend server error" });
    }
}
