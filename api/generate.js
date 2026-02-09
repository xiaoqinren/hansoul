export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const prompt = req.body?.prompt;
    if (prompt === undefined || prompt === null || (typeof prompt === 'string' && !prompt.trim())) {
        return res.status(400).json({ error: 'Missing or empty prompt' });
    }

    // 优先使用环境变量，如果没有则使用硬编码的 Key
    const API_KEY = process.env.DASHSCOPE_API_KEY || "sk-43ed3d1350764028bc8592ca5dc1880a";
    const APP_ID = "2ad8881cc5a5492b9636afd2832fe4e3";

    try {
        const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/apps/${APP_ID}/completion`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                // --- 必须补上这一行，否则会报 API-key 错误 ---
                'X-DashScope-AppId': APP_ID 
            },
            body: JSON.stringify({
                input: { prompt: typeof prompt === 'string' ? prompt.trim() : String(prompt) },
                parameters: {
                    // 建议加上这个，确保返回格式是标准的消息格式
                    result_format: "message" 
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // 如果 API 返回错误，把具体的错误信息传给前端，方便调试
            return res.status(response.status).json({
                error: data.message || data.code || "API Error"
            });
        }

        // 处理百炼应用返回的 text 字段
        if (data.output && data.output.text) {
            return res.status(200).json({ text: data.output.text });
        }
        
        return res.status(200).json({ error: "AI returned no text" });
    } catch (error) {
        return res.status(500).json({ error: "Backend server error" });
    }
}
