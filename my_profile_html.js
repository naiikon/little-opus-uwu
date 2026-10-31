document.addEventListener('DOMContentLoaded', () => {
    const myProfileHtml = `
        <header class="app-header">
            <button class="back-btn" data-target="contacts-screen">‹</button>
            <div class="title-container"><h1 class="title">Hồ sơ của tôi</h1></div>
            <div class="action-btn-group">
                <!-- Nút lưu chuyển xuống thanh nổi phía dưới, phía trên để trống hoặc đặt chức năng khác -->
            </div>
        </header>
        <main class="content" style="padding: 0; display: flex; flex-direction: column;">
            <!-- Lớp làm mờ nền -->
            <div id="mp-bg-blur" class="mp-bg-blur"></div>

            <!-- Băng chuyền ảnh đại diện phía trên -->
            <div class="mp-carousel-container">
                <div class="mp-carousel" id="mp-carousel">
                    <!-- JS Tạo thẻ ảnh đại diện động -->
                </div>
                <div class="mp-carousel-indicators" id="mp-carousel-indicators"></div>
            </div>

            <!-- Vùng sửa thông tin -->
            <div class="mp-info-container">
                <div class="mp-info-header">
                    <span class="mp-section-title">Hồ sơ cơ bản</span>
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <button class="icon-btn-simple" id="mp-set-active-btn" title="Đặt làm danh thiếp hiển thị">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        </button>
                        <button class="icon-btn-simple danger" id="mp-delete-persona-btn" title="Xóa persona hiện tại">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>

                <div class="mp-input-group">
                    <input type="text" id="mp-name-input" class="mp-transparent-input title-input" placeholder="Nhập biệt danh">
                </div>
                
                <div class="mp-input-group">
                    <textarea id="mp-persona-input" class="mp-transparent-input" rows="4" placeholder="Nhập mô tả persona/trạng thái dùng chung ở đây..."></textarea>
                </div>

                <div class="mp-divider"></div>

                <div class="mp-section-title" style="margin-bottom: 10px;">Nhân vật đã liên kết (thiết lập riêng)</div>
                <div class="mp-tags-container" id="mp-tags-container">
                    <!-- JS Tạo Tag -->
                    <button class="mp-tag-add" id="mp-add-binding-btn">+ Thêm</button>
                </div>
            </div>

            <!-- Thanh lưu phía dưới -->
            <div class="mp-bottom-bar">
                <button class="btn btn-primary mp-save-btn" id="mp-save-btn">Lưu và đồng bộ persona hiện tại</button>
            </div>
        </main>

        <!-- Bảng trượt thiết lập riêng -->
        <div id="mp-exclusive-sheet" class="action-sheet-overlay" style="align-items: flex-end;">
            <div class="action-sheet-content mp-exclusive-panel">
                <div class="mp-panel-header">
                    <div class="mp-panel-char-info">
                        <img src="" id="mp-panel-char-avatar" class="mp-panel-avatar">
                        <span id="mp-panel-char-name">Tên nhân vật</span>
                    </div>
                    <button class="icon-btn-simple" id="mp-panel-close-btn">×</button>
                </div>
                <div class="mp-panel-body">
                    <label class="mp-label">Thiết lập riêng (nối sau thiết lập chung)</label>
                    <textarea id="mp-panel-input" rows="4" placeholder="Ví dụ: là chị gái của Ta, tính cách dịu dàng hơn..."></textarea>
                    
                    <div class="mp-panel-option">
                        <label class="kkt-switch">
                            <input type="checkbox" id="mp-panel-override-check">
                            <span class="kkt-slider"></span>
                        </label>
                        <span>Ghi đè hoàn toàn thiết lập chung (không nối)</span>
                    </div>
                </div>
                <div class="mp-panel-footer">
                    <button class="btn btn-danger btn-small" id="mp-panel-unbind-btn">Hủy liên kết</button>
                    <button class="btn btn-primary" id="mp-panel-confirm-btn">Xác nhận sửa</button>
                </div>
            </div>
        </div>

        <!-- Hộp chọn nhân vật -->
        <div id="mp-char-select-modal" class="modal-overlay">
            <div class="modal-window">
                <h3>Chọn nhân vật để liên kết</h3>
                <div id="mp-char-select-list" class="mp-select-list">
                    <!-- JS Tạo -->
                </div>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn btn-primary" id="mp-char-select-confirm" style="flex:1;">OK</button>
                    <button class="btn btn-neutral" id="mp-char-select-cancel" style="flex:1;">Hủy</button>
                </div>
            </div>
        </div>
        
        <!-- Tải ảnh đại diện lên Input -->
        <input type="file" id="mp-carousel-avatar-upload" accept="image/*" style="display:none;">
    `;
    const container = document.getElementById('my-profile-screen');
    if (container) {
        container.innerHTML = myProfileHtml;
    }
});
