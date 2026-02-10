/**
 * 使用 Airwallex 创建支付链接，用于付费笔顺+读音视频
 * 环境变量：AIRWALLEX_CLIENT_ID、AIRWALLEX_API_KEY
 * 沙箱：AIRWALLEX_BASE_URL=https://api-demo.airwallex.com（可选，不设则用生产）
 * 支付成功后通过 return_url 跳回站点 ?paid=1&name=xxx 以解锁视频
 * 文档：https://www.airwallex.com/docs/payments/payment-links/payment-links-via-api
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { name } = req.body || {};
    const clientId = process.env.AIRWALLEX_CLIENT_ID;
    const apiKey = process.env.AIRWALLEX_API_KEY;
    if (!clientId || !apiKey) {
        return res.status(200).json({}); // 未配置时前端走演示
    }

    const baseUrl = (req.headers.origin || req.headers.referer || 'https://hansoul.vercel.app').replace(/\/$/, '');
    const returnUrl = baseUrl + '?paid=1&name=' + encodeURIComponent(name || '');
    const apiBase = process.env.AIRWALLEX_BASE_URL || 'https://api.airwallex.com';

    try {
        const authRes = await fetch(apiBase + '/api/v1/authentication/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': clientId,
                'x-api-key': apiKey,
            },
            body: JSON.stringify({}),
        });
        const authData = await authRes.json();
        const token = authData.token || authData.data?.token || authData.access_token;
        if (!token) {
            console.warn('Airwallex auth response:', authData);
            return res.status(500).json({ error: 'Airwallex auth failed' });
        }

        const linkRes = await fetch(apiBase + '/api/v1/pa/payment_links/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
                'x-api-version': '2024-06-14',
            },
            body: JSON.stringify({
                amount: 9.90,
                currency: 'USD',
                title: 'INKUL — Stroke-order & pronunciation for your name',
                reusable: false,
                return_url: returnUrl,
            }),
        });
        const linkData = await linkRes.json();
        const url = linkData.url || linkData.data?.url || linkData.link_url;
        if (url) {
            return res.status(200).json({ url });
        }
        console.warn('Airwallex payment link response:', linkData);
        return res.status(500).json({ error: 'No payment link URL' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Checkout failed' });
    }
}
