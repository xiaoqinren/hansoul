# INKUL 产品设计方案

**品牌**：INKUL（印刻）  
**Slogan**：Every soul deserves a Chinese name.

---

## 用户旅程（整体流程）

1. **取名**（已实现）  
   - 用户输入故事 → AI 生成中文名 → 展示「Your Chinese Soul Name」。

2. **中国风名片**（待开发）  
   - 取名完成后，为用户生成一张中国风电子/可下载名片（含中文名、可选用书法风格等）。  
   - 可作为免费环节或首步增值。

3. **笔顺视频**（付费）✅ 已接  
   - 取名后展示「Stroke-order & pronunciation」$9.90，点击跳转 **Airwallex** 支付链接。  
   - 支付成功后通过 return_url 回到本站 `?paid=1&name=xxx`，弹层内为：**Hanzi Writer** 笔顺动画 + 浏览器 **TTS 读音**（中文）。  
   - 需在 Vercel 配置 **AIRWALLEX_CLIENT_ID**、**AIRWALLEX_API_KEY**；沙箱可设 **AIRWALLEX_BASE_URL=https://api-demo.airwallex.com**。未配置时点击会直接打开演示弹层。

4. **印章图案**（已接）  
   - 取名后展示 3 款印章样式（Style A/B/C），用户选一款 → 填写收件地址 → 支付 $29.90（Airwallex）。  
   - 支付成功后跳回 `?order_id=xxx&paid=1`，展示 Thank you。  
   - **订单通知**：创建订单时发邮件到 **ORDER_NOTIFY_EMAIL**（如 huhanxing@gmail.com），需配置 **RESEND_API_KEY**。  
   - 后续：回填物流单号、客户查件。

5. **实物邮寄**  
   - 从中国寄出：选定款式的实物印章（+ 可选毛笔、练习用纸）。  
   - 需：制作、回填单号、客户跟踪。

---

## 订单通知（收到订单后提示）

- **收件邮箱**：`huhanxing@gmail.com`  
- 实现方式：支付成功 Webhook（或成功回调）→ 存订单 → 发邮件到该邮箱。  
- 环境变量建议：**ORDER_NOTIFY_EMAIL**（Vercel 中可设为上述邮箱，便于更换）。

---

## 技术/产品待办（可拆分迭代）

| 阶段 | 内容 | 备注 |
|------|------|------|
| 1 | 中国风名片生成 | 前端展示 + 图片生成（可接 AI 或模板），可下载 |
| 2 | 笔顺视频 | 视频生成（TTS/动画或真人）、支付、权限与交付 |
| 3 | 印章多款生成 | 多种字体/风格图案，用户选择一款 |
| 4 | 实物邮寄 | 订单、地址、支付、物流状态、从中国发货 |

---

## 当前页面状态

- 品牌已改为 **INKUL（印刻）**，slogan 保留。  
- 取名结果下方展示「Your journey with INKUL」四步：名片 → 笔顺视频(付费) → 印章选款 → 实物套装邮寄。

后续可按上述阶段逐步实现各模块。
