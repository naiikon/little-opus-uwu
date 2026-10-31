// SVG 图标库
const ShopIcons = {
    food: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`, // 汉堡/饮料
    gift: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>`, // 礼物盒
    gadget: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`, // 手机/数码
    pill: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"></path><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"></line></svg>`, // 药丸
    mystery: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`, // 问号/盲盒
    flower: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 1 4.5 4.5M7.5 12H9m3 4.5a4.5 4.5 0 1 1 4.5-4.5M12 16.5V15m4.5-3a4.5 4.5 0 1 0-4.5-4.5M16.5 12H15m-3 9v-6m0 0L8 12m4 6 4-6M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z"></path></svg>`, // 花
    clothes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path></svg>` // 衣服
};

// 全局商城状态
let shopState = {
    items: {
        recommend: [],
        food: [],
        general: [],
        guess: [],
        character_choice: []
    },
    banner: null,
    currentTab: 'recommend',
    selectedItem: null, // 仅用于兼容旧逻辑或单品详情
    isLoading: false,
    cart: [] // 购物车数组: [{ item, quantity }]
};

// 渲染 Tabs
function renderShopTabs() {
    const tabsContainer = document.querySelector('.shop-tabs');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = '';
    
    let tabs = [
        { id: 'recommend', name: '🔥 Đề xuất' },
        { id: 'food', name: '🍔 Đồ ăn' },
        { id: 'general', name: '🛍️ Bách hóa' },
        { id: 'guess', name: '❤️ Có thể bạn thích' },
        { id: 'character_choice', name: '👀 TaMuốn mua?' }
    ];

    // 合并自定义分类
    const customCategories = getCustomCategories();
    if (customCategories.length > 0) {
        tabs = tabs.concat(customCategories);
    }

    tabs.forEach(tab => {
        const el = document.createElement('div');
        el.className = `shop-tab-item ${shopState.currentTab === tab.id ? 'active' : ''}`;
        el.textContent = tab.name;
        el.dataset.id = tab.id;
        el.onclick = () => switchShopTab(tab.id);
        tabsContainer.appendChild(el);
    });
}

// 初始化商城
function initShopSystem() {
    console.log('initShopSystem called');
    // 渲染 Tab
    renderShopTabs();

    // 绑定下单按钮事件
    const confirmBtn = document.getElementById('shop-delivery-confirm');
    if (confirmBtn) {
        confirmBtn.onclick = confirmPurchase;
    }

    // 绑定刷新按钮事件
    const refreshBtn = document.getElementById('shop-refresh-btn');
    if (refreshBtn) {
        refreshBtn.onclick = forceRefreshShop;
    }

    // 绑定更多按钮事件
    const moreBtn = document.getElementById('shop-more-btn');
    console.log('Binding shop-more-btn, element found:', !!moreBtn);
    if (moreBtn) {
        moreBtn.onclick = () => {
            console.log('shop-more-btn clicked');
            const sheet = document.getElementById('shop-more-actionsheet');
            if (sheet) {
                sheet.classList.add('visible');
            } else {
                console.error('shop-more-actionsheet not found');
            }
        };
    }

    // 绑定更多菜单取消
    const moreCancelBtn = document.getElementById('shop-more-cancel-btn');
    if (moreCancelBtn) {
        moreCancelBtn.onclick = () => {
            document.getElementById('shop-more-actionsheet').classList.remove('visible');
        };
    }

    // 绑定提取商品按钮
    const pickupBtn = document.getElementById('shop-pickup-btn');
    if (pickupBtn) {
        pickupBtn.onclick = () => {
            document.getElementById('shop-more-actionsheet').classList.remove('visible');
            document.getElementById('shop-pickup-modal').classList.add('visible');
        };
    }

    // 绑定提取弹窗取消
    const pickupCancelBtn = document.getElementById('shop-pickup-cancel');
    if (pickupCancelBtn) {
        pickupCancelBtn.onclick = () => {
            document.getElementById('shop-pickup-modal').classList.remove('visible');
        };
    }

    // 绑定提取确认
    const pickupConfirmBtn = document.getElementById('shop-pickup-confirm');
    if (pickupConfirmBtn) {
        pickupConfirmBtn.onclick = handlePickupConfirm;
    }

    // 绑定分类管理按钮
    const categoryManageBtn = document.getElementById('shop-category-manage-btn');
    if (categoryManageBtn) {
        categoryManageBtn.onclick = () => {
            document.getElementById('shop-more-actionsheet').classList.remove('visible');
            openCategoryManager();
        };
    }

    // 绑定分类管理模态框按钮
    const addCategoryBtn = document.getElementById('shop-add-category-btn');
    if (addCategoryBtn) {
        addCategoryBtn.onclick = addCategory;
    }

    const closeCategoryBtn = document.getElementById('shop-category-close-btn');
    if (closeCategoryBtn) {
        closeCategoryBtn.onclick = () => {
            document.getElementById('shop-category-manage-modal').classList.remove('visible');
            // 关闭时刷新 Tab 显示（如果修改了分类）
            renderShopTabs();
        };
    }
    
    // 初始化购物车 UI
    initCartUI();
}

// --- 自定义分类管理 ---

function getShopSettings() {
    const chat = db.characters.find(c => c.id === currentChatId);
    if (chat && chat.shopSettings) {
        return chat.shopSettings;
    }
    return { customCategories: [], itemCount: 8 };
}

async function saveShopSettings(settings) {
    const chat = db.characters.find(c => c.id === currentChatId);
    if (!chat) return;
    chat.shopSettings = settings;
    await dexieDB.characters.update(chat.id, { shopSettings: chat.shopSettings });
}

function getCustomCategories() {
    const settings = getShopSettings();
    return settings.customCategories || [];
}

async function saveCustomCategories(categories) {
    const settings = getShopSettings();
    settings.customCategories = categories;
    await saveShopSettings(settings);
}

async function saveItemCount() {
    const countInput = document.getElementById('shop-item-count');
    if (!countInput) return;
    
    let count = parseInt(countInput.value);
    if (isNaN(count) || count < 1) count = 8;
    if (count > 50) count = 50; // 限制最大数量
    
    const settings = getShopSettings();
    settings.itemCount = count;
    await saveShopSettings(settings);
}

function openCategoryManager() {
    const modal = document.getElementById('shop-category-manage-modal');
    modal.classList.add('visible');
    
    // 填充数量设置
    const settings = getShopSettings();
    const countInput = document.getElementById('shop-item-count');
    if (countInput) {
        countInput.value = settings.itemCount || 8;
    }
    
    renderCategoryList();
}

function renderCategoryList() {
    const list = document.getElementById('shop-category-list');
    const categories = getCustomCategories();
    
    if (categories.length === 0) {
        list.innerHTML = '<div style="text-align:center; color:#999; padding:20px;">Chưa có danh mục tùy chỉnh</div>';
        return;
    }

    list.innerHTML = categories.map((cat, index) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
            <div style="flex:1;">
                <div style="font-weight:bold;">${cat.name} <span style="font-weight:normal; color:#999; font-size:12px;">(${cat.id})</span></div>
                <div style="font-size:12px; color:#666;">${cat.prompt}</div>
            </div>
            <button class="btn btn-danger btn-small" onclick="deleteCategory(${index})" style="margin-left:10px;">Xóa</button>
        </div>
    `).join('');
}

async function addCategory() {
    const idInput = document.getElementById('shop-cat-id');
    const nameInput = document.getElementById('shop-cat-name');
    const promptInput = document.getElementById('shop-cat-prompt');
    
    const id = idInput.value.trim();
    const name = nameInput.value.trim();
    const prompt = promptInput.value.trim();

    if (!id || !name || !prompt) {
        showToast('Vui lòng điền đầy đủ thông tin');
        return;
    }

    // 检查 ID 是否冲突 (包括默认分类)
    const defaultIds = ['recommend', 'food', 'general', 'guess', 'character_choice'];
    const currentCategories = getCustomCategories();
    if (defaultIds.includes(id) || currentCategories.some(c => c.id === id)) {
        showToast('ID danh mục đã tồn tại, vui lòng đổi');
        return;
    }

    currentCategories.push({ id, name, prompt });
    await saveCustomCategories(currentCategories);
    
    // 清空输入
    idInput.value = '';
    nameInput.value = '';
    promptInput.value = '';
    
    renderCategoryList();
    showToast('Thêm thành công');
}

async function deleteCategory(index) {
    if (!confirm('Chắc chắn xóa danh mục này?')) return;
    
    const categories = getCustomCategories();
    categories.splice(index, 1);
    await saveCustomCategories(categories);
    renderCategoryList();
}

// 将 deleteCategory 暴露给全局以便 HTML onclick 调用
window.deleteCategory = deleteCategory;

// 处理提取商品确认
async function handlePickupConfirm() {
    const input = document.getElementById('shop-pickup-input');
    const code = input.value.trim();
    
    if (!code) {
        showToast('Vui lòng nhập mật khẩu');
        return;
    }

    // 查找匹配的订单
    const chat = db.characters.find(c => c.id === currentChatId);
    if (!chat) return;

    let found = false;
    let foundItemName = '';

    // 遍历历史记录查找未提取的自提订单
    // 格式: [A为B下单了：自提口令: xxx|金额|商品清单]
    // 注意：口令匹配忽略大小写和空格
    for (let i = chat.history.length - 1; i >= 0; i--) {
        const msg = chat.history[i];
        if (msg.role === 'assistant' && !msg.isPickedUp) {
            const match = msg.content.match(/\[.*?为.*?下单了：自提口令:\s*(.*?)\|.*?\|(.*?)\]/);
            if (match) {
                const msgCode = match[1].trim();
                const items = match[2].trim();
                
                if (msgCode.toLowerCase() === code.toLowerCase()) {
                    // 匹配成功
                    msg.isPickedUp = true;
                    found = true;
                    foundItemName = items;
                    break; // 只提取最近的一单，或者全部提取？这里假设一次提取一单
                }
            }
        }
    }

    if (found) {
        await saveData();
        document.getElementById('shop-pickup-modal').classList.remove('visible');
        input.value = '';
        
        // 刷新聊天界面以显示商品名
        renderMessages(false, false); // 重新渲染，不强制滚动
        
        // 弹窗提示成功
        alert(`Nhận hàng thành công!\nBạn nhận được:${foundItemName}`);
        
        // 可选：发送一条系统消息或用户消息确认
        // sendSystemMessage(`成功提取了 ${foundItemName}`);
    } else {
        showToast('Mật khẩu không hợp lệ hoặc hàng đã được nhận');
    }
}

function initCartUI() {
    // 移除可能存在的旧元素
    const oldFab = document.querySelector('.shop-cart-fab');
    if (oldFab) oldFab.remove();
    const oldPanel = document.querySelector('.shop-cart-panel');
    if (oldPanel) oldPanel.remove();
    const oldOverlay = document.querySelector('.shop-cart-overlay');
    if (oldOverlay) oldOverlay.remove();

    const shopScreen = document.getElementById('shop-screen');
    if (!shopScreen) return;

    // 1. 创建悬浮球 (Ins风胶囊)
    const fab = document.createElement('div');
    fab.className = 'shop-cart-fab';
    fab.innerHTML = `
        <div class="shop-cart-content">
            <div class="shop-cart-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </div>
            <div class="shop-cart-price-group">
                <span class="shop-cart-divider"></span>
                <span class="shop-cart-total">¥0.00</span>
            </div>
        </div>
        <div class="shop-cart-badge" style="display: none;">0</div>
    `;
    fab.onclick = toggleCartPanel;
    shopScreen.appendChild(fab);

    // 2. 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'shop-cart-overlay';
    overlay.onclick = closeCartPanel;
    shopScreen.appendChild(overlay);

    // 3. 创建购物车面板
    const panel = document.createElement('div');
    panel.className = 'shop-cart-panel';
    panel.innerHTML = `
        <div class="cart-header">
            <span>Danh sách mua</span>
            <span class="cart-clear-btn" onclick="clearCart()">Xóa hết</span>
        </div>
        <div class="cart-items-container">
            <!-- Tạo động -->
            <div class="cart-empty-tip">Giỏ hàng trống</div>
        </div>
        <div class="cart-footer">
            <div class="cart-total-price">¥0.00</div>
            <button class="cart-checkout-btn" disabled onclick="openCartDeliveryModal()">Thanh toán</button>
        </div>
    `;
    shopScreen.appendChild(panel);
}

// 购物车操作
function addToCart(item) {
    const existing = shopState.cart.find(i => i.item.name === item.name);
    if (existing) {
        existing.quantity++;
    } else {
        shopState.cart.push({ item: item, quantity: 1 });
    }
    updateCartUI();
    
    // 简单的飞入动画效果 (可选，这里先只更新数字)
    const badge = document.querySelector('.shop-cart-badge');
    badge.classList.add('bump');
    setTimeout(() => badge.classList.remove('bump'), 200);
}

function removeFromCart(itemName) {
    const index = shopState.cart.findIndex(i => i.item.name === itemName);
    if (index > -1) {
        shopState.cart[index].quantity--;
        if (shopState.cart[index].quantity <= 0) {
            shopState.cart.splice(index, 1);
        }
        updateCartUI();
    }
}

function clearCart() {
    shopState.cart = [];
    updateCartUI();
    closeCartPanel();
}

function updateCartUI() {
    const totalCount = shopState.cart.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = shopState.cart.reduce((sum, i) => sum + (parseFloat(i.item.price) * i.quantity), 0);

    // 更新悬浮球
    const fab = document.querySelector('.shop-cart-fab');
    const badge = document.querySelector('.shop-cart-badge');
    const priceGroup = document.querySelector('.shop-cart-price-group');
    const totalEl = document.querySelector('.shop-cart-total');

    if (totalCount > 0) {
        badge.textContent = totalCount;
        badge.style.display = 'flex';
        fab.classList.add('has-items');
        if (priceGroup) priceGroup.style.display = 'flex';
        if (totalEl) totalEl.textContent = `¥${totalPrice.toFixed(2)}`;
    } else {
        badge.style.display = 'none';
        fab.classList.remove('has-items');
        if (priceGroup) priceGroup.style.display = 'none';
    }

    // 更新面板列表
    const container = document.querySelector('.cart-items-container');
    if (shopState.cart.length === 0) {
        container.innerHTML = `<div class="cart-empty-tip">Giỏ hàng trống</div>`;
        document.querySelector('.cart-checkout-btn').disabled = true;
    } else {
        container.innerHTML = shopState.cart.map(entry => `
            <div class="cart-item-row">
                <div class="cart-item-name">${entry.item.name}</div>
                <div class="cart-item-price">¥${entry.item.price}</div>
                <div class="cart-item-controls">
                    <button class="cart-ctrl-btn minus" onclick="removeFromCart('${entry.item.name}')">-</button>
                    <span class="cart-item-qty">${entry.quantity}</span>
                    <button class="cart-ctrl-btn plus" onclick="addToCart({name:'${entry.item.name}', price:'${entry.item.price}'})">+</button>
                </div>
            </div>
        `).join('');
        document.querySelector('.cart-checkout-btn').disabled = false;
    }

    // 更新总价
    const panelTotal = document.querySelector('.cart-total-price');
    if (panelTotal) panelTotal.textContent = `¥${totalPrice.toFixed(2)}`;
}

function toggleCartPanel() {
    const panel = document.querySelector('.shop-cart-panel');
    const overlay = document.querySelector('.shop-cart-overlay');
    if (panel.classList.contains('active')) {
        closeCartPanel();
    } else {
        panel.classList.add('active');
        overlay.classList.add('active');
    }
}

function closeCartPanel() {
    document.querySelector('.shop-cart-panel').classList.remove('active');
    document.querySelector('.shop-cart-overlay').classList.remove('active');
}

// 将 addToCart 暴露给全局以便 HTML 字符串调用（如果需要）
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.openCartDeliveryModal = openCartDeliveryModal;
window.toggleCartPanel = toggleCartPanel;
window.closeCartPanel = closeCartPanel;

// 打开商城
async function openShopScreen() {
    shopState.currentTab = 'recommend';
    renderShopTabs(); // 确保 Tabs 正确渲染
    switchScreen('shop-screen');
    
    // 1. 如果正在加载中，直接显示 Loading 状态，避免重复触发
    if (shopState.isLoading) {
        renderShopLoading();
        return;
    }

    // 2. 检查是否有缓存数据
    const chat = db.characters.find(c => c.id === currentChatId);
    if (chat && chat.shopData && chat.shopData.items) {
        // 使用缓存数据
        shopState.banner = chat.shopData.banner;
        shopState.items = chat.shopData.items;
        
        // 重新渲染 Tabs 状态
        updateTabsUI('recommend');
        
        renderShopContent();
    } else {
        // 3. 无缓存，显示手动触发界面
        renderShopInitialState();
    }
}

// 强制刷新商城
async function forceRefreshShop() {
    if (shopState.isLoading) return; // 避免重复点击
    
    // 检查是否已有商品，如果有则需要确认，否则直接开始
    const hasItems = shopState.items && Object.values(shopState.items).some(arr => arr && arr.length > 0);

    if (hasItems && !confirm('Chắc chắn xóa hàng hiện tại và nhập hàng lại?')) return;

    shopState.isLoading = true;
    shopState.currentTab = 'recommend'; // 重置回推荐页
    
    // 清空当前显示
    renderShopLoading();
    
    // 重置 Tabs 状态
    updateTabsUI('recommend');

    try {
        // 清空数据库中的缓存
        const chat = db.characters.find(c => c.id === currentChatId);
        if (chat) {
            delete chat.shopData;
            await dexieDB.characters.update(chat.id, { shopData: null });
        }

        await fetchShopData();
        renderShopContent();
    } catch (e) {
        console.error("Làm mới cửa hàng thất bại", e);
        renderShopError();
    } finally {
        shopState.isLoading = false;
    }
}

// 切换 Tab
function switchShopTab(tabId) {
    shopState.currentTab = tabId;
    updateTabsUI(tabId);
    renderShopContent();
}

function updateTabsUI(activeId) {
    const tabsContainer = document.querySelector('.shop-tabs');
    if (!tabsContainer) return;
    
    Array.from(tabsContainer.children).forEach(el => {
        if (el.dataset.id === activeId) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

function getTabName(id) {
    const map = {
        'recommend': '🔥 Đề xuất',
        'food': '🍔 Đồ ăn',
        'general': '🛍️ Bách hóa',
        'guess': '❤️ Có thể bạn thích',
        'character_choice': '👀 TaMuốn mua?'
    };
    
    if (map[id]) return map[id];

    // 查找自定义分类
    const customCategories = getCustomCategories();
    const found = customCategories.find(c => c.id === id);
    return found ? found.name : id;
}

// 渲染 Loading (骨架屏)
function renderShopLoading() {
    const container = document.getElementById('shop-content-container');
    container.innerHTML = `
        <div class="shop-loading-skeleton">
            <div class="skeleton-banner"></div>
            <div class="skeleton-grid">
                <div class="skeleton-card">
                    <div class="skeleton-img"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text short"></div>
                </div>
                <div class="skeleton-card">
                    <div class="skeleton-img"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text short"></div>
                </div>
                <div class="skeleton-card">
                    <div class="skeleton-img"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text short"></div>
                </div>
                <div class="skeleton-card">
                    <div class="skeleton-img"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text short"></div>
                </div>
            </div>
        </div>
    `;
}

// 渲染错误
function renderShopError() {
    const container = document.getElementById('shop-content-container');
    container.innerHTML = `
        <div class="shop-empty-state">
            <div style="font-size: 40px; margin-bottom: 10px;">🚧</div>
            <p>Nhập hàng thất bại, vui lòng thử lại sau</p>
            <button class="btn btn-primary" onclick="forceRefreshShop()" style="margin-top: 15px;">Thử lại</button>
        </div>
    `;
}

// 渲染初始状态（手动触发进货）
function renderShopInitialState() {
    const container = document.getElementById('shop-content-container');
    container.innerHTML = `
        <div class="shop-empty-state">
            <div style="font-size: 40px; margin-bottom: 10px;">🏪</div>
            <p>Cửa hàng chưa có hàng nè</p>
            <button class="btn btn-primary" onclick="forceRefreshShop()" style="margin-top: 15px;">Bắt đầu nhập hàng</button>
        </div>
    `;
}

// 获取 AI 数据
async function fetchShopData() {
    // 构造 Prompt
    const chat = db.characters.find(c => c.id === currentChatId);
    if (!chat) return; // 应该不会发生

    const contextPrompt = generatePrivateSystemPrompt(chat);

    // 截取最近 50 条消息作为参考
    let historySlice = chat.history.slice(-50);
    historySlice = filterHistoryForAI(chat, historySlice);

    const recentHistory = historySlice.map(m => {
        return `${m.role === 'user' ? 'Tôi' : chat.realName}: ${m.content}`;
    }).join('\n');

    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()}`;

    // 获取商品数量设置
    const settings = getShopSettings();
    const itemCount = settings.itemCount || 8;

    // 构建分类 Prompt
    let categoryPrompt = `
        *   **recommend**: đề xuất tổng hợp. Theo thế giới quan hiện tại, mô phỏng trang đề xuất chính của app mua sắm, gồm xu hướng đang hot, hàng bán chạy, quảng cáo…
        *   **food **: giao đồ ăn, thức ăn, đồ uống, đồ ăn vặt.
        *   **general (chợ bách hóa)**: đồ dùng hằng ngày, quà tặng, đồ điện tử, quần áo.
        *   **guess (có thể bạn thích)**: nhắm vào người dùng, mô phỏng thuật toán gợi ý để tạo các món hàng tôi (${chat.myName}) có thể muốn mua, phản ánh sở thích, nhu cầu của tôi hoặc chủ đề chúng tôi vừa nói gần đây.
        *   **character_choice (${chat.realName}muốn mua?)**: mô phỏng các món hàng ${chat.realName} vừa xem gần đây, phản ánh sở thích, nhu cầu của Ta hoặc chủ đề chúng tôi vừa nói gần đây.
    `;

    // 添加自定义分类
    const customCategories = getCustomCategories();
    customCategories.forEach(cat => {
        categoryPrompt += `\n        *   **${cat.id} (${cat.name})**：${cat.prompt}`;
    });

    // 构建 XML 示例
    let xmlExample = `
    <shop>
      <banner>
        <title>Tiêu đề sự kiện</title>
        <desc>Khẩu hiệu sự kiện</desc>
        <bgStart>#Màu sắc1</bgStart>
        <bgEnd>#Màu sắc2</bgEnd>
      </banner>
      <items>
        <recommend>
          <item>
            <name>Tên món hàng</name>
            <desc>Quy cách món hàng</desc>
            <price>9.9</price>
            <type>food</type>
            <isAd>false</isAd>
          </item>
          ... (Tổng ${itemCount} món)
        </recommend>
        <food>
          ... (Tổng ${itemCount} món)
        </food>
        <general>
          ... (Tổng ${itemCount} món)
        </general>
        <guess>
          ... (Tổng ${itemCount} món)
        </guess>
        <character_choice>
          ... (Tổng ${itemCount} món)
        </character_choice>`;
    
    customCategories.forEach(cat => {
        xmlExample += `\n        <${cat.id}>\n          ... (Tổng ${itemCount} món)\n        </${cat.id}>`;
    });
    xmlExample += `\n      </items>\n    </shop>`;

    const shopPrompt = `
    ${contextPrompt}
    
    ---

    【Lịch sử chat gần đây】
    ${recentHistory}
    
    ---
    
    【Lệnh nhiệm vụ】
    Bạn cần mô phỏng app mua sắm nổi tiếng"Uống Gì Chưa"với giao diện cửa hàng.
    
    Hãy dựa vào thế giới quan, bối cảnh thời đại và ngày hôm nay (${dateStr}), tạo một danh sách sản phẩm.

    【Yêu cầu】
    1.  **Banner sự kiện**: thiết kế một câu khuyến mãi hợp với ngày hôm nay hoặc một dịp lễ ngẫu nhiên (như Tết, Valentine, Thứ Năm điên rồ, 11/11, cuối tuần bình thường…), lời quảng cáo phải kích thích người dùng mua sắm.
    2.  **Danh mục & số lượng sản phẩm**: bắt buộc tạo đúng các danh mục dưới đây, mỗi danh mục **phải có ${itemCount} sản phẩm**:
        ${categoryPrompt}
    3.  **Nội dung sản phẩm**:
        *   name: Tên sản phẩm.
        *   desc: Quy cách sản phẩm. (không được bắt chước giọng nhân vật, phải khách quan, trung tính)
        *   price: Giá (số).
        *   type: Loại icon, chỉ được chọn một trong các loại sau:'food', 'gift', 'gadget', 'pill', 'mystery', 'flower', 'clothes'。
        *   isAd: Có phải sản phẩm quảng cáo không (true/false).
    
    【Định dạng đầu ra】
    Chỉ xuất dữ liệu XML thuần, không kèm ký hiệu khối code markdown, không có bất kỳ lời giải thích nào khác.
    XML Cấu trúc như sau:
    ${xmlExample}
    `;

    // 调用 API
    const apiConfig = resolveAuxiliaryApiConfig('shop');
    let { url, key, model, provider } = apiConfig;
    
    // 兼容 Gemini 和其他 OpenAI 格式接口
    let requestBody, endpoint, headers;

    if (provider === 'gemini') {
        endpoint = `${url}/v1beta/models/${model}:generateContent?key=${key}`;
        headers = { 'Content-Type': 'application/json' };
        requestBody = {
            contents: [{
                role: 'user',
                parts: [{ text: "Bạn là một API chỉ xuất dữ liệu XML." + shopPrompt }]
            }],
            generationConfig: {
                temperature: 0.8
            }
        };
    } else {
        endpoint = `${url}/v1/chat/completions`;
        headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        };
        requestBody = {
            model: model,
            messages: [
                { role: "system", content: "Bạn là một API chỉ xuất dữ liệu XML." },
                { role: "user", content: shopPrompt }
            ],
            temperature: 0.8
        };
    }

    let content = await fetchAiResponse(apiConfig, requestBody, headers, endpoint);

    // 清洗 XML
    content = content.replace(/```xml/g, '').replace(/```/g, '').trim();
    // 尝试提取 <shop> 之间的内容
    const xmlMatch = content.match(/<shop>[\s\S]*<\/shop>/);
    if (xmlMatch) content = xmlMatch[0];

    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, "text/xml");
        
        // 检查解析错误
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error("XML Parser Error: " + parserError.textContent);
        }

        const shopNode = xmlDoc.querySelector('shop');
        if (!shopNode) throw new Error("Missing <shop> root element");

        // 解析 banner
        const bannerNode = shopNode.querySelector('banner');
        let banner = null;
        if (bannerNode) {
            banner = {
                title: bannerNode.querySelector('title')?.textContent || '',
                desc: bannerNode.querySelector('desc')?.textContent || '',
                bgStart: bannerNode.querySelector('bgStart')?.textContent || '',
                bgEnd: bannerNode.querySelector('bgEnd')?.textContent || ''
            };
        }

        // 解析 items
        const itemsNode = shopNode.querySelector('items');
        const items = {};
        
        // 默认分类
        const categories = ['recommend', 'food', 'general', 'guess', 'character_choice'];
        // 自定义分类
        const customCategories = getCustomCategories();
        customCategories.forEach(cat => {
            categories.push(cat.id);
        });

        categories.forEach(catId => {
            items[catId] = [];
            const catNode = itemsNode?.querySelector(catId);
            if (catNode) {
                const itemNodes = catNode.querySelectorAll('item');
                itemNodes.forEach(itemNode => {
                    items[catId].push({
                        name: itemNode.querySelector('name')?.textContent || '',
                        desc: itemNode.querySelector('desc')?.textContent || '',
                        price: itemNode.querySelector('price')?.textContent || '0',
                        type: itemNode.querySelector('type')?.textContent || 'mystery',
                        isAd: itemNode.querySelector('isAd')?.textContent === 'true'
                    });
                });
            }
        });

        shopState.banner = banner;
        shopState.items = items;

        // 保存到数据库
        chat.shopData = {
            banner: banner,
            items: items,
            lastUpdated: Date.now()
        };
        await dexieDB.characters.update(chat.id, { shopData: chat.shopData });

    } catch (e) {
        console.error("XML Parse Error", e);
        throw new Error("XML Parse Error");
    }
}

// 渲染内容
function renderShopContent() {
    const container = document.getElementById('shop-content-container');
    container.innerHTML = '';

    // 1. 渲染 Banner (仅在推荐页)
    if (shopState.currentTab === 'recommend' && shopState.banner) {
        const banner = document.createElement('div');
        banner.className = 'shop-banner';
        // 使用 AI 返回的颜色，或者默认渐变
        const bgStart = shopState.banner.bgStart || '#ff9a9e';
        const bgEnd = shopState.banner.bgEnd || '#fecfef';
        banner.style.background = `linear-gradient(135deg, ${bgStart} 0%, ${bgEnd} 100%)`;
        
        banner.innerHTML = `
            <div class="shop-banner-tag">Sự kiện giới hạn</div>
            <div class="shop-banner-title">${shopState.banner.title}</div>
            <div class="shop-banner-desc">${shopState.banner.desc}</div>
            <div class="shop-banner-decoration">🎁</div>
        `;
        container.appendChild(banner);
    }

    // 2. 渲染网格
    const grid = document.createElement('div');
    grid.className = 'shop-grid';
    
    const items = shopState.items[shopState.currentTab] || [];
    
    if (items.length === 0) {
        container.innerHTML += `<div class="shop-empty-state"><p>Danh mục này chưa có sản phẩm</p></div>`;
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = `shop-item-card ${item.isAd ? 'ad-item' : ''}`;
        
        // 图标匹配
        let svgIcon = ShopIcons[item.type] || ShopIcons.mystery;
        // 颜色随机微调
        const iconColor = item.isAd ? '#f1c40f' : 'var(--primary-color)';
        
        card.innerHTML = `
            <div class="shop-item-image-box">
                <div class="shop-item-svg" style="color: ${iconColor}; width: 64px; height: 64px;">${svgIcon}</div>
                ${item.isAd ? '<div class="shop-item-ad-badge">Quảng cáo</div>' : ''}
            </div>
            <div class="shop-item-info">
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-desc">${item.desc}</div>
                <div class="shop-item-footer">
                    <div class="shop-item-price">${item.price}</div>
                    <div class="shop-item-buy-btn" onclick="event.stopPropagation(); addToCart({name: '${item.name}', price: '${item.price}', desc: '${item.desc.replace(/'/g, "\\'")}'})">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"></path></svg>
                    </div>
                </div>
            </div>
        `;
        
        // 点击卡片不再直接加入购物车，防止误触
        // card.onclick = () => addToCart(item);
        grid.appendChild(card);
    });

    container.appendChild(grid);
}

// 打开配送选择弹窗 (现在用于购物车结算)
function openCartDeliveryModal() {
    closeCartPanel(); // 关闭购物车面板
    const modal = document.getElementById('shop-delivery-modal');
    const title = document.getElementById('shop-delivery-item-name');
    
    const totalCount = shopState.cart.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = shopState.cart.reduce((sum, i) => sum + (parseFloat(i.item.price) * i.quantity), 0);
    
    title.textContent = `Thanh toán ${totalCount} món (tổng ¥${totalPrice.toFixed(2)})`;
    
    // 重置选择
    document.querySelectorAll('.delivery-option-card').forEach(el => el.classList.remove('active'));
    document.querySelector('.delivery-option-card[data-type="timed"]').classList.add('active'); 
    
    modal.classList.add('visible');
}

// 确认购买
function confirmPurchase() {
    if (shopState.cart.length === 0) return;

    // 获取当前角色信息
    const chat = db.characters.find(c => c.id === currentChatId);
    if (!chat) return;
    const realName = chat.realName;
    const myName = chat.myName;

    // 获取选中的配送方式
    const activeOption = document.querySelector('.delivery-option-card.active');
    const deliveryType = activeOption ? activeOption.dataset.type : 'timed';
    
    let deliveryName = '30phút nữa giao tới';
    if (deliveryType === 'instant') deliveryName = 'Giao ngay';
    if (deliveryType === 'pay-for-me') deliveryName = 'Yêu cầu thanh toán hộ';
    
    if (deliveryType === 'pickup') {
        const code = document.getElementById('shop-pickup-code').value.trim();
        if (!code) {
            alert('Vui lòng nhập mật khẩu tự nhận');
            return;
        }
        deliveryName = `自提口令: ${code}`;
    }
    
    // 计算总价
    const totalPrice = shopState.cart.reduce((sum, i) => sum + (parseFloat(i.item.price) * i.quantity), 0);

    // 生成商品列表字符串: 商品名x数量
    const itemsStr = shopState.cart.map(entry => `${entry.item.name} x${entry.quantity}`).join(', ');

    // 格式生成
    let messageText = '';
    if (deliveryType === 'pay-for-me') {
        // 代付请求格式: [myName向realName发起了代付请求:总价|商品清单]
        messageText = `[${myName}向${realName}发起了代付请求:${totalPrice.toFixed(2)}|${itemsStr}]`;
    } else {
        // 普通订单格式: [myName为realName下单了：配送方式|总价|商品清单]
        messageText = `[${myName}为${realName}下单了：${deliveryName}|${totalPrice.toFixed(2)}|${itemsStr}]`;
    }

    // 清空购物车
    clearCart();

    // 关闭所有层级，发送消息
    document.getElementById('shop-delivery-modal').classList.remove('visible');
    switchScreen('chat-room-screen');
    
    // 调用 chat.js 的发送逻辑
    const input = document.getElementById('message-input');
    if (input) {
        input.value = messageText;
        document.getElementById('send-message-btn').click(); // 触发点击事件发送
    }
}

// 配送选项点击逻辑 (HTML 中 onclick 绑定)
window.selectDeliveryOption = function(type) {
    document.querySelectorAll('.delivery-option-card').forEach(el => {
        if (el.dataset.type === type) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });

    const pickupInputContainer = document.getElementById('pickup-code-input-container');
    if (type === 'pickup') {
        pickupInputContainer.style.display = 'block';
    } else {
        pickupInputContainer.style.display = 'none';
    }
};

// 导出供 main.js 使用
window.setupShopSystem = function() {
    initShopSystem();
    // 绑定返回按钮
    const backBtn = document.querySelector('#shop-screen .back-btn');
    if (backBtn) {
        backBtn.onclick = () => {
            switchScreen('chat-room-screen');
        };
    }
    
    // 绑定弹窗关闭
    document.getElementById('shop-delivery-cancel').onclick = () => {
        document.getElementById('shop-delivery-modal').classList.remove('visible');
    };
};
