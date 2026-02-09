export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { prompt } = req.body;
    const API_KEY = "sk-43ed3d1350764028bc8592ca5dc1880a";
    const APP_ID = "2ad8881cc5a5492b9636afd2832fe4e3";

    try {
        const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/apps/${APP_ID}/completion`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'X-DashScope-AppId': APP_ID
            },
            body: JSON.stringify({
                input: { prompt: prompt },
                parameters: { result_format: "message" }
            })
        });
        const data = await response.json();
        res.status(200).json({ text: data.output.text });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch AI" });
    }
}
