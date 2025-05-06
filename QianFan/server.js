// 引入 express 框架
const express = require('express');
// 引入 node-fetch 并赋值给全局 fetch（用于服务端发起 HTTP 请求）
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
// 引入 body-parser 用于解析 JSON 请求体
const bodyParser = require('body-parser');

// 千帆平台 API Key 和 Secret Key（请根据实际情况替换）
const QIANFAN_API_KEY = 'UZp3VUmSenTswbloZ4zSNRCj';
const QIANFAN_SECRET_KEY = 'cLYpmnDJKzXrqmJFMJwpm8Jg3e3EnxHF';

// 用于缓存 accessToken 及其过期时间
let accessToken = '';
let tokenExpire = 0;

// 获取千帆平台 access_token 的函数，自动缓存和续期
async function getAccessToken() {
    const now = Date.now();
    // 如果 token 未过期，直接返回
    if (accessToken && tokenExpire > now + 60 * 1000) {
        return accessToken;
    }
    // 请求新的 access_token
    const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${QIANFAN_API_KEY}&client_secret=${QIANFAN_SECRET_KEY}`;
    const res = await fetch(url, { method: 'POST' });
    const data = await res.json();
    accessToken = data.access_token;
    // 计算 token 过期时间（提前一分钟刷新）
    tokenExpire = now + (data.expires_in || 2592000) * 1000;
    return accessToken;
}

// 创建 express 应用
const app = express();

// 设置 CORS 跨域响应头，允许所有来源访问
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// 解析 JSON 请求体
app.use(bodyParser.json());

// 聊天接口，接收前端消息并转发到千帆大模型
app.post('/api/chat', async (req, res) => {
    try {
        // 获取用户输入的消息
        const userMsg = req.body.message;
        // 获取有效的 access_token
        const token = await getAccessToken();
        // 千帆大模型 API 地址
        const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${token}`;
        // 构造请求体
        const body = {
            messages: [
                { role: "user", content: userMsg }
            ]
        };
        // 向千帆大模型发送请求
        const apiRes = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const apiData = await apiRes.json();
        // 打印千帆API返回内容到控制台，便于调试
        console.log('千帆API返回:', apiData);
        // 返回结果给前端
        if (apiData.result) {
            res.json({ result: apiData.result });
        } else {
            res.json({ result: "（千帆API请求失败）" });
        }
    } catch (e) {
        // 捕获异常并打印详细错误日志
        console.error('服务器异常:', e);
        res.json({ result: "（服务器异常）" });
    }
});

// 启动服务器，监听 3000 端口
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});