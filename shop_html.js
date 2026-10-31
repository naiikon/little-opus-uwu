document.addEventListener('DOMContentLoaded', () => {
    const shopHtml = `
    <header class="app-header">
        <button class="back-btn" data-target="chat-room-screen">‹</button>
        <div class="title-container">
            <h1 class="title">Cửa hàng</h1>
        </div>
        <div class="action-btn-group">
            <button class="action-btn" id="shop-refresh-btn" title="Nhập hàng lại">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 22px; height: 22px;">
                    <path d="M23 4v6h-6"></path>
                    <path d="M1 20v-6h6"></path>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
            </button>
            <button class="action-btn" id="shop-more-btn" title="Thêm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
        </div>
    </header>
    <div class="shop-tabs"></div>
    <main class="content" id="shop-content-container"></main>
    <div id="shop-delivery-modal" class="modal-overlay">
        <div class="modal-window">
            <h3 id="shop-delivery-item-name">Xác nhận đơn hàng</h3>
            <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Chọn cách giao hàng:</p>
            <div class="delivery-options">
                <div class="delivery-option-card active" data-type="timed" onclick="selectDeliveryOption('timed')">
                    <div class="delivery-icon">🛵</div>
                    <div class="delivery-info">
                        <div class="delivery-title">Giao theo giờ hẹn</div>
                        <div class="delivery-desc">Dự kiến giao trong 30 phút</div>
                    </div>
                    <div class="delivery-check"></div>
                </div>
                <div class="delivery-option-card" data-type="instant" onclick="selectDeliveryOption('instant')">
                    <div class="delivery-icon">⚡</div>
                    <div class="delivery-info">
                        <div class="delivery-title">Giao ngay</div>
                        <div class="delivery-desc">Giao gấp, gửi ngay</div>
                    </div>
                    <div class="delivery-check"></div>
                </div>
                <div class="delivery-option-card" data-type="pickup" onclick="selectDeliveryOption('pickup')">
                    <div class="delivery-icon">🏪</div>
                    <div class="delivery-info">
                        <div class="delivery-title">Nhận tại cửa hàng</div>
                        <div class="delivery-desc">Đến cửa hàng nhận bằng mật khẩu</div>
                    </div>
                    <div class="delivery-check"></div>
                </div>
                <div class="delivery-option-card" data-type="pay-for-me" onclick="selectDeliveryOption('pay-for-me')">
                    <div class="delivery-icon">🥺</div>
                    <div class="delivery-info">
                        <div class="delivery-title">Để Ta trả tiền</div>
                        <div class="delivery-desc">Gửi yêu cầu thanh toán hộ</div>
                    </div>
                    <div class="delivery-check"></div>
                </div>
            </div>
            
            <div id="pickup-code-input-container" style="display: none; margin-top: 15px;">
                <label style="font-size: 12px; color: #666; display: block; margin-bottom: 5px;">Mật khẩu tự nhận</label>
                <input type="text" id="shop-pickup-code" placeholder="Nhập mã nhận hàng/mật khẩu" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; outline: none;">
            </div>

            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button id="shop-delivery-confirm" class="btn btn-primary" style="flex: 1;">Xác nhận đặt hàng</button>
                <button id="shop-delivery-cancel" class="btn btn-neutral" style="flex: 1;">Hủy</button>
            </div>
        </div>
    </div>

    <!-- Shop More ActionSheet -->
    <div id="shop-more-actionsheet" class="action-sheet-overlay">
        <div class="action-sheet">
            <button class="action-sheet-button" id="shop-pickup-btn">🎁 Nhận hàng (nhập mật khẩu)</button>
            <button class="action-sheet-button" id="shop-category-manage-btn">🏷️ Danh mục tùy chỉnh</button>
            <button class="action-sheet-button danger" id="shop-more-cancel-btn">Hủy</button>
        </div>
    </div>

    <!-- Shop Category Manage Modal -->
    <div id="shop-category-manage-modal" class="modal-overlay">
        <div class="modal-window" style="max-height: 85vh; overflow-y: auto;">
            <h3>Quản lý danh mục cửa hàng</h3>
            <div style="font-size: 12px; color: #666; margin-bottom: 10px; background: #f9f9f9; padding: 8px; border-radius: 6px;">
                Sau khi thêm danh mục tùy chỉnh, lần nhập hàng tiếp theo AI sẽ tạo sản phẩm tương ứng theo prompt của bạn.
            </div>

            <div class="form-group" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                <label for="shop-item-count" style="margin: 0;">Số lượng tạo mỗi danh mục</label>
                <input type="number" id="shop-item-count" value="8" min="1" max="20" style="width: 60px; text-align: center;">
            </div>
            
            <div id="shop-category-list" style="margin-bottom: 15px; border: 1px solid #eee; border-radius: 8px; padding: 10px; min-height: 100px;">
                <!-- JS populated list -->
            </div>

            <div class="form-group" style="border-top: 1px solid #eee; padding-top: 15px;">
                <label style="font-weight: bold; margin-bottom: 10px; display: block;">Thêm danh mục mới</label>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <input type="text" id="shop-cat-id" placeholder="ID tiếng Anh (vd: flower)" style="flex: 1; min-width: 0;" required>
                    <input type="text" id="shop-cat-name" placeholder="Tên hiển thị (vd: 🌸 Hoa)" style="flex: 1; min-width: 0;" required>
                </div>
                <textarea id="shop-cat-prompt" rows="2" placeholder="Prompt ngắn: mô tả danh mục này nên bán những gì..." style="width: 100%; margin-bottom: 10px;" required></textarea>
                <button id="shop-add-category-btn" class="btn btn-secondary" style="width: 100%;">+ Thêm danh mục</button>
            </div>
            
            <div style="margin-top: 10px; text-align: right;">
                <button id="shop-category-close-btn" class="btn btn-primary" style="width: 100%;">Xong</button>
            </div>
        </div>
    </div>

    <!-- Shop Pickup Modal -->
    <div id="shop-pickup-modal" class="modal-overlay">
        <div class="modal-window">
            <h3>Nhận hàng</h3>
            <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Nhập mật khẩu tự nhận hoặc ám hiệu trong đơn hàng:</p>
            <div class="form-group">
                <input type="text" id="shop-pickup-input" placeholder="Ví dụ: 888888 hoặc gâu gâu gâu" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; outline: none; font-size: 16px; text-align: center;">
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button id="shop-pickup-confirm" class="btn btn-primary" style="flex: 1;">Xác nhận nhận</button>
                <button id="shop-pickup-cancel" class="btn btn-neutral" style="flex: 1;">Hủy</button>
            </div>
        </div>
    </div>
    `;
    const container = document.getElementById('shop-screen');
    if (container) {
        container.innerHTML = shopHtml;
    }
});
