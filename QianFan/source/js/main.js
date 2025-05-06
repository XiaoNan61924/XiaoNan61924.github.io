// 聊天历史相关常量
const CHAT_HISTORY_KEY = 'qianfan_chat_history';
const CHAT_LIST_KEY = 'qianfan_chat_list';

// 当前会话ID
let currentChatId = null;

// 生成唯一ID
function generateId() {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 获取聊天历史
function getChatHistory(chatId) {
    const allHistory = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || '{}');
    return allHistory[chatId] || [];
}

// 保存聊天历史
function saveChatHistory(chatId, history) {
    const allHistory = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || '{}');
    allHistory[chatId] = history;
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(allHistory));
}

// 获取聊天列表
function getChatList() {
    return JSON.parse(localStorage.getItem(CHAT_LIST_KEY) || '[]');
}

// 保存聊天列表
function saveChatList(list) {
    localStorage.setItem(CHAT_LIST_KEY, JSON.stringify(list));
}

// 渲染侧边栏聊天列表
function renderChatList() {
    const chatList = getChatList();
    const navUl = document.querySelector('.sidebar nav ul');
    navUl.innerHTML = '';
    // 新建聊天按钮
    const newLi = document.createElement('li');
    newLi.className = 'new-chat-btn';
    newLi.innerHTML = '<span>＋ 新建聊天</span>';
    newLi.onclick = () => createNewChat();
    navUl.appendChild(newLi);

    chatList.forEach(chat => {
        const li = document.createElement('li');
        li.className = (chat.id === currentChatId) ? 'active' : '';
        // 聊天标题和下拉按钮
        li.innerHTML = `
            <span class="chat-title">${chat.title}</span>
            <div class="dropdown">
                <button class="dropdown-toggle">⋮</button>
                <div class="dropdown-menu" style="display:none;">
                    <button class="rename-chat-btn">重命名</button>
                    <button class="delete-chat-btn">删除</button>
                </div>
            </div>
        `;
        // 点击聊天标题切换会话
        li.querySelector('.chat-title').onclick = () => loadChat(chat.id);
        // 下拉按钮事件
        const dropdownToggle = li.querySelector('.dropdown-toggle');
        const dropdownMenu = li.querySelector('.dropdown-menu');
        dropdownToggle.onclick = (e) => {
            e.stopPropagation();
            // 关闭其它下拉
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu !== dropdownMenu) menu.style.display = 'none';
            });
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        };
        // 删除按钮事件
        li.querySelector('.delete-chat-btn').onclick = (e) => {
            e.stopPropagation();
            deleteChat(chat.id);
        };
        // 重命名按钮事件
        li.querySelector('.rename-chat-btn').onclick = (e) => {
            e.stopPropagation();
            renameChat(chat.id);
        };
        navUl.appendChild(li);
    });

    // 点击空白处关闭所有下拉菜单
    document.body.onclick = () => {
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.style.display = 'none');
    };
}

// 新建聊天
function createNewChat() {
    const chatId = generateId();
    const chatList = getChatList();
    const newChat = {
        id: chatId,
        title: '新聊天 ' + (chatList.length + 1)
    };
    chatList.unshift(newChat);
    saveChatList(chatList);
    saveChatHistory(chatId, []);
    currentChatId = chatId;
    renderChatList();
    renderChatHistory([]);
}

// 加载聊天历史
function loadChat(chatId) {
    currentChatId = chatId;
    renderChatList();
    const history = getChatHistory(chatId);
    renderChatHistory(history);
}

// 删除聊天
function deleteChat(chatId) {
    let chatList = getChatList();
    chatList = chatList.filter(chat => chat.id !== chatId);
    saveChatList(chatList);

    const allHistory = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || '{}');
    delete allHistory[chatId];
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(allHistory));

    // 如果删除的是当前会话，切换到第一个
    if (currentChatId === chatId) {
        if (chatList.length > 0) {
            loadChat(chatList[0].id);
        } else {
            createNewChat();
        }
    } else {
        renderChatList();
    }
}

// 重命名聊天
function renameChat(chatId) {
    const chatList = getChatList();
    const chat = chatList.find(c => c.id === chatId);
    if (!chat) return;
    // 弹出输入框让用户输入新名称
    const newTitle = prompt('请输入新的聊天名称：', chat.title);
    if (newTitle && newTitle.trim() !== '') {
        chat.title = newTitle.trim();
        saveChatList(chatList);
        renderChatList();
    }
}

// 将消息内容中的代码块用 <pre><code> 包裹
function renderMessageContent(content) {
    // 支持 Markdown 三反引号代码块
    // 先处理多行代码块
    content = content.replace(/```(\w*)\n([\s\S]*?)```/g, function(match, lang, code) {
        // lang 可用于后续高亮
        return `<pre><code class="lang-${lang}">${escapeHtml(code)}</code></pre>`;
    });
    // 再处理行内代码
    content = content.replace(/`([^`\n]+)`/g, function(match, code) {
        return `<code>${escapeHtml(code)}</code>`;
    });
    // 支持换行
    content = content.replace(/\n/g, '<br>');
    return content;
}

// 转义HTML
function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(tag) {
        const charsToReplace = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return charsToReplace[tag] || tag;
    });
}

// 渲染聊天消息区
function renderChatHistory(history) {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.innerHTML = '';
    history.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message ' + msg.role;
        msgDiv.innerHTML = `<div class="message">${renderMessageContent(msg.content)}</div>`;
        chatContainer.appendChild(msgDiv);
    });
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 发送消息的主函数
async function sendMessage() {
    var input = document.getElementById('chat-input');
    var text = input.value.trim();
    if (!text || !currentChatId) return;
    var chatContainer = document.querySelector('.chat-container');

    // 保存用户消息到历史
    let history = getChatHistory(currentChatId);
    history.push({ role: 'user', content: text });
    saveChatHistory(currentChatId, history);

    // 显示用户消息
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.innerHTML = `<div class="message">${renderMessageContent(text)}</div>`;
    chatContainer.appendChild(userMsg);
    input.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // 显示机器人“正在思考中...”
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-message bot';
    botMsg.innerHTML = '<div class="message">正在思考中...</div>';
    chatContainer.appendChild(botMsg);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const res = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        botMsg.querySelector('.message').innerHTML = renderMessageContent(data.result);

        // 保存机器人回复到历史
        history = getChatHistory(currentChatId);
        history.push({ role: 'bot', content: data.result });
        saveChatHistory(currentChatId, history);
    } catch (e) {
        botMsg.querySelector('.message').innerText = "（服务器异常）";
    }
}

// 发送按钮点击事件
document.getElementById('send-btn').onclick = sendMessage;

// 回车发送消息事件
document.getElementById('chat-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

// 侧边栏收起/展开功能
document.getElementById('sidebar-toggle-btn').onclick = function() {
    document.body.classList.toggle('sidebar-collapsed');
};

// 自动生成年份区间
(function() {
    var startYear = 2025;
    var nowYear = new Date().getFullYear();
    var text = startYear === nowYear ? startYear : (startYear + '-' + nowYear);
    var el = document.getElementById('copyright-year');
    if (el) el.innerText = '© ' + text;
})();

// 初始化页面
(function init() {
    // 没有历史则新建一个
    const chatList = getChatList();
    if (chatList.length === 0) {
        createNewChat();
    } else {
        currentChatId = chatList[0].id;
        renderChatList();
        renderChatHistory(getChatHistory(currentChatId));
    }
})();
