/**
 * 印章订单：创建支付链接 + 发邮件通知 huhanxing@gmail.com
 * 环境变量：AIRWALLEX_CLIENT_ID, AIRWALLEX_API_KEY, ORDER_NOTIFY_EMAIL, RESEND_API_KEY(可选，用于发邮件)
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { name, sealIndex, address } = req.body || {};
    if (!name || !address || !address.fullName || !address.email || !address.country || !address.addressLine1 || !address.city || !address.postalCode || !address.phone) {
        return res.status(400).json({ error: 'Missing name or address fields' });
    }

    const orderId = 'INK' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6).toUpperCase();
    const baseUrl = (req.headers.origin || req.headers.referer || 'https://hansoul.vercel.app').replace(/\/$/, '');
    const returnUrl = baseUrl + '?order_id=' + encodeURIComponent(orderId) + '&paid=1';

    const sealLabels = ['A', 'B', 'C'];
    const sealLabel = sealLabels[Number(sealIndex)] || 'A';

    const orderSummary = `
Chinese name: ${name}
Seal style: ${sealLabel}
---
${address.fullName}
${address.email}
${address.addressLine1}${address.addressLine2 ? '\n' + address.addressLine2 : ''}
${address.city}${address.state ? ', ' + address.state : ''} ${address.postalCode}
${address.country}
Phone: ${address.phone}
---
Order ID: ${orderId}
Amount: $29.90 USD
Status: Pending payment (customer will complete payment on Airwallex).
    `.trim();

    const notifyEmail = process.env.ORDER_NOTIFY_EMAIL || 'huhanxing@gmail.com';
    const resendKey = process.env.RESEND_API_KEY;

    if (resendKey) {
        try {
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + resendKey,
                },
                body: JSON.stringify({
                    from: 'INKUL Orders <onboarding@resend.dev>',
                    to: [notifyEmail],
                    subject: '[INKUL] New seal order (pending) - ' + orderId,
                    text: orderSummary,
                }),
            });
        } catch (e) {
            console.error('Resend email error:', e);
        }
    }

    const clientId = process.env.AIRWALLEX_CLIENT_ID;
    const apiKey = process.env.AIRWALLEX_API_KEY;
    const apiBase = process.env.AIRWALLEX_BASE_URL || 'https://api.airwallex.com';

    if (!clientId || !apiKey) {
        return res.status(200).json({ orderId, paymentUrl: null, error: 'Payment not configured' });
    }

    try {
        const authRes = await fetch(apiBase + '/api/v1/authentication/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-client-id': clientId, 'x-api-key': apiKey },
            body: JSON.stringify({}),
        });
        const authData = await authRes.json();
        const token = authData.token || authData.data?.token || authData.access_token;
        if (!token) return res.status(500).json({ error: 'Airwallex auth failed' });

        const linkRes = await fetch(apiBase + '/api/v1/pa/payment_links/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
                'x-api-version': '2024-06-14',
            },
            body: JSON.stringify({
                amount: 29.90,
                currency: 'USD',
                title: 'INKUL — Physical seal (Style ' + sealLabel + ') + shipping',
                reusable: false,
                return_url: returnUrl,
            }),
        });
        const linkData = await linkRes.json();
        const paymentUrl = linkData.url || linkData.data?.url || linkData.link_url;
        if (paymentUrl) {
            return res.status(200).json({ orderId, paymentUrl });
        }
        return res.status(500).json({ orderId, error: 'No payment link URL' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ orderId, error: 'Create order failed' });
    }
}
