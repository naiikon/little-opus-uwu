// --- 消息操作模块 (编辑、撤回、多选、截图、历史记录管理) ---

let currentMultiSelectMode = 'delete'; // 'delete' or 'capture'
let isAddingMessageMode = false;
let addingAfterMessageId = null;

function handleMessageLongPress(messageWrapper, x, y) {
    if (isInMultiSelectMode) return;
    clearTimeout(longPressTimer);
    // 清除可能存在的文本选择，防止干扰菜单点击
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
    const messageId = messageWrapper.dataset.id;
    const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
    const message = chat.history.find(m => m.id === messageId);
    if (!message) return;

    const isImageRecognitionMsg = message.parts && message.parts.some(p => p.type === 'image');
    const isVoiceMessage = /\[.*?的语音：.*?\]/.test(message.content);
    const isStickerMessage = /\[.*?的表情包：.*?\]|\[.*?发送的表情包：.*?\]/.test(message.content);
    const isPhotoVideoMessage = /\[.*?发来的照片\/视频：.*?\]/.test(message.content);
    const isTransferMessage = /\[.*?给你转账：.*?\]|\[.*?的转账：.*?\]|\[.*?向.*?转账：.*?\]/.test(message.content);
    const isGiftMessage = /\[.*?送来的礼物：.*?\]|\[.*?向.*?送来了礼物：.*?\]/.test(message.content);
    
    let invisibleRegex;
    if (chat.showStatusUpdateMsg) {
        invisibleRegex = /\[.*?(?:接收|退回).*?的转账\]|\[.*?已接收礼物\]|\[system:.*?\]|\[.*?邀请.*?加入了群聊\]|\[.*?修改群名为：.*?\]|\[system-display:.*?\]/;
    } else {
        invisibleRegex = /\[.*?(?:接收|退回).*?的转账\]|\[.*?更新状态为：.*?\]|\[.*?已接收礼物\]|\[system:.*?\]|\[.*?邀请.*?加入了群聊\]|\[.*?修改群名为：.*?\]|\[system-display:.*?\]/;
    }
    const isInvisibleMessage = invisibleRegex.test(message.content);
    const isWithdrawn = message.isWithdrawn; 

    let menuItems = [];

    if (!isWithdrawn) {
        if (!isImageRecognitionMsg && !isVoiceMessage && !isStickerMessage && !isPhotoVideoMessage && !isTransferMessage && !isGiftMessage && !isInvisibleMessage) {
            menuItems.push({label: 'Sửa', action: () => startMessageEdit(messageId)});
        }
        
        if (!isInvisibleMessage) {
            menuItems.push({label: 'Trích dẫn', action: () => startQuoteReply(messageId)});
        }

        if (message.role === 'user') {
            menuItems.push({label: 'Thu hồi', action: () => withdrawMessage(messageId)});
        }
        
        if (message.role === 'assistant') {
            menuItems.push({label: 'Nhận ảnh', action: () => receiveAirDropPhoto(messageId)});
            menuItems.push({label: 'Thêm mới', action: () => startAddNewMessage(messageId)});
        }
    }

    menuItems.push({
        label: isDebugMode ? 'Thoát debug' : 'Vào debug',
        action: () => {
            isDebugMode = !isDebugMode;
            showToast(isDebugMode ? 'Đã vào chế độ debug' : 'Đã thoát chế độ debug');
            renderMessages(false, true); 
        }
    });

    menuItems.push({label: 'Xóa', action: () => enterMultiSelectMode(messageId)});
    menuItems.push({label: 'Tạo nhánh từ đây', action: () => createBranchArchiveAtMessage(messageId)});

    if (menuItems.length > 0) {
        triggerHapticFeedback('medium');
        createContextMenu(menuItems, x, y);
    }
}

function startDebugEdit(messageId) {
    exitMultiSelectMode();
    editingMessageId = messageId;
    isRawEditMode = true; 

    const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
    const message = chat.history.find(m => m.id === messageId);
    if (!message) return;

    const modal = document.getElementById('message-edit-modal');
    const textarea = document.getElementById('message-edit-textarea');
    const title = modal.querySelector('h3');
    const deleteBtn = document.getElementById('debug-delete-msg-btn'); 

    if (!modal.dataset.originalTitle) modal.dataset.originalTitle = title.textContent;
    title.textContent = "Debug/sửa mã nguồn";

    const textMatch = message.content.match(/^\[(.*?)的消息：([\s\S]+?)\]$/);
    if (message.quote && textMatch) {
        const name = textMatch[1];
        const text = textMatch[2];
        const quoteContent = message.quote.content;
        textarea.value = `[${name}引用“${quoteContent}”并回复：${text}]`;
    } else {
        textarea.value = message.content; 
    }

    const timestampInput = document.getElementById('message-edit-timestamp');
    const timestampGroup = document.getElementById('message-edit-timestamp-group');
    if (timestampInput && timestampGroup) {
        const date = new Date(message.timestamp);
        const Y = date.getFullYear();
        const M = String(date.getMonth() + 1).padStart(2, '0');
        const D = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        timestampInput.value = `${Y}-${M}-${D}T${h}:${m}`;
        timestampInput.dataset.originalValue = timestampInput.value;
        timestampGroup.style.display = 'flex';
    }
    
    if (deleteBtn) {
        deleteBtn.style.display = 'block';
        const newDeleteBtn = deleteBtn.cloneNode(true);
        deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
        
        newDeleteBtn.addEventListener('click', async () => {
            if (confirm('【Chế độ debug】Chắc chắn xóa vĩnh viễn tin nhắn này?')) {
                chat.history = chat.history.filter(m => m.id !== messageId);
                
                if (currentChatType === 'private') {
                    recalculateChatStatus(chat);
                }

                await saveData(); 
                renderMessages(false, true); 
                cancelMessageEdit(); 
                showToast('Đã xóa tin nhắn');
            }
        });
    }

    modal.classList.add('visible');
    textarea.focus();
}

function startQuoteReply(messageId) {
    const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
    const message = chat.history.find(m => m.id === messageId);
    if (!message) return;

    let senderName = '';
    let senderId = '';
    if (message.role === 'user') {
        senderName = (currentChatType === 'private')
            ? ((chat.myRemarkName && chat.myRemarkName.trim()) || chat.myName || 'User')
            : chat.me.nickname;
        senderId = 'user_me';
    } else { 
        if (currentChatType === 'private') {
            senderName = chat.remarkName;
            senderId = chat.id;
        } else {
            const sender = chat.members.find(m => m.id === message.senderId);
            senderName = sender ? sender.groupNickname : 'Thành viên không rõ';
            senderId = sender ? sender.id : 'unknown';
        }
    }
    
    let previewContent = message.content;
    const textMatch = message.content.match(/\[.*?的消息：([\s\S]+?)\]/);
    if (textMatch) {
        previewContent = textMatch[1];
    } else if (/\[.*?的表情包：.*?\]/.test(message.content)) {
        previewContent = '[表情包]';
    } else if (/\[.*?的语音：.*?\]/.test(message.content)) {
        previewContent = '[语音]';
    } else if (/\[.*?发来的照片\/视频：.*?\]/.test(message.content)) {
        previewContent = '[照片/视频]';
    } else if (message.parts && message.parts.some(p => p.type === 'image')) {
        previewContent = '[Ảnh]';
    }
    
    currentQuoteInfo = {
        id: message.id,
        senderId: senderId,
        senderName: senderName,
        content: previewContent.substring(0, 100) 
    };

    const previewBar = document.getElementById('reply-preview-bar');
    previewBar.querySelector('.reply-preview-name').textContent = `Trả lời ${senderName}`;
    previewBar.querySelector('.reply-preview-text').textContent = currentQuoteInfo.content;
    previewBar.classList.add('visible');
    
    messageInput.focus();
}

function cancelQuoteReply() {
    currentQuoteInfo = null;
    const previewBar = document.getElementById('reply-preview-bar');
    previewBar.classList.remove('visible');
}

function startAddNewMessage(messageId) {
    exitMultiSelectMode();
    isAddingMessageMode = true;
    addingAfterMessageId = messageId;
    isRawEditMode = false;
    
    const modal = document.getElementById('message-edit-modal');
    const textarea = document.getElementById('message-edit-textarea');
    const title = document.getElementById('message-edit-modal-title');
    const typeGroup = document.getElementById('message-edit-type-group');
    const typeSelect = document.getElementById('message-edit-type');
    
    if (title) title.textContent = "Thêm tin nhắn của nhân vật";
    if (typeGroup) typeGroup.style.display = 'block';
    if (typeSelect) {
        typeSelect.value = 'text';
        textarea.placeholder = "Nhập nội dung chữ...";
        
        // 绑定类型切换事件
        typeSelect.onchange = () => {
            switch(typeSelect.value) {
                case 'text': textarea.placeholder = "Nhập nội dung chữ..."; break;
                case 'voice': textarea.placeholder = "Nhập nội dung tin thoại..."; break;
                case 'image': textarea.placeholder = "Nhập mô tả ảnh/video hoặcURL..."; break;
                case 'sticker': textarea.placeholder = "Nhập tên sticker..."; break;
            }
        };
    }
    
    textarea.value = '';
    
    const timestampGroup = document.getElementById('message-edit-timestamp-group');
    if (timestampGroup) timestampGroup.style.display = 'none';
    
    modal.classList.add('visible');
    textarea.focus();
}

function startMessageEdit(messageId) {
    exitMultiSelectMode();
    editingMessageId = messageId;
    isRawEditMode = false;
    isAddingMessageMode = false;
    const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
    const message = chat.history.find(m => m.id === messageId);
    if (!message) return;

    const modal = document.getElementById('message-edit-modal');
    const textarea = document.getElementById('message-edit-textarea');
    const title = document.getElementById('message-edit-modal-title');
    const typeGroup = document.getElementById('message-edit-type-group');
    
    if (title) title.textContent = "Sửa tin nhắn";
    if (typeGroup) typeGroup.style.display = 'none';

    let contentToEdit = message.content;
    const plainTextMatch = contentToEdit.match(/^\[.*?：([\s\S]*)\]$/);
    if (plainTextMatch && plainTextMatch[1]) {
        contentToEdit = plainTextMatch[1].trim();
    }
    contentToEdit = contentToEdit.replace(/\[发送时间:.*?\]/g, '').trim();
    
    textarea.value = contentToEdit;

    const timestampInput = document.getElementById('message-edit-timestamp');
    const timestampGroup = document.getElementById('message-edit-timestamp-group');
    if (timestampInput && timestampGroup) {
        const date = new Date(message.timestamp);
        const Y = date.getFullYear();
        const M = String(date.getMonth() + 1).padStart(2, '0');
        const D = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        timestampInput.value = `${Y}-${M}-${D}T${h}:${m}`;
        timestampInput.dataset.originalValue = timestampInput.value;
        timestampGroup.style.display = 'flex';
    }

    modal.classList.add('visible');
    textarea.focus();
}

async function saveMessageEdit() {
    const newText = document.getElementById('message-edit-textarea').value.trim();
    if (!newText) {
        cancelMessageEdit();
        return;
    }
    
    if (!isAddingMessageMode && !editingMessageId) {
        cancelMessageEdit();
        return;
    }

    const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
    
    if (isAddingMessageMode) {
        const targetIndex = chat.history.findIndex(m => m.id === addingAfterMessageId);
        if (targetIndex === -1) {
            cancelMessageEdit();
            return;
        }
        
        const targetMessage = chat.history[targetIndex];
        let senderName = '';
        let senderId = '';
        
        if (currentChatType === 'private') {
            senderName = chat.realName;
            senderId = chat.id;
        } else {
            const sender = chat.members.find(m => m.id === targetMessage.senderId);
            senderName = sender ? (sender.realName || sender.groupNickname) : 'Thành viên không rõ';
            senderId = targetMessage.senderId;
        }
        
        const typeSelect = document.getElementById('message-edit-type');
        const msgType = typeSelect ? typeSelect.value : 'text';
        let formattedContent = '';
        
        switch(msgType) {
            case 'text':
                formattedContent = `[${senderName}的消息：${newText}]`;
                break;
            case 'voice':
                formattedContent = `[${senderName}的语音：${newText}]`;
                break;
            case 'image':
                formattedContent = `[${senderName}发来的照片/视频：${newText}]`;
                break;
            case 'sticker':
                formattedContent = `[${senderName}的表情包：${newText}]`;
                break;
            default:
                formattedContent = `[${senderName}的消息：${newText}]`;
        }
        
        const newMessage = {
            id: `msg_${Date.now()}_${Math.random()}`,
            role: 'assistant',
            content: formattedContent,
            parts: [{type: 'text', text: formattedContent}],
            timestamp: targetMessage.timestamp + 1,
            senderId: senderId
        };
        
        chat.history.splice(targetIndex + 1, 0, newMessage);
        
    } else {
        const messageIndex = chat.history.findIndex(m => m.id === editingMessageId);
        if (messageIndex === -1) {
            cancelMessageEdit();
            return;
        }

        if (isRawEditMode) {
            const quoteRegex = /^\[(.*?)引用[“"]([\s\S]*?)[”"]并回复：([\s\S]*?)\]$/;
            const match = newText.match(quoteRegex);

            if (match) {
                const name = match[1];
                const quoteContent = match[2];
                const replyText = match[3];

                if (chat.history[messageIndex].quote) {
                    chat.history[messageIndex].quote.content = quoteContent;

                    const targetContent = quoteContent.trim();
                    const originalMessage = chat.history.slice().reverse().find(m => {
                        if (m.id === chat.history[messageIndex].id) return false;
                        let text = m.content;
                        const plainTextMatch = text.match(/^\[.*?：([\s\S]*)\]$/);
                        if (plainTextMatch && plainTextMatch[1]) {
                            text = plainTextMatch[1].trim();
                        }
                        text = text.replace(/\[发送时间:.*?\]$/, '').trim();
                        return text === targetContent;
                    });

                    if (originalMessage) {
                        let newSenderId;
                        if (originalMessage.role === 'user') {
                            newSenderId = 'user_me';
                        } else {
                            newSenderId = originalMessage.senderId || (currentChatType === 'private' ? chat.id : 'unknown');
                        }
                        chat.history[messageIndex].quote.senderId = newSenderId;
                        chat.history[messageIndex].quote.messageId = originalMessage.id;
                    }
                }
                chat.history[messageIndex].content = `[${name}的消息：${replyText}]`;
            } else {
                chat.history[messageIndex].content = newText;
            }

            if (chat.history[messageIndex].parts) {
                chat.history[messageIndex].parts = [{type: 'text', text: chat.history[messageIndex].content}];
            }
        } else {
            const oldContent = chat.history[messageIndex].content;
            const prefixMatch = oldContent.match(/(\[.*?的(?:消息|语音|表情包|照片\/视频)[：:])[\s\S]+\]/);
            let newContent;

            if (prefixMatch && prefixMatch[1]) {
                const prefix = prefixMatch[1];
                newContent = `${prefix}${newText}]`;
            } else {
                newContent = newText;
            }

            chat.history[messageIndex].content = newContent;
            if (chat.history[messageIndex].parts) {
                chat.history[messageIndex].parts = [{type: 'text', text: newContent}];
            }
        }

        const timestampInput = document.getElementById('message-edit-timestamp');
        if (timestampInput && timestampInput.value) {
            if (timestampInput.value !== timestampInput.dataset.originalValue) {
                const newTime = new Date(timestampInput.value).getTime();
                if (!isNaN(newTime)) {
                    chat.history[messageIndex].timestamp = newTime;
                    chat.history.sort((a, b) => a.timestamp - b.timestamp);
                }
            }
        }
        
        if (currentChatType === 'private') {
            recalculateChatStatus(chat);

            if (chat.statusPanel && chat.statusPanel.enabled && chat.statusPanel.regexPattern) {
                try {
                    let pattern = chat.statusPanel.regexPattern;
                    let flags = 'gs'; 

                    const matchParts = pattern.match(/^\/(.*?)\/([a-z]*)$/);
                    if (matchParts) {
                        pattern = matchParts[1];
                        flags = matchParts[2] || 'gs';
                        if (!flags.includes('s')) flags += 's';
                    }

                    const regex = new RegExp(pattern, flags);
                    const match = regex.exec(chat.history[messageIndex].content);
                    
                    if (match) {
                        const rawStatus = match[0];
                        chat.statusPanel.currentStatusRaw = rawStatus;
                        
                        let html = chat.statusPanel.replacePattern;
                        
                        for (let i = 1; i < match.length; i++) {
                            html = html.replace(new RegExp(`\\$${i}`, 'g'), match[i]);
                        }
                        chat.statusPanel.currentStatusHtml = html;
                        
                        chat.history[messageIndex].isStatusUpdate = true;
                        chat.history[messageIndex].statusSnapshot = {
                            regex: pattern,
                            replacePattern: chat.statusPanel.replacePattern
                        };
                    } else {
                        chat.history[messageIndex].isStatusUpdate = false;
                        delete chat.history[messageIndex].statusSnapshot;
                    }
                } catch (e) {
                    console.error("Lỗi phân tích thanh trạng thái khi sửa:", e);
                }
            }
        }
    }

    await saveData();
    currentPage = 1;
    renderMessages(false, true);
    renderChatList();
    
    cancelMessageEdit();
}

function cancelMessageEdit() {
    editingMessageId = null;
    isRawEditMode = false; 
    isAddingMessageMode = false;
    addingAfterMessageId = null;
    
    const modal = document.getElementById('message-edit-modal');
    const deleteBtn = document.getElementById('debug-delete-msg-btn');
    if (deleteBtn) deleteBtn.style.display = 'none';

    const timestampInput = document.getElementById('message-edit-timestamp');
    const timestampGroup = document.getElementById('message-edit-timestamp-group');
    if (timestampInput && timestampGroup) {
        timestampInput.value = '';
        timestampGroup.style.display = 'none';
    }
    
    const typeGroup = document.getElementById('message-edit-type-group');
    if (typeGroup) typeGroup.style.display = 'none';

    if (modal) {
        modal.classList.remove('visible');
        const title = document.getElementById('message-edit-modal-title');
        if (title) {
            title.textContent = "Sửa tin nhắn";
        }
    }
}

function enterMultiSelectMode(initialMessageId, mode = 'delete') {
    isInMultiSelectMode = true;
    currentMultiSelectMode = mode;
    
    chatRoomHeaderDefault.style.display = 'none';
    chatRoomHeaderSelect.style.display = 'flex';
    document.querySelector('.chat-input-wrapper').style.display = 'none';
    
    if (mode === 'delete') {
        multiSelectBar.classList.add('visible');
        document.getElementById('multi-select-title').textContent = 'Chọn tin nhắn';
    } else if (mode === 'capture') {
        document.getElementById('capture-mode-bar').classList.add('visible');
        document.getElementById('multi-select-title').textContent = 'Chọn phạm vi chụp';
    }
    
    chatRoomScreen.classList.add('multi-select-active');
    selectedMessageIds.clear();
    if (initialMessageId) {
        toggleMessageSelection(initialMessageId);
    }
}

function exitMultiSelectMode() {
    isInMultiSelectMode = false;
    chatRoomHeaderDefault.style.display = 'flex';
    chatRoomHeaderSelect.style.display = 'none';
    document.querySelector('.chat-input-wrapper').style.display = 'block';
    
    multiSelectBar.classList.remove('visible');
    document.getElementById('capture-mode-bar').classList.remove('visible');
    
    chatRoomScreen.classList.remove('multi-select-active');
    selectedMessageIds.forEach(id => {
        const el = messageArea.querySelector(`.message-wrapper[data-id="${id}"]`);
        if (el) el.classList.remove('multi-select-selected');
    });
    selectedMessageIds.clear();
    currentMultiSelectMode = 'delete';
}

function toggleMessageSelection(messageId) {
    const el = messageArea.querySelector(`.message-wrapper[data-id="${messageId}"]`);
    if (!el) return;
    if (selectedMessageIds.has(messageId)) {
        selectedMessageIds.delete(messageId);
        el.classList.remove('multi-select-selected');
    } else {
        selectedMessageIds.add(messageId);
        el.classList.add('multi-select-selected');
    }
    
    if (currentMultiSelectMode === 'delete') {
        selectCount.textContent = `Đã chọn ${selectedMessageIds.size} mục`;
        deleteSelectedBtn.disabled = selectedMessageIds.size === 0;
    } else if (currentMultiSelectMode === 'capture') {
        document.getElementById('capture-select-count').textContent = `Đã chọn ${selectedMessageIds.size} mục`;
        // 截图模式下，即使没选也可以生成（虽然没意义，但保持逻辑简单），或者禁用
        // document.getElementById('generate-capture-btn').disabled = selectedMessageIds.size === 0;
    }
}

async function generateCapture() {
    if (selectedMessageIds.size === 0) return showToast('Vui lòng chọn ít nhất một tin nhắn');
    
    showToast('Đang tạo ảnh chụp, vui lòng đợi...', 3000);
    
    // 1. 获取选中的消息元素并排序
    const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
    const sortedMessages = chat.history.filter(m => selectedMessageIds.has(m.id));
    
    // 2. 创建临时容器
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '0';
    tempContainer.style.width = '400px'; // 固定宽度模拟手机
    tempContainer.style.backgroundColor = '#f5f5f5'; // 默认背景
    if (chat.chatBg) {
        tempContainer.style.backgroundImage = `url(${chat.chatBg})`;
        tempContainer.style.backgroundSize = 'cover';
        tempContainer.style.backgroundPosition = 'center';
    } else if (chat.theme) {
        // 应用主题背景色
        const theme = colorThemes[chat.theme] || colorThemes['white_pink'];
        // 这里简单处理，如果需要更精确的主题背景，可能需要更多逻辑
    }
    
    tempContainer.style.padding = '20px';
    tempContainer.style.display = 'flex';
    tempContainer.style.flexDirection = 'column';
    
    // 3. 克隆并处理消息元素
    // 为了保证样式正确，我们需要重新渲染这些消息，或者克隆现有的 DOM
    // 这里选择重新渲染，因为现有的 DOM 可能包含多选状态的样式
    
    // 临时借用 createMessageBubbleElement，但需要注意它依赖全局状态
    // 我们可以手动构建或者克隆现有的 DOM 并移除 .multi-select-selected 类
    
    sortedMessages.forEach(msg => {
        const originalEl = messageArea.querySelector(`.message-wrapper[data-id="${msg.id}"]`);
        if (originalEl) {
            const clone = originalEl.cloneNode(true);
            clone.classList.remove('multi-select-selected');
            clone.style.marginBottom = '15px';
            
            // 处理一些可能在截图时显示不正常的元素
            // 例如：如果是 HTML 气泡，iframe 可能无法被 html2canvas 捕获
            // 这里暂时不做特殊处理，html2canvas 对 iframe 支持有限
            
            tempContainer.appendChild(clone);
        }
    });
    
    // 添加水印
    
    
    document.body.appendChild(tempContainer);
    
    try {
        // 4. 生成截图
        const canvas = await html2canvas(tempContainer, {
            useCORS: true, // 允许跨域图片
            scale: 2, // 提高清晰度
            backgroundColor: null // 透明背景
        });
        
        const imgUrl = canvas.toDataURL('image/png');
        
        // 5. 显示结果
        const previewContainer = document.getElementById('capture-preview-container');
        previewContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = imgUrl;
        previewContainer.appendChild(img);
        
        // 设置下载按钮
        const downloadBtn = document.getElementById('download-capture-btn');
        if (downloadBtn) {
            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.href = imgUrl;
                link.download = `uwu_chat_${new Date().getTime()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };
        }

        document.getElementById('capture-result-modal').classList.add('visible');
        exitMultiSelectMode();
        
    } catch (error) {
        console.error('Tạo ảnh chụp thất bại:', error);
        showToast('Tạo ảnh chụp thất bại, vui lòng thử lại');
    } finally {
        document.body.removeChild(tempContainer);
    }
}

async function deleteSelectedMessages() {
    if (selectedMessageIds.size === 0) return;
    const deletedCount = selectedMessageIds.size;
    const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
    chat.history = chat.history.filter(m => !selectedMessageIds.has(m.id));

    if (currentChatType === 'private') {
        recalculateChatStatus(chat);
    }

    await saveData();
    currentPage = 1;
    renderMessages(false, true);
    renderChatList();
    exitMultiSelectMode();
    showToast(`Đã xóa ${deletedCount} tin nhắn`);
}

async function withdrawMessage(messageId) {
    const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
    if (!chat) return;

    const messageIndex = chat.history.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const message = chat.history[messageIndex];
    const messageTime = message.timestamp;
    const now = Date.now();

    if (now - messageTime > 2 * 60 * 1000) {
        showToast('Tin nhắn quá 2 phút không thể thu hồi');
        return;
    }

    message.isWithdrawn = true;

    const cleanContentMatch = message.content.match(/\[.*?的消息：([\s\S]+?)\]/);
    const cleanOriginalContent = cleanContentMatch ? cleanContentMatch[1] : message.content;
    message.originalContent = cleanOriginalContent; 

    const myName = (currentChatType === 'private') ? chat.myName : chat.me.nickname;

    message.content = `[${myName} 撤回了一条消息：${cleanOriginalContent}]`;

    if (currentChatType === 'private') {
        recalculateChatStatus(chat);
    }

    await saveData();

    currentPage = 1;
    renderMessages(false, true);
    renderChatList();
    showToast('Đã thu hồi tin nhắn');
    triggerHapticFeedback('medium');
}

function openDeleteChunkModal() {
    const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
    if (!chat || !chat.history || chat.history.length === 0) {
        showToast('Hiện không có lịch sử chat để quản lý');
        return;
    }
    const totalMessages = chat.history.length;
    const rangeInfo = document.getElementById('delete-chunk-range-info');
    rangeInfo.textContent = `Tổng số tin nhắn của chat hiện tại: ${totalMessages}`;
    
    // 计算并显示已隐藏的范围
    updateHiddenRangesInfo(chat);
    
    document.getElementById('delete-chunk-form').reset();
    document.getElementById('delete-chunk-preview-box').innerHTML = '<p style="color: #999; text-align: center; margin-top: 30px;">Nhập phạm vi để xem trước</p>';
    
    document.getElementById('delete-chunk-modal').classList.add('visible');
}

function updateHiddenRangesInfo(chat) {
    const hiddenInfo = document.getElementById('delete-chunk-hidden-info');
    if (!hiddenInfo) return;

    if (!chat.history || chat.history.length === 0) {
        hiddenInfo.textContent = '';
        return;
    }

    const ranges = [];
    let start = -1;

    for (let i = 0; i < chat.history.length; i++) {
        const isHidden = chat.history[i].isContextDisabled;
        if (isHidden) {
            if (start === -1) start = i; // Start of a range
        } else {
            if (start !== -1) {
                // End of a range
                ranges.push(start === i - 1 ? `${start + 1}` : `${start + 1}-${i}`);
                start = -1;
            }
        }
    }
    // Handle case where range goes until the end
    if (start !== -1) {
        ranges.push(start === chat.history.length - 1 ? `${start + 1}` : `${start + 1}-${chat.history.length}`);
    }

    if (ranges.length > 0) {
        hiddenInfo.textContent = `Phạm vi đang ẩn: ${ranges.join(', ')}`;
        hiddenInfo.style.display = 'block';
    } else {
        hiddenInfo.textContent = '';
        hiddenInfo.style.display = 'none';
    }
}

function generateRangePreview(chat, startIndex, endIndex) {
    const previewBox = document.getElementById('delete-chunk-preview-box');
    if (!previewBox) return;

    if (startIndex < 0 || endIndex > chat.history.length || startIndex >= endIndex) {
        previewBox.innerHTML = '<p style="color: #999; text-align: center; margin-top: 30px;">Phạm vi không hợp lệ</p>';
        return;
    }

    const messagesToPreview = chat.history.slice(startIndex, endIndex);
    const totalToPreview = messagesToPreview.length;
    let previewHtml = '';

    if (totalToPreview === 0) {
        previewBox.innerHTML = '<p style="color: #999; text-align: center; margin-top: 30px;">Phạm vi trống</p>';
        return;
    }

    const renderMsg = (msg) => {
        const contentMatch = msg.content.match(/\[.*?的消息：([\s\S]+)\]/);
        let text = contentMatch ? contentMatch[1] : msg.content;
        text = text.replace(/</g, '<').replace(/>/g, '>'); // Escape HTML
        const sender = msg.role === 'user' ? 'Tôi' : (chat.remarkName || chat.name || 'Đối phương');
        const status = msg.isContextDisabled ? ' <span style="color:red; font-size:10px;">(Đã ẩn)</span>' : '';
        return `<div style="margin-bottom:4px; padding-bottom:4px; border-bottom:1px solid #eee;">
            <span style="font-weight:600; color:#555;">${sender}</span>${status}: 
            <span style="color:#666;">${text.substring(0, 60)}${text.length > 60 ? '...' : ''}</span>
        </div>`;
    };

    if (totalToPreview <= 5) {
        previewHtml = messagesToPreview.map(renderMsg).join('');
    } else {
        const firstThree = messagesToPreview.slice(0, 3);
        const lastTwo = messagesToPreview.slice(-2);
        
        previewHtml = firstThree.map(renderMsg).join('') + 
                      `<div style="text-align: center; color: #999; margin: 8px 0; font-size: 10px;">... Tổng ${totalToPreview} tin ...</div>` + 
                      lastTwo.map(renderMsg).join('');
    }
    
    previewBox.innerHTML = previewHtml;
}

function setupDeleteHistoryChunk() {
    const deleteChunkModal = document.getElementById('delete-chunk-modal');
    const startInput = document.getElementById('delete-range-start');
    const endInput = document.getElementById('delete-range-end');
    
    // Real-time Preview Logic
    const updatePreview = () => {
        const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
        if (!chat) return;
        
        const s = parseInt(startInput.value);
        const e = parseInt(endInput.value);
        
        if (!isNaN(s) && !isNaN(e) && s > 0 && e >= s && e <= chat.history.length) {
            generateRangePreview(chat, s - 1, e);
        }
    };

    startInput.addEventListener('input', updatePreview);
    endInput.addEventListener('input', updatePreview);

    // Button Actions
    const btnBlock = document.getElementById('btn-block-range');
    const btnRestore = document.getElementById('btn-restore-range');
    const btnDelete = document.getElementById('btn-delete-range');
    
    const getRange = () => {
        const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
        const s = parseInt(startInput.value);
        const e = parseInt(endInput.value);
        if (!chat || isNaN(s) || isNaN(e) || s <= 0 || e < s || e > chat.history.length) {
            showToast('Vui lòng nhập phạm vi bắt đầu/kết thúc hợp lệ');
            return null;
        }
        return { chat, startIndex: s - 1, endIndex: e, count: e - s + 1 };
    };

    if (btnBlock) {
        btnBlock.addEventListener('click', async () => {
            const range = getRange();
            if (!range) return;
            
            let changedCount = 0;
            const modifiedIds = [];
            for (let i = range.startIndex; i < range.endIndex; i++) {
                if (!range.chat.history[i].isContextDisabled) {
                    range.chat.history[i].isContextDisabled = true;
                    modifiedIds.push(range.chat.history[i].id);
                    changedCount++;
                }
            }
            
            if (changedCount > 0) {
                await saveData();
                showToast(`Đã ẩn ${changedCount} tin nhắn`);
                // Update DOM in-place
                modifiedIds.forEach(id => {
                    const el = document.querySelector(`.message-wrapper[data-id="${id}"]`);
                    if (el) el.classList.add('context-disabled');
                });
                updateHiddenRangesInfo(range.chat);
                generateRangePreview(range.chat, range.startIndex, range.endIndex);
            } else {
                showToast('Trong phạm vi đã chọn không có tin nhắn nào cần ẩn');
            }
        });
    }

    if (btnRestore) {
        btnRestore.addEventListener('click', async () => {
            const range = getRange();
            if (!range) return;
            
            let changedCount = 0;
            const modifiedIds = [];
            for (let i = range.startIndex; i < range.endIndex; i++) {
                const msg = range.chat.history[i];
                // 检查是否为思维链消息 (isThinking 标记或内容以 <thinking> 开头)
                const isThinkingMsg = msg.isThinking || (msg.content && typeof msg.content === 'string' && msg.content.trim().startsWith('<thinking>'));
                
                if (msg.isContextDisabled && !isThinkingMsg) {
                    msg.isContextDisabled = false;
                    modifiedIds.push(msg.id);
                    changedCount++;
                }
            }
            
            if (changedCount > 0) {
                await saveData();
                showToast(`Đã khôi phục ${changedCount} tin nhắn`);
                // Update DOM in-place
                modifiedIds.forEach(id => {
                    const el = document.querySelector(`.message-wrapper[data-id="${id}"]`);
                    if (el) el.classList.remove('context-disabled');
                });
                updateHiddenRangesInfo(range.chat);
                generateRangePreview(range.chat, range.startIndex, range.endIndex);
            } else {
                showToast('Trong phạm vi đã chọn không có tin nhắn nào bị ẩn');
            }
        });
    }

    // Delete Logic (With Confirmation)
    const confirmDeleteModal = document.getElementById('delete-chunk-confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-chunk-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-chunk-btn');
    
    let pendingDeleteRange = null;

    if (btnDelete) {
        btnDelete.addEventListener('click', () => {
            const range = getRange();
            if (range) {
                pendingDeleteRange = range;
                confirmDeleteModal.classList.add('visible');
            }
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (!pendingDeleteRange) return;
            
            const { chat, startIndex, count } = pendingDeleteRange;
            chat.history.splice(startIndex, count);

            if (currentChatType === 'private') {
                recalculateChatStatus(chat);
            }

            await saveData();
            confirmDeleteModal.classList.remove('visible');
            deleteChunkModal.classList.remove('visible');
            showToast(`Đã xóa vĩnh viễn ${count} tin nhắn`);
            
            currentPage = 1;
            renderMessages(false, true);
            renderChatList();
            
            pendingDeleteRange = null;
        });
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            confirmDeleteModal.classList.remove('visible');
            pendingDeleteRange = null;
        });
    }

    document.getElementById('close-delete-modal-btn').addEventListener('click', () => {
        deleteChunkModal.classList.remove('visible');
    });
}

// 重新计算并更新角色状态
function recalculateChatStatus(chat) {
    if (!chat || !chat.history) return;
    
    // 仅针对私聊且非群聊
    // 注意：虽然函数参数叫 chat，但在调用处需确保是 private 类型或者在这里判断
    // 由于群聊没有状态栏，这里主要针对 private
    // 但为了通用性，我们可以检查 chat.realName 是否存在
    
    if (!chat.realName) return; // 简单判断，群聊通常没有单人的 realName 用于状态更新（群聊逻辑不同）

    const updateStatusRegex = new RegExp(`\\[${chat.realName}更新状态为：(.*?)\\]`);
    let foundStatus = 'Online'; // 默认状态

    // 倒序遍历历史记录
    for (let i = chat.history.length - 1; i >= 0; i--) {
        const msg = chat.history[i];
        // 忽略被撤回的消息
        if (msg.isWithdrawn) continue;

        const match = msg.content.match(updateStatusRegex);
        if (match) {
            foundStatus = match[1];
            break; // 找到最近的一个状态，停止遍历
        }
    }

    // 更新状态
    chat.status = foundStatus;
    
    // 如果当前正在该聊天室，实时更新 UI
    if (currentChatId === chat.id) {
        const statusTextEl = document.getElementById('chat-room-status-text');
        if (statusTextEl) {
            statusTextEl.textContent = foundStatus;
        }
    }
}
