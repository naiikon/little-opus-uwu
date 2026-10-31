// --- 教程与备份功能 (js/modules/tutorial.js) ---

function setupTutorialApp() {
    const tutorialContentArea = document.getElementById('tutorial-content-area');
    tutorialContentArea.addEventListener('click', (e) => {
        const header = e.target.closest('.tutorial-header');
        if (header) {
            header.parentElement.classList.toggle('open');
        }
    });
}

function renderUpdateLog() {
    const tutorialContent = document.getElementById('tutorial-content-area');
    if (!tutorialContent) return;

    const updateSection = document.createElement('div');
    updateSection.className = 'tutorial-item'; 

    let notesHtml = '';
    updateLog.forEach((log, index) => {
        notesHtml += `
            <div style="margin-bottom: 15px; ${index < updateLog.length - 1 ? 'padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;' : ''}">
                <h4 style="font-size: 15px; color: #333; margin: 0 0 5px 0;">Phiên bản ${log.version} (${log.date})</h4>
                <ul style="padding-left: 20px; margin: 0; list-style-type: '› ';">
                    ${log.notes.map(note => `<li style="margin-bottom: 5px; color: #666;">${note}</li>`).join('')}
                </ul>
            </div>
        `;
    });

    updateSection.innerHTML = `
        <div class="tutorial-header">Nhật ký cập nhật</div>
        <div class="tutorial-content" style="padding-top: 15px;">
            ${notesHtml}
        </div>
    `;
    
    tutorialContent.appendChild(updateSection);
}

function showUpdateModal() {
    const modal = document.getElementById('update-log-modal');
    const contentEl = document.getElementById('update-log-modal-content');
    const closeBtn = document.getElementById('close-update-log-modal');

    const latestLog = updateLog[0];
    if (!latestLog) return;

    // 优化内容渲染
    let notesHtml = '<div style="text-align: left; max-height: 60vh; overflow-y: auto; padding-right: 5px;">';
    latestLog.notes.forEach(note => {
        // 处理加粗标记 **text** -> <b>text</b>
        let formattedNote = note.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

        if (note.includes('————')) {
            // 分割线
            notesHtml += '<hr style="margin: 15px 0; border: 0; border-top: 1px dashed #ccc;">';
        } else if (/^\d+\./.test(note)) {
            // 标题行 (例如 "1.日记功能升级！")
            notesHtml += `<h4 style="margin: 15px 0 8px; color: #333; font-size: 15px; font-weight: 600;">${formattedNote}</h4>`;
        } else {
            // 普通内容行
            notesHtml += `<div style="margin-bottom: 6px; color: #555; font-size: 13px; line-height: 1.5; padding-left: 12px; position: relative;">
                <span style="position: absolute; left: 0; top: 0; color: #999;">•</span>${formattedNote}
            </div>`;
        }
    });
    notesHtml += '</div>';

    contentEl.innerHTML = `
        <h3 style="margin-top: 0; margin-bottom: 15px; text-align: center;">Phiên bản ${latestLog.version} (${latestLog.date})</h3>
        ${notesHtml}
        <p style="font-size: 12px; color: #888; text-align: center; margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px;">Có thể xem các ghi chú cập nhật trước đây trong ứng dụng “Hướng dẫn”.</p>
    `;

    modal.classList.add('visible');

    // 强制阅读倒计时
    const originalText = "Mình biết rồi";
    let timeLeft = 10;
    closeBtn.disabled = true;
    closeBtn.textContent = `Vui lòng đọc (${timeLeft}s)`;
    closeBtn.style.opacity = '0.6';
    closeBtn.style.cursor = 'not-allowed';

    const timer = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            closeBtn.textContent = `Vui lòng đọc (${timeLeft}s)`;
        } else {
            clearInterval(timer);
            closeBtn.disabled = false;
            closeBtn.textContent = originalText;
            closeBtn.style.opacity = '1';
            closeBtn.style.cursor = 'pointer';
        }
    }, 1000);

    closeBtn.onclick = () => {
        modal.classList.remove('visible');
        localStorage.setItem('lastSeenVersion', appVersion);
    };
}

function checkForUpdates() {
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    if (lastSeenVersion !== appVersion) {
        // 仅当当前版本为 1.8.0 时，才执行引导重置
        if (appVersion === '1.8.0') {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('guide_')) {
                    localStorage.removeItem(key);
                }
            });
        }

        setTimeout(showUpdateModal, 500);
    }
}

// --- Guide System (分步引导) ---
const GuideSystem = {
    check: function(guideId, nextCallback) {
        // 检查是否已显示过
        if (localStorage.getItem(guideId) === 'true') return;

        // 根据 ID 定义引导内容
        let config = null;
        switch (guideId) {
            case 'guide_search_entry':
                config = {
                    target: '.search-bar-decoration',
                    text: 'Thêm chức năng tìm kiếm! Hỗ trợ lọc theo nhân vật, chat nhóm, tìm lại lịch sử thật nhanh.',
                    position: 'bottom'
                };
                break;
            case 'guide_char_gallery':
                config = {
                    target: '#char-gallery-manage-btn',
                    text: 'Thêm Album của TA! Quản lý ảnh riêng của nhân vật ở đây, bật công tắc này trong cài đặt chat thì khi trò chuyện nhân vật có thể gửi thẳng ảnh đã tải lên.',
                    position: 'top'
                };
                break;
            case 'guide_group_summary':
                config = {
                    target: '#memory-journal-btn',
                    text: 'Chat nhóm quá nhiều tin? Bấm vào đây để tạo tóm tắt thông minh bằng một nút, tự liên kết world book của nhóm hiện tại, có sẵn prompt.',
                    position: 'top'
                };
                break;
            case 'guide_group_notice':
                config = {
                    target: '#setting-group-notice',
                    text: 'Thêm thông báo nhóm! Đặt bối cảnh cốt truyện hoặc thông báo quan trọng để mọi thành viên đều biết.',
                    position: 'bottom',
                    parent: '.kkt-item' // 高亮父容器
                };
                break;
            case 'guide_group_gossip':
                config = {
                    target: '#setting-group-allow-gossip',
                    text: 'Bật chat riêng trong nhóm! Bấm đúp vào tiêu đề nhóm để xem, các thành viên có thể lén tương tác với nhau, tám chuyện chân thật hơn.',
                    position: 'bottom',
                    parent: '.kkt-item'
                };
                break;
        }

        if (config) {
            // 稍微延迟以确保 DOM 渲染完成
            setTimeout(() => {
                const targetEl = document.querySelector(config.target);
                if (targetEl && targetEl.offsetParent !== null) { // 确保元素可见
                    this.show(targetEl, config, guideId, nextCallback);
                }
            }, 500);
        }
    },

    show: function(targetEl, config, guideId, nextCallback) {
        // 1. 先滚动到可见区域
        const highlightEl = config.parent ? targetEl.closest(config.parent) : targetEl;
        
        // 特殊处理 Swiper 容器内的元素，避免触发页面整体水平滚动
        const swiperWrapper = highlightEl.closest('.function-swiper-wrapper');
        if (swiperWrapper) {
            const slide = highlightEl.closest('.function-slide');
            if (slide) {
                // 滚动到对应的 slide，使用 inline: 'start' 确保对齐且不溢出
                slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            } else {
                highlightEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        } else {
            highlightEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // 强制重置页面水平滚动，防止露出侧边栏
        const resetScroll = () => {
            document.documentElement.scrollLeft = 0;
            document.body.scrollLeft = 0;
        };
        // 在滚动开始和结束时多次尝试重置
        setTimeout(resetScroll, 50);
        setTimeout(resetScroll, 200);
        setTimeout(resetScroll, 600);

        // 2. 延迟显示引导（等待滚动完成）
        setTimeout(() => {
            // 再次重置滚动位置，确保万无一失
            resetScroll();

            // 移除现有的引导
            this.cleanup();

            // 创建遮罩
            const overlay = document.createElement('div');
            overlay.className = 'guide-overlay visible';
            document.body.appendChild(overlay);

            // 重新计算高亮位置（滚动后）
            const rect = highlightEl.getBoundingClientRect();
            
            // 创建高亮框
            const highlightBox = document.createElement('div');
            highlightBox.className = 'guide-highlight-box';
            // 强制使用 fixed 定位，避免滚动容器导致的坐标偏移问题
            highlightBox.style.position = 'fixed';
            highlightBox.style.top = `${rect.top}px`;
            highlightBox.style.left = `${rect.left}px`;
            highlightBox.style.width = `${rect.width}px`;
            highlightBox.style.height = `${rect.height}px`;
            document.body.appendChild(highlightBox);

            // 创建提示气泡
            const tooltip = document.createElement('div');
            tooltip.className = `guide-tooltip ${config.position || 'bottom'} visible`;
            // 气泡也使用 fixed 定位
            tooltip.style.position = 'fixed';
            
            tooltip.innerHTML = `
                <div class="guide-content">${config.text}</div>
                <div class="guide-footer">
                    <button class="guide-btn guide-btn-primary">Mình biết rồi</button>
                </div>
            `;
            document.body.appendChild(tooltip);

            // 计算气泡位置 (需要先添加到 DOM 获取尺寸)
            const tooltipRect = tooltip.getBoundingClientRect();
            const tooltipWidth = tooltipRect.width;
            const screenWidth = window.innerWidth;
            const margin = 10; // 屏幕边缘间距

            let tooltipTop, tooltipLeft;
            
            // 初始水平居中对齐目标
            let idealLeft = rect.left + rect.width / 2 - tooltipWidth / 2;

            // 边界检测与调整
            if (idealLeft < margin) {
                tooltipLeft = margin;
            } else if (idealLeft + tooltipWidth > screenWidth - margin) {
                tooltipLeft = screenWidth - tooltipWidth - margin;
            } else {
                tooltipLeft = idealLeft;
            }

            // 计算箭头偏移量 (相对于 tooltip 左边缘)
            const targetCenterX = rect.left + rect.width / 2;
            let arrowRelX = targetCenterX - tooltipLeft;
            
            // 限制箭头在 tooltip 内部 (留出圆角空间)
            const arrowMargin = 20;
            if (arrowRelX < arrowMargin) arrowRelX = arrowMargin;
            if (arrowRelX > tooltipWidth - arrowMargin) arrowRelX = tooltipWidth - arrowMargin;

            // 设置箭头位置变量
            tooltip.style.setProperty('--arrow-left', `${arrowRelX}px`);

            // 垂直位置
            if (config.position === 'top') {
                tooltipTop = rect.top - 10; 
                tooltip.style.transform = 'translateY(-100%) translateY(-10px)';
            } else {
                tooltipTop = rect.bottom + 10;
                tooltip.style.transform = 'translateY(10px)';
            }
            
            tooltip.style.top = `${tooltipTop}px`;
            tooltip.style.left = `${tooltipLeft}px`;

            // 绑定事件
            const closeGuide = () => {
                this.cleanup();
                localStorage.setItem(guideId, 'true');
                if (nextCallback) nextCallback();
            };

            overlay.addEventListener('click', closeGuide);
            tooltip.querySelector('.guide-btn-primary').addEventListener('click', closeGuide);
        }, 500); // 等待 500ms 确保滚动完成
    },

    cleanup: function() {
        const overlay = document.querySelector('.guide-overlay');
        const highlight = document.querySelector('.guide-highlight-box');
        const tooltip = document.querySelector('.guide-tooltip');
        if (overlay) overlay.remove();
        if (highlight) highlight.remove();
        if (tooltip) tooltip.remove();
    }
};
window.GuideSystem = GuideSystem;

let loadingBtn = false

function renderTutorialContent() {
    const tutorialContentArea = document.getElementById('tutorial-content-area');
    const tutorials = [
        {title: 'Lời nói đầu', imageUrls: ['https://i.postimg.cc/3RJfvgzq/xie-zai-qian-mian(1).jpg']},
        {
            title: 'Giới thiệu ứng dụng',
            imageUrls: ['https://i.postimg.cc/VvsJRh6q/IMG-20250713-162647.jpg', 'https://i.postimg.cc/8P5FfxxD/IMG-20250713-162702.jpg', 'https://i.postimg.cc/3r94R3Sn/IMG-20250713-162712.jpg']
        },
        {
            title: '404',
            imageUrls: ['https://i.postimg.cc/x8scFPJW/IMG-20250713-162756.jpg', 'https://i.postimg.cc/pX6mfqtj/IMG-20250713-162809.jpg', 'https://i.postimg.cc/YScjV00q/IMG-20250713-162819.jpg', 'https://i.postimg.cc/13VfJw9j/IMG-20250713-162828.jpg']
        },
        {title: '404-Chat nhóm', imageUrls: ['https://i.postimg.cc/X7LSmRTJ/404.jpg']}
    ];
    tutorialContentArea.innerHTML = '';
    renderUpdateLog();
    tutorials.forEach(tutorial => {
        const item = document.createElement('div');
        item.className = 'tutorial-item';
        const imagesHtml = tutorial.imageUrls.map(url => `<img src="${url}" alt="${tutorial.title}Ảnh hướng dẫn">`).join('');
        item.innerHTML = `<div class="tutorial-header">${tutorial.title}</div><div class="tutorial-content">${imagesHtml}</div>`;
        tutorialContentArea.appendChild(item);
    });

    const backupDataBtn = document.createElement('button');
    backupDataBtn.className = 'btn btn-primary';
    backupDataBtn.textContent = 'Sao lưu dữ liệu';
    backupDataBtn.disabled = loadingBtn

    backupDataBtn.addEventListener('click', () => triggerManualBackup());
    const importDataBtn = document.createElement('label');
    importDataBtn.className = 'btn btn-neutral';
    importDataBtn.textContent = 'Nhập dữ liệu';
    importDataBtn.style.marginTop = '15px'
    importDataBtn.style.display = 'block'
    importDataBtn.disabled = loadingBtn;
    importDataBtn.setAttribute('for', 'import-data-input')
    document.querySelector('#import-data-input').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if(confirm('Thao tác này sẽ ghi đè toàn bộ lịch sử chat và cài đặt hiện tại. Không thể hoàn tác. Bạn chắc chắn muốn tiếp tục?')){
            try {
                showToast('Đang nhập dữ liệu, vui lòng đợi...');

                const decompressionStream = new DecompressionStream('gzip');
                const decompressedStream = file.stream().pipeThrough(decompressionStream);
                const jsonString = await new Response(decompressedStream).text();

                let data = JSON.parse(jsonString);

                const importResult = await importBackupData(data);

                if (importResult.success) {
                    showToast(`Nhập dữ liệu thành công! ${importResult.message} Ứng dụng sắp tải lại.`);
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showToast(`Nhập thất bại: ${importResult.error}`);
                }
            } catch (error) {
                console.error("Nhập thất bại:", error);
                showToast(`Có lỗi khi giải nén hoặc phân tích file: ${error.message}`);
            } finally {
                event.target.value = null;
            }
        }else {
            event.target.value = null;
        }

    })

    tutorialContentArea.appendChild(backupDataBtn);
    tutorialContentArea.appendChild(importDataBtn);

    // 定期备份提醒设置
    const reminderSection = document.createElement('div');
    reminderSection.innerHTML = `
        <div style="font-size:0.89rem; color:#999; margin:20px 0 8px;">Nhắc sao lưu định kỳ</div>
        <div class="btn-white" style="display:block; cursor:default; background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>Bật nhắc nhở</span>
                <label class="switch" style="position:relative; display:inline-block; width:40px; height:24px;">
                    <input type="checkbox" id="backup-reminder-switch" style="opacity:0; width:0; height:0;">
                    <span style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:#ccc; transition:.4s; border-radius:24px;" id="reminder-switch-slider"></span>
                    <style>
                        #backup-reminder-switch:checked + #reminder-switch-slider { background-color: #333; }
                        #reminder-switch-slider:before { position:absolute; content:""; height:16px; width:16px; left:4px; bottom:4px; background-color:white; transition:.4s; border-radius:50%; }
                        #backup-reminder-switch:checked + #reminder-switch-slider:before { transform: translateX(16px); }
                    </style>
                </label>
            </div>
            <div id="reminder-interval-setting" style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                <span style="font-size:0.89rem; color:#666;">Tần suất nhắc</span>
                <select id="backup-reminder-interval" style="border:1px solid #eee; padding:5px; border-radius:4px; font-size:0.89rem; background:#fff;">
                    <option value="1">Mỗi 1 ngày</option>
                    <option value="3">Mỗi 3 ngày</option>
                    <option value="7">Mỗi 7 ngày</option>
                    <option value="15">Mỗi 15 ngày</option>
                    <option value="30">Mỗi 30 ngày</option>
                </select>
            </div>
        </div>
    `;
    tutorialContentArea.appendChild(reminderSection);

    const reminderSwitch = document.getElementById('backup-reminder-switch');
    const reminderInterval = document.getElementById('backup-reminder-interval');
    
    if (db.backupReminderSettings) {
        reminderSwitch.checked = db.backupReminderSettings.enabled !== false;
        reminderInterval.value = db.backupReminderSettings.interval || 3;
        document.getElementById('reminder-interval-setting').style.display = reminderSwitch.checked ? 'flex' : 'none';
    }

    reminderSwitch.addEventListener('change', async () => {
        db.backupReminderSettings.enabled = reminderSwitch.checked;
        document.getElementById('reminder-interval-setting').style.display = reminderSwitch.checked ? 'flex' : 'none';
        await saveData();
    });

    reminderInterval.addEventListener('change', async () => {
        db.backupReminderSettings.interval = parseInt(reminderInterval.value);
        await saveData();
    });

    // GitHub Backup UI
    const githubSection = document.createElement('div');
    const iconEyeOpen = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    const iconEyeClosed = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

    githubSection.innerHTML = `
        <div style="font-size:0.89rem; color:#999; margin:20px 0 8px;">Sao lưu đám mây (GitHub)</div>
        <div class="btn-white" style="display:block; cursor:default; background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:12px;">
            <div id="gh-collapse-header" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; padding-bottom:5px;">
                <div style="display:flex; align-items:center;">
                    <span style="color:#333; font-weight:500;">🔧 Tham số cấu hình</span>
                    <div id="gh-help-btn" style="margin-left:8px; display:flex; align-items:center; padding:2px; cursor:pointer;">
                        <svg style="width:16px; height:16px; color:#1890ff;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    </div>
                </div>
                <svg class="toggle-icon" style="width:14px; height:14px; color:#999; transition:transform 0.3s;" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
            </div>

            <div id="gh-config-area" style="display:none; margin-top:10px; padding-top:10px; border-top:1px dashed #eee;">
                <div style="margin-bottom:10px;">
                    <div style="font-size:0.81rem; color:#666; margin-bottom:5px;">GitHub Token</div>
                    <div style="position:relative;">
                        <input type="password" id="gh-token-input" placeholder="ghp_xxxx..." style="width:100%; border:1px solid #eee; padding:8px; padding-right:35px; border-radius:4px; font-size:0.89rem;">
                        <div id="gh-eye-btn" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); color:#999; cursor:pointer; display:flex;">
                            ${iconEyeClosed}
                        </div>
                    </div>
                </div>
                <div style="margin-bottom:10px;">
                    <div style="font-size:0.81rem; color:#666; margin-bottom:5px;">Đường dẫn repo (tên người dùng/tên repo)</div>
                    <input type="text" id="gh-repo-input" placeholder="username/repo" style="width:100%; border:1px solid #eee; padding:8px; border-radius:4px; font-size:0.89rem;">
                </div>
                <div style="margin-bottom:10px;">
                    <div style="font-size:0.81rem; color:#666; margin-bottom:5px;">Tên file sao lưu (tùy chọn, điền thì sẽ ghi đè)</div>
                    <input type="text" id="gh-filename-input" placeholder="Ví dụ: my_backup.ee" style="width:100%; border:1px solid #eee; padding:8px; border-radius:4px; font-size:0.89rem;">
                </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; border-top:1px solid #f5f5f5; padding-top:10px;">
                <span>công tắc sao lưu tự động</span>
                <label class="switch" style="position:relative; display:inline-block; width:40px; height:24px;">
                    <input type="checkbox" id="gh-auto-switch" style="opacity:0; width:0; height:0;">
                    <span style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:#ccc; transition:.4s; border-radius:24px;" id="gh-switch-slider"></span>
                    <style>
                        #gh-auto-switch:checked + #gh-switch-slider { background-color: #333; }
                        #gh-switch-slider:before { position:absolute; content:""; height:16px; width:16px; left:4px; bottom:4px; background-color:white; transition:.4s; border-radius:50%; }
                        #gh-auto-switch:checked + #gh-switch-slider:before { transform: translateX(16px); }
                    </style>
                </label>
            </div>

            <div id="gh-interval-setting" style="display:none; justify-content:space-between; align-items:center; margin-top:10px;">
                <span style="font-size:0.89rem; color:#666;">Tần suất sao lưu</span>
                <select id="gh-interval-select" style="border:1px solid #eee; padding:5px; border-radius:4px; font-size:0.89rem; background:#fff;">
                    <option value="24">Mỗi 24 giờ</option>
                    <option value="36">Mỗi 36 giờ</option>
                    <option value="48">Mỗi 48 giờ</option>
                </select>
            </div>

            <div style="margin-top:15px; display:flex; gap:10px;">
                <div id="gh-backup-btn" style="flex:1; background:#333; color:#fff; text-align:center; padding:8px; border-radius:4px; font-size:0.89rem; cursor:pointer;">Sao lưu ngay</div>
                <div id="gh-restore-btn" style="flex:1; background:#1890ff; color:#fff; text-align:center; padding:8px; border-radius:4px; font-size:0.89rem; cursor:pointer;">Khôi phục bản mới nhất</div>
                <div id="gh-check-btn" style="flex:1; background:#f5f5f5; color:#666; text-align:center; padding:8px; border-radius:4px; font-size:0.89rem; cursor:pointer;">Kiểm tra trạng thái</div>
            </div>
            
            <div id="gh-status-msg" style="margin-top:10px; font-size:0.74rem; color:#999;"></div>
        </div>
    `;
    
    tutorialContentArea.appendChild(githubSection);

    const existingOverlay = document.getElementById('gh-help-overlay');
    if (existingOverlay) existingOverlay.remove();

    const helpOverlay = document.createElement('div');
    helpOverlay.id = 'gh-help-overlay';
    helpOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: none; align-items: center; justify-content: center;';
    
    helpOverlay.onclick = function(e) { 
        if(e.target === this) this.style.display = 'none'; 
    };
    
    helpOverlay.innerHTML = `
        <div class="modal-window" style="width: 85%; max-height: 80vh; overflow-y: auto; background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.2);">
            <h3 style="margin-top:0; margin-bottom:15px; text-align:center; font-size:1.1rem; color: var(--primary-color);">GitHub Hướng dẫn cấu hình</h3>
            
            <h4 style="margin:10px 0 5px; color:#333;">1. Lấy Token</h4>
            <ol style="padding-left:20px; font-size:0.89rem; color:#555; line-height:1.6;">
                <li>Đăng nhập GitHub, bấm ảnh đại diện → <strong>Settings</strong></li>
                <li>Cuối menu bên trái → <strong>Developer settings</strong></li>
                <li><strong>Personal access tokens</strong> → <strong>Tokens (classic)</strong></li>
                <li>Generate new token (classic)</li>
                <li>Expiration Chọn <strong>No expiration</strong></li>
                <li><strong style="color:#d32f2f;">Scopes Bắt buộc tích repo (gồm tất cả mục con)</strong></li>
                <li>Bấm Generate, sao chép chuỗi bắt đầu bằng ghp_.<br><strong style="color:#d32f2f;">Nhất định phải sao chép và cất kỹ ngay! Một khi tải lại trang, bạn sẽ không bao giờ thấy lại nó nữa.</strong></li>
            </ol>

            <h4 style="margin:15px 0 5px; color:#333;">2. Tạo repo</h4>
            <ol style="padding-left:20px; font-size:0.89rem; color:#555; line-height:1.6;">
                <li>Dấu + góc trên bên phải → <strong>New repository</strong></li>
                <li>Repository name Đặt một cái tên</li>
                <li>Nên chọn <strong>Private</strong> (Riêng tư)</li>
                <li>Bấm Create repository</li>
            </ol>

            <h4 style="margin:15px 0 5px; color:#333;">3. Ví dụ điền</h4>
            <ul style="padding-left:20px; font-size:0.89rem; color:#555; line-height:1.6;">
                <li>Token: <code>ghp_xxxxxxxxxxxx...</code></li>
                <li>Đường dẫn repo: <code>tên người dùng/tên repo</code></li>
            </ul>

            <div style="margin-top:20px; text-align: center;">
                <button class="btn btn-primary" onclick="document.getElementById('gh-help-overlay').style.display='none'">Mình hiểu rồi</button>
            </div>
        </div>
    `;
    document.body.appendChild(helpOverlay);

    document.getElementById('gh-collapse-header').addEventListener('click', function() {
        const area = document.getElementById('gh-config-area');
        const icon = this.querySelector('.toggle-icon');
        if (area.style.display === 'none') {
            area.style.display = 'block';
            icon.style.transform = 'rotate(180deg)';
        } else {
            area.style.display = 'none';
            icon.style.transform = 'rotate(0deg)';
        }
    });

    document.getElementById('gh-help-btn').addEventListener('click', function(e) {
        e.stopPropagation(); 
        document.getElementById('gh-help-overlay').style.display = 'flex';
    });

    document.getElementById('gh-eye-btn').addEventListener('click', function() {
        const input = document.getElementById('gh-token-input');
        if (input.type === 'password') {
            input.type = 'text';
            this.innerHTML = iconEyeOpen;
        } else {
            input.type = 'password';
            this.innerHTML = iconEyeClosed;
        }
    });

    const saveHandler = () => { if(window.GitHubMgr) window.GitHubMgr.saveConfig(); };
    document.getElementById('gh-token-input').addEventListener('change', saveHandler);
    document.getElementById('gh-repo-input').addEventListener('change', saveHandler);
    document.getElementById('gh-filename-input').addEventListener('change', saveHandler);
    document.getElementById('gh-auto-switch').addEventListener('change', saveHandler);
    document.getElementById('gh-interval-select').addEventListener('change', saveHandler);

    document.getElementById('gh-backup-btn').addEventListener('click', () => window.GitHubMgr.testUpload());
    document.getElementById('gh-restore-btn').addEventListener('click', () => window.GitHubMgr.restoreLatest());
    document.getElementById('gh-check-btn').addEventListener('click', () => window.GitHubMgr.checkStatus());

    if(window.GitHubMgr) {
        window.GitHubMgr.init();
    }
}

// 创建完整的备份数据
async function createFullBackupData() {
    const backupData = JSON.parse(JSON.stringify(db));
    backupData._exportVersion = '3.0'; 
    backupData._exportTimestamp = Date.now();
    return backupData;
}

// 导入备份数据
async function importBackupData(data) {
    const startTime = Date.now();
    try {
        await Promise.all([
            dexieDB.characters.clear(),
            dexieDB.groups.clear(),
            dexieDB.worldBooks.clear(),
            dexieDB.myStickers.clear(),
            dexieDB.globalSettings.clear()
        ]);
        showToast('Đang xóa dữ liệu cũ...');

        let convertedData = data;

        if (data._exportVersion !== '3.0') {
            showToast('Phát hiện file sao lưu bản cũ, đang chuyển định dạng...');
            
            const reassembleHistory = (chat, backupData) => {
                if (!chat.history || !Array.isArray(chat.history) || chat.history.length === 0) {
                    return [];
                }
                if (typeof chat.history[0] === 'object' && chat.history[0] !== null) {
                    return chat.history;
                }
                if (backupData.__chunks__ && typeof chat.history[0] === 'string') {
                    let fullHistory = [];
                    chat.history.forEach(key => {
                        if (backupData.__chunks__[key]) {
                            try {
                                const chunk = JSON.parse(backupData.__chunks__[key]);
                                fullHistory = fullHistory.concat(chunk);
                            } catch (e) {
                                console.error(`Failed to parse history chunk ${key}`, e);
                            }
                        }
                    });
                    return fullHistory;
                }
                return []; 
            };

            const newData = { ...data };

            if (newData.characters) {
                newData.characters = newData.characters.map(char => ({
                    ...char,
                    history: reassembleHistory(char, data)
                }));
            }
            if (newData.groups) {
                newData.groups = newData.groups.map(group => ({
                    ...group,
                    history: reassembleHistory(group, data)
                }));
            }

            // 兼容性处理：将旧版“世界书·中”转换为“世界书·前 + 深度300”
            if (newData.worldBooks && Array.isArray(newData.worldBooks)) {
                newData.worldBooks = newData.worldBooks.map(item => {
                    if (item.type === 'entry' && (item.position === 'middle' || item.position === 'center')) {
                        return {
                            ...item,
                            position: 'before',
                            depth: 300
                        };
                    }
                    return item;
                });
            }
            
            convertedData = newData;
        }

        Object.keys(db).forEach(key => {
            if (convertedData[key] !== undefined) {
                db[key] = convertedData[key];
            }
        });
        
        if (!db.insWidgetSettings) db.insWidgetSettings = { avatar1: 'https://i.postimg.cc/Y96LPskq/o-o-2.jpg', bubble1: 'love u.', avatar2: 'https://i.postimg.cc/GtbTnxhP/o-o-1.jpg', bubble2: 'miss u.' };
        if (!db.homeWidgetSettings) db.homeWidgetSettings = JSON.parse(JSON.stringify(defaultWidgetSettings));


        showToast('Đang ghi dữ liệu mới...');
        await saveData(db);

        const duration = Date.now() - startTime;
        const message = `Nhập xong (mất${duration}ms)`;
        
        return { success: true, message: message };

    } catch (error) {
        console.error('Nhập dữ liệu thất bại:', error);
        return {
            success: false,
            error: error.message,
            duration: Date.now() - startTime
        };
    }
}

// GitHub Manager
const GitHubMgr = {
    config: { token: '', repo: '', auto: false, interval: 48, lastTime: 0, fileName: '' },
    
    init: () => {
        const confStr = localStorage.getItem('gh_config');
        if(confStr) GitHubMgr.config = JSON.parse(confStr);
        
        const tokenInput = document.getElementById('gh-token-input');
        const repoInput = document.getElementById('gh-repo-input');
        const fileNameInput = document.getElementById('gh-filename-input');
        const autoSwitch = document.getElementById('gh-auto-switch');
        
        if(tokenInput) tokenInput.value = GitHubMgr.config.token || '';
        if(repoInput) repoInput.value = GitHubMgr.config.repo || '';
        if(fileNameInput) fileNameInput.value = GitHubMgr.config.fileName || '';
        
        if(autoSwitch) {
            autoSwitch.checked = GitHubMgr.config.auto || false;
            document.getElementById('gh-interval-setting').style.display = autoSwitch.checked ? 'flex' : 'none';
        }
        if(document.getElementById('gh-interval-select')) {
            document.getElementById('gh-interval-select').value = GitHubMgr.config.interval || 48;
        }
        
        if(GitHubMgr.config.auto) GitHubMgr.checkAndBackup();
        GitHubMgr.updateStatusText();
    },
    
    saveConfig: () => {
        let token = document.getElementById('gh-token-input').value.trim();
        // 自动清理 Token：移除前缀和空格
        token = token.replace(/^(Bearer|token)\s+/i, '').replace(/\s+/g, '');

        const repo = document.getElementById('gh-repo-input').value.trim();
        const fileName = document.getElementById('gh-filename-input').value.trim();
        const auto = document.getElementById('gh-auto-switch').checked;
        const interval = parseInt(document.getElementById('gh-interval-select').value);
        
        GitHubMgr.config.token = token;
        GitHubMgr.config.repo = repo;
        GitHubMgr.config.fileName = fileName;
        GitHubMgr.config.auto = auto;
        GitHubMgr.config.interval = interval;
        
        document.getElementById('gh-interval-setting').style.display = auto ? 'flex' : 'none';
        
        localStorage.setItem('gh_config', JSON.stringify(GitHubMgr.config));
        GitHubMgr.updateStatusText();
        
        if(auto) GitHubMgr.checkAndBackup();
    },
    
    updateStatusText: () => {
        const el = document.getElementById('gh-status-msg');
        if(!el) return;
        if(!GitHubMgr.config.lastTime) el.innerText = 'Chưa từng sao lưu';
        else {
            const date = new Date(GitHubMgr.config.lastTime);
            const nextTime = new Date(GitHubMgr.config.lastTime + (GitHubMgr.config.interval || 48) * 3600000);
            el.innerText = `Lần trước: ${date.toLocaleString()} (lần tới khoảng: ${nextTime.toLocaleString()})`;
        }
    },
    
    checkAndBackup: async () => {
        if(!GitHubMgr.config.token || !GitHubMgr.config.repo || !GitHubMgr.config.auto) return;
        const now = Date.now();
        const interval = GitHubMgr.config.interval || 48;
        const hours = (now - (GitHubMgr.config.lastTime || 0)) / (1000 * 60 * 60);
        
        if(hours >= interval) {
            console.log(`Đã ${hours.toFixed(1)} giờ kể từ lần sao lưu trước, kích hoạt sao lưu tự động...`);
            
            const toast = document.createElement('div');
            toast.style.cssText = 'position:fixed; top:10px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.7); color:#fff; padding:8px 15px; border-radius:20px; font-size:12px; z-index:9999; pointer-events:none; transition:opacity 0.5s;';
            toast.innerText = 'Đang chuẩn bị sao lưu tự động trong nền...';
            document.body.appendChild(toast);
            
            try {
                await GitHubMgr.performUpload((msg) => { toast.innerText = 'Sao lưu tự động: ' + msg; });
                toast.innerText = 'Sao lưu tự động thành công!';
                setTimeout(() => toast.remove(), 3000);
            } catch(e) {
                console.error('Sao lưu tự động thất bại', e);
                toast.innerText = 'Sao lưu tự động thất bại: ' + e.message;
                setTimeout(() => toast.remove(), 5000);
            }
        }
    },
    
    testUpload: async () => {
        GitHubMgr.saveConfig(); // 强制保存当前输入框的值
        if(!GitHubMgr.config.token || !GitHubMgr.config.repo) return alert('Vui lòng điền Token và đường dẫn repo trước');
        showToast('Bắt đầu sao lưu...');
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = 'Đang sao lưu...';
        btn.style.pointerEvents = 'none';
        
        try {
            await GitHubMgr.performUpload((msg) => { showToast(msg); });
            showToast('Tải lên thành công!');
        } catch(e) {
            showToast('Tải lên thất bại: ' + e.message);
        } finally {
            btn.innerText = originalText;
            btn.style.pointerEvents = 'auto';
        }
    },
    
    performUpload: async (onProgress) => {
        // 1. 预检权限
        onProgress('Đang kiểm tra quyền...');
        const checkUrl = `https://api.github.com/repos/${GitHubMgr.config.repo}`;
        const checkRes = await fetch(checkUrl, {
            headers: { 'Authorization': `token ${GitHubMgr.config.token}` }
        });
        
        if (!checkRes.ok) {
             if (checkRes.status === 401) throw new Error('Token không hợp lệ hoặc đã hết hạn (401)');
             if (checkRes.status === 404) throw new Error('Repo không tồn tại hoặc Token không có quyền truy cập (404)');
             throw new Error(`Kiểm tra quyền thất bại: ${checkRes.status}`);
        }
        
        const repoInfo = await checkRes.json();
        // 检查 push 权限
        if (repoInfo.permissions && repoInfo.permissions.push === false) {
            throw new Error('Token Thiếu quyền ghi (push), vui lòng tạo lại Token và tích quyền repo');
        }

        onProgress('Đang đóng gói dữ liệu...');
        const backupData = await createFullBackupData();
        const jsonString = JSON.stringify(backupData);
        
        onProgress('Đang nén...');
        const dataBlob = new Blob([jsonString]);
        const compressionStream = new CompressionStream('gzip');
        const compressedStream = dataBlob.stream().pipeThrough(compressionStream);
        const compressedBlob = await new Response(compressedStream, { headers: { 'Content-Type': 'application/octet-stream' } }).blob();
        
        onProgress('Đang mã hóa...');
        const base64Content = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const res = reader.result;
                let base64 = res.split(',')[1]; 
                // 移除可能存在的换行符，防止上传失败
                base64 = base64.replace(/\s/g, '');
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(compressedBlob);
        });

        onProgress('Đang tải lên GitHub...');
        let path = '';
        let sha = null;
        const customName = GitHubMgr.config.fileName;
        
        if (customName && customName.trim()) {
            path = customName.trim();
            if (!path.endsWith('.ee')) path += '.ee';
            
            try {
                const checkUrl = `https://api.github.com/repos/${GitHubMgr.config.repo}/contents/${encodeURIComponent(path)}`;
                const checkRes = await fetch(checkUrl, {
                    headers: { 'Authorization': `token ${GitHubMgr.config.token}` }
                });
                if (checkRes.ok) {
                    const fileData = await checkRes.json();
                    sha = fileData.sha;
                }
            } catch(e) {
                console.log('File does not exist or error checking:', e);
            }
        } else {
            const dateStr = new Date().toISOString().slice(0, 10);
            path = `AutoBackup_${dateStr}_${Date.now()}.ee`; 
        }
        
        const url = `https://api.github.com/repos/${GitHubMgr.config.repo}/contents/${encodeURIComponent(path)}`;
        
        const body = {
            message: `Auto backup`,
            content: base64Content
        };
        if (sha) body.sha = sha; 

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GitHubMgr.config.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify(body)
        });

        if(!response.ok) {
            const errJson = await response.json();
            throw new Error(errJson.message || 'GitHub API Error');
        }

        GitHubMgr.config.lastTime = Date.now();
        localStorage.setItem('gh_config', JSON.stringify(GitHubMgr.config));
        GitHubMgr.updateStatusText();
    },
    
    checkStatus: async () => {
        if(!GitHubMgr.config.token || !GitHubMgr.config.repo) return showToast('Chưa cấu hình');
        const url = `https://api.github.com/repos/${GitHubMgr.config.repo}`;
        try {
            const res = await fetch(url, { headers: { 'Authorization': `token ${GitHubMgr.config.token}` } });
            if(res.ok) {
                const data = await res.json();
                alert(`Kết nối thành công!\nRepo: ${data.full_name}\nRiêng tư: ${data.private}\nGhi chú: cấu hình hợp lệ`);
            } else {
                alert('Kết nối thất bại, vui lòng kiểm tra Token hoặc đường dẫn repo');
            }
        } catch(e) { alert('Lỗi mạng: ' + e.message); }
    },
    
    restoreLatest: async () => {
        if(!GitHubMgr.config.token || !GitHubMgr.config.repo) return alert('Vui lòng điền Token và đường dẫn repo trong cấu hình trước');
        if(!confirm('⚠️ Cảnh báo: thao tác này sẽ tải bản sao lưu tự động mới nhất và ghi đè toàn bộ dữ liệu hiện tại!\nKhông thể hoàn tác!\n\nBạn chắc chắn muốn tiếp tục?')) return;

        showToast('Đang kết nối GitHub...');
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = 'Đang khôi phục...';
        btn.style.pointerEvents = 'none';

        try {
            const customName = GitHubMgr.config.fileName;
            let targetFile = null;

            if (customName && customName.trim()) {
                let path = customName.trim();
                if (!path.endsWith('.ee')) path += '.ee';
                targetFile = { name: path };
            } else {
                const url = `https://api.github.com/repos/${GitHubMgr.config.repo}/contents/`;
                const res = await fetch(url, { headers: { 'Authorization': `token ${GitHubMgr.config.token}` } });
                
                if(!res.ok) {
                    if(res.status === 404) throw new Error('Repo không tồn tại hoặc sai đường dẫn');
                    if(res.status === 401) throw new Error('Token không hợp lệ hoặc không có quyền');
                    throw new Error('Lấy danh sách thất bại: ' + res.status);
                }
                
                const files = await res.json();
                
                const backups = files.filter(f => f.name.startsWith('AutoBackup_') && f.name.endsWith('.ee'));
                if(backups.length === 0) throw new Error('Không tìm thấy file sao lưu .ee nào trong repo');

                backups.sort((a, b) => {
                    const getTs = (name) => {
                        const match = name.match(/_(\d+)\.ee$/);
                        return match ? parseInt(match[1]) : 0;
                    };
                    return getTs(b.name) - getTs(a.name);
                });

                targetFile = backups[0];
            }

            if (!targetFile) throw new Error('Không tìm thấy file sao lưu để khôi phục');

            showToast('Đang tải xuống: ' + targetFile.name);

            const dlUrl = `https://api.github.com/repos/${GitHubMgr.config.repo}/contents/${encodeURIComponent(targetFile.name)}`;
            const dlRes = await fetch(dlUrl, {
                headers: {
                    'Authorization': `token ${GitHubMgr.config.token}`,
                    'Accept': 'application/vnd.github.v3.raw'
                }
            });

            if(!dlRes.ok) throw new Error('Tải file thất bại: ' + dlRes.status);
            
            showToast('Tải xong, đang giải nén...');
            const blob = await dlRes.blob();
            
            const decompressionStream = new DecompressionStream('gzip');
            const decompressedStream = blob.stream().pipeThrough(decompressionStream);
            const jsonString = await new Response(decompressedStream).text();
            
            const data = JSON.parse(jsonString);
            
            showToast('Giải nén xong, bắt đầu nhập...');
            const importResult = await importBackupData(data);

            if (importResult.success) {
                showToast(`Khôi phục thành công! ${importResult.message} Ứng dụng sắp tải lại.`);
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                throw new Error(importResult.error);
            }

        } catch(e) {
            console.error(e);
            alert('Khôi phục thất bại: ' + e.message);
            btn.innerText = originalText;
            btn.style.pointerEvents = 'auto';
        }
    }
};
window.GitHubMgr = GitHubMgr;

// 全局手动备份触发函数
async function triggerManualBackup() {
    if (loadingBtn) return;
    loadingBtn = true;
    try {
        showToast('Đang chuẩn bị xuất dữ liệu...');

        const fullBackupData = await createFullBackupData();

        const jsonString = JSON.stringify(fullBackupData);
        const dataBlob = new Blob([jsonString]);

        const compressionStream = new CompressionStream('gzip');
        const compressedStream = dataBlob.stream().pipeThrough(compressionStream);
        const compressedBlob = await new Response(compressedStream, { headers: { 'Content-Type': 'application/octet-stream' } }).blob();

        const url = URL.createObjectURL(compressedBlob);
        const a = document.createElement('a');
        const now = new Date();
        const date = now.toISOString().slice(0, 10);
        const time = now.toTimeString().slice(0, 8).replace(/:/g, '');
        a.href = url;
        a.download = `BachTuoc_SaoLuu_${date}_${time}.ee`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        loadingBtn = false;
        showToast('Xuất lịch sử chat thành công');
        
        // 更新提醒时间
        if (db.backupReminderSettings) {
            db.backupReminderSettings.lastReminderTime = Date.now();
            await saveData();
        }
    } catch (e) {
        loadingBtn = false;
        showToast(`Xuất thất bại, có lỗi xảy ra: ${e.message}`);
        console.error('Chi tiết lỗi xuất:', e);
    }
}
window.triggerManualBackup = triggerManualBackup;
