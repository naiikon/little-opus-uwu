const chatSettingsHtml = `
        <header class="app-header">
            <button class="back-btn" data-target="chat-room-screen">‹</button>
            <div class="title-container">
                <h1 class="title">Cài đặt chat</h1>
            </div>
            <div class="placeholder"></div>
        </header>
        <main class="content">
            <div class="kkt-settings-container">
                <!-- Phần hồ sơ cá nhân -->
                <div class="kkt-profile-section">
                    <img src="" alt="Avatar" id="setting-char-avatar-preview" class="kkt-profile-avatar" onclick="document.getElementById('setting-char-avatar-upload').click()">
                    <div class="kkt-profile-name" id="setting-char-name-display"></div>
                    <!-- Ô tải file ẩninput -->
                    <input type="file" id="setting-char-avatar-upload" accept="image/*" style="display:none;">
                </div>

                <!-- Tab Thanh điều hướng -->
                <div class="settings-tabs">
                    <div class="settings-tab-item active" data-tab="setting-tab-basic">Thiết lập</div>
                    <div class="settings-tab-item" data-tab="setting-tab-func">Chức năng</div>
                    <div class="settings-tab-item" data-tab="setting-tab-style">Trang trí</div>
                    <div class="settings-tab-item" data-tab="setting-tab-exclusive">Riêng</div>
                </div>

                <form id="chat-settings-form">
                    
                    <!-- 【Thiết lập】Tab nội dung -->
                    <div id="setting-tab-basic" class="settings-tab-content active">
                        <!-- Nhóm thông tin nhân vật -->
                        <div class="kkt-group">
                            <div class="kkt-item">
                                <div class="kkt-item-label">Tên thật nhân vật</div>
                                <div class="kkt-item-control">
                                    <input type="text" id="setting-char-realname" autocomplete="off" style="text-align:right; border:none; background:transparent;" placeholder="Bấm để sửa">
                                </div>
                            </div>
                            <div class="kkt-item">
                                <div class="kkt-item-label">Tên ghi chú</div>
                                <div class="kkt-item-control">
                                    <input type="text" id="setting-char-remark" autocomplete="off" style="text-align:right; border:none; background:transparent;" placeholder="Bấm để sửa">
                                </div>
                            </div>
                            <div class="kkt-item" style="flex-direction:column; align-items:flex-start;">
                                <div class="kkt-item-label" style="margin-bottom:8px;">Thiết lập nhân vật</div>
                                <textarea id="setting-char-persona" style="width:100%; border:1px solid #eee; border-radius:8px; padding:8px; min-height:80px;" placeholder="Mô tả chi tiết tính cách nhân vật..."></textarea>
                            </div>
                             <!-- Nhóm sticker -->
                            <div class="kkt-item" style="flex-direction:column; align-items:flex-start;">
                                <div class="kkt-item-label" style="margin-bottom:8px;">Nhóm sticker được dùng</div>
                                <div id="setting-char-sticker-groups-container" style="width:100%; max-height: 120px; overflow-y: auto; border: 1px solid #eee; padding: 10px; border-radius: 8px;">
                                    <!-- JS populate -->
                                </div>
                            </div>
                        </div>

                        <!-- World book liên kết (chuyển lên trước thông tin của tôi) -->
                        <div class="kkt-group" style="margin-top:15px;">
                            <div class="kkt-item" style="flex-direction: column; align-items: stretch; padding-bottom: 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px;">
                                    <div class="kkt-item-label">World book liên kết</div>
                                    <div class="kkt-item-control">
                                        <button type="button" id="link-world-book-btn" class="btn btn-small btn-secondary" style="margin: 0; padding: 4px 8px;">Cài đặt</button>
                                    </div>
                                </div>
                                <div id="private-bound-worldbooks-wrapper" style="display: none; padding-bottom: 10px;">
                                    <div id="private-bound-worldbooks-toggle" style="font-size: 12px; color: #999; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                        <span>World book đã liên kết (<span id="private-bound-count">0</span>)</span>
                                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.3s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </div>
                                    <div id="private-bound-worldbooks-container" style="display: none; padding-top: 8px;">
                                        <div id="private-bound-worldbooks-list" style="display: flex; flex-direction: column; gap: 4px;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Nhóm thông tin của tôi -->
                        <div class="kkt-group" style="margin-top:15px;">
                            <div class="kkt-item">
                                <div class="kkt-item-label">Ảnh đại diện của tôi</div>
                                <div class="kkt-item-control" onclick="document.getElementById('setting-my-avatar-upload').click()">
                                    <img src="" id="setting-my-avatar-preview" class="kkt-small-avatar">
                                    <span class="kkt-arrow">›</span>
                                </div>
                                <input type="file" id="setting-my-avatar-upload" accept="image/*" style="display:none;">
                            </div>
                            <div class="kkt-item">
                                <div class="kkt-item-label">Tên của tôi</div>
                                <div class="kkt-item-control">
                                    <input type="text" id="setting-my-name" autocomplete="off" style="text-align:right; border:none; background:transparent;" placeholder="Bấm để sửa">
                                </div>
                            </div>
                            <div class="kkt-item">
                                <div class="kkt-item-label">Biệt danh của tôi</div>
                                <div class="kkt-item-control">
                                    <input type="text" id="setting-my-remark-name" autocomplete="off" style="text-align:right; border:none; background:transparent;" placeholder="Để trống sẽ hiện tên của tôi">
                                </div>
                            </div>
                            <div class="kkt-item" style="flex-direction:column; align-items:flex-start;">
                                <div class="kkt-item-label" style="margin-bottom:8px;">Persona của tôi</div>
                                <textarea id="setting-my-persona" style="width:100%; border:1px solid #eee; border-radius:8px; padding:8px; min-height:60px;" placeholder="Mô tả hình tượng của bạn..."></textarea>
                            </div>
                            <!-- Preset persona -->
                            <div class="kkt-item">
                                 <div class="kkt-item-label">Preset persona</div>
                                 <div class="kkt-item-control">
                                     <select id="mypersona-preset-select" style="border:none; bg:transparent; width:100px;"><option value="">Chọn</option></select>
                                     <button type="button" id="mypersona-apply-btn" class="btn btn-small btn-primary" style="padding:4px 8px; margin-left:5px;">Áp dụng</button>
                                     <button type="button" id="mypersona-save-btn" class="btn btn-small" style="padding:4px 8px; margin-left:5px;">Lưu</button>
                                     <button type="button" id="mypersona-manage-btn" class="btn btn-small" style="padding:4px 8px; margin-left:5px;">QL</button>
                                 </div>
                            </div>
                        </div>
                    </div>

                    <!-- 【Chức năng】Tab nội dung -->
                    <div id="setting-tab-func" class="settings-tab-content">
                        <!-- Tăng cường chat -->
                        <div class="kkt-group">
                            <div class="kkt-item">
                                <div class="kkt-item-label">Số lượt nhớ tối đa</div>
                                <div class="kkt-item-control">
                                    <input type="number" id="setting-max-memory" value="100" min="1" style="width:50px; text-align:right; border:none;">
                                </div>
                            </div>
                            <div class="kkt-item">
                                <div class="kkt-item-label">Chế độ chat song ngữ</div>
                                <div class="kkt-item-control">
                                    <label class="kkt-switch">
                                        <input type="checkbox" id="setting-bilingual-mode">
                                        <span class="kkt-slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="kkt-item" id="setting-bilingual-style-container">
                                <div class="kkt-item-label">Kiểu hiển thị bản dịch</div>
                                <div class="kkt-item-control">
                                    <select id="setting-bilingual-style" style="border:none; background:transparent; text-align:right;">
                                        <option value="under">Ngoài bong bóng (mặc định)</option>
                                        <option value="inner">Trong bong bóng</option>
                                        <option value="inner-no-line">Trong bong bóng (không vạch chia)</option>
                                    </select>
                                    <span class="kkt-arrow">›</span>
                                </div>
                            </div>
                            <div class="kkt-item">
                                <div class="kkt-item-label">Tùy chỉnh số tin trả lời</div>
                                <div class="kkt-item-control">
                                    <label class="kkt-switch">
                                        <input type="checkbox" id="setting-reply-count-enabled">
                                        <span class="kkt-slider"></span>
                                    </label>
                                </div>
                            </div>
                        
                            <div class="kkt-item" id="setting-reply-count-container" style="display: none;">
                                <div class="kkt-item-label">Khoảng số tin trả lời</div>
                                <div class="kkt-item-control" style="gap: 5px;">
                                    <input type="number" id="setting-reply-count-min" value="3" min="1" style="width:30px; text-align:center; border:none; background: rgba(0,0,0,0.05); border-radius: 4px;">
                                    <span style="color:#999;">-</span>
                                    <input type="number" id="setting-reply-count-max" value="8" min="1" style="width:30px; text-align:center; border:none; background: rgba(0,0,0,0.05); border-radius: 4px;">
                                </div>
                            </div>
                        </div>

                        <!-- Trung tâm điều khiển tương tác -->
                        <div class="feature-control-center" style="margin-top: 15px;">
                            <div class="feature-grid">
                                <!-- Album thật -->
                                <div class="feature-card" data-feature="gallery">
                                    <div class="feature-card-header">
                                        <div class="feature-card-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                        </div>
                                        <label class="kkt-switch">
                                            <input type="checkbox" id="setting-use-real-gallery">
                                            <span class="kkt-slider"></span>
                                        </label>
                                    </div>
                                    <div class="feature-card-body">
                                        <div class="feature-card-title">Album thật</div>
                                        <div class="feature-card-desc">Gửi ảnh khớp trong album</div>
                                    </div>
                                </div>

                                <!-- Tương tác Khoảnh khắc -->
                                <div class="feature-card" data-feature="moments">
                                    <div class="feature-card-header">
                                        <div class="feature-card-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                                        </div>
                                        <label class="kkt-switch">
                                            <input type="checkbox" id="setting-moments-enabled">
                                            <span class="kkt-slider"></span>
                                        </label>
                                    </div>
                                    <div class="feature-card-body">
                                        <div class="feature-card-title">Tương tác Khoảnh khắc</div>
                                        <div class="feature-card-desc">Cho phép nhân vật đăng bài</div>
                                    </div>
                                </div>

                                <!-- Tương tác Cửa hàng -->
                                <div class="feature-card" data-feature="shop">
                                    <div class="feature-card-header">
                                        <div class="feature-card-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                        </div>
                                        <label class="kkt-switch">
                                            <input type="checkbox" id="setting-shop-interaction-enabled">
                                            <span class="kkt-slider"></span>
                                        </label>
                                    </div>
                                    <div class="feature-card-body">
                                        <div class="feature-card-title">Tương tác Cửa hàng</div>
                                        <div class="feature-card-desc">Cho phép nhân vật mua hàng</div>
                                    </div>
                                </div>

                                <!-- Gọi video -->
                                <div class="feature-card" data-feature="call">
                                    <div class="feature-card-header">
                                        <div class="feature-card-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                        </div>
                                        <label class="kkt-switch">
                                            <input type="checkbox" id="setting-video-call-enabled">
                                            <span class="kkt-slider"></span>
                                        </label>
                                    </div>
                                    <div class="feature-card-body">
                                        <div class="feature-card-title">Chủ động gọi</div>
                                        <div class="feature-card-desc">Cho phép nhân vật gọi điện</div>
                                    </div>
                                </div>

                                <!-- Thanh trạng thái nhân vật -->
                                <div class="feature-card" data-feature="status">
                                    <div class="feature-card-header">
                                        <div class="feature-card-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M6 12h12M6 8h12M6 16h12"></path></svg>
                                        </div>
                                        <label class="kkt-switch">
                                            <input type="checkbox" id="setting-status-panel-enabled">
                                            <span class="kkt-slider"></span>
                                        </label>
                                    </div>
                                    <div class="feature-card-body">
                                        <div class="feature-card-title">Thanh trạng thái nhân vật</div>
                                        <div class="feature-card-desc">Hiện trạng thái thời gian thực của nhân vật</div>
                                    </div>
                                </div>

                                <!-- Tin nhắn tự động khi chạy nền -->
                                <div class="feature-card" data-feature="auto-reply">
                                    <div class="feature-card-header">
                                        <div class="feature-card-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                        </div>
                                        <label class="kkt-switch">
                                            <input type="checkbox" id="setting-auto-reply-enabled">
                                            <span class="kkt-slider"></span>
                                        </label>
                                    </div>
                                    <div class="feature-card-body">
                                        <div class="feature-card-title">Tin nhắn tự động</div>
                                        <div class="feature-card-desc">Chủ động gửi tin khi chạy nền</div>
                                    </div>
                                </div>

                                <!-- AirDrop tự động -->
                                <div class="feature-card" data-feature="auto-airdrop">
                                    <div class="feature-card-header">
                                        <div class="feature-card-icon">
                                            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M10 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4zM6 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6z"/><path d="M8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM1.599 4.058a.5.5 0 0 1 .208.676A6.967 6.967 0 0 0 1 8c0 1.18.292 2.292.807 3.266a.5.5 0 0 1-.884.468A7.968 7.968 0 0 1 0 8c0-1.347.334-2.619.923-3.734a.5.5 0 0 1 .676-.208zm12.802 0a.5.5 0 0 1 .676.208A7.967 7.967 0 0 1 16 8a7.967 7.967 0 0 1-.923 3.734.5.5 0 0 1-.884-.468A6.967 6.967 0 0 0 15 8c0-1.18-.292-2.292-.807-3.266a.5.5 0 0 1 .208-.676zM3.057 5.534a.5.5 0 0 1 .284.648A4.986 4.986 0 0 0 3 8c0 .642.12 1.255.34 1.818a.5.5 0 1 1-.93.364A5.986 5.986 0 0 1 2 8c0-.769.145-1.505.41-2.182a.5.5 0 0 1 .647-.284zm9.886 0a.5.5 0 0 1 .648.284C13.855 6.495 14 7.231 14 8c0 .769-.145 1.505-.41 2.182a.5.5 0 0 1-.93-.364C12.88 9.255 13 8.642 13 8c0-.642-.12-1.255-.34-1.818a.5.5 0 0 1 .283-.648z"/></svg>
                                        </div>
                                        <label class="kkt-switch">
                                            <input type="checkbox" id="setting-auto-airdrop-enabled">
                                            <span class="kkt-slider"></span>
                                        </label>
                                    </div>
                                    <div class="feature-card-body">
                                        <div class="feature-card-title">AirDrop tự động</div>
                                        <div class="feature-card-desc">Tự nhận khi nhân vật gửi ảnh</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Cài đặt chi tiết thanh trạng thái (bảng gập) -->
                            <div id="status-panel-settings-container" class="feature-details-panel">
                                <div class="kkt-group">
                                    <div class="kkt-item" style="flex-direction:column; align-items:flex-start;">
                                        <div class="preset-select-container" style="width: 100%; margin-bottom: 10px;">
                                            <label class="preset-select-label">Điền nhanh từ preset</label>
                                            <div style="display:flex; gap:5px; align-items:center;">
                                                <select id="setting-status-preset-select" style="flex:1; border: 1px solid #eee; border-radius: 6px; padding: 6px;">
                                                    <option value="">-- Chọn preset để tự điền --</option>
                                                </select>
                                                <button type="button" id="quick-save-status-preset-btn" class="btn btn-small" style="padding: 6px 12px; white-space: nowrap;">Lưu</button>
                                            </div>
                                        </div>
                                        <div class="kkt-item-label" style="margin-bottom:8px;">Yêu cầu định dạng thanh trạng thái (Prompt Suffix)</div>
                                        <textarea id="setting-status-prompt-suffix" style="width:100%; border:1px solid #eee; border-radius:8px; padding:8px; min-height:60px;" placeholder="Ví dụ: hãy xuất mã trạng thái ở cuối câu trả lời:[HP:xx]"></textarea>
                                    </div>
                                    <div class="kkt-item" style="flex-direction:column; align-items:flex-start;">
                                        <div class="kkt-item-label" style="margin-bottom:8px;">Regex trích xuất (Regex Pattern)</div>
                                        <input type="text" id="setting-status-regex" style="width:100%; border:1px solid #eee; border-radius:8px; padding:8px;" placeholder="Ví dụ:\\[HP:(\\d+)\\]">
                                    </div>
                                    <div class="kkt-item" style="flex-direction:column; align-items:flex-start;">
                                        <div class="kkt-item-label" style="margin-bottom:8px;">Biểu thức thay thế regex (HTML Template)</div>
                                        <textarea id="setting-status-replace" style="width:100%; border:1px solid #eee; border-radius:8px; padding:8px; min-height:60px;" placeholder='Ví dụ:<div class="hp-bar" style="width:$1%"></div>'></textarea>
                                    </div>
                                    <div class="kkt-item">
                                        <div class="kkt-item-label">Chỉ gửi x thanh trạng thái gần nhất</div>
                                        <div class="kkt-item-control">
                                            <input type="number" id="setting-status-history-limit" value="3" min="0" style="width:50px; text-align:right; border:none; background: #f5f5f5; border-radius: 4px; padding: 4px;">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Cài đặt chi tiết tin nhắn tự động (bảng gập) -->
                            <div id="auto-reply-settings-container" class="feature-details-panel">
                                <div class="kkt-group">
                                    <div class="kkt-item">
                                        <div class="kkt-item-label">Thời gian không thao tác (phút)</div>
                                        <div class="kkt-item-control">
                                            <input type="number" id="setting-auto-reply-interval" value="60" min="1" style="width:50px; text-align:right; border:none; background: #f5f5f5; border-radius: 4px; padding: 4px;">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button type="button" class="kkt-danger-btn" id="clear-chat-history-btn">Xóa lịch sử chat</button>
                    </div>

                    <!-- 【Riêng】Tab nội dung -->
                    <div id="setting-tab-exclusive" class="settings-tab-content">
                        <!-- Model riêng -->
                        <div class="kkt-group">
                            <div class="kkt-item">
                                <div class="kkt-item-label">Dùng model riêng</div>
                                <div class="kkt-item-control">
                                    <label class="kkt-switch">
                                        <input type="checkbox" id="setting-exclusive-api-enabled">
                                        <span class="kkt-slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="kkt-item" id="setting-exclusive-api-container" style="display: none;">
                                <div class="kkt-item-label">Chọn preset API</div>
                                <div class="kkt-item-control">
                                    <select id="setting-exclusive-api-preset-select" style="border:none; background:transparent; text-align:right; direction: rtl; appearance: none; -webkit-appearance: none; padding-right: 15px;">
                                        <option value="">Vui lòng chọn preset</option>
                                    </select>
                                    <span class="kkt-arrow">›</span>
                                </div>
                            </div>
                        </div>

                        <!-- Prompt & chuỗi suy nghĩ riêng -->
                        <div class="kkt-group" style="margin-top: 15px;">
                            <div class="kkt-item">
                                <div class="kkt-item-label">Phiên bản prompt riêng</div>
                                <div class="kkt-item-control">
                                    <select id="setting-exclusive-prompt-version" style="border:none; background:transparent; text-align:right; direction: rtl; appearance: none; -webkit-appearance: none; padding-right: 15px;">
                                        <option value="">Theo toàn cục</option>
                                        <option value="uwu">UwU</option>
                                        <option value="tt">T.T</option>
                                    </select>
                                    <span class="kkt-arrow">›</span>
                                </div>
                            </div>
                            <div class="kkt-item">
                                <div class="kkt-item-label">Preset chuỗi suy nghĩ riêng</div>
                                <div class="kkt-item-control">
                                    <select id="setting-exclusive-cot-preset" style="border:none; background:transparent; text-align:right; direction: rtl; appearance: none; -webkit-appearance: none; padding-right: 15px; max-width: 150px;">
                                        <option value="">Theo toàn cục</option>
                                    </select>
                                    <span class="kkt-arrow">›</span>
                                </div>
                            </div>
                        </div>

                        <!-- Cấu hình Xưởng vẽ riêng -->
                        <div class="kkt-group" style="margin-top: 15px;">
                            <div class="kkt-item">
                                <div class="kkt-item-label">Preset prompt vẽ riêng</div>
                                <div class="kkt-item-control">
                                    <select id="setting-exclusive-workshop-preset" style="border:none; background:transparent; text-align:right; direction: rtl; appearance: none; -webkit-appearance: none; padding-right: 15px; max-width: 150px;">
                                        <option value="">Theo toàn cục</option>
                                    </select>
                                    <span class="kkt-arrow">›</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 【Trang trí】Tab nội dung -->
                    <div id="setting-tab-style" class="settings-tab-content">
                        <!-- Nhóm môi trường chat -->
                        <div class="kkt-group">
                            <div class="kkt-item">
                                <div class="kkt-item-label">Hình nền chat</div>
                                <div class="kkt-item-control">
                                    <span onclick="document.getElementById('setting-chat-bg-upload').click()" style="cursor:pointer; color:var(--primary-color);">Bấm để đổi</span>
                                    <span style="margin: 0 8px; color: #eee;">|</span>
                                    <span id="reset-chat-bg-btn" style="cursor:pointer; color:#999;">Khôi phục mặc định</span>
                                </div>
                                <input type="file" id="setting-chat-bg-upload" accept="image/*" style="display:none;">
                            </div>
                            <div class="kkt-item">
                                <div class="kkt-item-label">Màu chủ đạo</div>
                                <div class="kkt-item-control">
                                    <select id="setting-theme-color" style="border:none; background:transparent; text-align:right;"></select>
                                    <span class="kkt-arrow">›</span>
                                </div>
                            </div>
                            <div class="kkt-item">
                                <div class="kkt-item-label">Chế độ hiển thị ảnh đại diện</div>
                                <div class="kkt-item-control">
                                    <select id="setting-avatar-mode" style="border:none; background:transparent; text-align:right;">
                                        <option value="full">Hiện tất cả</option>
                                        <option value="merge">Gộp bong bóng</option>
                                        <option value="kkt">KKTChế độ</option>
                                        <option value="hidden">Ẩn ảnh đại diện</option>
                                    </select>
                                    <span class="kkt-arrow">›</span>
                                </div>
                            </div>
                            <div class="kkt-item">
                                <div class="kkt-item-label">Bố cục tiêu đề trên</div>
                                <div class="kkt-item-control">
                                    <select id="setting-title-layout" style="border:none; background:transparent; text-align:right;">
                                        <option value="left">Căn trái (mặc định)</option>
                                        <option value="center">Căn giữa</option>
                                    </select>
                                    <span class="kkt-arrow">›</span>
                                </div>
                            </div>
                            <div class="kkt-item">
                                <div class="kkt-item-label">Hiện mốc thời gian</div>
                                <div class="kkt-item-control">
                                    <label class="kkt-switch">
                                        <input type="checkbox" id="setting-show-timestamp">
                                        <span class="kkt-slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="kkt-item" id="setting-timestamp-style-container">
                                <div class="kkt-item-label">Vị trí mốc thời gian</div>
                                <div class="kkt-item-control">
                                    <select id="setting-timestamp-style" style="border:none; background:transparent; text-align:right;">
                                        <option value="bubble">Theo bong bóng</option>
                                        <option value="avatar">Dưới ảnh đại diện</option>
                                    </select>
                                    <span class="kkt-arrow">›</span>
                                </div>
                            </div>
                            <div class="kkt-item">
                                <div class="kkt-item-label">Hiện trạng thái online ở trên</div>
                                <div class="kkt-item-control">
                                    <label class="kkt-switch">
                                        <input type="checkbox" id="setting-show-status">
                                        <span class="kkt-slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="kkt-item">
                                <div class="kkt-item-label">Hiện tin cập nhật trạng thái trong chat</div>
                                <div class="kkt-item-control">
                                    <label class="kkt-switch">
                                        <input type="checkbox" id="setting-show-status-update-msg">
                                        <span class="kkt-slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="kkt-item">
                                <div class="kkt-item-label">Hiệu ứng mờ kính cho bong bóng</div>
                                <div class="kkt-item-control">
                                    <label class="kkt-switch">
                                        <input type="checkbox" id="setting-bubble-blur">
                                        <span class="kkt-slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="kkt-item" style="flex-direction: column; align-items: stretch; padding-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                    <div class="kkt-item-label">Bo góc ảnh đại diện</div>
                                    <span id="setting-avatar-radius-value" style="color: var(--primary-color); font-weight: bold;">50%</span>
                                </div>
                                <input type="range" id="setting-avatar-radius" min="0" max="50" step="1" value="50" style="width: 100%; accent-color: var(--primary-color);">
                            </div>
                        </div>

                        <!-- Nhóm kiểu bong bóng -->
                        <div class="kkt-group" style="margin-top:15px;">
                            <div class="kkt-item">
                                <div class="kkt-item-label">Kiểu bong bóng tùy chỉnh</div>
                                <div class="kkt-item-control">
                                    <label class="kkt-switch">
                                        <input type="checkbox" id="setting-use-custom-css">
                                        <span class="kkt-slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="kkt-item" style="display:block;">
                                 <div id="private-bubble-css-preview" class="bubble-css-preview" style="margin-bottom:10px;"></div>
                                 <div id="private-bubble-author-note" style="font-size: 12px; color: #999; margin-bottom: 5px; display: none;"></div>
                                 
                                 <!-- Thanh công cụ tìm & thay CSS chat riêng -->
                                 <div class="textarea-edit-toolbar" id="private-css-toolbar">
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
                                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                            </button>
                                            <button type="button" class="toolbar-replace-all-btn" title="Thay tất cả">
                                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                 </div>

                                 <textarea id="setting-custom-bubble-css" rows="4" placeholder="CSSCode..." style="width:100%; border:1px solid #eee; border-radius:8px; padding:5px;" disabled></textarea>
                                 <div style="display:flex; justify-content:flex-end; gap:5px; margin-top:5px; flex-wrap: wrap;">
                                     <select id="bubble-preset-select" style="width:100px;"><option value="">Preset</option></select>
                                     <button type="button" id="apply-preset-btn" class="btn btn-small btn-primary" style="padding:4px 8px;">Áp dụng</button>
                                     <button type="button" id="save-preset-btn" class="btn btn-small" style="padding:4px 8px;">Lưu</button>
                                     <button type="button" id="manage-presets-btn" class="btn btn-small" style="padding:4px 8px;">QL</button>
                                     <button type="button" id="export-preset-btn" class="btn btn-small" style="padding:4px 8px;">Xuất</button>
                                     <button type="button" id="import-preset-btn" class="btn btn-small" style="padding:4px 8px;">Nhập</button>
                                     <button type="button" id="reset-custom-bubble-css-btn" class="btn btn-small btn-neutral" style="padding:4px 8px;">Đặt lại</button>
                                 </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary" style="margin-top:20px;">Lưu mọi thay đổi</button>
                </form>
            </div>
        </main>
`;

function injectChatSettingsHtml() {
    const container = document.getElementById('chat-settings-screen');
    if (container) {
        container.innerHTML = chatSettingsHtml;
    }
}
