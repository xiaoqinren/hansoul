export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const prompt = req.body?.prompt;
    if (prompt === undefined || prompt === null || (typeof prompt === 'string' && !prompt.trim())) {
        return res.status(400).json({ error: 'Missing or empty prompt' });
    }

    const API_KEY = "sk-fc3a51f125254fbab1477c0fa25b0cf8";
    const APP_ID = "2ad8881cc5a5492b9636afd2832fe4e3";
    // Vercel 部署在美国，用国内 endpoint 可能被拒。若仍报 Invalid API-key，在 Vercel 设 DASHSCOPE_BASE_URL=https://dashscope-intl.aliyuncs.com 试国际版（需国际版账号的 Key）
    const BASE_URL = process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com";

    if (!API_KEY || !API_KEY.startsWith("sk-")) {
        return res.status(500).json({
            error: "API Key 格式或配置错误。百炼 Key 须以 sk- 开头，请检查 Vercel 环境变量 DASHSCOPE_API_KEY 是否已设置且无多余空格/换行，勿使用其他平台密钥。"
        });
    }
    if (API_KEY.startsWith("sk-sp-") && BASE_URL.indexOf("coding.dashscope") === -1) {
        return res.status(500).json({
            error: "Coding Plan 密钥(sk-sp-) 须配合 DASHSCOPE_BASE_URL=https://coding.dashscope.aliyuncs.com 使用，不能用于通用应用接口。"
        });
    }

    try {
        const response = await fetch(`${BASE_URL.replace(/\/$/, "")}/api/v1/apps/${APP_ID}/completion`, {
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
