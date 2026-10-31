// --- 群聊系统逻辑 (js/group_chat.js) ---

let gossipUnreadMap = {};

function setupGroupChatSystem() {
    const createGroupForm = document.getElementById('create-group-form');
    const groupSettingsForm = document.getElementById('group-settings-form');
    const createGroupModal = document.getElementById('create-group-modal');
    const memberSelectionList = document.getElementById('member-selection-list');
    const groupNameInput = document.getElementById('group-name-input');
    const groupMembersListContainer = document.getElementById('group-members-list-container');
    const addMemberActionSheet = document.getElementById('add-member-actionsheet');
    const editGroupMemberModal = document.getElementById('edit-group-member-modal');
    const editGroupMemberForm = document.getElementById('edit-group-member-form');
    const inviteExistingMemberBtn = document.getElementById('invite-existing-member-btn');
    const createNewMemberBtn = document.getElementById('create-new-member-btn');
    const inviteMemberModal = document.getElementById('invite-member-modal');
    const inviteMemberSelectionList = document.getElementById('invite-member-selection-list');
    const confirmInviteBtn = document.getElementById('confirm-invite-btn');
    const createMemberForGroupModal = document.getElementById('create-member-for-group-modal');
    const createMemberForGroupForm = document.getElementById('create-member-for-group-form');
    const groupRecipientSelectionModal = document.getElementById('group-recipient-selection-modal');
    const groupRecipientSelectionList = document.getElementById('group-recipient-selection-list');
    const confirmGroupRecipientBtn = document.getElementById('confirm-group-recipient-btn');
    const peekBtn = document.getElementById('peek-btn');

    if (peekBtn) {
        peekBtn.addEventListener('click', () => {
            if (currentChatType !== 'group') return;
            const overlay = document.getElementById('private-chat-overlay');
            overlay.classList.add('visible');
            renderPrivateChatMonitor();
            // 打开时清除全局未读状态
            peekBtn.classList.remove('has-unread');
            document.getElementById('gossip-badge').style.display = 'none';
            // 清空未读计数数据
            gossipUnreadMap = {};
        });
    }

    if (createGroupForm) {
        createGroupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const selectedMemberIds = Array.from(memberSelectionList.querySelectorAll('input:checked')).map(input => input.value);
            const groupName = groupNameInput.value.trim();
            // if (selectedMemberIds.length < 1) return showToast('请至少选择一个群成员。'); // 允许创建空群
            if (!groupName) return showToast('Vui lòng nhập tên nhóm.');
            const firstChar = db.characters.length > 0 ? db.characters[0] : null;
            const newGroup = {
                id: `group_${Date.now()}`,
                name: groupName,
                avatar: 'https://i.postimg.cc/fTLCngk1/image.jpg',
                me: {
                    nickname: (firstChar && firstChar.myName) ? firstChar.myName : 'user',
                    persona: firstChar ? firstChar.myPersona : '',
                    avatar: firstChar ? firstChar.myAvatar : 'https://i.postimg.cc/GtbTnxhP/o-o-1.jpg'
                },
                members: selectedMemberIds.map(charId => {
                    const char = db.characters.find(c => c.id === charId);
                    return {
                        id: `member_${char.id}`,
                        originalCharId: char.id,
                        realName: char.realName,
                        groupNickname: char.remarkName,
                        persona: char.persona,
                        avatar: char.avatar
                    };
                }),
                theme: 'white_pink',
                maxMemory: 100,
                chatBg: '',
                history: [],
                isPinned: false,
                unreadCount: 0,
                useCustomBubbleCss: false,
                customBubbleCss: '',
                worldBookIds: [],
                allowGossip: false,
                privateSessions: {}
            };
            db.groups.push(newGroup);
            await saveData();
            renderChatList();
            createGroupModal.classList.remove('visible');
            showToast(`Đã tạo nhóm “${groupName}” thành công!`);
        });
    }

    if (groupSettingsForm) {
        groupSettingsForm.addEventListener('submit', e => {
            e.preventDefault();
            saveGroupSettingsFromSidebar();
        });
    }

    // --- 自动保存逻辑 (Group Chat) ---
    const groupAutoSaveInputs = [
        'setting-group-name', 'setting-group-my-nickname', 'setting-group-my-persona',
        'setting-group-max-memory', 'setting-group-custom-bubble-css', 'setting-group-notice'
    ];
    groupAutoSaveInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('blur', () => saveGroupSettingsFromSidebar(false));
    });

    const groupAutoSaveChanges = [
        'setting-group-theme-color', 'setting-group-use-custom-css', 'setting-group-show-timestamp',
        'setting-group-show-notice', 'setting-group-allow-gossip', 'setting-group-avatar-radius',
        'setting-group-bilingual-mode', 'setting-group-bilingual-style', 'setting-group-exclusive-api-enabled',
        'setting-group-exclusive-api-preset-select'
    ];
    groupAutoSaveChanges.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => saveGroupSettingsFromSidebar(false));
    });

    const showGroupNoticeCheckbox = document.getElementById('setting-group-show-notice');
    const groupNoticeTextarea = document.getElementById('setting-group-notice');
    if (showGroupNoticeCheckbox && groupNoticeTextarea) {
        showGroupNoticeCheckbox.addEventListener('change', (e) => {
            groupNoticeTextarea.disabled = !e.target.checked;
        });
    }

    const useGroupCustomCssCheckbox = document.getElementById('setting-group-use-custom-css'),
        groupCustomCssTextarea = document.getElementById('setting-group-custom-bubble-css'),
        resetGroupCustomCssBtn = document.getElementById('reset-group-custom-bubble-css-btn'),
        groupPreviewBox = document.getElementById('group-bubble-css-preview');
        
    if (useGroupCustomCssCheckbox) {
        useGroupCustomCssCheckbox.addEventListener('change', (e) => {
            groupCustomCssTextarea.disabled = !e.target.checked;
            const group = db.groups.find(g => g.id === currentChatId);
            if (group) {
                const theme = colorThemes[group.theme || 'white_pink'];
                updateBubbleCssPreview(groupPreviewBox, groupCustomCssTextarea.value, !e.target.checked, theme);
            }
        });
    }
    if (groupCustomCssTextarea) {
        groupCustomCssTextarea.addEventListener('input', (e) => {
            const group = db.groups.find(g => g.id === currentChatId);
            if (group && useGroupCustomCssCheckbox.checked) {
                const theme = colorThemes[group.theme || 'white_pink'];
                updateBubbleCssPreview(groupPreviewBox, e.target.value, false, theme);
            }
        });
    }
    if (resetGroupCustomCssBtn) {
        resetGroupCustomCssBtn.addEventListener('click', () => {
            const group = db.groups.find(g => g.id === currentChatId);
            if (group) {
                groupCustomCssTextarea.value = '';
                useGroupCustomCssCheckbox.checked = false;
                groupCustomCssTextarea.disabled = true;
                const theme = colorThemes[group.theme || 'white_pink'];
                updateBubbleCssPreview(groupPreviewBox, '', true, theme);
                showToast('Đã đặt lại style về mặc định');
            }
        });
    }

    const groupAvatarUpload = document.getElementById('setting-group-avatar-upload');
    if (groupAvatarUpload) {
        groupAvatarUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const compressedUrl = await compressImage(file, {quality: 0.8, maxWidth: 400, maxHeight: 400});
                    const group = db.groups.find(g => g.id === currentChatId);
                    if (group) {
                        group.avatar = compressedUrl;
                        document.getElementById('setting-group-avatar-preview').src = compressedUrl;
                        saveGroupSettingsFromSidebar(false);
                    }
                } catch (error) {
                    showToast('Nén ảnh nhóm thất bại, vui lòng thử lại');
                }
            }
        });
    }

    const groupChatBgUpload = document.getElementById('setting-group-chat-bg-upload');
    if (groupChatBgUpload) {
        groupChatBgUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const compressedUrl = await compressImage(file, {
                        quality: 0.85,
                        maxWidth: 1080,
                        maxHeight: 1920
                    });
                    const group = db.groups.find(g => g.id === currentChatId);
                    if (group) {
                        group.chatBg = compressedUrl;
                        chatRoomScreen.style.backgroundImage = `url(${compressedUrl})`;
                        await saveData();
                        showToast('Đã đổi hình nền chat');
                    }
                } catch (error) {
                    showToast('Nén hình nền nhóm thất bại, vui lòng thử lại');
                }
            }
        });
    }

    const resetGroupChatBgBtn = document.getElementById('reset-group-chat-bg-btn');
    if (resetGroupChatBgBtn) {
        resetGroupChatBgBtn.addEventListener('click', async () => {
            const group = db.groups.find(g => g.id === currentChatId);
            if (group) {
                group.chatBg = '';
                const chatRoomScreen = document.getElementById('chat-room-screen');
                if (chatRoomScreen) chatRoomScreen.style.backgroundImage = '';
                await saveData();
                showToast('Đã khôi phục hình nền chat mặc định');
            }
        });
    }

    const clearGroupHistoryBtn = document.getElementById('clear-group-chat-history-btn');
    if (clearGroupHistoryBtn) {
        clearGroupHistoryBtn.addEventListener('click', async () => {
            const group = db.groups.find(g => g.id === currentChatId);
            if (!group) return;
            if (confirm(`Bạn chắc chắn muốn xóa toàn bộ lịch sử chat của nhóm “${group.name}”? Thao tác này không thể khôi phục!`)) {
                group.history = [];
                await saveData();
                renderMessages(false, true);
                renderChatList();
                showToast('Đã xóa lịch sử chat');
            }
        });
    }

    if (groupMembersListContainer) {
        groupMembersListContainer.addEventListener('click', e => {
            const memberDiv = e.target.closest('.group-member');
            const addBtn = e.target.closest('.add-member-btn');
            if (memberDiv) {
                openGroupMemberEditModal(memberDiv.dataset.id);
            } else if (addBtn) {
                addMemberActionSheet.classList.add('visible');
            }
        });
    }

    const editMemberAvatarPreview = document.getElementById('edit-member-avatar-preview');
    if (editMemberAvatarPreview) {
        editMemberAvatarPreview.addEventListener('click', () => {
            document.getElementById('edit-member-avatar-upload').click();
        });
    }
    
    const editMemberAvatarUpload = document.getElementById('edit-member-avatar-upload');
    if (editMemberAvatarUpload) {
        editMemberAvatarUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const compressedUrl = await compressImage(file, {quality: 0.8, maxWidth: 400, maxHeight: 400});
                    document.getElementById('edit-member-avatar-preview').src = compressedUrl;
                } catch (error) {
                    showToast('Nén ảnh đại diện thành viên thất bại, vui lòng thử lại');
                }
            }
        });
    }

    if (editGroupMemberForm) {
        editGroupMemberForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const memberId = document.getElementById('editing-member-id').value;
            const group = db.groups.find(g => g.id === currentChatId);
            const member = group.members.find(m => m.id === memberId);
            if (member) {
                member.avatar = document.getElementById('edit-member-avatar-preview').src;
                member.groupNickname = document.getElementById('edit-member-group-nickname').value;
                member.realName = document.getElementById('edit-member-real-name').value;
                member.persona = document.getElementById('edit-member-persona').value;
                await saveData();
                renderGroupMembersInSettings(group);
                document.querySelectorAll(`.message-wrapper[data-sender-id="${member.id}"] .group-nickname`).forEach(el => {
                    el.textContent = member.groupNickname;
                });
                showToast('Đã cập nhật thông tin thành viên');
            }
            editGroupMemberModal.classList.remove('visible');
        });
    }

    if (inviteExistingMemberBtn) {
        inviteExistingMemberBtn.addEventListener('click', () => {
            renderInviteSelectionList();
            inviteMemberModal.classList.add('visible');
            addMemberActionSheet.classList.remove('visible');
        });
    }
    if (createNewMemberBtn) {
        createNewMemberBtn.addEventListener('click', () => {
            createMemberForGroupForm.reset();
            document.getElementById('create-group-member-avatar-preview').src = 'https://i.postimg.cc/Y96LPskq/o-o-2.jpg';
            createMemberForGroupModal.classList.add('visible');
            addMemberActionSheet.classList.remove('visible');
        });
    }
    
    const createGroupMemberAvatarPreview = document.getElementById('create-group-member-avatar-preview');
    if (createGroupMemberAvatarPreview) {
        createGroupMemberAvatarPreview.addEventListener('click', () => {
            document.getElementById('create-group-member-avatar-upload').click();
        });
    }
    
    const createGroupMemberAvatarUpload = document.getElementById('create-group-member-avatar-upload');
    if (createGroupMemberAvatarUpload) {
        createGroupMemberAvatarUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const compressedUrl = await compressImage(file, {quality: 0.8, maxWidth: 400, maxHeight: 400});
                    document.getElementById('create-group-member-avatar-preview').src = compressedUrl;
                } catch (error) {
                    showToast('Nén ảnh đại diện thành viên mới thất bại, vui lòng thử lại');
                }
            }
        });
    }

    if (confirmInviteBtn) {
        confirmInviteBtn.addEventListener('click', async () => {
            const group = db.groups.find(g => g.id === currentChatId);
            if (!group) return;
            const selectedCharIds = Array.from(inviteMemberSelectionList.querySelectorAll('input:checked')).map(input => input.value);
            selectedCharIds.forEach(charId => {
                const char = db.characters.find(c => c.id === charId);
                if (char) {
                    const newMember = {
                        id: `member_${char.id}`,
                        originalCharId: char.id,
                        realName: char.realName,
                        groupNickname: char.remarkName,
                        persona: char.persona,
                        avatar: char.avatar
                    };
                    group.members.push(newMember);
                    sendInviteNotification(group, newMember.realName);
                }
            });
            if (selectedCharIds.length > 0) {
                await saveData();
                renderGroupMembersInSettings(group);
                renderMessages(false, true);
                showToast('Đã mời thành viên mới');
            }
            inviteMemberModal.classList.remove('visible');
        });
    }

    if (createMemberForGroupForm) {
        createMemberForGroupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const group = db.groups.find(g => g.id === currentChatId);
            if (!group) return;
            const newMember = {
                id: `member_group_only_${Date.now()}`,
                originalCharId: null,
                realName: document.getElementById('create-group-member-realname').value,
                groupNickname: document.getElementById('create-group-member-nickname').value,
                persona: document.getElementById('create-group-member-persona').value,
                avatar: document.getElementById('create-group-member-avatar-preview').src,
            };
            group.members.push(newMember);
            sendInviteNotification(group, newMember.realName);
            await saveData();
            renderGroupMembersInSettings(group);
            renderMessages(false, true);
            showToast(`Thành viên mới ${newMember.groupNickname} đã vào nhóm`);
            createMemberForGroupModal.classList.remove('visible');
        });
    }

    const settingGroupMyAvatarUpload = document.getElementById('setting-group-my-avatar-upload');
    if (settingGroupMyAvatarUpload) {
        settingGroupMyAvatarUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const compressedUrl = await compressImage(file, {quality: 0.8, maxWidth: 400, maxHeight: 400});
                    document.getElementById('setting-group-my-avatar-preview').src = compressedUrl;
                    saveGroupSettingsFromSidebar(false);
                } catch (error) {
                    showToast('Nén ảnh đại diện thất bại')
                }
            }
        });
    }

    if (confirmGroupRecipientBtn) {
        confirmGroupRecipientBtn.addEventListener('click', () => {
            const selectedRecipientIds = Array.from(groupRecipientSelectionList.querySelectorAll('input:checked')).map(input => input.value);
            if (selectedRecipientIds.length === 0) {
                return showToast('Vui lòng chọn ít nhất một người nhận.');
            }
            currentGroupAction.recipients = selectedRecipientIds;
            groupRecipientSelectionModal.classList.remove('visible');

            if (currentGroupAction.type === 'transfer') {
                document.getElementById('send-transfer-form').reset();
                document.getElementById('send-transfer-modal').classList.add('visible');
            } else if (currentGroupAction.type === 'gift') {
                document.getElementById('send-gift-form').reset();
                document.getElementById('send-gift-modal').classList.add('visible');
            }
        });
    }

    setupGossipUI();
    setupPrivateChatEditModal();
    setupGossipInput();
    setupRedPacketSystem();
}

function setupRedPacketSystem() {
    const sendRedPacketForm = document.getElementById('send-red-packet-form');
    const sendRedPacketModal = document.getElementById('send-red-packet-modal');
    const cancelRedPacketBtn = document.getElementById('cancel-red-packet-btn');

    if (cancelRedPacketBtn) {
        cancelRedPacketBtn.addEventListener('click', () => {
            sendRedPacketModal.classList.remove('visible');
        });
    }

    if (sendRedPacketForm) {
        sendRedPacketForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('red-packet-amount-input').value);
            const count = parseInt(document.getElementById('red-packet-count-input').value, 10);
            const remark = document.getElementById('red-packet-remark-input').value.trim() || 'Chúc phát tài, vạn sự như ý';
            
            if (isNaN(amount) || amount <= 0) return showToast('Vui lòng nhập số tiền hợp lệ');
            if (isNaN(count) || count <= 0) return showToast('Vui lòng nhập số lượng hợp lệ');

            const group = db.groups.find(g => g.id === currentChatId);
            if (!group) return;

            // 生成金额池
            const pool = distributeRedPacket(amount, count);

            const messageContent = `[${group.me.nickname}发出了一个拼手气红包：${amount}元；个数：${count}个；留言：${remark}]`;
            const message = {
                id: `msg_${Date.now()}`,
                role: 'user',
                type: 'red-packet',
                content: messageContent,
                totalAmount: amount,
                count: count,
                remark: remark,
                pool: pool, // 剩余的金额池
                distributions: {}, // 已分配的记录 { memberId: amount }
                isRevealed: false,
                timestamp: Date.now(),
                senderId: 'user_me'
            };

            group.history.push(message);
            if (typeof addMessageBubble === 'function') {
                addMessageBubble(message, group.id, 'group');
            }
            
            await saveData();
            sendRedPacketModal.classList.remove('visible');
            showToast('Đã gửi lì xì');
        });
    }
}

/**
 * 红包分配算法 (二倍均值法)
 * @param {number} total 总金额
 * @param {number} count 人数
 * @returns {number[]} 分配金额数组
 */
function distributeRedPacket(total, count) {
    let remain = total;
    let remainCount = count;
    const result = [];
    for (let i = 0; i < count - 1; i++) {
        // 每次分配范围：[0.01, 剩余平均值的2倍)
        let amount = Math.random() * (remain / remainCount * 2 - 0.01) + 0.01;
        amount = Math.floor(amount * 100) / 100;
        if (amount < 0.01) amount = 0.01;
        result.push(amount);
        remain -= amount;
        remainCount--;
    }
    result.push(Math.round(remain * 100) / 100);
    return result;
}

// --- Gossip Mode UI Logic ---
let activePrivateSessionId = null; // Now stores "NameA_NameB"

// 迁移旧的 privateSessions 数据到 history
window.migratePrivateSessionsToHistory = function(group) {
    if (!group.privateSessions) return;
    
    let hasChanges = false;
    Object.values(group.privateSessions).forEach(session => {
        if (session.history && session.history.length > 0) {
            session.history.forEach(msg => {
                // 检查是否已存在（通过 id）
                const exists = group.history.some(hMsg => hMsg.id === msg.id);
                if (!exists) {
                    // 转换格式
                    let newMsg = { ...msg };
                    if (msg.isEndCommand) {
                        // 已经是 [Private-End: ...] 格式，保持原样
                    } else {
                        // 需要包装成 [Private: ...]
                        const receiver = session.memberNames.find(n => n !== msg.sender);
                        if (receiver) {
                            newMsg.content = `[Private: ${msg.sender} -> ${receiver}: ${msg.content}]`;
                            newMsg.parts = [{type: 'text', text: newMsg.content}];
                        }
                    }
                    // 确保 role 正确
                    if (!newMsg.role) newMsg.role = 'assistant'; 
                    
                    group.history.push(newMsg);
                    hasChanges = true;
                }
            });
        }
    });
    
    if (hasChanges) {
        group.history.sort((a, b) => a.timestamp - b.timestamp);
    }
    
    // 迁移完成后删除旧字段
    delete group.privateSessions;
    // 注意：调用此函数后，调用者应负责执行 saveData()
};

function setupGossipUI() {
    const titleEl = document.getElementById('chat-room-title');
    const overlay = document.getElementById('private-chat-overlay');
    const closeBtn = document.getElementById('private-window-close');
    const maxBtn = document.getElementById('private-window-maximize');
    const minBtn = document.getElementById('private-window-minimize');
    const browserWindow = document.querySelector('.browser-window');

    if (titleEl) {
        titleEl.addEventListener('dblclick', () => {
            if (currentChatType !== 'group') return;
            const group = db.groups.find(g => g.id === currentChatId);
            if (!group || !group.allowGossip) return;
            
            overlay.classList.toggle('visible');
            if (overlay.classList.contains('visible')) {
                renderPrivateChatMonitor();
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('visible');
        });
    }

    if (maxBtn) {
        maxBtn.addEventListener('click', () => {
            browserWindow.classList.toggle('fullscreen');
        });
    }
    
    if (minBtn) {
        minBtn.addEventListener('click', () => {
            overlay.classList.remove('visible');
        });
    }

    // Tab switching delegation
    const tabsContainer = document.getElementById('private-chat-tabs');
    if (tabsContainer) {
        tabsContainer.addEventListener('click', (e) => {
            const tab = e.target.closest('.tab-open');
            const closeIcon = e.target.closest('.close-tab');
            
            if (closeIcon && tab) {
                e.stopPropagation();
                const sessionId = tab.dataset.id;
                closePrivateSession(sessionId);
            } else if (tab) {
                activePrivateSessionId = tab.dataset.id;
                renderPrivateChatMonitor();
            }
        });
    }
}

function renderPrivateChatMonitor() {
    const group = db.groups.find(g => g.id === currentChatId);
    if (!group) return;

    // 动态解析私聊会话
    const sessions = {}; // key: "NameA_NameB" (sorted)
    
    const privateRegex = /^\[Private: (.*?) -> (.*?): ([\s\S]+?)\]$/;
    const privateEndRegex = /^\[Private-End: (.*?) -> (.*?)\]$/;

    group.history.forEach(msg => {
        let sender, receiver, content, isEnd = false;
        
        const match = msg.content.match(privateRegex);
        const endMatch = msg.content.match(privateEndRegex);
        
        if (match) {
            sender = match[1];
            receiver = match[2];
            content = match[3];
        } else if (endMatch) {
            sender = endMatch[1];
            receiver = endMatch[2];
            isEnd = true;
        } else {
            return;
        }
        
        const members = [sender, receiver].sort();
        const key = members.join('_');
        
        if (!sessions[key]) {
            sessions[key] = {
                id: key,
                memberNames: members,
                history: [],
                status: 'active',
                lastTime: 0
            };
        }
        
        sessions[key].history.push({
            ...msg,
            displayContent: content, // 提取纯内容用于显示
            isEnd: isEnd
        });
        sessions[key].lastTime = msg.timestamp;
        
        if (isEnd) {
            sessions[key].status = 'ended';
        } else {
            sessions[key].status = 'active'; // 如果有新消息，重新激活
        }
    });

    const sessionList = Object.values(sessions).sort((a, b) => b.lastTime - a.lastTime);

    const tabsContainer = document.getElementById('private-chat-tabs');
    const contentContainer = document.getElementById('private-chat-content');
    const addressBar = document.getElementById('private-chat-title');
    const inputArea = document.getElementById('private-chat-input-area');

    // Auto-select first if none selected or selected is closed
    if (!activePrivateSessionId && sessionList.length > 0) {
        activePrivateSessionId = sessionList[0].id;
    } else if (activePrivateSessionId && !sessions[activePrivateSessionId]) {
        activePrivateSessionId = sessionList.length > 0 ? sessionList[0].id : null;
    }

    // Render Tabs
    tabsContainer.innerHTML = sessionList.map(s => {
        const isEnded = s.status === 'ended';
        return `
        <div class="tab-open ${s.id === activePrivateSessionId ? 'active' : ''}" data-id="${s.id}" style="${isEnded ? 'opacity: 0.7;' : ''}">
            <div class="rounded-l"><div class="mask-round"></div></div>
            <span>${isEnded ? '🔒 ' : ''}${s.memberNames.join(' & ')}</span>
            <div class="close-tab">✕</div>
            <div class="rounded-r"><div class="mask-round"></div></div>
        </div>
    `}).join('');

    // Render Content
    if (activePrivateSessionId && sessions[activePrivateSessionId]) {
        const session = sessions[activePrivateSessionId];
        addressBar.textContent = `Private Chat: ${session.memberNames.join(' & ')} ${session.status === 'ended' ? '(Đã kết thúc)' : ''}`;
        
        // 检查是否包含“我”
        const myName = group.me.nickname;
        const isMyChat = session.memberNames.includes(myName);
        
        if (isMyChat && session.status !== 'ended') {
            if (inputArea) inputArea.classList.add('visible');
        } else {
            if (inputArea) inputArea.classList.remove('visible');
        }

        contentContainer.innerHTML = session.history.map((msg, index) => {
            if (msg.isEnd) {
                return `<div class="private-msg system"><div class="private-msg-bubble system">-- Phiên kết thúc --</div></div>`;
            }

            // 解析发送者
            const privateMatch = msg.content.match(privateRegex);
            const sender = privateMatch ? privateMatch[1] : 'Unknown';
            
            // 如果是“我”发送的，显示在右侧；否则显示在左侧
            // 注意：对于 AI 之间的私聊，仍然保持原来的左右分布逻辑（基于 memberNames[0]）
            let alignClass = 'left';
            if (sender === myName) {
                alignClass = 'right';
            } else if (!isMyChat) {
                // AI 之间的私聊，第一个成员在左，第二个在右
                alignClass = (sender === session.memberNames[0]) ? 'left' : 'right';
            } else {
                // 与我私聊的 AI，显示在左侧
                alignClass = 'left';
            }
            
            return `
                <div class="private-msg ${alignClass}" ondblclick="window.openPrivateMsgEdit('${msg.id}')">
                    <div class="private-msg-sender">${sender}</div>
                    <div class="private-msg-bubble">${msg.displayContent}</div>
                </div>
            `;
        }).join('');
        
        // Scroll to bottom
        contentContainer.scrollTop = contentContainer.scrollHeight;
    } else {
        addressBar.textContent = 'Private Chat Monitor';
        contentContainer.innerHTML = '<div class="empty-state">Chưa có phiên chat riêng nào đang hoạt động</div>';
        if (inputArea) inputArea.classList.remove('visible');
    }
}

function closePrivateSession(sessionId) {
    if (!confirm('Chắc chắn kết thúc chủ đề chat riêng này?')) return;

    const group = db.groups.find(g => g.id === currentChatId);
    if (!group) return;
    
    // sessionId is "NameA_NameB"
    const members = sessionId.split('_');
    if (members.length !== 2) return;
    
    const [sender, receiver] = members;
    
    // 添加结束消息
    const endContent = `[Private-End: ${sender} -> ${receiver}]`;
    const endMsg = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: endContent,
        parts: [{type: 'text', text: endContent}],
        timestamp: Date.now()
    };
    
    group.history.push(endMsg);
    saveData();
    renderPrivateChatMonitor();
}

function setupGossipInput() {
    const input = document.getElementById('private-chat-input');
    if (!input) return;

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const content = input.value.trim();
            if (content) {
                sendGossipMessage(content);
                input.value = '';
            }
        }
    });
}

function sendGossipMessage(content) {
    const group = db.groups.find(g => g.id === currentChatId);
    if (!group || !activePrivateSessionId) return;

    const sessionMembers = activePrivateSessionId.split('_');
    const myName = group.me.nickname;
    
    // 确定接收者
    const targetName = sessionMembers.find(n => n !== myName);
    if (!targetName) return; // 异常情况

    const fullContent = `[Private: ${myName} -> ${targetName}: ${content}]`;
    
    const message = {
        id: `msg_${Date.now()}`,
        role: 'user', // 标记为用户发送
        content: fullContent,
        parts: [{type: 'text', text: fullContent}],
        timestamp: Date.now()
    };

    group.history.push(message);
    saveData();
    renderPrivateChatMonitor();
    
    // 注意：此处不自动触发 getAiReply，等待用户在主界面操作
}

// --- Private Chat Editing Logic ---
let editingPrivateMsgId = null;

function setupPrivateChatEditModal() {
    if (document.getElementById('private-msg-edit-modal')) return;

    const modalHTML = `
    <div id="private-msg-edit-modal" class="modal-overlay">
        <div class="modal-window">
            <h3>Sửa tin nhắn riêng</h3>
            <form id="private-msg-edit-form">
                <div class="form-group">
                    <textarea id="private-msg-edit-textarea" rows="6" style="width:100%; resize:vertical; padding:10px; border-radius:8px; border:1px solid #ddd;"></textarea>
                </div>
                <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:15px;">
                    <button type="button" class="btn btn-neutral btn-small" id="private-msg-cancel-btn">Hủy</button>
                    <button type="button" class="btn btn-danger btn-small" id="private-msg-delete-btn">Xóa</button>
                    <button type="submit" class="btn btn-primary btn-small">Lưu</button>
                </div>
            </form>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('private-msg-edit-form').addEventListener('submit', (e) => {
        e.preventDefault();
        savePrivateMsgEdit();
    });

    document.getElementById('private-msg-cancel-btn').addEventListener('click', () => {
        document.getElementById('private-msg-edit-modal').classList.remove('visible');
        editingPrivateMsgId = null;
    });

    document.getElementById('private-msg-delete-btn').addEventListener('click', () => {
        if (confirm('Chắc chắn xóa tin nhắn riêng này?')) {
            deletePrivateMsg();
        }
    });
}

window.openPrivateMsgEdit = function(msgId) {
    const group = db.groups.find(g => g.id === currentChatId);
    if (!group) return;
    
    const msg = group.history.find(m => m.id === msgId);
    if (!msg) return;

    editingPrivateMsgId = msgId;

    // 提取纯内容用于编辑
    const privateRegex = /^\[Private: (.*?) -> (.*?): ([\s\S]+?)\]$/;
    const match = msg.content.match(privateRegex);
    const displayContent = match ? match[3] : msg.content;

    document.getElementById('private-msg-edit-textarea').value = displayContent;
    document.getElementById('private-msg-edit-modal').classList.add('visible');
    document.getElementById('private-msg-edit-textarea').focus();
};

window.savePrivateMsgEdit = function() {
    if (!editingPrivateMsgId) return;
    
    const newContent = document.getElementById('private-msg-edit-textarea').value;
    const group = db.groups.find(g => g.id === currentChatId);
    
    if (group) {
        const msg = group.history.find(m => m.id === editingPrivateMsgId);
        if (msg) {
            // 重新包装
            const privateRegex = /^\[Private: (.*?) -> (.*?): ([\s\S]+?)\]$/;
            const match = msg.content.match(privateRegex);
            if (match) {
                const sender = match[1];
                const receiver = match[2];
                msg.content = `[Private: ${sender} -> ${receiver}: ${newContent}]`;
                msg.parts = [{type: 'text', text: msg.content}];
                
                saveData();
                renderPrivateChatMonitor();
                document.getElementById('private-msg-edit-modal').classList.remove('visible');
                showToast('Đã cập nhật tin nhắn riêng');
            }
        }
    }
    
    editingPrivateMsgId = null;
};

window.deletePrivateMsg = function() {
    if (!editingPrivateMsgId) return;
    
    const group = db.groups.find(g => g.id === currentChatId);
    
    if (group) {
        group.history = group.history.filter(m => m.id !== editingPrivateMsgId);
        saveData();
        renderPrivateChatMonitor();
        document.getElementById('private-msg-edit-modal').classList.remove('visible');
        showToast('Đã xóa tin nhắn riêng');
    }
    
    editingPrivateMsgId = null;
};

// 处理来自 AI 的私聊消息
function handleGossipMessage(group, content) {
    const privateRegex = /^\[Private: (.*?) -> (.*?): ([\s\S]+?)\]$/;
    const privateEndRegex = /^\[Private-End: (.*?) -> (.*?)\]$/;

    const privateMatch = content.match(privateRegex);
    const endMatch = content.match(privateEndRegex);

    if (privateMatch) {
        const sender = privateMatch[1];
        const receiver = privateMatch[2];
        const members = [sender, receiver].sort();
        const sessionId = members.join('_');
        
        const overlay = document.getElementById('private-chat-overlay');
        const isOverlayVisible = overlay.classList.contains('visible');

        // 如果窗口未打开，或者打开了但不是当前会话 -> 增加未读
        if (!isOverlayVisible || activePrivateSessionId !== sessionId) {
            gossipUnreadMap[sessionId] = (gossipUnreadMap[sessionId] || 0) + 1;
            
            // 更新全局入口按钮状态
            const btn = document.getElementById('peek-btn');
            const badge = document.getElementById('gossip-badge');
            if (btn && badge) {
                btn.classList.add('has-unread');
                badge.style.display = 'block';
            }
        }

        // UI Update if monitor is open
        if (isOverlayVisible) {
            renderPrivateChatMonitor();
        }
        return false; // 不拦截，让它进入 history
    }
    
    if (endMatch) {
        if (document.getElementById('private-chat-overlay').classList.contains('visible')) {
            renderPrivateChatMonitor();
        }
        return false; // 不拦截
    }

    return false;
}

function renderMemberSelectionList() {
    const memberSelectionList = document.getElementById('member-selection-list');
    if (!memberSelectionList) return;
    memberSelectionList.innerHTML = '';
    if (db.characters.length === 0) {
        memberSelectionList.innerHTML = '<li style="color:#aaa; text-align:center; padding: 10px 0;">Không có persona nào để chọn.</li>';
        return;
    }
    db.characters.forEach(char => {
        const li = document.createElement('li');
        li.className = 'member-selection-item';
        li.innerHTML = `<input type="checkbox" id="select-${char.id}" value="${char.id}"><img src="${char.avatar}" alt="${char.remarkName}"><label for="select-${char.id}">${char.remarkName}</label>`;
        memberSelectionList.appendChild(li);
    });
}

function loadGroupSettingsToSidebar() {
    const group = db.groups.find(g => g.id === currentChatId);
    if (!group) return;
    const themeSelect = document.getElementById('setting-group-theme-color');
    if (themeSelect.options.length === 0) {
        Object.keys(colorThemes).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = colorThemes[key].name;
            themeSelect.appendChild(option);
        });
    }
    document.getElementById('setting-group-avatar-preview').src = group.avatar;
    document.getElementById('setting-group-name').value = group.name;
    document.getElementById('setting-group-my-avatar-preview').src = group.me.avatar;
    document.getElementById('setting-group-my-nickname').value = group.me.nickname;
    document.getElementById('setting-group-my-persona').value = group.me.persona;
    themeSelect.value = group.theme || 'white_pink';
    document.getElementById('setting-group-max-memory').value = group.maxMemory;
    
    // --- 关联世界书 ---
    if (typeof renderBoundWorldBooks === 'function') {
        renderBoundWorldBooks('group', group.worldBookIds || []);
    }

    document.getElementById('setting-group-title-layout').value = group.titleLayout || 'left';
    document.getElementById('setting-group-show-timestamp').checked = group.showTimestamp || false;
    document.getElementById('setting-group-timestamp-style').value = group.timestampStyle || 'bubble';
    document.getElementById('setting-group-allow-gossip').checked = group.allowGossip || false;

    // 专属模型
    const groupExclusiveApiSwitch = document.getElementById('setting-group-exclusive-api-enabled');
    const groupExclusiveApiContainer = document.getElementById('setting-group-exclusive-api-container');
    const groupExclusiveApiPresetSelect = document.getElementById('setting-group-exclusive-api-preset-select');
    
    if (groupExclusiveApiSwitch && groupExclusiveApiContainer && groupExclusiveApiPresetSelect) {
        groupExclusiveApiSwitch.checked = group.exclusiveApiEnabled || false;
        groupExclusiveApiContainer.style.display = group.exclusiveApiEnabled ? 'flex' : 'none';
        
        // 填充预设列表
        groupExclusiveApiPresetSelect.innerHTML = '<option value="">Vui lòng chọn preset</option>';
        const presets = db.apiPresets || [];
        presets.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.name;
            opt.textContent = p.name;
            groupExclusiveApiPresetSelect.appendChild(opt);
        });
        
        groupExclusiveApiPresetSelect.value = group.exclusiveApiPreset || '';
    }

    const bilingualModeCheckbox = document.getElementById('setting-group-bilingual-mode');
    const bilingualStyleSelect = document.getElementById('setting-group-bilingual-style');
    const bilingualStyleContainer = document.getElementById('setting-group-bilingual-style-container');
    
    if (bilingualModeCheckbox && bilingualStyleSelect) {
        bilingualModeCheckbox.checked = group.bilingualModeEnabled || false;
        bilingualStyleSelect.value = group.bilingualBubbleStyle || 'under';
        
        if (bilingualStyleContainer) {
            bilingualStyleContainer.style.display = group.bilingualModeEnabled ? 'flex' : 'none';
        }
        
        // 移除旧的监听器以防重复绑定 (虽然 loadGroupSettingsToSidebar 通常每次打开都会调用，但最好保持干净)
        const newCheckbox = bilingualModeCheckbox.cloneNode(true);
        bilingualModeCheckbox.parentNode.replaceChild(newCheckbox, bilingualModeCheckbox);
        
        newCheckbox.addEventListener('change', (e) => {
            if (bilingualStyleContainer) {
                bilingualStyleContainer.style.display = e.target.checked ? 'flex' : 'none';
            }
            saveGroupSettingsFromSidebar(false);
        });
    }

    const avatarRadius = group.avatarRadius !== undefined ? group.avatarRadius : 50;
    document.getElementById('setting-group-avatar-radius').value = avatarRadius;
    document.getElementById('setting-group-avatar-radius-value').textContent = `${avatarRadius}%`;
    
    const radiusSlider = document.getElementById('setting-group-avatar-radius');
    const radiusValue = document.getElementById('setting-group-avatar-radius-value');
    radiusSlider.oninput = () => {
        radiusValue.textContent = `${radiusSlider.value}%`;
    };

    // --- 群公告设置 ---
    const showNoticeCheckbox = document.getElementById('setting-group-show-notice');
    const noticeTextarea = document.getElementById('setting-group-notice');
    if (showNoticeCheckbox && noticeTextarea) {
        showNoticeCheckbox.checked = group.showNotice || false;
        noticeTextarea.value = group.notice || '';
        noticeTextarea.disabled = !group.showNotice;
    }

    renderGroupMembersInSettings(group);

    // --- 渲染群聊表情包分组 ---
    const stickerGroupsContainer = document.getElementById('setting-group-sticker-groups-container');
    if (stickerGroupsContainer) {
        stickerGroupsContainer.innerHTML = '';
        const allGroups = [...new Set(db.myStickers.map(s => s.group || '未分类'))].filter(g => g);
        const groupStickerGroups = (group.stickerGroups || '').split(/[,，]/).map(s => s.trim());

        if (allGroups.length === 0) {
            stickerGroupsContainer.innerHTML = '<span style="color:#999; font-size:12px;">Chưa có nhóm sticker nào, vui lòng thêm trong Quản lý sticker trước.</span>';
        } else {
            allGroups.forEach(g => {
                const tag = document.createElement('div');
                tag.className = 'sticker-group-tag';
                if (groupStickerGroups.includes(g)) {
                    tag.classList.add('selected');
                }
                tag.textContent = g;
                tag.dataset.group = g;
                
                tag.addEventListener('click', () => {
                    tag.classList.toggle('selected');
                });
                
                stickerGroupsContainer.appendChild(tag);
            });
        }
    }

    const useGroupCustomCssCheckbox = document.getElementById('setting-group-use-custom-css'),
        groupCustomCssTextarea = document.getElementById('setting-group-custom-bubble-css'),
        groupPreviewBox = document.getElementById('group-bubble-css-preview');
    useGroupCustomCssCheckbox.checked = group.useCustomBubbleCss || false;
    groupCustomCssTextarea.value = group.customBubbleCss || '';
    groupCustomCssTextarea.disabled = !useGroupCustomCssCheckbox.checked;

    // 初始化群聊 CSS 搜索替换工具栏
    if (typeof initTextareaSearchReplace === 'function') {
        initTextareaSearchReplace('group-css-toolbar', 'setting-group-custom-bubble-css');
    }

    const theme = colorThemes[group.theme || 'white_pink'];
    updateBubbleCssPreview(groupPreviewBox, group.customBubbleCss, !group.useCustomBubbleCss, theme);
    populateBubblePresetSelect('group-bubble-preset-select');

    // 触发群设置引导 (连续引导)
    if (window.GuideSystem) {
        window.GuideSystem.check('guide_group_notice', () => {
            // 当群公告引导结束后，触发私聊引导
            window.GuideSystem.check('guide_group_gossip');
        });
    }
}

function renderGroupMembersInSettings(group) {
    const groupMembersListContainer = document.getElementById('group-members-list-container');
    if (!groupMembersListContainer) return;
    groupMembersListContainer.innerHTML = '';
    group.members.forEach(member => {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'group-member';
        memberDiv.dataset.id = member.id;
        memberDiv.innerHTML = `<img src="${member.avatar}" alt="${member.groupNickname}"><span>${member.groupNickname}</span>`;
        groupMembersListContainer.appendChild(memberDiv);
    });
    const addBtn = document.createElement('div');
    addBtn.className = 'add-member-btn';
    addBtn.innerHTML = `<div class="add-icon">+</div><span>Thêm</span>`;
    groupMembersListContainer.appendChild(addBtn);
}

function renderGroupRecipientSelectionList(actionText) {
    const group = db.groups.find(g => g.id === currentChatId);
    if (!group) return;
    const groupRecipientSelectionTitle = document.getElementById('group-recipient-selection-title');
    const groupRecipientSelectionList = document.getElementById('group-recipient-selection-list');
    
    groupRecipientSelectionTitle.textContent = actionText;
    groupRecipientSelectionList.innerHTML = '';
    group.members.forEach(member => {
        const li = document.createElement('li');
        li.className = 'group-recipient-select-item';
        li.innerHTML = `
                <input type="checkbox" id="recipient-select-${member.id}" value="${member.id}">
                <label for="recipient-select-${member.id}">
                    <img src="${member.avatar}" alt="${member.groupNickname}">
                    <span>${member.groupNickname}</span>
                </label>`;
        groupRecipientSelectionList.appendChild(li);
    });
}

async function saveGroupSettingsFromSidebar(showToastFlag = true) {
    const group = db.groups.find(g => g.id === currentChatId);
    if (!group) return;
    const oldName = group.name;
    const newName = document.getElementById('setting-group-name').value;
    if (oldName !== newName) {
        group.name = newName;
        sendRenameNotification(group, newName);
    }
    group.avatar = document.getElementById('setting-group-avatar-preview').src;
    group.me.avatar = document.getElementById('setting-group-my-avatar-preview').src;
    group.me.nickname = document.getElementById('setting-group-my-nickname').value;
    group.me.persona = document.getElementById('setting-group-my-persona').value;

    const selectedGroups = Array.from(document.querySelectorAll('#setting-group-sticker-groups-container .sticker-group-tag.selected'))
        .map(tag => tag.dataset.group)
        .join(',');
    group.stickerGroups = selectedGroups;

    group.theme = document.getElementById('setting-group-theme-color').value;
    group.maxMemory = document.getElementById('setting-group-max-memory').value;
    
    const groupExclusiveApiSwitch = document.getElementById('setting-group-exclusive-api-enabled');
    if (groupExclusiveApiSwitch) {
        group.exclusiveApiEnabled = groupExclusiveApiSwitch.checked;
        group.exclusiveApiPreset = document.getElementById('setting-group-exclusive-api-preset-select').value;
    }

    group.useCustomBubbleCss = document.getElementById('setting-group-use-custom-css').checked;
    group.customBubbleCss = document.getElementById('setting-group-custom-bubble-css').value;
    
    group.titleLayout = document.getElementById('setting-group-title-layout').value;
    const header = document.getElementById('chat-room-header-default');
    if (group.titleLayout === 'center') {
        header.classList.add('title-centered');
    } else {
        header.classList.remove('title-centered');
    }

    group.avatarRadius = parseInt(document.getElementById('setting-group-avatar-radius').value, 10);

    group.showTimestamp = document.getElementById('setting-group-show-timestamp').checked;
    group.timestampStyle = document.getElementById('setting-group-timestamp-style').value;
    
    const oldAllowGossip = group.allowGossip || false;
    const newAllowGossip = document.getElementById('setting-group-allow-gossip').checked;
    
    if (oldAllowGossip !== newAllowGossip) {
        group.allowGossip = newAllowGossip;
        const sysContent = newAllowGossip 
            ? `[system: Nhóm này cho phép “thành viên chat riêng với nhau”. (Dòng này không hiển thị, không cần phản hồi, hãy tiếp tục chat trong nhóm một cách tự nhiên)]`
            : `[system: 本群已关闭“群成员私聊”。请停止所有私聊，禁止再发送任何私聊格式的消息。（本条不可见，无需做出回应，请自然地继续群内聊天）]`;
            
        const sysMsg = {
            id: `msg_${Date.now()}`,
            role: 'system', // 使用 system role
            content: sysContent,
            parts: [{type: 'text', text: sysContent}],
            timestamp: Date.now()
        };
        group.history.push(sysMsg);
    } else {
        group.allowGossip = newAllowGossip;
    }
    
    group.bilingualModeEnabled = document.getElementById('setting-group-bilingual-mode').checked;
    group.bilingualBubbleStyle = document.getElementById('setting-group-bilingual-style').value;

    // --- 保存群公告 ---
    group.showNotice = document.getElementById('setting-group-show-notice').checked;
    group.notice = document.getElementById('setting-group-notice').value;
    
    const chatScreen = document.getElementById('chat-room-screen');
    if (group.showTimestamp) {
        chatScreen.classList.add('show-timestamp');
    } else {
        chatScreen.classList.remove('show-timestamp');
    }
    chatScreen.classList.remove('timestamp-side');

    chatScreen.classList.remove('timestamp-style-bubble', 'timestamp-style-avatar');
    chatScreen.classList.add(`timestamp-style-${group.timestampStyle || 'bubble'}`);

    // updateCustomBubbleStyle(currentChatId, group.customBubbleCss, group.useCustomBubbleCss); // 移除实时应用以防污染设置页
    await saveData();
    if (showToastFlag) showToast('Đã lưu cài đặt nhóm!');
    chatRoomTitle.textContent = group.name;
    renderChatList();
    renderMessages(false, true);
}

function openGroupMemberEditModal(memberId) {
    const group = db.groups.find(g => g.id === currentChatId);
    const member = group.members.find(m => m.id === memberId);
    if (!member) return;
    document.getElementById('edit-group-member-title').textContent = `Sửa ${member.groupNickname}`;
    document.getElementById('editing-member-id').value = member.id;
    document.getElementById('edit-member-avatar-preview').src = member.avatar;
    document.getElementById('edit-member-group-nickname').value = member.groupNickname;
    document.getElementById('edit-member-real-name').value = member.realName;
    document.getElementById('edit-member-persona').value = member.persona;
    document.getElementById('edit-group-member-modal').classList.add('visible');
}

function renderInviteSelectionList() {
    const inviteMemberSelectionList = document.getElementById('invite-member-selection-list');
    const confirmInviteBtn = document.getElementById('confirm-invite-btn');
    if (!inviteMemberSelectionList) return;
    inviteMemberSelectionList.innerHTML = '';
    const group = db.groups.find(g => g.id === currentChatId);
    if (!group) return;
    const currentMemberCharIds = new Set(group.members.map(m => m.originalCharId));
    const availableChars = db.characters.filter(c => !currentMemberCharIds.has(c.id));
    if (availableChars.length === 0) {
        inviteMemberSelectionList.innerHTML = '<li style="color:#aaa; text-align:center; padding: 10px 0;">Không còn thành viên mới nào để mời.</li>';
        confirmInviteBtn.disabled = true;
        return;
    }
    confirmInviteBtn.disabled = false;
    availableChars.forEach(char => {
        const li = document.createElement('li');
        li.className = 'invite-member-select-item';
        li.innerHTML = `<input type="checkbox" id="invite-select-${char.id}" value="${char.id}"><label for="invite-select-${char.id}"><img src="${char.avatar}" alt="${char.remarkName}"><span>${char.remarkName}</span></label>`;
        inviteMemberSelectionList.appendChild(li);
    });
}

function sendInviteNotification(group, newMemberRealName) {
    const messageContent = `[${group.me.nickname}邀请${newMemberRealName}加入了群聊]`;
    const message = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: messageContent,
        parts: [{type: 'text', text: messageContent}],
        timestamp: Date.now(),
        senderId: 'user_me'
    };
    group.history.push(message);
}

function sendRenameNotification(group, newName) {
    const myName = group.me.nickname;
    const messageContent = `[${myName}修改群名为：${newName}]`;
    const message = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: messageContent,
        parts: [{type: 'text', text: messageContent}],
        timestamp: Date.now()
    };
    group.history.push(message);
}

function generateGroupSystemPrompt(group) {
    const worldBooksBefore = (group.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'before')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');
    const worldBooksAfter = (group.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'after')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');
    const worldBooksGuidelines = (group.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'guidelines')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');

    let prompt = `Bạn đang nhập vai trong một nhóm chat tên “${group.name}” trên ứng dụng chat online tên “404”. Hãy tuân thủ nghiêm ngặt mọi quy tắc sau:\n\n`;

    if (worldBooksBefore) {
        prompt += `${worldBooksBefore}\n\n`;
    }

    const favoritedJournals = (group.memoryJournals || [])
        .filter(j => j.isFavorited)
        .map(j => `Tiêu đề:${j.title}\nNội dung:${j.content}`)
        .join('\n\n---\n\n');

    if (favoritedJournals) {
        prompt += `【Kỷ niệm/tóm tắt quan trọng của nhóm】\nĐây là bối cảnh chuyện cũ của nhóm mà bạn cần nhớ:\n${favoritedJournals}\n\n`;
    }

    prompt += `1. **Nhiệm vụ cốt lõi**: bạn cần đồng thời đóng vai **tất cả** thành viên AI trong nhóm này. Tôi là người dùng con người duy nhất (“tôi”, biệt danh: ${group.me.nickname}) tương tác với các bạn.\n\n`;
    prompt += `2. **Danh sách thành viên nhóm**: dưới đây là tất cả nhân vật bạn cần đóng và thông tin của tôi:\n`;
    prompt += `   - **Tôi (người dùng)**: \n     - Biệt danh trong nhóm: ${group.me.nickname}\n     - Persona của tôi: ${group.me.persona || 'Không có persona cụ thể'}\n`;
    group.members.forEach(member => {
        prompt += `   - **Nhân vật: ${member.realName} (AI)**\n`;
        prompt += `     - Biệt danh trong nhóm: ${member.groupNickname}\n`;
        prompt += `     - Persona: ${member.persona || 'Không có persona cụ thể'}\n`;
    });

    // --- 插入群公告 ---
    if (group.showNotice && group.notice && group.notice.trim()) {
        prompt += `\n【Thông báo nhóm/bối cảnh cốt truyện hiện tại】\n${group.notice}\n(Gợi ý hệ thống: đây là thông tin ghim quan trọng của nhóm, mọi thành viên đều đã biết, hãy tương tác dựa trên bối cảnh này.)\n`;
    }

    if (worldBooksAfter) {
        prompt += `\n${worldBooksAfter}\n`;
    }
    if (worldBooksGuidelines) {
        prompt += `\n${worldBooksGuidelines}\n`;
    }
    prompt += `\n`;

    prompt += `3. **Giải thích định dạng tin nhắn của tôi**: tin nhắn của tôi (người dùng) có nhiều định dạng, bạn cần hiểu ý nghĩa của chúng và để các thành viên phản ứng tương ứng:\n`;
    prompt += `   - \`[${group.me.nickname}的消息：...]\`: Tin nhắn chat thường của tôi.\n`;
    prompt += `   - \`[${group.me.nickname} cho {tên thật của một thành viên} 转账：...]\`: Tôi đã chuyển khoản cho một thành viên cụ thể.\n`;
    prompt += `   - \`[${group.me.nickname} cho {tên thật của một thành viên} 送来了礼物：...]\`: Tôi đã tặng quà cho một thành viên cụ thể.\n`;
    prompt += `   - \`[${group.me.nickname}的表情包：...]\`, \`[${group.me.nickname}的语音：...]\`, \`[${group.me.nickname}发来的照片/视频：...]\`: Tôi đã gửi một loại tin đặc biệt, thành viên có thể bình luận về nó.\n`;
    prompt += `   - \`[system: ...]\`, \`[...邀请...加入了群聊]\`, \`[...修改群名为...]\`: Thông báo hệ thống hoặc sự kiện, thành viên nên phản ứng theo đó, ví dụ chào người mới, bàn về tên nhóm mới…\n\n`;

    // --- 表情包逻辑 ---
    const groups = (group.stickerGroups || '').split(/[,，]/).map(s => s.trim()).filter(s => s && s !== '未分类');
    let stickerInstruction = '';
    let canUseStickers = false;
    if (groups.length > 0) {
        const availableStickers = db.myStickers.filter(s => groups.includes(s.group));
        if (availableStickers.length > 0) {
            const stickerNames = availableStickers.map(s => s.name).join(', ');
            stickerInstruction = `   - **Sticker có thể dùng**: các bạn có thể dùng những sticker sau để thể hiện cảm xúc:[${stickerNames}]。\n`;
            canUseStickers = true;
        }
    }
    prompt += stickerInstruction;

    let outputFormats = `
- **Tin nhắn thường**: \`[{tên thật thành viên}的消息：{消息内容}]\``;

    if (canUseStickers) {
        outputFormats += `\n- **Sticker**: \`[{tên thật thành viên}发送的表情包：{表情包名称}]\`. Ví dụ:\`[{tên thật thành viên}发送的表情包：开心]\`。`;
    }

    outputFormats += `
- **thoại**: \`[{tên thật thành viên}的语音：{语音转述的文字}]\`
- **Ảnh/video**: \`[{tên thật thành viên}发来的照片/视频：{mô tả nội dung}]\`
- **Chuyển khoản**: \`[{tên thật người gửi} cho {接收者真名} 转账：{số tiền}元；备注：{备注}]\``;

    if (group.allowGossip) {
        outputFormats += `
- **Tin nhắn riêng**: \`[Private: {tên thật người gửi} -> {接收者真名}: {nội dung}]\``;
    }
   
   const allWorldBookContent = worldBooksBefore + '\n' + worldBooksAfter;
   if (allWorldBookContent.includes('<orange>')) {
       outputFormats += `\n   - **HTMLTin nhắn**: \`<orange char="{tên thật thành viên}">{HTMLnội dung}</orange>\`. Đây là loại tin thẻ nhỏ đặc biệt để hiển thị style phong phú, bạn có thể dùng nó để tạo tương tác thú vị hơn. Lưu ý điền **tên thật** của thành viên vào \`char\` thuộc tính.`;
   }
   
    prompt += `4. **Định dạng đầu ra của bạn (cực kỳ quan trọng)**: mỗi tin bạn tạo ra đều **bắt buộc** tuân thủ đúng một trong các định dạng sau. Mỗi tin một dòng. Giữ nguyên y hệt các nhãn tiếng Trung trong ngoặc vuông (như 的消息：), phần nội dung viết bằng tiếng Việt. Hãy điền **tên thật** của thành viên vào \`{tên thật thành viên}\`。\n${outputFormats}\n\n`;
    
    if (group.bilingualModeEnabled) {
        prompt += `✨Chỉ lệnh đặc biệt cho chế độ song ngữ✨: khi tiếng mẹ đẻ của thành viên không phải tiếng Việt, tin trả lời của họ **bắt buộc** phải tuân thủ đúng định dạng tin nhắn thường ở chế độ song ngữ:\`[{tên thật thành viên}的消息：{nguyên văn tiếng nước ngoài}「bản dịch tiếng Việt」]\`. Ví dụ: \`[Alice的消息：Of course, I'd love to.「Tất nhiên rồi, mình rất sẵn lòng.」]\`. Phần dịch tiếng Việt được xem là hệ thống tự dịch, không phải lời gốc của nhân vật. Khi nhân vật muốn nói tiếng Việt, hãy dùng định dạng chuẩn:\`[{tên thật thành viên}的消息：{中文消息内容}]\`. Quy tắc này có ưu tiên rất cao, nhất định phải tuân thủ.\n\n`;
    }

    prompt += `   - **Quan trọng**: chat nhóm không hỗ trợ lệnh đặc biệt để thành viên AI nhận/trả lại chuyển khoản hoặc nhận quà (tức là bạn không được gửi[已接收]), nhưng có thể nói lời cảm ơn), cũng không hỗ trợ cập nhật trạng thái. Bạn chỉ cần đáp lại chuyển khoản hoặc quà tôi gửi bằng tin nhắn thường.\n\n`;

    prompt += `5. **Mô phỏng không khí nhóm**: để nhóm chat trông thật, sôi nổi và hỗn loạn, mỗi lần trả lời bạn đều phải tuân theo các yêu cầu ngẫu nhiên sau:\n`;
    const numMembers = group.members.length;
    const minMessages = numMembers * 2;
    const maxMessages = numMembers * 4;
    prompt += `   - **Số lượng tin**: câu trả lời của bạn cần có **${minMessages} đến ${maxMessages} tin** (tức trung bình mỗi thành viên 2-4 tin). Đảm bảo đủ tương tác.\n`;
    prompt += `   - **Người nói và thứ tự ngẫu nhiên**: chọn ngẫu nhiên thành viên lên tiếng, thứ tự cũng phải ngẫu nhiên, đừng lần lượt theo thứ tự cố định.\n`;
    prompt += `   - **Nội dung đa dạng**: câu trả lời chủ yếu là tin chữ thường, nhưng có thể **thỉnh thoảng, có chọn lọc** cho một thành viên gửi tin đặc biệt (sticker, tin thoại, ảnh/video) để tăng độ chân thật. Đừng lạm dụng tin đặc biệt.\n`;
    prompt += `   - **Mạch hội thoại**: dù người nói ngẫu nhiên, nội dung hội thoại vẫn phải xoay quanh lời của tôi và các thành viên khác, giữ được logic nhất định.\n\n`;

    // --- 检查未结算红包 ---
    const unrevealedRedPacket = group.history.find(m => m.type === 'red-packet' && !m.isRevealed);
    if (unrevealedRedPacket) {
        // 在这里进行 AI 的分配
        const aiMembers = group.members;
        const pool = unrevealedRedPacket.pool || [];
        const distributions = unrevealedRedPacket.distributions || {};
        
        // 随机打乱 AI 成员顺序，以便随机分配
        const shuffledAiMembers = [...aiMembers].sort(() => Math.random() - 0.5);
        
        shuffledAiMembers.forEach(m => {
            if (pool.length > 0 && !distributions[m.id]) {
                const randomIndex = Math.floor(Math.random() * pool.length);
                const grabbedAmount = pool.splice(randomIndex, 1)[0];
                distributions[m.id] = grabbedAmount;
            }
        });
        
        // 更新 message 对象
        unrevealedRedPacket.pool = pool;
        unrevealedRedPacket.distributions = distributions;

        let rpInfo = `\n【🧧 Nhắc chia lì xì ẩn】\nTôi vừa gửi một bao lì xì may mắn tổng ${unrevealedRedPacket.totalAmount} tệ, gồm ${unrevealedRedPacket.count} phần. Hệ thống đã tự chia số tiền giành được cho từng thành viên:\n`;
        
        if (distributions['user_me']) {
            rpInfo += `- ${group.me.nickname} (tôi) giành được ${distributions['user_me']} tệ\n`;
        }
        
        group.members.forEach(m => {
            const amount = distributions[m.id];
            if (amount !== undefined) {
                rpInfo += `- ${m.realName} giành được ${amount} tệ\n`;
            } else {
                rpInfo += `- ${m.realName} không giành được lì xì\n`;
            }
        });
        
        if (pool.length > 0) {
            const remainingAmount = pool.reduce((a, b) => a + b, 0).toFixed(2);
            rpInfo += `(Còn ${pool.length} bao lì xì chưa ai nhận, tổng số tiền còn lại ${remainingAmount} tệ)\n`;
        }
        
        rpInfo += `(Gợi ý hệ thống: đây là sự kiện thật vừa xảy ra, các thành viên hãy tự nhiên thể hiện phản ứng sau khi giành được (hoặc không giành được) lì xì trong các tin trả lời tiếp theo, ai giành được phải nhắc số tiền cụ thể mình giành được, người vui, người chê ít, ai không giành được có thể than thở, cho tương tác thêm vui.)\n`;
        prompt += rpInfo;
    }

    prompt += `6. **Nguyên tắc hành xử**:\n`;
    prompt += `   - **Phản ứng với sự kiện công khai (quan trọng)**: khi tôi (người dùng) chuyển khoản hoặc tặng quà cho **một** thành viên trong nhóm, đây là sự kiện **cả nhóm đều thấy**. Ngoài thành viên được nhận có thể cảm ơn, **các thành viên AI khác cũng nên để ý**, và phản ứng theo persona của mình. Ví dụ họ có thể ghen tị, chúc mừng, tò mò, đùa giỡn hoặc hùa theo. Điều này giúp không khí nhóm thật và náo nhiệt hơn.\n`;
    
    if (group.allowGossip) {
        prompt += `   - **Chế độ chat riêng trong nhóm**: đây là cơ chế cốt truyện đặc biệt. Các thành viên có thể bắt đầu “chat riêng” với nhau, nội dung này **các thành viên khác không thấy**, cũng không được làm rối dòng thời gian của nhóm chính.
     - **Định dạng**: 
       - Bắt đầu/trả lời: \`[Private: {tên thật người gửi} -> {接收者真名}: {nội dung}]\`
       - Kết thúc chủ đề: \`[Private-End: {tên thật người gửi} -> {接收者真名}]\`
     - **Quy tắc**: 
       1. Chat riêng diễn ra song song, không chiếm lượt của nhóm chính. Đối tượng chat riêng có thể là thành viên AI khác trong nhóm, hoặc người dùng (tôi).
       2. **Nguyên tắc vừa phải**: cùng một chủ đề chat riêng không nên kéo dài vô thời hạn. Đừng để chat riêng quá dông dài.
       3. **Gợi ý nội dung**: chat riêng rất hợp để nói xấu những chuyện đang diễn ra trong nhóm chính, hoặc bàn những bí mật không muốn người khác biết.\n`;
    }

    prompt += `   - Đóng đúng persona của từng nhân vật, giữa các nhân vật phải có khác biệt rõ về tính cách và giọng điệu.\n`;
    prompt += `   - Câu trả lời của bạn chỉ được chứa các tin đúng định dạng hợp lệ liệt kê ở mục 4. Tuyệt đối không được chứa bất kỳ nội dung nào khác, như \`[mô tả cảnh]\`, \`(hoạt động tâm lý)\`, \`*hành động*\` hay bất kỳ lời giải thích nào ngoài định dạng.\n`;
    prompt += `   - Giữ cho hội thoại tiếp diễn, đừng chủ động kết thúc.\n\n`;
    prompt += `Giờ hãy dựa vào các thiết lập trên, bắt đầu đóng vai tất cả nhân vật trong nhóm.`;
    if (group.me && group.me.nickname) {
        prompt = prompt.replace(/\{\{user\}\}/gi, group.me.nickname);
    }

    return prompt;
}

function injectGossipContext(chat, historySlice) {
    if (!chat.allowGossip || !chat.privateSessions) return historySlice;

    const startTime = historySlice.length > 0 ? historySlice[0].timestamp : 0;
    const privateMessages = [];

    Object.values(chat.privateSessions).forEach(session => {
        if (session.history && session.history.length > 0) {
            session.history.forEach(pMsg => {
                if (pMsg.timestamp >= startTime) {
                    if (pMsg.isEndCommand) {
                        // 结束指令直接注入
                        privateMessages.push({
                            role: 'assistant',
                            content: pMsg.content,
                            timestamp: pMsg.timestamp,
                            isPrivateContext: true
                        });
                    } else {
                        // 普通私聊消息需要包装
                        const receiver = session.memberNames.find(n => n !== pMsg.sender);
                        if (receiver) {
                            privateMessages.push({
                                role: 'assistant',
                                content: `[Private: ${pMsg.sender} -> ${receiver}: ${pMsg.content}]`,
                                timestamp: pMsg.timestamp,
                                isPrivateContext: true
                            });
                        }
                    }
                }
            });
        }
    });

    if (privateMessages.length > 0) {
        const newHistory = historySlice.concat(privateMessages);
        newHistory.sort((a, b) => a.timestamp - b.timestamp);
        return newHistory;
    }

    return historySlice;
}
