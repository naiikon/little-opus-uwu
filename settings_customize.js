// --- 个性化与外观设置逻辑 ---

function setupWallpaperApp() {
    const e = document.getElementById('wallpaper-upload'), t = document.getElementById('wallpaper-preview');
    if (t) {
        t.style.backgroundImage = `url(${db.wallpaper})`;
        t.textContent = '';
    }
    if (e) {
        e.addEventListener('change', async (a) => {
            const n = a.target.files[0];
            if (n) {
                try {
                    const r = await compressImage(n, {quality: 0.85, maxWidth: 1080, maxHeight: 1920});
                    db.wallpaper = r;
                    applyWallpaper(r);
                    if (t) t.style.backgroundImage = `url(${r})`;
                    await saveData();
                    showToast('Đã cập nhật hình nền');
                } catch (error) {
                    showToast('Nén hình nền thất bại');
                }
            }
        });
    }
}

function setupCustomizeApp() {
    const customizeForm = document.getElementById('customize-form');
    
    document.body.addEventListener('click', async (e) => {
        const target = e.target;

        const header = target.closest('.collapsible-header');
        if (header) {
            const section = header.closest('.collapsible-section');
            if (section) {
                section.classList.toggle('open');
                return; 
            }
        }

        if (target.matches('.reset-icon-btn')) {
            const iconId = target.dataset.id;
            if (db.customIcons) {
                delete db.customIcons[iconId];
            }
            await saveData();
            renderCustomizeForm();
            setupHomeScreen();
            showToast('Đã đặt lại icon');
        }

        if (target.matches('#apply-global-css-now-btn')) {
            const textarea = document.getElementById('global-beautification-css');
            const newCss = textarea.value;
            db.globalCss = newCss;
            applyGlobalCss(newCss);
            await saveData();
            showToast('Đã áp dụng style toàn cục');
        }
        
        if (target.matches('#global-css-apply-btn')) {
            const select = document.getElementById('global-css-preset-select');
            const presetName = select.value;
            if (!presetName) return showToast('Vui lòng chọn một preset');
            const preset = db.globalCssPresets.find(p => p.name === presetName);
            if (preset) {
                const textarea = document.getElementById('global-beautification-css');
                textarea.value = preset.css;
                db.globalCss = preset.css;
                applyGlobalCss(preset.css);
                saveData();
                showToast('Đã áp dụng preset CSS toàn cục');
            }
        }
        
        if (target.matches('#global-css-save-btn')) {
            const textarea = document.getElementById('global-beautification-css');
            const css = textarea.value.trim();
            if (!css) return showToast('CSSNội dung trống, không thể lưu');
            const name = prompt('Nhập tên preset này (trùng tên sẽ ghi đè):');
            if (!name) return;
            if (!db.globalCssPresets) db.globalCssPresets = [];
            const existingIndex = db.globalCssPresets.findIndex(p => p.name === name);
            if (existingIndex > -1) {
                db.globalCssPresets[existingIndex].css = css;
            } else {
                db.globalCssPresets.push({ name, css });
            }
            saveData();
            populateGlobalCssPresetSelect();
            showToast('Đã lưu preset CSS toàn cục');
        }
        
        if (target.matches('#global-css-manage-btn')) {
            openGlobalCssManageModal();
        }
        
        if (target.matches('#apply-font-btn')) {
            const fontUrl = document.getElementById('customize-font-url').value.trim();
            if (fontUrl.startsWith('[本地字体] ')) {
                const presetName = fontUrl.replace('[本地字体] ', '');
                applyFontPreset(presetName);
            } else {
                db.fontUrl = fontUrl;
                await saveData();
                applyGlobalFont(fontUrl, false);
                showToast('Đã áp dụng font mới!');
            }
        }
        
        if (target.matches('#restore-font-btn')) {
            document.getElementById('customize-font-url').value = '';
            db.fontUrl = '';
            await saveData();
            applyGlobalFont('', false);
            showToast('Đã khôi phục font mặc định!');
        }

        if (target.matches('#font-apply-preset-btn')) {
            const select = document.getElementById('font-preset-select');
            const presetName = select.value;
            if (!presetName) return showToast('Vui lòng chọn một preset');
            applyFontPreset(presetName);
        }
        
        if (target.matches('#font-save-preset-btn')) {
            saveCurrentFontAsPreset();
        }
        
        if (target.matches('#font-manage-presets-btn')) {
            openFontManageModal();
        }

        if (target.matches('#sound-apply-preset-btn')) {
            const select = document.getElementById('sound-preset-select');
            const presetName = select.value;
            if (!presetName) return showToast('Vui lòng chọn một preset');
            applySoundPreset(presetName);
        }
        
        if (target.matches('#sound-save-preset-btn')) {
            saveCurrentSoundAsPreset();
        }
        
        if (target.matches('#sound-manage-presets-btn')) {
            openSoundManageModal();
        }

        if (target.matches('#test-send-sound-btn')) {
            const url = document.getElementById('global-send-sound-url').value;
            if (url) {
                try {
                    const audio = new Audio(url);
                    audio.play().catch(e => showToast('Phát thất bại: ' + e.message));
                } catch (e) {
                    showToast('Địa chỉ âm thanh không hợp lệ');
                }
            } else {
                showToast('Chưa đặt âm báo');
            }
        }
        if (target.matches('#reset-send-sound-btn')) {
            document.getElementById('global-send-sound-url').value = '';
            db.globalSendSound = '';
            saveData();
            showToast('Đã đặt lại');
        }
        if (target.matches('#test-receive-sound-btn')) {
            const url = document.getElementById('global-receive-sound-url').value;
            if (url) {
                try {
                    const audio = new Audio(url);
                    audio.play().catch(e => showToast('Phát thất bại: ' + e.message));
                } catch (e) {
                    showToast('Địa chỉ âm thanh không hợp lệ');
                }
            } else {
                showToast('Chưa đặt âm báo');
            }
        }
        if (target.matches('#reset-receive-sound-btn')) {
            document.getElementById('global-receive-sound-url').value = '';
            db.globalReceiveSound = '';
            saveData();
            showToast('Đã đặt lại');
        }
    });

    document.body.addEventListener('input', async (e) => {
        const target = e.target;

        if (target.dataset.iconId) { 
            const iconId = target.dataset.iconId;
            const newUrl = target.value.trim();
            const previewImg = document.getElementById(`icon-preview-${iconId}`);
            if (newUrl) {
                if (!db.customIcons) db.customIcons = {};
                db.customIcons[iconId] = newUrl;
                if(previewImg) previewImg.src = newUrl;
            }
            await saveData();
            setupHomeScreen();
        } 
        else if (target.dataset.widgetPart) {
            const part = target.dataset.widgetPart;
            const prop = target.dataset.widgetProp;
            const newValue = target.value.trim();

            if (prop) { 
                db.homeWidgetSettings[part][prop] = newValue;
            } else { 
                db.homeWidgetSettings[part] = newValue;
            }
            await saveData();
            setupHomeScreen();
        }
    });

    document.body.addEventListener('change', async (e) => {
        if (e.target.id === 'local-font-upload') {
            const file = e.target.files[0];
            if (!file) return;
            
            const validTypes = ['font/ttf', 'font/woff', 'font/woff2', 'font/otf'];
            const validExtensions = ['.ttf', '.woff', '.woff2', '.otf'];
            const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            
            if (!validTypes.includes(file.type) && !validExtensions.includes(fileExt)) {
                showToast('Định dạng font không được hỗ trợ, vui lòng tải file ttf, woff, woff2 hoặc otf');
                e.target.value = '';
                return;
            }

            try {
                showToast('Đang xử lý file font...');
                const presetId = 'font_' + Date.now();
                const fontFamily = 'CustomFont_' + Date.now();
                
                await dexieDB.customFonts.put({
                    id: presetId,
                    file: file,
                    timestamp: Date.now()
                });

                const presetName = file.name.substring(0, file.name.lastIndexOf('.'));
                const newPreset = {
                    id: presetId,
                    name: presetName,
                    isCustom: true,
                    fontFamily: fontFamily
                };

                const presets = _getFontPresets();
                presets.push(newPreset);
                _saveFontPresets(presets);
                
                await injectCustomFont(newPreset);
                populateFontPresetSelect();
                
                const select = document.getElementById('font-preset-select');
                if (select) {
                    select.value = presetName;
                    await applyFontPreset(presetName);
                }
                
                showToast('Đã tải lên và áp dụng font từ máy');
            } catch (error) {
                console.error('Tải font thất bại:', error);
                showToast('Tải font thất bại, vui lòng thử lại');
            } finally {
                e.target.value = '';
            }
        }

        if (e.target.matches('.icon-upload-input')) {
            const file = e.target.files[0];
            if (!file) return;
            const iconId = e.target.dataset.iconId;
            
            try {
                showToast('Đang xử lý ảnh...');
                const compressedUrl = await compressImage(file, { quality: 0.8, maxWidth: 200, maxHeight: 200 });
                
                if (!db.customIcons) db.customIcons = {};
                db.customIcons[iconId] = compressedUrl;
                
                const previewImg = document.getElementById(`icon-preview-${iconId}`);
                const urlInput = document.querySelector(`input[data-icon-id="${iconId}"][type="url"]`);
                
                if (previewImg) previewImg.src = compressedUrl;
                if (urlInput) urlInput.value = compressedUrl;
                
                await saveData();
                setupHomeScreen();
                showToast('Đã cập nhật icon');
            } catch (error) {
                console.error('Tải icon thất bại', error);
                showToast('Xử lý ảnh thất bại, vui lòng thử lại');
            } finally {
                e.target.value = null;
            }
        }

        if (e.target.id === 'global-send-sound-url') {
            db.globalSendSound = e.target.value.trim();
            saveData();
        }
        if (e.target.id === 'global-receive-sound-url') {
            db.globalReceiveSound = e.target.value.trim();
            saveData();
        }
        if (e.target.id === 'multi-msg-sound-switch') {
            db.multiMsgSoundEnabled = e.target.checked;
            saveData();
        }
        if (e.target.id === 'global-send-sound-upload' || e.target.id === 'global-receive-sound-upload') {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
                showToast('File quá lớn, vui lòng giới hạn trong 2MB');
                e.target.value = null;
                return;
            }
            const reader = new FileReader();
            reader.onload = async (evt) => {
                const base64 = evt.target.result;
                if (e.target.id === 'global-send-sound-upload') {
                    db.globalSendSound = base64;
                    document.getElementById('global-send-sound-url').value = base64;
                } else {
                    db.globalReceiveSound = base64;
                    document.getElementById('global-receive-sound-url').value = base64;
                }
                await saveData();
                showToast('Đã tải âm báo lên');
            };
            reader.readAsDataURL(file);
            e.target.value = null;
        }
    });
}

function renderCustomizeForm() {
    const customizeForm = document.getElementById('customize-form');
    customizeForm.innerHTML = ''; 
    
    const container = document.createElement('div');
    container.className = 'kkt-settings-container';
    
    const iconOrder = [
        'chat-list-screen', 'api-settings-screen', 'wallpaper-screen',
        'world-book-screen', 'customize-screen', 'tutorial-screen',
        'day-mode-btn', 'night-mode-btn', 'forum-screen', 'music-screen', 'console-screen', 'pomodoro-screen', 'storage-analysis-screen', 'widget-market-screen', 'reader-bookshelf-screen', 'placeholder-app'
    ];

    let iconsContentHTML = '';
    iconOrder.forEach(id => {
        if (!defaultIcons[id]) return;
        const { name, url } = defaultIcons[id];
        const currentIcon = (db.customIcons && db.customIcons[id]) || url;
        iconsContentHTML += `
        <div class="kkt-item">
            <div class="kkt-item-label">
                <img src="${currentIcon}" alt="${name}" class="kkt-small-avatar" id="icon-preview-${id}" style="width: 40px; height: 40px; border-radius: 10px; margin-right: 10px; object-fit: cover;">
                <span>${name || 'Chuyển chế độ'}</span>
            </div>
            <div class="kkt-item-control" style="gap: 8px;">
                <input type="url" placeholder="URL" value="${(db.customIcons && db.customIcons[id]) || ''}" data-icon-id="${id}" style="text-align:right; border:none; background:transparent; width: 100px; font-size: 13px; color: #888;">
                <input type="file" id="upload-icon-${id}" data-icon-id="${id}" accept="image/*" style="display:none;" class="icon-upload-input">
                <label for="upload-icon-${id}" class="btn btn-small btn-neutral" style="padding: 4px 8px; font-size: 12px; margin: 0; cursor: pointer;">📷</label>
                <button type="button" class="reset-icon-btn btn btn-small" data-id="${id}" style="padding: 4px 8px; font-size: 12px; margin: 0; background-color: #f0f0f0; color: #666; border:none;">↺</button>
            </div>
        </div>`;
    });

    const appearanceSection = `
    <div class="kkt-group-title" style="margin-left: 15px; margin-bottom: 8px; font-size: 13px; color: #666;">Giao diện & ngoại hình</div>
    <div class="kkt-group">
        <!-- Cỡ chữ -->
        <div class="kkt-item" style="flex-direction: column; align-items: stretch; padding-bottom: 15px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <div class="kkt-item-icon" style="background: transparent; color: #007AFF;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
                </div>
                <div class="kkt-item-content">
                    <div class="kkt-item-title">Cỡ chữ toàn cục</div>
                    <div class="kkt-item-subtitle">Điều chỉnh tỉ lệ phóng chữ trong ứng dụng</div>
                </div>
                <span id="font-size-value" style="color: var(--primary-color); font-weight: bold; font-size: 16px;">${(db.fontSizeScale || 1.0).toFixed(1)}x</span>
            </div>
            <input type="range" id="font-size-slider" min="0.8" max="1.5" step="0.1" value="${db.fontSizeScale || 1.0}" style="width: 100%; accent-color: var(--primary-color); margin-top: 8px;">
        </div>

        <!-- Cài đặt font -->
        <div class="kkt-item" onclick="document.getElementById('font-settings-modal').classList.add('visible')" style="cursor: pointer;">
            <div class="kkt-item-icon" style="background: transparent; color: #FF9500;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            </div>
            <div class="kkt-item-content">
                <div class="kkt-item-title">Font tùy chỉnh</div>
                <div class="kkt-item-subtitle">Tải lên hoặc nhập link font</div>
            </div>
            <span class="kkt-arrow">›</span>
        </div>

        <!-- Toàn cụcCSS -->
        <div class="kkt-item" onclick="document.getElementById('global-css-modal').classList.add('visible')" style="cursor: pointer;">
            <div class="kkt-item-icon" style="background: transparent; color: #AF52DE;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
            </div>
            <div class="kkt-item-content">
                <div class="kkt-item-title">Trang trí CSS toàn cục</div>
                <div class="kkt-item-subtitle">Tùy chỉnh style toàn ứng dụng</div>
            </div>
            <span class="kkt-arrow">›</span>
        </div>
    </div>
    `;

    const soundSectionHTML = `
    <div class="kkt-group-title" style="margin-left: 15px; margin-bottom: 8px; font-size: 13px; color: #666; margin-top: 20px;">Âm thanh & rung</div>
    <div class="kkt-group">
        <div class="kkt-item" onclick="document.getElementById('sound-settings-modal').classList.add('visible')" style="cursor: pointer;">
            <div class="kkt-item-icon" style="background: transparent; color: #34C759;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            </div>
            <div class="kkt-item-content">
                <div class="kkt-item-title">Âm báo tin nhắn</div>
                <div class="kkt-item-subtitle">Hiệu ứng âm thanh khi gửi và nhận tin</div>
            </div>
            <span class="kkt-arrow">›</span>
        </div>
    </div>
    `;

    const iconsSectionHTML = `
    <div class="kkt-group-title" style="margin-left: 15px; margin-bottom: 8px; font-size: 13px; color: #666; margin-top: 20px;">Cá nhân hóa</div>
    <div class="kkt-group">
        <div class="kkt-item" onclick="document.getElementById('icon-settings-modal').classList.add('visible')" style="cursor: pointer;">
            <div class="kkt-item-icon" style="background: transparent; color: #FF2D55;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </div>
            <div class="kkt-item-content">
                <div class="kkt-item-title">Icon tùy chỉnh</div>
                <div class="kkt-item-subtitle">Đổi icon ứng dụng trên màn hình chính</div>
            </div>
            <span class="kkt-arrow">›</span>
        </div>
    </div>
    `;

    container.innerHTML = appearanceSection + soundSectionHTML + iconsSectionHTML;
    customizeForm.appendChild(container);

    // 注入模态框 HTML 到 body (如果不存在)
    if (!document.getElementById('font-settings-modal')) {
        const modalsHTML = `
        <!-- Hộp cài đặt font -->
        <div id="font-settings-modal" class="modal-overlay">
            <div class="modal-window" style="max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0;">Font tùy chỉnh</h3>
                    <button class="icon-btn-simple" onclick="document.getElementById('font-settings-modal').classList.remove('visible')">✕</button>
                </div>
                <div class="form-group" style="margin-top: 15px;">
                    <input type="text" id="customize-font-url" placeholder="Ví dụ:https://example.com/font.woff2" value="${db.fontUrl && db.fontUrl.startsWith('CustomFont_') ? '[本地字体] Đã áp dụng' : (db.fontUrl || '')}" style="width:100%; border:1px solid #eee; border-radius:8px; padding:10px; font-size: 14px;">
                </div>
                <div class="form-group" style="margin-top: 10px;">
                    <input type="file" id="local-font-upload" accept=".ttf,.woff,.woff2,.otf" style="display: none;">
                    <label for="local-font-upload" class="btn btn-secondary" style="display: block; text-align: center; cursor: pointer; padding: 10px; border-radius: 8px; border: 1px dashed #ccc; background: #fafafa; color: #666;">
                        <span style="font-size: 16px; margin-right: 5px;">📁</span> Tải file font từ máy
                    </label>
                </div>
                <div style="background:#f9f9f9; padding:10px; border-radius:8px; margin-top:15px; border: 1px solid #f0f0f0;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                        <label for="font-preset-select" style="width:auto;color:#666;font-size:13px;">Thư viện preset</label>
                        <select id="font-preset-select" style="flex:1;padding:6px;border-radius:6px;border:1px solid #ddd;font-size:13px; background: transparent;"><option value="">— Chọn —</option></select>
                    </div>
                    <div style="display:flex;gap:8px;justify-content: flex-end;">
                        <button type="button" id="font-apply-preset-btn" class="btn btn-small btn-primary" style="padding:4px 8px;">Áp dụng</button>
                        <button type="button" id="font-save-preset-btn" class="btn btn-small" style="padding:4px 8px;">Lưu</button>
                        <button type="button" id="font-manage-presets-btn" class="btn btn-small" style="padding:4px 8px;">Quản lý</button>
                    </div>
                </div>
                <div style="display:flex; gap:10px; justify-content: flex-end; margin-top: 15px;">
                    <button type="button" id="restore-font-btn" class="btn btn-neutral btn-small">Khôi phục mặc định</button>
                    <button type="button" id="apply-font-btn" class="btn btn-primary btn-small">Áp dụng luôn</button>
                </div>
            </div>
        </div>

        <!-- Hộp CSS toàn cục -->
        <div id="global-css-modal" class="modal-overlay">
            <div class="modal-window" style="max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0;">Trang trí CSS toàn cục</h3>
                    <button class="icon-btn-simple" onclick="document.getElementById('global-css-modal').classList.remove('visible')">✕</button>
                </div>
                <div class="form-group" style="margin-top: 15px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <label for="global-beautification-css" style="font-weight: bold; font-size: 14px; color: var(--primary-color); margin-bottom: 0;">CSSCode</label>
                        <button type="button" id="apply-global-css-now-btn" class="btn btn-primary btn-small" style="width:auto;">Áp dụng ngay</button>
                    </div>
                    <textarea id="global-beautification-css" class="form-group" rows="8" placeholder="Nhập code CSS ở đây..." style="width:100%; border:1px solid #eee; border-radius:8px; padding:10px; font-family: monospace; font-size: 12px;"></textarea>
                </div>
                <div style="background:#f9f9f9; padding:10px; border-radius:8px; border: 1px solid #f0f0f0;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                        <label for="global-css-preset-select" style="width:auto;color:#666;font-size:13px;">Thư viện preset</label>
                        <select id="global-css-preset-select" style="flex:1;padding:6px;border-radius:6px;border:1px solid #ddd;font-size:13px; background: transparent;"><option value="">-- Chọn --</option></select>
                    </div>
                    <div style="display:flex;gap:8px;justify-content: flex-end;">
                        <button type="button" id="global-css-apply-btn" class="btn btn-small btn-primary" style="padding:4px 8px;">Áp dụng</button>
                        <button type="button" id="global-css-save-btn" class="btn btn-small" style="padding:4px 8px;">Lưu</button>
                        <button type="button" id="global-css-manage-btn" class="btn btn-small" style="padding:4px 8px;">Quản lý</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Hộp cài đặt âm báo -->
        <div id="sound-settings-modal" class="modal-overlay">
            <div class="modal-window" style="max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0;">Âm báo tin nhắn</h3>
                    <button class="icon-btn-simple" onclick="document.getElementById('sound-settings-modal').classList.remove('visible')">✕</button>
                </div>
                <div class="form-group" style="margin-top: 15px; margin-bottom: 15px;">
                    <label style="font-weight: bold; font-size: 13px; color: #333;">Âm báo bắt đầu tạo</label>
                    <div style="display: flex; gap: 8px; margin-top: 5px;">
                        <input type="url" id="global-send-sound-url" placeholder="Âm thanhURL" value="${db.globalSendSound || ''}" style="flex: 1; border: 1px solid #eee; border-radius: 8px; padding: 8px; font-size: 13px;">
                        <input type="file" id="global-send-sound-upload" accept="audio/*" style="display: none;">
                        <label for="global-send-sound-upload" class="btn btn-secondary btn-small" style="margin: 0; display: flex; align-items: center; cursor: pointer;">📂</label>
                        <button type="button" id="test-send-sound-btn" class="btn btn-primary btn-small" style="margin: 0;">▶</button>
                        <button type="button" id="reset-send-sound-btn" class="btn btn-danger btn-small" style="margin: 0;">×</button>
                    </div>
                </div>
                <div class="form-group">
                    <label style="font-weight: bold; font-size: 13px; color: #333;">Âm báo nhận trả lời</label>
                    <div style="display: flex; gap: 8px; margin-top: 5px;">
                        <input type="url" id="global-receive-sound-url" placeholder="Âm thanhURL" value="${db.globalReceiveSound || ''}" style="flex: 1; border: 1px solid #eee; border-radius: 8px; padding: 8px; font-size: 13px;">
                        <input type="file" id="global-receive-sound-upload" accept="audio/*" style="display: none;">
                        <label for="global-receive-sound-upload" class="btn btn-secondary btn-small" style="margin: 0; display: flex; align-items: center; cursor: pointer;">📂</label>
                        <button type="button" id="test-receive-sound-btn" class="btn btn-primary btn-small" style="margin: 0;">▶</button>
                        <button type="button" id="reset-receive-sound-btn" class="btn btn-danger btn-small" style="margin: 0;">×</button>
                    </div>
                </div>
                
                <div class="form-group" style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                    <label for="multi-msg-sound-switch" style="font-weight: bold; font-size: 13px; color: #333; margin-bottom: 0;">Âm báo liên tục cho nhiều tin</label>
                    <label class="kkt-switch">
                        <input type="checkbox" id="multi-msg-sound-switch" ${db.multiMsgSoundEnabled ? 'checked' : ''}>
                        <span class="kkt-slider"></span>
                    </label>
                </div>
                <p style="font-size: 12px; color: #999; margin-top: 5px;">Khi bật, mỗi tin trong chuỗi tin AI trả lời liên tiếp đều phát âm báo.</p>

                <div style="background:#f9f9f9; padding:10px; border-radius:8px; margin-top:15px; border: 1px solid #f0f0f0;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                        <label for="sound-preset-select" style="width:auto;color:#666;font-size:13px;">Thư viện preset</label>
                        <select id="sound-preset-select" style="flex:1;padding:6px;border-radius:6px;border:1px solid #ddd;font-size:13px; background: transparent;"><option value="">— Chọn —</option></select>
                    </div>
                    <div style="display:flex;gap:8px;justify-content: flex-end;">
                        <button type="button" id="sound-apply-preset-btn" class="btn btn-small btn-primary" style="padding:4px 8px;">Áp dụng</button>
                        <button type="button" id="sound-save-preset-btn" class="btn btn-small" style="padding:4px 8px;">Lưu</button>
                        <button type="button" id="sound-manage-presets-btn" class="btn btn-small" style="padding:4px 8px;">Quản lý</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Hộp icon tùy chỉnh -->
        <div id="icon-settings-modal" class="modal-overlay">
            <div class="modal-window" style="max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0;">Icon tùy chỉnh</h3>
                    <button class="icon-btn-simple" onclick="document.getElementById('icon-settings-modal').classList.remove('visible')">✕</button>
                </div>
                <div style="border-top: 1px solid #f5f5f5; padding-top: 15px;">
                    ${iconsContentHTML}
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalsHTML);
    } else {
        // 更新模态框内容
        document.getElementById('icon-settings-modal').querySelector('.modal-window > div:last-child').innerHTML = iconsContentHTML;
        const globalCssTextarea = document.getElementById('global-beautification-css');
        if (globalCssTextarea) {
            globalCssTextarea.value = db.globalCss || '';
        }
    }

    populateGlobalCssPresetSelect();
    populateFontPresetSelect();
    populateSoundPresetSelect();

    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontSizeValue = document.getElementById('font-size-value');
    if (fontSizeSlider) {
        fontSizeSlider.addEventListener('input', (e) => {
            const scale = parseFloat(e.target.value);
            fontSizeValue.textContent = `${scale.toFixed(1)}x`;
            applyFontSize(scale);
        });
        fontSizeSlider.addEventListener('change', async (e) => {
            const scale = parseFloat(e.target.value);
            db.fontSizeScale = scale;
            await saveData();
            showToast('Đã lưu cỡ chữ');
        });
    }

    const globalCssTextarea = document.getElementById('global-beautification-css');
    if (globalCssTextarea) {
        globalCssTextarea.value = db.globalCss || '';
    }
}
