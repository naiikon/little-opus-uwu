// --- 回忆日记功能 (js/modules/journal.js) ---

let generatingChatId = null;

function setupMemoryJournalScreen() {
    const generateNewJournalBtn = document.getElementById('generate-new-journal-btn');
    const generateJournalModal = document.getElementById('generate-journal-modal');
    const generateJournalForm = document.getElementById('generate-journal-form');
    const journalListContainer = document.getElementById('journal-list-container');
    const editDetailBtn = document.getElementById('edit-journal-detail-btn');
    const bindWorldBookBtn = document.getElementById('bind-journal-worldbook-btn');
    // 新增元素引用
    const journalStyleModal = document.getElementById('journal-style-selection-modal');
    const saveJournalStyleBtn = document.getElementById('save-journal-style-btn');
    const journalStyleRadios = document.querySelectorAll('input[name="journal-style-mode"]');
    const customStyleContainer = document.getElementById('journal-custom-style-container');
    const journalStyleWorldBookList = document.getElementById('journal-style-worldbook-list');
    // 新增：多选管理相关元素
    const manageBtn = document.getElementById('journal-manage-btn');
    const cancelManageBtn = document.getElementById('journal-cancel-manage-btn');
    const multiSelectBar = document.getElementById('journal-multi-select-bar');
    const batchDeleteBtn = document.getElementById('journal-batch-delete-btn');
    const mergeBtn = document.getElementById('journal-merge-btn');
    const selectCountSpan = document.getElementById('journal-select-count');

    let isMultiSelectMode = false;
    let selectedJournalIds = new Set();

    // 绑定按钮点击事件
    if (manageBtn) {
        manageBtn.addEventListener('click', () => {
            toggleMultiSelectMode(true);
        });
    }

    if (cancelManageBtn) {
        cancelManageBtn.addEventListener('click', () => {
            toggleMultiSelectMode(false);
        });
    }

    if (batchDeleteBtn) {
        batchDeleteBtn.addEventListener('click', async () => {
            if (selectedJournalIds.size === 0) return;
            if (confirm(`Chắc chắn xóa ${selectedJournalIds.size} nhật ký đã chọn? Thao tác này không thể khôi phục.`)) {
                const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
                if (!chat) return;

                chat.memoryJournals = chat.memoryJournals.filter(j => !selectedJournalIds.has(j.id));
                await saveData();
                toggleMultiSelectMode(false);
                renderJournalList();
                showToast('Đã xóa hàng loạt');
            }
        });
    }

    if (mergeBtn) {
        mergeBtn.addEventListener('click', async () => {
            if (selectedJournalIds.size < 2) {
                showToast('Vui lòng chọn ít nhất 2 nhật ký để gộp');
                return;
            }
            await mergeJournals(Array.from(selectedJournalIds));
        });
    }

    function toggleMultiSelectMode(active) {
        isMultiSelectMode = active;
        selectedJournalIds.clear();
        updateSelectCount();

        const container = document.getElementById('journal-list-container');
        const cards = container.querySelectorAll('.journal-card');
        
        if (active) {
            manageBtn.style.display = 'none';
            cancelManageBtn.style.display = 'flex';
            multiSelectBar.style.display = 'flex';
            generateNewJournalBtn.style.display = 'none'; // 隐藏生成按钮避免干扰
            if (bindWorldBookBtn) bindWorldBookBtn.style.display = 'none';
            
            cards.forEach(card => {
                card.classList.add('select-mode');
            });
        } else {
            manageBtn.style.display = 'flex';
            cancelManageBtn.style.display = 'none';
            multiSelectBar.style.display = 'none';
            generateNewJournalBtn.style.display = 'flex';
            if (bindWorldBookBtn && currentChatType === 'private') bindWorldBookBtn.style.display = 'flex';

            cards.forEach(card => {
                card.classList.remove('select-mode');
                const checkbox = card.querySelector('.journal-checkbox');
                if (checkbox) checkbox.classList.remove('checked');
            });
        }
    }

    function updateSelectCount() {
        if (selectCountSpan) {
            selectCountSpan.textContent = `Đã chọn ${selectedJournalIds.size} bài`;
        }
    }

    async function mergeJournals(journalIds) {
        const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
        if (!chat) return;

        // 1. 获取选中的日记对象并排序
        const selectedJournals = chat.memoryJournals
            .filter(j => journalIds.includes(j.id))
            .sort((a, b) => a.range.start - b.range.start); // 按消息范围起始排序

        if (selectedJournals.length === 0) return;

        // 2. 计算合并后的范围
        const mergedStart = selectedJournals[0].range.start;
        const mergedEnd = selectedJournals[selectedJournals.length - 1].range.end;

        // 3. 拼接内容
        const combinedContent = selectedJournals.map(j => `【${j.title}】\n${j.content}`).join('\n\n---\n\n');

        // 4. 构建 Prompt
        let summaryPrompt = `Bạn là một người ghi chép hồ sơ chuyên nghiệp. Hãy gộp và chỉnh lý các nhật ký sau thành một bản “hồi ký” liền mạch, súc tích.\n\n`;

        summaryPrompt += `【Yêu cầu cốt lõi】\n`;
        summaryPrompt += `1. **Thể hiện dòng thời gian**: nội dung chính phải sắp theo thứ tự thời gian và ghi rõ mốc thời gian. **Quy chuẩn định dạng:** hãy kể đúng theo định dạng “Ngày x tháng x năm x, đã xảy ra[sự kiện]” để dòng thời gian rõ ràng.\n`;
        summaryPrompt += `2. **Khách quan mộc mạc**: dùng ngôi thứ ba, trình bày sự thật khách quan. **Tuyệt đối cấm dùng từ ngữ cảm xúc mạnh** (như “giận dữ tột độ”, “đau thấu tâm can”, “mừng như điên”…), giữ lối kể bình tĩnh, tiết chế.\n`;
        summaryPrompt += `3. **Nắm trọng tâm**: nhận ra các sự kiện cốt lõi, bước ngoặt chủ đề quan trọng, quyết định hoặc thông tin then chốt trong hội thoại. Bỏ qua tán gẫu không liên quan và chi tiết vụn vặt.\n`;
        summaryPrompt += `4. **Trích lời gốc quan trọng (quan trọng)**:\n`;
        summaryPrompt += `    - Chỉ khi xuất hiện câu thoại có **giá trị cảm xúc cực cao** (như tỏ tình, lời hứa trang trọng, bộc lộ cảm xúc đầy sức lay động) hoặc **giá trị cốt truyện lớn** (như hé lộ bí mật cốt lõi, khoảnh khắc quyết định), hãy **trích thẳng lời gốc của nhân vật**.\n`;
        summaryPrompt += `    - **Định dạng trích dẫn**: dùng dấu ngoặc kép bọc lời gốc, ví dụ: ${chat.realName} nói: “Anh sẽ không bao giờ rời xa em.”\n`;
        summaryPrompt += `    - **Kiểm soát chặt số lượng**: chỉ trích vài câu sáng giá nhất, không thể thay thế nhất. Nếu lịch sử chat bình thường hoặc toàn chuyện vặt hằng ngày, **đừng trích câu nào**, để giữ bản tóm tắt súc tích.\n`;
        summaryPrompt += `5. **Không nâng tầm**: không nâng tầm giá trị, cảm ngộ hay đánh giá tổng kết, chỉ ghi lại những gì đã xảy ra.\n\n`;

        summaryPrompt += `Đầu ra của bạn phải được bọc trong thẻ XML, gồm hai phần sau:\n`;
        summaryPrompt += `<title>Một tiêu đề khái quát, ví dụ “Đầu tháng 1 · Chuẩn bị và lên đường đi du lịch”</title>\n`;
        summaryPrompt += `<content>Nội dung chính sau khi gộp</content>\n\n`;

        summaryPrompt += `Hãy xuất đúng theo định dạng thẻ XML trên, không xuất thêm bất kỳ chữ thừa nào.\n\n`;
        summaryPrompt += `Nội dung các nhật ký cần gộp như sau:\n\n${combinedContent}`;

        showToast('Đang gộp và rút gọn, vui lòng đợi...');
        
        // 退出多选模式并显示加载状态
        toggleMultiSelectMode(false);
        
        // 显示列表占位卡片
        const container = document.getElementById('journal-list-container');
        const loadingCard = document.createElement('li');
        loadingCard.className = 'journal-card generating';
        loadingCard.id = 'journal-generating-card';
        loadingCard.innerHTML = `
            <div class="spinner"></div>
            <div class="text">Đang gộp hồi ức...</div>
        `;
        if (container.firstChild) {
            container.insertBefore(loadingCard, container.firstChild);
        } else {
            container.appendChild(loadingCard);
        }
        container.scrollTop = 0;

        isGenerating = true;
        generatingChatId = currentChatId;

        try {
            const apiConfig = resolveAuxiliaryApiConfig('journal');
            let { url, key, model } = apiConfig;
            if (!url || !key || !model) {
                throw new Error("APICài đặt chưa đầy đủ.");
            }

            if (url.endsWith('/')) {
                url = url.slice(0, -1);
            }

            const { requestBody, endpoint, headers } = buildChatApiRequest(
                apiConfig,
                [{ role: 'user', content: summaryPrompt }],
                { temperature: 0.7 }
            );

            const rawContent = await fetchAiResponse(apiConfig, requestBody, headers, endpoint);

            const titleMatch = rawContent.match(/<title>([\s\S]*?)<\/title>/i);
            const contentMatch = rawContent.match(/<content>([\s\S]*?)<\/content>/i);

            const parsedTitle = titleMatch ? titleMatch[1].trim() : "Gộp nhật ký";
            const parsedContent = contentMatch ? contentMatch[1].trim() : "Nội dung trống.";

            const newJournal = {
                id: `journal_${Date.now()}`,
                range: { start: mergedStart, end: mergedEnd },
                startMessageId: chat.history[mergedStart - 1]?.id || null,
                endMessageId: chat.history[mergedEnd - 1]?.id || null,
                title: parsedTitle,
                content: parsedContent,
                createdAt: Date.now(),
                chatId: currentChatId,
                chatType: currentChatType,
                isFavorited: false 
            };

            if (!chat.memoryJournals) {
                chat.memoryJournals = [];
            }
            chat.memoryJournals.push(newJournal);
            await saveData();

            renderJournalList();
            showToast('Đã gộp nhật ký xong!');

        } catch (error) {
            const card = document.getElementById('journal-generating-card');
            if(card) card.remove();
            showApiError(error);
        } finally {
            isGenerating = false;
            generatingChatId = null;
        }
    }

    bindWorldBookBtn.addEventListener('click', () => {
        const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
        if (!chat) return;

        // 仅私聊支持新风格设置
        if (currentChatType === 'private') {
            // 智能迁移
            const migrationMsg = migrateJournalSettings(chat);
            if (migrationMsg) {
                showToast(migrationMsg);
            }

            // 设置 Radio 状态
            const currentMode = chat.journalStyleSettings.mode || 'default';
            const radio = document.querySelector(`input[name="journal-style-mode"][value="${currentMode}"]`);
            if (radio) radio.checked = true;

            // 显示/隐藏自定义列表
            customStyleContainer.style.display = (currentMode === 'custom') ? 'flex' : 'none';

            // 渲染世界书列表 (总是渲染，以便切换时可用)
            renderCategorizedWorldBookList(journalStyleWorldBookList, db.worldBooks, chat.journalStyleSettings.customWorldBookIds || [], 'journal-style-wb-select');
            
            journalStyleModal.classList.add('visible');
        } else {
            showToast('Chat nhóm tạm chưa hỗ trợ cài đặt phong cách tùy chỉnh');
        }
    });

    // Radio 切换事件
    journalStyleRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            customStyleContainer.style.display = (e.target.value === 'custom') ? 'flex' : 'none';
        });
    });

    // 保存按钮点击事件
    saveJournalStyleBtn.addEventListener('click', async () => {
        const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : null;
        if (!chat) return;

        const selectedMode = document.querySelector('input[name="journal-style-mode"]:checked').value;
        const selectedIds = Array.from(journalStyleWorldBookList.querySelectorAll('.item-checkbox:checked')).map(input => input.value);

        chat.journalStyleSettings = {
            mode: selectedMode,
            customWorldBookIds: selectedIds
        };
        
        // 同步更新旧字段以保持潜在的向后兼容性
        chat.journalWorldBookIds = selectedIds;

        await saveData();
        journalStyleModal.classList.remove('visible');
        showToast('Đã lưu cài đặt phong cách nhật ký');
    });

    generateNewJournalBtn.addEventListener('click', () => {
        const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
        const totalMessages = chat ? chat.history.length : 0;
        
        const rangeInfo = document.getElementById('journal-range-info');
        rangeInfo.textContent = `Tổng số tin nhắn của chat hiện tại: ${totalMessages}`;

        const modalTitle = document.querySelector('#generate-journal-modal h3');
        if (modalTitle) {
            modalTitle.textContent = (currentChatType === 'group') ? 'Tạo tóm tắt chat nhóm' : 'Chỉ định phạm vi tóm tắt';
        }

        generateJournalForm.reset();
        generateJournalModal.classList.add('visible');
    });

    generateJournalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const startInput = document.getElementById('journal-range-start');
        const endInput = document.getElementById('journal-range-end');
        const includeFavoritedCheckbox = document.getElementById('journal-include-favorited');

        const start = parseInt(startInput.value);
        const end = parseInt(endInput.value);
        const includeFavorited = includeFavoritedCheckbox.checked;
        
        if (isNaN(start) || isNaN(end) || start <= 0 || end < start) {
            showToast('Vui lòng nhập phạm vi bắt đầu/kết thúc hợp lệ');
            return;
        }

        generateJournalModal.classList.remove('visible');
        await generateJournal(start, end, includeFavorited);
    });

    journalListContainer.addEventListener('click', async (e) => {
        const target = e.target;
        const card = target.closest('.journal-card');
        if (!card) return;

        const journalId = card.dataset.id;
        
        // 多选模式逻辑
        if (isMultiSelectMode) {
            if (selectedJournalIds.has(journalId)) {
                selectedJournalIds.delete(journalId);
                card.querySelector('.journal-checkbox').classList.remove('checked');
            } else {
                selectedJournalIds.add(journalId);
                card.querySelector('.journal-checkbox').classList.add('checked');
            }
            updateSelectCount();
            return; // 阻止进入详情页
        }

        const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
        if (!chat) return;
        const journal = chat.memoryJournals.find(j => j.id === journalId);
        if (!journal) return;

        if (target.closest('.delete-journal-btn')) {
            if (confirm('Chắc chắn xóa nhật ký này?')) {
                chat.memoryJournals = chat.memoryJournals.filter(j => j.id !== journalId);
                await saveData();
                renderJournalList();
                showToast('Đã xóa nhật ký');
            }
            return;
        }

        if (target.closest('.favorite-journal-btn')) {
            journal.isFavorited = !journal.isFavorited;
            await saveData();
            target.closest('.favorite-journal-btn').classList.toggle('favorited', journal.isFavorited);
            showToast(journal.isFavorited ? 'Đã lưu yêu thích' : 'Đã bỏ yêu thích');
            return;
        }
        
        const date = new Date(journal.createdAt);
        const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        
        currentJournalDetailId = journal.id;

        const titleEl = document.getElementById('journal-detail-title');
        const contentEl = document.getElementById('journal-detail-content');

        titleEl.isContentEditable = false;
        contentEl.isContentEditable = false;
        titleEl.style.border = 'none';
        contentEl.style.border = 'none';
        titleEl.style.padding = '0';
        contentEl.style.padding = '0';
        editDetailBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.13,5.12L18.88,8.87M3,17.25V21H6.75L17.81,9.94L14.06,6.19L3,17.25Z" /></svg>`;

        titleEl.textContent = journal.title;
        document.getElementById('journal-detail-meta').textContent = `Tạo lúc ${formattedDate} | Phạm vi tin nhắn: ${journal.range.start}-${journal.range.end}`;
        document.getElementById('journal-detail-content').textContent = journal.content;
        
        switchScreen('memory-journal-detail-screen');
    });

    editDetailBtn.addEventListener('click', async () => {
        if (!currentJournalDetailId) return;

        const titleEl = document.getElementById('journal-detail-title');
        const contentEl = document.getElementById('journal-detail-content');
        const isEditing = titleEl.isContentEditable;

        if (isEditing) {
            const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
            if (!chat) return;
            const journal = chat.memoryJournals.find(j => j.id === currentJournalDetailId);
            if (!journal) return;

            journal.title = titleEl.textContent.trim();
            journal.content = contentEl.textContent.trim();
            await saveData();

            titleEl.isContentEditable = false;
            contentEl.isContentEditable = false;
            titleEl.style.border = 'none';
            contentEl.style.border = 'none';
            titleEl.style.padding = '0';
            contentEl.style.padding = '0';
            editDetailBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.13,5.12L18.88,8.87M3,17.25V21H6.75L17.81,9.94L14.06,6.19L3,17.25Z" /></svg>`;
            showToast('Đã lưu nhật ký');
            renderJournalList(); 
        } else {
            titleEl.setAttribute('contenteditable', 'true');
            contentEl.setAttribute('contenteditable', 'true');
            titleEl.style.border = '1px dashed #ccc';
            titleEl.style.padding = '5px';
            contentEl.style.border = '1px dashed #ccc';
            contentEl.style.padding = '10px';
            editDetailBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z" /></svg>`; 
            titleEl.focus();
        }
    });
}

function renderJournalList() {
    const container = document.getElementById('journal-list-container');
    const placeholder = document.getElementById('no-journals-placeholder');
    container.innerHTML = '';

    const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
    const journals = chat ? chat.memoryJournals : [];

    // 更新标题和按钮显示
    const bindBtn = document.getElementById('bind-journal-worldbook-btn');
    const title = document.querySelector('#memory-journal-screen .title');
    
    if (currentChatType === 'group') {
        if (bindBtn) bindBtn.style.display = 'none';
        if (title) title.textContent = 'Tóm tắt thông minh';
        if (placeholder) {
            placeholder.innerHTML = '<p>Chưa có tóm tắt nào~</p><p>Bấm “dấu +” góc trên bên phải để tạo bài đầu tiên nhé!</p>';
        }
    } else {
        if (bindBtn) bindBtn.style.display = 'flex';
        if (title) title.textContent = 'Nhật ký hồi ức';
        if (placeholder) {
            placeholder.innerHTML = '<p>Chưa có nhật ký nào~</p><p>Bấm “dấu +” góc trên bên phải để tạo bài đầu tiên nhé!</p>';
        }
    }

    let isShowingLoading = false;
    // 恢复生成状态卡片
    if (typeof isGenerating !== 'undefined' && isGenerating && generatingChatId === currentChatId) {
        const loadingCard = document.createElement('li');
        loadingCard.className = 'journal-card generating';
        loadingCard.id = 'journal-generating-card';
        loadingCard.innerHTML = `
            <div class="spinner"></div>
            <div class="text">Đang${currentChatType === 'group' ? 'Tóm tắt nhóm' : 'Dệt hồi ức'}...</div>
        `;
        container.appendChild(loadingCard);
        isShowingLoading = true;
    }

    if ((!journals || journals.length === 0) && !isShowingLoading) {
        if (placeholder) placeholder.style.display = 'block';
        return;
    }

    if (placeholder) placeholder.style.display = 'none';

    const sortedJournals = [...journals].sort((a, b) => a.createdAt - b.createdAt);

    sortedJournals.forEach(journal => {
        const card = document.createElement('li');
        card.className = 'journal-card';
        card.dataset.id = journal.id;

        const date = new Date(journal.createdAt);
        const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

        card.innerHTML = `
            <div class="journal-checkbox"></div>
            <div class="journal-card-header">
                <div class="journal-card-title">${journal.title}</div>
            </div>
            <div class="journal-card-actions">
                <button class="action-icon-btn favorite-journal-btn" title="Yêu thích">
                    <svg viewBox="0 0 24 24">
                        <path class="star-outline" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" fill="currentColor"/>
                        <path class="star-solid" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                    </svg>
                </button>
                <button class="action-icon-btn delete-journal-btn" title="Xóa">
                    <svg viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>
                </button>
            </div>
            <div class="journal-card-footer" style="justify-content: space-between; height: auto; opacity: 1; margin-top: 10px;">
                <span class="journal-card-date">${formattedDate}</span>
                <span class="journal-card-range">Phạm vi: ${journal.range.start}-${journal.range.end}</span>
            </div>
        `;

        if (journal.isFavorited) {
            card.querySelector('.favorite-journal-btn').classList.add('favorited');
        }

        container.appendChild(card);
    });
}

async function generateJournal(start, end, includeFavorited = false) {
    showToast('Đang tạo nhật ký, vui lòng đợi...');
    
    // 显示列表占位卡片
    const container = document.getElementById('journal-list-container');
    const placeholder = document.getElementById('no-journals-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    const loadingCard = document.createElement('li');
    loadingCard.className = 'journal-card generating';
    loadingCard.id = 'journal-generating-card';
    loadingCard.innerHTML = `
        <div class="spinner"></div>
        <div class="text">Đang${currentChatType === 'group' ? 'Tóm tắt nhóm' : 'Dệt hồi ức'}...</div>
    `;
    
    if (container.firstChild) {
        container.insertBefore(loadingCard, container.firstChild);
    } else {
        container.appendChild(loadingCard);
    }
    container.scrollTop = 0;

    isGenerating = true; 
    generatingChatId = currentChatId;

    try {
        const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
        if (!chat) {
            throw new Error("Không tìm thấy chat hiện tại.");
        }

        const startIndex = start - 1;
        const endIndex = end;
        
        if (startIndex < 0 || endIndex > chat.history.length || startIndex >= endIndex) {
            throw new Error("Phạm vi tin nhắn không hợp lệ.");
        }

        // ...
        let messagesToSummarize = chat.history.slice(startIndex, endIndex);
        
        // 1. 保持原样：第三个参数设为 true，确保你想要的“高权重”隐藏消息能被读进来
        messagesToSummarize = filterHistoryForAI(chat, messagesToSummarize, true);

        // 2. 【新增】精准剔除 thinking 消息
        // 你的 chat_ai.js 中生成的思考消息带有 isThinking: true 属性
        // 即使它们包含在上下文里，我们也在生成日记前把它们扔掉
        messagesToSummarize = messagesToSummarize.filter(m => !m.isThinking);

        // 3. 【可选保险】防止只有标签没有属性的情况（针对旧历史记录）
        // 如果你担心以前的历史记录里有 thinking 标签但没有 isThinking 属性，可以加一步正则清洗
        messagesToSummarize.forEach(m => {
            if (m.content && typeof m.content === 'string') {
               m.content = m.content.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
            }
        });

        let worldBooksContent = '';
        let summaryPrompt = '';
        let favoritedJournalsPrompt = '';

        // 新增：读取已收藏的日记 (通用逻辑)
        if (includeFavorited) {
            const favoritedJournals = (chat.memoryJournals || [])
                .filter(j => j.isFavorited)
                .map(j => `Tiêu đề:${j.title}\nNội dung:${j.content}`)
                .join('\n\n---\n\n');
            
            if (favoritedJournals) {
                favoritedJournalsPrompt = `【Nhìn lại trước đây】\nĐây là nội dung bạn đã viết trước đó, hãy tham khảo để nội dung mới liền mạch, tránh ghi lặp những sự kiện đã ghi.\n\n${favoritedJournals}\n\n`;
            }
        }

        if (currentChatType === 'group') {
            // 群聊逻辑
            const worldBooksLimitBreak = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'limit_break')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100));
            const worldBooksBefore = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'before')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100));
            const worldBooksAfter = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && (wb.position === 'after' || !wb.position))).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100));
            const worldBooksGuidelines = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'guidelines')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100));
            
            worldBooksContent = [
                ...worldBooksLimitBreak.map(wb => wb.content),
                ...worldBooksBefore.map(wb => wb.content),
                ...worldBooksAfter.map(wb => wb.content),
                ...worldBooksGuidelines.map(wb => wb.content)
            ].join('\n\n');

            summaryPrompt = `Bạn là trợ lý tóm tắt chat nhóm. Hãy dùng góc nhìn thứ ba hoàn toàn khách quan để tóm tắt ngắn gọn đoạn chat nhóm sau.\n\n`;
            
            if (favoritedJournalsPrompt) {
                summaryPrompt += favoritedJournalsPrompt;
            }

            // 注入群聊基础信息
            summaryPrompt += `Tên nhóm: ${chat.name}\n`;
            summaryPrompt += `Danh sách thành viên: ${chat.members.map(m => `${m.groupNickname}(${m.realName})`).join(', ')}\n\n`;

            // 注入群聊关联的世界书
            if (worldBooksContent) {
                summaryPrompt += `Bối cảnh tham khảo:\n${worldBooksContent}\n\n`;
            }

            summaryPrompt += `Yêu cầu tóm tắt:\n`;
            summaryPrompt += `1. **Khách quan trung lập**: dùng ngôi thứ ba, không mang cảm xúc cá nhân, không dùng từ ngữ cảm xúc mạnh.\n`;
            summaryPrompt += `2. **Ngắn gọn chính xác**: chỉ trình bày sự thật, khái quát chủ đề và sự kiện chính, bỏ chi tiết tán gẫu không liên quan.\n`;
            summaryPrompt += `3. **Không nâng tầm**: không nâng tầm giá trị, cảm ngộ hay đánh giá tổng kết, chỉ ghi lại những gì đã xảy ra.\n\n`;

            summaryPrompt += `Đầu ra của bạn phải được bọc trong thẻ XML, gồm hai phần sau:\n`;
            summaryPrompt += `<title>Định dạng “Ngày · Sự kiện cốt lõi”, ví dụ “20/1 · Bàn kế hoạch cuối tuần”</title>\n`;
            summaryPrompt += `<content>Nội dung tóm tắt. Liệt kê theo từng ý các điểm thảo luận hoặc sự kiện chính.</content>\n\n`;

            summaryPrompt += `Hãy xuất đúng theo định dạng thẻ XML trên, không xuất thêm bất kỳ chữ thừa nào.\n\n`;
            summaryPrompt += `Lịch sử chat như sau:\n\n---\n${(() => {
                let lastTime = 0;
                return messagesToSummarize.map(m => {
                    let prefix = '';
                    const currentTime = m.timestamp;
                    const timeDiff = currentTime - lastTime;
                    const isSameDay = new Date(currentTime).toDateString() === new Date(lastTime).toDateString();
                    
                    if (lastTime === 0 || timeDiff > 20 * 60 * 1000 || !isSameDay) {
                        const d = new Date(currentTime);
                        const timeStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
                        prefix = `\n[系统时间: ${timeStr}]\n`;
                    }
                    lastTime = currentTime;
                    return `${prefix}${m.content}`;
                }).join('\n');
            })()}\n---`;

        } else {
            // 私聊逻辑
            // 0. 确保迁移
            migrateJournalSettings(chat);

            // 1. 自动获取通用世界书 (Context)
            const worldBooksLimitBreak = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'limit_break')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100));
            const worldBooksBefore = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'before')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100));
            const worldBooksAfter = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && (wb.position === 'after' || !wb.position))).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100));
            const worldBooksGuidelines = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'guidelines')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100));
            
            worldBooksContent = [
                ...worldBooksLimitBreak.map(wb => wb.content),
                ...worldBooksBefore.map(wb => wb.content),
                ...worldBooksAfter.map(wb => wb.content),
                ...worldBooksGuidelines.map(wb => wb.content)
            ].join('\n\n');

            // 2. 获取风格设置
            const styleSettings = chat.journalStyleSettings || { mode: 'default', customWorldBookIds: [] };
            
            // 3. 构建 Prompt
            if (styleSettings.mode === 'summary') {
                // 摘要总结风格
                summaryPrompt = `Bạn là trợ lý tóm tắt hội thoại chuyên nghiệp. Hãy dựa vào lịch sử chat được cung cấp, tạo một bản tóm tắt súc tích.\n\n`;
                
                if (favoritedJournalsPrompt) {
                    summaryPrompt += favoritedJournalsPrompt;
                }

                summaryPrompt += `Yêu cầu:
1. **Thể hiện dòng thời gian**: nội dung chính phải sắp theo thứ tự thời gian và ghi rõ mốc thời gian. **Quy chuẩn định dạng:** hãy kể đúng theo định dạng “Ngày x tháng x năm x, đã xảy ra[sự kiện]” để dòng thời gian rõ ràng.
2. **Khách quan mộc mạc**: dùng ngôi thứ ba, trình bày sự thật khách quan. **Tuyệt đối cấm dùng từ ngữ cảm xúc mạnh** (như “giận dữ tột độ”, “đau thấu tâm can”, “mừng như điên”…), giữ lối kể bình tĩnh, tiết chế.
3. **Nắm trọng tâm**: nhận ra các sự kiện cốt lõi, bước ngoặt chủ đề quan trọng, quyết định hoặc thông tin then chốt trong hội thoại. Bỏ qua tán gẫu không liên quan và chi tiết vụn vặt.
4. **Trích lời gốc quan trọng (quan trọng)**:
    - Chỉ khi xuất hiện câu thoại có **giá trị cảm xúc cực cao** (như tỏ tình, lời hứa trang trọng, bộc lộ cảm xúc đầy sức lay động) hoặc **giá trị cốt truyện lớn** (như hé lộ bí mật cốt lõi, khoảnh khắc quyết định), hãy **trích thẳng lời gốc của nhân vật**.
    - **Định dạng trích dẫn**: dùng dấu ngoặc kép bọc lời gốc, ví dụ: ${chat.realName} nói: “Anh sẽ không bao giờ rời xa em.”
    - **Kiểm soát chặt số lượng**: chỉ trích vài câu sáng giá nhất, không thể thay thế nhất. Nếu lịch sử chat bình thường hoặc toàn chuyện vặt hằng ngày, **đừng trích câu nào**, để giữ bản tóm tắt súc tích.
5. **Không nâng tầm**: không nâng tầm giá trị, cảm ngộ hay đánh giá tổng kết, chỉ ghi lại những gì đã xảy ra.

Đầu ra của bạn phải được bọc trong thẻ XML, gồm hai phần sau:
<title>Định dạng “Khoảng ngày · Sự kiện cốt lõi”, ví dụ “20/1 - 22/1 · Bàn về kế hoạch du lịch”</title>
<content>Nội dung tóm tắt</content>

Hãy xuất đúng theo định dạng thẻ XML trên, không xuất thêm bất kỳ chữ thừa nào.

Lịch sử chat như sau:\n\n---\n${(() => {
                let lastTime = 0;
                return messagesToSummarize.map(m => {
                    let prefix = '';
                    const currentTime = m.timestamp;
                    const timeDiff = currentTime - lastTime;
                    const isSameDay = new Date(currentTime).toDateString() === new Date(lastTime).toDateString();
                    
                    if (lastTime === 0 || timeDiff > 20 * 60 * 1000 || !isSameDay) {
                        const d = new Date(currentTime);
                        const timeStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
                        prefix = `\n[系统时间: ${timeStr}]\n`;
                    }
                    lastTime = currentTime;
                    return `${prefix}${m.content}`;
                }).join('\n');
            })()}\n---`;

            } else {
                // 默认风格 (流水账) 或 自定义风格
                // 基础 Prompt (第一人称)
                summaryPrompt = `Bạn là trợ lý chỉnh lý nhật ký. Hãy dùng ngôi thứ nhất của nhân vật "${chat.remarkName || chat.name}" để tóm tắt đoạn chat sau. Hãy tập trung vào cảm xúc, sự kiện và chi tiết quan trọng.\n\n`;
                
                if (favoritedJournalsPrompt) {
                    summaryPrompt += favoritedJournalsPrompt;
                }

                summaryPrompt += "Để hiểu rõ hơn nhân vật và bối cảnh, hãy tham khảo thông tin sau:\n";
                summaryPrompt += "=====\n";

                if (worldBooksContent) {
                    summaryPrompt += `Thiết lập thế giới quan:\n${worldBooksContent}\n\n`;
                }

                summaryPrompt += `Thiết lập nhân vật của bạn:\n- Tên nhân vật: ${chat.realName}\n- Persona: ${chat.persona || "Một người bạn thân thiện, sẵn lòng giúp đỡ."}\n\n`;
                summaryPrompt += `Thiết lập nhân vật của tôi:\n- Cách gọi tôi: ${chat.myName}\n- Persona của tôi: ${chat.myPersona || "Không có persona cụ thể."}\n\n`;
                summaryPrompt += "=====\n";

                // 如果是自定义风格，注入额外要求
                if (styleSettings.mode === 'custom') {
                    const customWorldBooks = (styleSettings.customWorldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id)).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100));
                    const customStyleContent = customWorldBooks.map(wb => wb.content).join('\n\n');
                    
                    if (customStyleContent) {
                        summaryPrompt += `\n**Yêu cầu định dạng/phong cách nhật ký đặc biệt**:\nHãy ưu tiên tuân thủ chặt hướng dẫn phong cách hoặc yêu cầu định dạng sau khi viết nhật ký:\n${customStyleContent}\n\n`;
                    }
                }

                summaryPrompt += `Hãy dựa trên toàn bộ thông tin bối cảnh trên để tóm tắt đoạn chat sau. Đầu ra phải được bọc trong thẻ XML, gồm <title>Ngày tháng năm · một tiêu đề ngắn gọn</title> và <content>Toàn văn nhật ký</content> hai phần, hãy xuất đúng định dạng thẻ XML, không xuất thêm chữ thừa nào. Lịch sử chat như sau:\n\n---\n${(() => {
                let lastTime = 0;
                return messagesToSummarize.map(m => {
                    let prefix = '';
                    const currentTime = m.timestamp;
                    const timeDiff = currentTime - lastTime;
                    const isSameDay = new Date(currentTime).toDateString() === new Date(lastTime).toDateString();
                    
                    if (lastTime === 0 || timeDiff > 20 * 60 * 1000 || !isSameDay) {
                        const d = new Date(currentTime);
                        const timeStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
                        prefix = `\n[系统时间: ${timeStr}]\n`;
                    }
                    lastTime = currentTime;
                    return `${prefix}${m.content}`;
                }).join('\n');
            })()}\n---`;
            }
        }

        const apiConfig = resolveAuxiliaryApiConfig('journal');
        let { url, key, model } = apiConfig;
        if (!url || !key || !model) {
            throw new Error("APICài đặt chưa đầy đủ.");
        }

        if (url.endsWith('/')) {
            url = url.slice(0, -1);
        }

        const { requestBody, endpoint, headers } = buildChatApiRequest(
            apiConfig,
            [{ role: 'user', content: summaryPrompt }],
            { temperature: 0.7 }
        );

        const rawContent = await fetchAiResponse(apiConfig, requestBody, headers, endpoint);

        const titleMatch = rawContent.match(/<title>([\s\S]*?)<\/title>/i);
        const contentMatch = rawContent.match(/<content>([\s\S]*?)<\/content>/i);

        const parsedTitle = titleMatch ? titleMatch[1].trim() : "Nhật ký không tiêu đề";
        const parsedContent = contentMatch ? contentMatch[1].trim() : "Nội dung trống.";

        const newJournal = {
            id: `journal_${Date.now()}`,
            range: { start, end },
            startMessageId: chat.history[start - 1]?.id || null,
            endMessageId: chat.history[end - 1]?.id || null,
            title: parsedTitle,
            content: parsedContent,
            createdAt: Date.now(),
            chatId: currentChatId,
            chatType: currentChatType,
            isFavorited: false 
        };

        if (!chat.memoryJournals) {
            chat.memoryJournals = [];
        }
        chat.memoryJournals.push(newJournal);
        await saveData();

        renderJournalList();
        showToast('Đã tạo nhật ký mới!');

    } catch (error) {
        // 移除生成卡片
        const card = document.getElementById('journal-generating-card');
        if(card) card.remove();
        
        // 如果列表为空，恢复显示 placeholder
        const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
        if (!chat || !chat.memoryJournals || chat.memoryJournals.length === 0) {
             const placeholder = document.getElementById('no-journals-placeholder');
             if (placeholder) placeholder.style.display = 'block';
        }

        showApiError(error);
    } finally {
        isGenerating = false; 
        generatingChatId = null;
    }
}

function migrateJournalSettings(chat) {
    if (!chat.journalStyleSettings) {
        const oldJournalIds = chat.journalWorldBookIds || [];
        const chatCommonIds = chat.worldBookIds || [];
        
        // 1. 剔除重复项 (在通用里已存在的)
        const uniqueCustomIds = oldJournalIds.filter(id => !chatCommonIds.includes(id));
        
        // 2. 决定模式
        let newMode = 'default';
        let migrationMsg = '';

        if (oldJournalIds.length > 0) {
            if (uniqueCustomIds.length === 0) {
                // 情况 A: 旧关联全是通用背景 -> 迁移到默认模式
                newMode = 'default';
                migrationMsg = 'Nâng cấp nhật ký: đã tự liên kết bối cảnh phòng chat, cài đặt cũ của bạn đã được gộp vào “Phong cách mặc định”.';
            } else {
                // 情况 B: 有额外的世界书 -> 迁移到自定义模式，保留额外项
                newMode = 'custom';
                migrationMsg = `Nâng cấp nhật ký: đã tự liên kết bối cảnh phòng chat, ${uniqueCustomIds.length} thiết lập đặc biệt còn lại được giữ trong “Phong cách tùy chỉnh”.`;
            }
        } else {
            // 情况 C: 无旧关联 -> 默认
            newMode = 'default';
        }

        // 3. 应用设置
        chat.journalStyleSettings = { 
            mode: newMode, 
            customWorldBookIds: uniqueCustomIds 
        };
        
        return migrationMsg;
    }
    return null;
}
