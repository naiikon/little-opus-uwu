const groupSettingsHtml = `
        <header class="app-header">
            <button class="back-btn" data-target="chat-room-screen">‹</button>
            <div class="title-container">
                <h1 class="title">Cài đặt nhóm</h1>
            </div>
            <div class="placeholder"></div>
        </header>
        <main class="content">
            <div class="kkt-settings-container">
                <!-- Phần đầu thông tin nhóm (giống hồ sơ cá nhân) -->
                <div class="kkt-profile-section">
                    <img src="" alt="Ảnh nhóm" id="setting-group-avatar-preview" class="kkt-profile-avatar" onclick="document.getElementById('setting-group-avatar-upload').click()">
                    <!-- Ô tải file ẩninput -->
                    <input type="file" id="setting-group-avatar-upload" accept="image/*" style="display:none;">
                    <!-- Tên nhóm hiển thị/sửa trực tiếp ở đây -->
                    <input type="text" id="setting-group-name" autocomplete="off" class="kkt-profile-name-input" placeholder="Nhập tên nhóm" style="text-align:center; border:none; background:transparent; font-size:18px; font-weight:bold; margin-top:10px; width:80%;">
                </div>

                <form id="group-settings-form">
                    <!-- Nhóm thông tin của tôi -->
                    <div class="kkt-group">
                        <div class="kkt-item">
                            <div class="kkt-item-label">Ảnh đại diện của tôi</div>
                            <div class="kkt-item-control" onclick="document.getElementById('setting-group-my-avatar-upload').click()">
                                <img src="" id="setting-group-my-avatar-preview" class="kkt-small-avatar">
                                <span class="kkt-arrow">›</span>
                            </div>
                            <input type="file" id="setting-group-my-avatar-upload" accept="image/*" style="display:none;">
                        </div>
                        <div class="kkt-item">
                            <div class="kkt-item-label">Biệt danh của tôi trong nhóm</div>
                            <div class="kkt-item-control">
                                <input type="text" id="setting-group-my-nickname" autocomplete="off" style="text-align:right; border:none; background:transparent;" placeholder="Bấm để sửa">
                            </div>
                        </div>
                        <div class="kkt-item" style="flex-direction:column; align-items:flex-start;">
                            <div class="kkt-item-label" style="margin-bottom:8px;">Persona của tôi</div>
                            <textarea id="setting-group-my-persona" style="width:100%; border:1px solid #eee; border-radius:8px; padding:8px; min-height:60px;" placeholder="Mô tả hình tượng của bạn trong nhóm này..."></textarea>
                        </div>
                    </div>

                    <!-- Nhóm quản lý thành viên -->
                    <div class="kkt-group" style="margin-top:15px;">
                        <div class="kkt-item" style="display:block;">
                            <div class="kkt-item-label" style="margin-bottom:10px;">Thành viên nhóm</div>
                            <div class="group-members-list" id="group-members-list-container" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 10px;"></div>
                        </div>
                    </div>

                    <!-- Nhóm cài đặt thông báo nhóm -->
                    <div class="kkt-group" style="margin-top:15px;">
                        <div class="kkt-item">
                            <div class="kkt-item-label">Bật thông báo nhóm</div>
                            <div class="kkt-item-control">
                                <label class="kkt-switch">
                                    <input type="checkbox" id="setting-group-show-notice">
                                    <span class="kkt-slider"></span>
                                </label>
                            </div>
                        </div>
                        <div class="kkt-item" style="flex-direction:column; align-items:flex-start;">
                            <div class="kkt-item-label" style="margin-bottom:8px;">Nội dung thông báo</div>
                            <textarea id="setting-group-notice" style="width:100%; border:1px solid #eee; border-radius:8px; padding:8px; min-height:80px;" placeholder="Nhập thông báo nhóm, sẽ dùng làm bối cảnh cốt truyện hiện tại..."></textarea>
                        </div>
                    </div>

                    <!-- Model riêng -->
                    <div class="kkt-group" style="margin-top: 15px;">
                        <div class="kkt-item">
                            <div class="kkt-item-label">Dùng model riêng</div>
                            <div class="kkt-item-control">
                                <label class="kkt-switch">
                                    <input type="checkbox" id="setting-group-exclusive-api-enabled">
                                    <span class="kkt-slider"></span>
                                </label>
                            </div>
                        </div>
                        <div class="kkt-item" id="setting-group-exclusive-api-container" style="display: none;">
                            <div class="kkt-item-label">Chọn preset API</div>
                            <div class="kkt-item-control">
                                <select id="setting-group-exclusive-api-preset-select" style="border:none; background:transparent; text-align:right; direction: rtl; appearance: none; -webkit-appearance: none; padding-right: 15px;">
                                    <option value="">Vui lòng chọn preset</option>
                                </select>
                                <span class="kkt-arrow">›</span>
                            </div>
                        </div>
                    </div>

                    <!-- Nhóm công tắc chức năng (tám riêng) -->
                    <div class="kkt-group" style="margin-top: 15px;">
                        <div class="kkt-item">
                            <div class="kkt-item-label">Cho phép chat riêng trong nhóm</div>
                            <div class="kkt-item-control">
                                <label class="kkt-switch">
                                    <input type="checkbox" id="setting-group-allow-gossip">
                                    <span class="kkt-slider"></span>
                                </label>
                            </div>
                        </div>
                        <div class="kkt-item">
                            <div class="kkt-item-label">Chế độ chat song ngữ</div>
                            <div class="kkt-item-control">
                                <label class="kkt-switch">
                                    <input type="checkbox" id="setting-group-bilingual-mode">
                                    <span class="kkt-slider"></span>
                                </label>
                            </div>
                        </div>
                        <div class="kkt-item" id="setting-group-bilingual-style-container">
                            <div class="kkt-item-label">Kiểu hiển thị bản dịch</div>
                            <div class="kkt-item-control">
                                <select id="setting-group-bilingual-style" style="border:none; background:transparent; text-align:right;">
                                    <option value="under">Ngoài bong bóng (mặc định)</option>
                                    <option value="inner">Trong bong bóng</option>
                                    <option value="inner-no-line">Trong bong bóng (không vạch chia)</option>
                                </select>
                                <span class="kkt-arrow">›</span>
                            </div>
                        </div>
                    </div>

                    <!-- Nhóm cài đặt sticker -->
                    <div class="kkt-group" style="margin-top:15px;">
                        <div class="kkt-item" style="flex-direction:column; align-items:flex-start;">
                            <div class="kkt-item-label" style="margin-bottom:8px;">Nhóm sticker được dùng</div>
                            <div id="setting-group-sticker-groups-container" style="width:100%; max-height: 120px; overflow-y: auto; border: 1px solid #eee; padding: 10px; border-radius: 8px;">
                                <!-- JS populate -->
                            </div>
                        </div>
                    </div>

                    <!-- Nhóm môi trường chat -->
                    <div class="kkt-group" style="margin-top:15px;">
                        <div class="kkt-item">
                            <div class="kkt-item-label">Hình nền chat</div>
                            <div class="kkt-item-control">
                                <span onclick="document.getElementById('setting-group-chat-bg-upload').click()" style="cursor:pointer; color:var(--primary-color);">Bấm để đổi</span>
                                <span style="margin: 0 8px; color: #eee;">|</span>
                                <span id="reset-group-chat-bg-btn" style="cursor:pointer; color:#999;">Khôi phục mặc định</span>
                            </div>
                            <input type="file" id="setting-group-chat-bg-upload" accept="image/*" style="display:none;">
                        </div>
                        <div class="kkt-item">
                            <div class="kkt-item-label">Màu chủ đạo</div>
                            <div class="kkt-item-control">
                                <select id="setting-group-theme-color" style="border:none; background:transparent; text-align:right;"></select>
                                <span class="kkt-arrow">›</span>
                            </div>
                        </div>
                        <div class="kkt-item">
                            <div class="kkt-item-label">Số lượt nhớ tối đa</div>
                            <div class="kkt-item-control">
                                <input type="number" id="setting-group-max-memory" value="100" min="1" style="width:50px; text-align:right; border:none;">
                            </div>
                        </div>
                        <div class="kkt-item" style="flex-direction: column; align-items: stretch; padding-bottom: 0;">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px;">
                                <div class="kkt-item-label">World book liên kết</div>
                                <div class="kkt-item-control">
                                    <button type="button" id="link-group-world-book-btn" class="btn btn-small btn-secondary" style="margin: 0; padding: 4px 8px;">Cài đặt</button>
                                </div>
                            </div>
                            <div id="group-bound-worldbooks-wrapper" style="display: none; padding-bottom: 10px;">
                                <div id="group-bound-worldbooks-toggle" style="font-size: 12px; color: #999; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                    <span>World book đã liên kết (<span id="group-bound-count">0</span>)</span>
                                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.3s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </div>
                                <div id="group-bound-worldbooks-container" style="display: none; padding-top: 8px;">
                                    <div id="group-bound-worldbooks-list" style="display: flex; flex-direction: column; gap: 4px;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="kkt-item">
                            <div class="kkt-item-label">Hiện mốc thời gian</div>
                            <div class="kkt-item-control">
                                <label class="kkt-switch">
                                    <input type="checkbox" id="setting-group-show-timestamp">
                                    <span class="kkt-slider"></span>
                                </label>
                            </div>
                        </div>
                        <div class="kkt-item" id="setting-group-timestamp-style-container">
                            <div class="kkt-item-label">Vị trí mốc thời gian</div>
                            <div class="kkt-item-control">
                                <select id="setting-group-timestamp-style" style="border:none; background:transparent; text-align:right;">
                                    <option value="bubble">Theo bong bóng</option>
                                    <option value="avatar">Dưới ảnh đại diện</option>
                                </select>
                                <span class="kkt-arrow">›</span>
                            </div>
                        </div>
                        <div class="kkt-item">
                            <div class="kkt-item-label">Bố cục tiêu đề trên</div>
                            <div class="kkt-item-control">
                                <select id="setting-group-title-layout" style="border:none; background:transparent; text-align:right;">
                                    <option value="left">Căn trái (mặc định)</option>
                                    <option value="center">Căn giữa</option>
                                </select>
                                <span class="kkt-arrow">›</span>
                            </div>
                        </div>
                        <div class="kkt-item" style="flex-direction: column; align-items: stretch; padding-bottom: 15px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <div class="kkt-item-label">Bo góc ảnh đại diện</div>
                                <span id="setting-group-avatar-radius-value" style="color: var(--primary-color); font-weight: bold;">50%</span>
                            </div>
                            <input type="range" id="setting-group-avatar-radius" min="0" max="50" step="1" value="50" style="width: 100%; accent-color: var(--primary-color);">
                        </div>
                    </div>

                    <!-- Nhóm kiểu bong bóng -->
                    <div class="kkt-group" style="margin-top:15px;">
                        <div class="kkt-item">
                            <div class="kkt-item-label">Kiểu bong bóng tùy chỉnh</div>
                            <div class="kkt-item-control">
                                <label class="kkt-switch">
                                    <input type="checkbox" id="setting-group-use-custom-css">
                                    <span class="kkt-slider"></span>
                                </label>
                            </div>
                        </div>
                        <div class="kkt-item" style="display:block;">
                             <div id="group-bubble-css-preview" class="bubble-css-preview" style="margin-bottom:10px;"></div>
                             <div id="group-bubble-author-note" style="font-size: 12px; color: #999; margin-bottom: 5px; display: none;"></div>
                             
                             <!-- Thanh công cụ tìm & thay CSS chat nhóm -->
                             <div class="textarea-edit-toolbar" id="group-css-toolbar">
                                <button type="button" class="toolbar-toggle-btn" title="Tìm & thay thế">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                </button>
                                <div class="toolbar-main-box" style="display: none;">
                                    <div class="toolbar-search-row">
                                        <input type="text" class="toolbar-search-input" placeholder="Tìm...">
                                        <span class="toolbar-match-count">0/0</span>
                                        <button type="button" class="toolbar-prev-btn" title="Trước">
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                        </button>
                                        <button type="button" class="toolbar-next-btn" title="Tiếp">
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </button>
                                        <button type="button" class="toolbar-expand-replace-btn" title="Mở thay thế">
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline></svg>
                                        </button>
                                    </div>
                                    <div class="toolbar-replace-row" style="display: none;">
                                        <input type="text" class="toolbar-replace-input" placeholder="Thay bằng...">
                                        <button type="button" class="toolbar-replace-btn" title="Thay mục này">
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 19"></polyline></svg>
                                        </button>
                                        <button type="button" class="toolbar-replace-all-btn" title="Thay tất cả">
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                                        </button>
                                    </div>
                                </div>
                             </div>

                             <textarea id="setting-group-custom-bubble-css" rows="4" placeholder="CSSCode..." style="width:100%; border:1px solid #eee; border-radius:8px; padding:5px;" disabled></textarea>
                             <div style="display:flex; justify-content:flex-end; gap:5px; margin-top:5px; flex-wrap: wrap;">
                                 <select id="group-bubble-preset-select" style="width:100px;"><option value="">Preset</option></select>
                                 <button type="button" id="group-apply-preset-btn" class="btn btn-small btn-primary" style="padding:4px 8px;">Áp dụng</button>
                                 <button type="button" id="group-save-preset-btn" class="btn btn-small" style="padding:4px 8px;">Lưu</button>
                                 <button type="button" id="group-manage-presets-btn" class="btn btn-small" style="padding:4px 8px;">QL</button>
                                 <button type="button" id="group-export-preset-btn" class="btn btn-small" style="padding:4px 8px;">Xuất</button>
                                 <button type="button" id="group-import-preset-btn" class="btn btn-small" style="padding:4px 8px;">Nhập</button>
                                 <button type="button" id="reset-group-custom-bubble-css-btn" class="btn btn-small btn-neutral" style="padding:4px 8px;">Đặt lại</button>
                             </div>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary" style="margin-top:20px;">Lưu mọi thay đổi</button>
                </form>

                <button type="button" class="kkt-danger-btn" id="clear-group-chat-history-btn">Xóa lịch sử chat</button>
            </div>
        </main>
`;

function injectGroupSettingsHtml() {
    const container = document.getElementById('group-settings-screen');
    if (container) {
        container.innerHTML = groupSettingsHtml;
    }
}
