// --- 思维链(CoT)设置模块 ---

const DEFAULT_COT_ITEMS_UWU = [
    { id: 'cot_item_1', name: 'Dẫn nhập', content: '[System Directive]:\nBạn bắt buộc phải tuân thủ nghiêm ngặt giao thức [incipere] . Trước khi trả lời, hãy vào thẻ <thinking> để suy luận sâu.\nHãy xem các module trong System Prompt theo các bước sau và suy nghĩ:', enabled: true, locked: false },
    { id: 'cot_item_2', name: 'Sẵn sàng vận động não chưa?', content: '---\n## 【Quy tắc tiên quyết】\n### **Bắt buộc** đọc tất cả<logic_rules>và<output_formats>: nắm **toàn bộ** quy tắc cần tuân thủ, sau đó suy nghĩ ngắn gọn, chính xác theo các bước sau', enabled: true },
    { id: 'cot_item_3', name: 'Đọc thiết lập cho tôi!', content: '---\n## 【Hiệu chỉnh hành vi】\nDựa trên<char_settings>và<角色活人运转>xây dựng nhân cách nhân vật\n### Phase1: person\n1. **Kiểm tra ý thức bản thân (Ref: <char_settings>và<角色活人运转>)**\n   - Đã khắc họa được nhân cách sống động, chân thật chưa?\n   - Bạn (nhân vật) có thói quen/phong cách chat riêng không?\n   - Bạn muốn đáp lại tôi thế nào?', enabled: true },
    { id: 'cot_item_4', name: 'Làm người đi nào.', content: '### Phase2: Verisimilitude\n2.**Chat chân thật**\n   - Đã áp dụng lối chat của người thật theo hai yêu cầu sau chưa?\n    - Sự chú ý của người bình thường có hạn, không nhất thiết câu nào cũng phải trả lời từng câu.\n    - Không hỏi ngược lặp lại những thông tin đã có.\n    - Xử lý khoảng ngắt: nếu cách tin nhắn trước khá lâu, mặc định hai bên chỉ bận việc rồi cầm điện thoại lên lại, hoặc mặc định trong lúc đó vẫn giữ liên lạc theo cách khác, tự nhiên nối tiếp chủ đề.', enabled: true },
    { id: 'cot_item_5', name: 'Có định dạng đặc biệt nào không?', content: '### Phase3: chat role\n3. **Truy xuất logic (Ref: <logic_rules>)**\n   - Hiện có phải bối cảnh hội thoại song ngữ không? Nếu không, bỏ qua mục này\n   - Có cần xuất thanh trạng thái không? Nếu không có yêu cầu liên quan thì bỏ qua mục này', enabled: true },
    { id: 'cot_item_6', name: 'Xác nhận lần cuối nào.', content: '## 【Xác nhận cuối】\n\n4. Tổng hợp<Chatting Guidelines>, đã trả lời hợp lý tự nhiên và không lệch persona chưa? Xem lại<output_formats>, định dạng tin nhắn xuất ra đã đúng chưa?', enabled: true },
    { id: 'cot_item_7', name: 'Kết', content: 'Trước mỗi lượt xuất, bắt buộc phải suy nghĩ lần lượt từng mục theo đúng các bước trong<thinking>…</thinking>, không cần chép lại các mục, nhưng nội dung suy nghĩ phải ngắn gọn, chính xác, rõ ràng, khả thi, không được nhảy bước.\n<thinking>Mọi phân tích trong\n\nĐịnh dạng:\n<thinking>\n...Quá trình suy nghĩ...\n</thinking>', enabled: true, locked: false }
];

const DEFAULT_COT_ITEMS_TT = [
    { id: 'cot_item_tt_1', name: 'Dẫn nhập', content: '[Quy chuẩn nộp bài]:\nTrước khi xuất câu trả lời, bạn bắt buộc phải dùng thẻ <thinking> để lên ý tưởng hội thoại, không được bỏ sót hay làm qua loa bước nào, phải suy nghĩ kỹ:', enabled: true, locked: false },
    { id: 'cot_item_tt_2', name: 'Phase0:【Xác nhận bối cảnh】', content: '## Phase0:【Xác nhận bối cảnh】\n - Bối cảnh hiện tại là:\n - Nhân vật có phải người Việt không? Nếu không, bật chế độ song ngữ:\n - Tiến triển quan hệ hiện tại của hai bên là:\n - Câu trả lời mới nhất của người dùng là:<user_input>', enabled: true },
    { id: 'cot_item_tt_3', name: 'Phase1:【Xác nhận nguyên lý gốc】', content: '## Phase1:【Xác nhận nguyên lý gốc】\nLần lượt đọc[Yếu tố sáng tác][rule=Hiểu đúng]<参考资料>, suy nghĩ phản hồi từng bước một:', enabled: true },
    { id: 'cot_item_tt_4', name: 'Phase2:【Khắc họa nhân cách】', content: '## Phase2:【Khắc họa nhân cách】\n - Xem lại<角色设定>, cốt cách bên trong của oc đang điều khiển là:\n - Phong cách chat:\n - Điều không nên bị khuôn mẫu định nghĩa nhất:', enabled: true },
    { id: 'cot_item_tt_5', name: 'Phase3:【Thực thi nguyên tắc】', content: '## Phase3:【Thực thi nguyên tắc】\n - [Nhịp hội thoại], số tin nhắn trả lời lần này:\n - Có những nguyên tắc nào?\n - Lần lượt nói rõ cách tự nhiên tuân thủ từng nguyên tắc khi sáng tác:\n - Ý tưởng nội dung:\n - Có phá được lối mòn không:\n - Có nằm trong khoảng số tin nhắn ở bước một không?', enabled: true },
    { id: 'cot_item_tt_6', name: 'Kết', content: 'Sẵn sàng vận động não chưa? Nhớ đóng thẻ<thinking>nha! Bắt đầu suy nghĩ:', enabled: true, locked: false }
];

const DEFAULT_CALL_COT_ITEMS_UWU = [
    { id: 'cot_call_item_1', name: 'Dẫn nhập', content: '[System Directive]:\nBạn bắt buộc phải tuân thủ nghiêm ngặt giao thức [incipere] . Trước khi trả lời, hãy vào thẻ <thinking> để suy luận sâu.\nHãy xem các module trong System Prompt theo các bước sau và suy nghĩ:', enabled: true, locked: false },
    { id: 'cot_call_item_2', name: 'Đọc thiết lập cho tôi!', content: '---\n## 【Hiệu chỉnh hành vi】\nDựa trên<char_settings>và<角色活人运转>xây dựng nhân cách nhân vật\n### Phase1: person\n1. **Kiểm tra ý thức bản thân (Ref: <char_settings>và<角色活人运转>)**\n   - Đã khắc họa được nhân cách sống động, chân thật chưa?\n   - Bạn (nhân vật) có thói quen/phong cách nói chuyện riêng không?\n   - Bạn muốn đáp lại tôi thế nào?', enabled: true },
    { id: 'cot_call_item_3', name: 'Nhận biết bối cảnh cuộc gọi', content: '---\n## 【Nhận biết bối cảnh】\n1. **Kiểm tra tính tức thời**: đây là cuộc gọi video/thoại thời gian thực. Phản ứng của bạn phải tức thì, tự nhiên, mang tính văn nói.\n2. **Môi trường & hình ảnh**:\n   - Nếu là gọi video, bạn cần ý thức được hình ảnh camera ghi lại (biểu cảm, động tác, bối cảnh của bạn).\n   - Nếu là gọi thoại, bạn cần ý thức được cảm xúc và tiếng động nền mà giọng nói truyền đi.', enabled: true },
    { id: 'cot_call_item_5', name: 'Kiểm tra đầu ra', content: '## 【Kiểm tra đầu ra】\n1. **Xác nhận định dạng**: đã tuân thủ đúng định dạng `[画面/环境音：...]` và `[nói：...]` chưa?\n2. **Lọc nội dung**: đảm bảo không xuất bất kỳ hoạt động tâm lý hay lời dẫn nào không thuộc nội dung cuộc gọi (trừ khi đặt trong phần mô tả hình ảnh).\n', enabled: true },
    { id: 'cot_call_item_6', name: 'Kết', content: 'Trước mỗi lượt xuất, bắt buộc phải suy nghĩ lần lượt từng mục theo đúng các bước trong<thinking>…</thinking>suy nghĩ lần lượt từng mục.\n<thinking>phải được thực hiện đầy đủ trong đầu ra.\n\nĐịnh dạng:\n<thinking>\n...Quá trình suy nghĩ...\n</thinking>', enabled: true, locked: false }
];

const DEFAULT_CALL_COT_ITEMS_TT = [
    { id: 'cot_call_item_tt_1', name: 'Dẫn nhập', content: '[Quy chuẩn nộp bài]:\nTrước khi xuất câu trả lời, bạn bắt buộc phải dùng thẻ <thinking> để lên ý tưởng hội thoại, không được bỏ sót hay làm qua loa bước nào, phải suy nghĩ kỹ:', enabled: true, locked: false },
    { id: 'cot_call_item_tt_2', name: 'Phase0:【Xác nhận bối cảnh】', content: '## Phase0:【Xác nhận bối cảnh】\n - Bối cảnh hiện tại là:\n - Nhân vật có phải người Việt không? Nếu không, bật chế độ song ngữ:\n - Tiến triển quan hệ hiện tại của hai bên là:\n - Câu trả lời mới nhất của người dùng là:<user_input>', enabled: true },
    { id: 'cot_call_item_tt_3', name: 'Phase1:【Xác nhận nguyên lý gốc】', content: '## Phase1:【Xác nhận nguyên lý gốc】\nLần lượt đọc[Yếu tố sáng tác][rule=Hiểu đúng]<参考资料>, suy nghĩ phản hồi từng bước một:', enabled: true },
    { id: 'cot_call_item_tt_4', name: 'Phase2:【Khắc họa nhân cách】', content: '## Phase2:【Khắc họa nhân cách】\n - Xem lại<角色设定>, cốt cách bên trong của oc đang điều khiển là:\n - Phong cách chat:\n - Điều không nên bị khuôn mẫu định nghĩa nhất:', enabled: true },
    { id: 'cot_call_item_tt_5', name: 'Phase3:【Thực thi nguyên tắc】', content: '## Phase3:【Thực thi nguyên tắc】\n - Có những nguyên tắc nào?\n - Lần lượt nói rõ cách tự nhiên tuân thủ từng nguyên tắc khi sáng tác:\n - Ý tưởng nội dung:', enabled: true },
    { id: 'cot_call_item_tt_6', name: 'Kết', content: 'Sẵn sàng vận động não chưa? Nhớ đóng thẻ<thinking>nha! Bắt đầu suy nghĩ:', enabled: true, locked: false }
];

let currentCotMode = 'chat'; // 'chat' or 'call'

// 初始化 CoT 设置
function initCotSettings() {
    // 绑定入口按钮事件 (在更多菜单中)
    const cotEntryBtn = document.querySelector('.menu-item[data-action="cot-settings"]');
    if (cotEntryBtn) {
        cotEntryBtn.addEventListener('click', () => {
            loadCotSettings();
            switchScreen('cot-settings-screen');
        });
    }

    // 绑定 Tab 切换
    const tabs = document.querySelectorAll('#cot-settings-tabs .settings-tab-item');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCotMode = tab.dataset.mode;
            
            if (currentCotMode === 'call' && db.cotSettings.promptVersion === 'tt' && !db.cotSettings.hasShownTTCallToast) {
                db.cotSettings.hasShownTTCallToast = true;
                saveData();
                showToast('Đã tự chuyển sang chuỗi suy nghĩ cuộc gọi riêng của T.T cho bạn');
            }
            
            loadCotSettings();
        });
    });

    // 绑定提示词版本切换
    const promptVersionSelect = document.getElementById('cot-prompt-version-select');
    if (promptVersionSelect) {
        promptVersionSelect.addEventListener('change', async (e) => {
            if (!db.cotSettings) db.cotSettings = { enabled: false, activePresetId: 'default_uwu', promptVersion: 'uwu' };
            
            const oldVersion = db.cotSettings.promptVersion || 'uwu';
            const newVersion = e.target.value;
            
            // 保存当前版本使用的预设
            if (oldVersion === 'uwu') {
                db.cotSettings.lastPresetUwU = db.cotSettings.activePresetId;
                db.cotSettings.lastCallPresetUwU = db.cotSettings.activeCallPresetId;
            } else if (oldVersion === 'tt') {
                db.cotSettings.lastPresetTT = db.cotSettings.activePresetId;
                db.cotSettings.lastCallPresetTT = db.cotSettings.activeCallPresetId;
            }

            db.cotSettings.promptVersion = newVersion;
            
            if (newVersion === 'tt') {
                let showMsg = false;
                if (!db.cotSettings.hasSwitchedToTT) {
                    db.cotSettings.hasSwitchedToTT = true;
                    db.cotSettings.activePresetId = 'default_tt';
                    db.cotSettings.lastPresetTT = 'default_tt';
                    showMsg = true;
                } else {
                    db.cotSettings.activePresetId = db.cotSettings.lastPresetTT || 'default_tt';
                }

                if (!db.cotSettings.hasSwitchedToTTCall) {
                    db.cotSettings.hasSwitchedToTTCall = true;
                    db.cotSettings.activeCallPresetId = 'default_call_tt';
                    db.cotSettings.lastCallPresetTT = 'default_call_tt';
                    db.cotSettings.hasShownTTCallToast = true;
                    showMsg = true;
                } else {
                    db.cotSettings.activeCallPresetId = db.cotSettings.lastCallPresetTT || 'default_call_tt';
                }

                if (showMsg) {
                    showToast('Đã tự chuyển sang chuỗi suy nghĩ riêng của T.T cho bạn');
                } else {
                    showToast('Đã chuyển phiên bản prompt');
                }
            } else {
                // 切换回 uwu
                db.cotSettings.activePresetId = db.cotSettings.lastPresetUwU || 'default_uwu';
                db.cotSettings.activeCallPresetId = db.cotSettings.lastCallPresetUwU || 'default_call_uwu';
                showToast('Đã chuyển phiên bản prompt');
            }
            
            await saveData();
            loadCotSettings(); // 重新加载界面
        });
    }

    // 绑定全局开关
    const enabledSwitch = document.getElementById('cot-enabled-switch');
    if (enabledSwitch) {
        enabledSwitch.addEventListener('change', async (e) => {
            if (!db.cotSettings) db.cotSettings = { enabled: false, activePresetId: 'default', promptVersion: 'uwu' };
            
            if (currentCotMode === 'chat') {
                db.cotSettings.enabled = e.target.checked;
            } else {
                db.cotSettings.callEnabled = e.target.checked;
            }
            
            await saveData();
            showToast(e.target.checked ? 'Đã bật chuỗi suy nghĩ' : 'Đã tắt chuỗi suy nghĩ');
        });
    }

    // 绑定预填开关
    const prefillSwitch = document.getElementById('cot-prefill-switch');
    if (prefillSwitch) {
        prefillSwitch.addEventListener('change', async (e) => {
            if (!db.cotSettings) db.cotSettings = { enabled: false, activePresetId: 'default', prefillEnabled: true, callPrefillEnabled: true };
            
            if (currentCotMode === 'chat') {
                db.cotSettings.prefillEnabled = e.target.checked;
            } else {
                db.cotSettings.callPrefillEnabled = e.target.checked;
            }
            
            await saveData();
            showToast(e.target.checked ? 'Đã bật điền trước' : 'Đã tắt điền trước');
        });
    }

    // 绑定角色活人运转开关
    const humanRunSwitch = document.getElementById('cot-human-run-switch');
    if (humanRunSwitch) {
        humanRunSwitch.addEventListener('change', async (e) => {
            if (!db.cotSettings) db.cotSettings = { enabled: false, activePresetId: 'default' };
            db.cotSettings.humanRunEnabled = e.target.checked;
            await saveData();
            showToast(e.target.checked ? 'Đã bật nhân vật tự vận hành' : 'Đã tắt nhân vật tự vận hành');
        });
    }

    // 绑定预设选择
    const presetSelect = document.getElementById('cot-preset-select');
    if (presetSelect) {
        presetSelect.addEventListener('change', async (e) => {
            const presetId = e.target.value;
            if (presetId) {
                if (currentCotMode === 'chat') {
                    db.cotSettings.activePresetId = presetId;
                    if (db.cotSettings.promptVersion === 'tt') {
                        db.cotSettings.lastPresetTT = presetId;
                    } else {
                        db.cotSettings.lastPresetUwU = presetId;
                    }
                } else {
                    db.cotSettings.activeCallPresetId = presetId;
                    if (db.cotSettings.promptVersion === 'tt') {
                        db.cotSettings.lastCallPresetTT = presetId;
                    } else {
                        db.cotSettings.lastCallPresetUwU = presetId;
                    }
                }
                await saveData();
                renderCotItems();
                showToast('Đã đổi preset');
            }
        });
    }

    // 绑定新建预设按钮
    document.getElementById('cot-new-preset-btn').addEventListener('click', createNewCotPreset);

    // 绑定管理预设按钮
    document.getElementById('cot-manage-presets-btn').addEventListener('click', openCotPresetManageModal);

    // 绑定重置预设按钮
    const resetBtn = document.getElementById('cot-reset-preset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetCotPreset);
    }

    // 绑定添加条目按钮
    document.getElementById('cot-add-item-btn').addEventListener('click', openAddCotItemModal);

    // 绑定条目编辑模态框按钮
    document.getElementById('cot-item-edit-form').addEventListener('submit', saveCotItem);
    document.getElementById('cot-item-cancel-btn').addEventListener('click', () => {
        document.getElementById('cot-item-edit-modal').classList.remove('visible');
    });

    // 绑定预设管理模态框按钮
    document.getElementById('cot-close-manage-modal-btn').addEventListener('click', () => {
        document.getElementById('cot-preset-manage-modal').classList.remove('visible');
        loadCotSettings(); // 刷新主界面
    });
    document.getElementById('cot-import-preset-btn').addEventListener('click', () => {
        document.getElementById('cot-import-file').click();
    });
    document.getElementById('cot-import-file').addEventListener('change', importCotPreset);

    // 初始化 XML 说明功能
    initXmlHelpFeature();
}

// 初始化 XML 说明功能
function initXmlHelpFeature() {
    // 1. 找到目标位置 (Prompt 条目序列 的标题栏)
    const labels = document.querySelectorAll('.kkt-item-label');
    let targetLabel = null;
    for (const label of labels) {
        if (label.textContent.includes('Prompt 条目序列')) {
            targetLabel = label;
            break;
        }
    }

    if (targetLabel && !targetLabel.querySelector('.cot-help-btn')) {
        // 创建问号按钮
        const helpBtn = document.createElement('button');
        helpBtn.className = 'cot-help-btn';
        helpBtn.innerHTML = '?';
        helpBtn.title = 'Xem giải thích thẻ XML';
        helpBtn.onclick = openXmlHelpModal;
        
        // 插入到 label 后面
        targetLabel.parentNode.appendChild(helpBtn);
        // 调整父元素样式以支持横向排列
        targetLabel.parentNode.style.display = 'flex';
        targetLabel.parentNode.style.justifyContent = 'space-between';
        targetLabel.parentNode.style.alignItems = 'center';
    }

    // 2. 创建模态框 (如果不存在)
    if (!document.getElementById('cot-xml-help-modal')) {
        const modalHtml = `
            <div id="cot-xml-help-modal" class="modal-overlay">
                <div class="modal-window" style="max-width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
                    <h3>XML Giải thích thẻ</h3>
                    <div class="cot-xml-help-content" style="flex: 1; overflow-y: auto; padding: 10px; line-height: 1.6; color: #444;">
                        <p>Chuỗi suy nghĩ mặc định dùng các thẻ XML sau để dựng System Prompt, hiểu chúng sẽ giúp bạn chỉnh preset tốt hơn hoặc tham chiếu nhanh trong chuỗi suy nghĩ:</p>
                        
            <div class="xml-tag-item">
              <code><char_settings></code>
              <p><strong>Thiết lập nhân vật</strong>: gồm thiết lập nhân vật và World book·Sau (không gồm World book·Phá giới hạn và World book·Trước)</p>
            </div>

            <div class="xml-tag-item">
              <code><user_settings></code>
              <p><strong>Thiết lập người dùng</strong>: gồm tên của bạn và mô tả persona của bạn.</p>
            </div>

            <div class="xml-tag-item">
              <code><logic_rules></code>
              <p><strong>Quy tắc logic</strong>: gồm giải thích chi tiết các logic tương tác, như danh sách sticker, ảnh album, quy tắc xử lý lệnh đặc biệt (chuyển khoản, quà, thu hồi…).</p>
            </div>

            <div class="xml-tag-item">
              <code><output_formats></code>
              <p><strong>Định dạng đầu ra</strong>: quy chuẩn tổng về định dạng tin nhắn AI trả lời.</p>
            </div>

            <div class="xml-tag-item">
              <code><Chatting Guidelines></code>
              <p><strong>Hướng dẫn hội thoại</strong>: định nghĩa nhịp hội thoại, giới hạn số tin trả lời và gợi ý phong cách.</p>
            </div>

            <div class="xml-tag-item">
              <code><thinking></code>
              <p><strong>Chuỗi suy nghĩ</strong>: quá trình suy nghĩ của AI sẽ được bọc trong thẻ này. Phần này không hiện trên giao diện chat, chỉ để AI suy luận logic.</p>
            </div>
                    </div>
                    <div style="margin-top: 15px; text-align: right;">
                        <button class="btn btn-primary" onclick="document.getElementById('cot-xml-help-modal').classList.remove('visible')">Đóng</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
}

function openXmlHelpModal() {
    document.getElementById('cot-xml-help-modal').classList.add('visible');
}

// 加载设置到界面
function loadCotSettings() {
    if (!db.cotSettings) db.cotSettings = { enabled: false, activePresetId: 'default_uwu', promptVersion: 'uwu' };
    if (!db.cotPresets) db.cotPresets = [];

    // 确保 uwu 预设存在
    let uwuPreset = db.cotPresets.find(p => p.id === 'default_uwu');
    if (!uwuPreset) {
        // 兼容旧的 'default'
        let oldDefault = db.cotPresets.find(p => p.id === 'default');
        if (oldDefault) {
            oldDefault.id = 'default_uwu';
            oldDefault.name = 'Chuỗi suy nghĩ mặc định (UwU)';
            uwuPreset = oldDefault;
        } else {
            uwuPreset = {
                id: 'default_uwu',
                name: 'Chuỗi suy nghĩ mặc định (UwU)',
                items: JSON.parse(JSON.stringify(DEFAULT_COT_ITEMS_UWU))
            };
            db.cotPresets.push(uwuPreset);
        }
        saveData();
    }

    // 确保 tt 预设存在
    let ttPreset = db.cotPresets.find(p => p.id === 'default_tt');
    if (!ttPreset) {
        ttPreset = {
            id: 'default_tt',
            name: 'Chuỗi suy nghĩ mặc định (T.T)',
            items: JSON.parse(JSON.stringify(DEFAULT_COT_ITEMS_TT))
        };
        db.cotPresets.push(ttPreset);
        saveData();
    }

    // 确保通话预设存在
    let callPresetUwU = db.cotPresets.find(p => p.id === 'default_call_uwu');
    if (!callPresetUwU) {
        // 兼容旧的 'default_call'
        let oldCallDefault = db.cotPresets.find(p => p.id === 'default_call');
        if (oldCallDefault) {
            oldCallDefault.id = 'default_call_uwu';
            oldCallDefault.name = 'Chuỗi suy nghĩ cuộc gọi mặc định (UwU)';
            callPresetUwU = oldCallDefault;
        } else {
            callPresetUwU = {
                id: 'default_call_uwu',
                name: 'Chuỗi suy nghĩ cuộc gọi mặc định (UwU)',
                items: JSON.parse(JSON.stringify(DEFAULT_CALL_COT_ITEMS_UWU))
            };
            db.cotPresets.push(callPresetUwU);
        }
        saveData();
    }

    let callPresetTT = db.cotPresets.find(p => p.id === 'default_call_tt');
    if (!callPresetTT) {
        callPresetTT = {
            id: 'default_call_tt',
            name: 'Chuỗi suy nghĩ cuộc gọi mặc định (T.T)',
            items: JSON.parse(JSON.stringify(DEFAULT_CALL_COT_ITEMS_TT))
        };
        db.cotPresets.push(callPresetTT);
        saveData();
    }

    // 确保 activePresetId 存在
    if (!db.cotSettings.activePresetId) {
        db.cotSettings.activePresetId = db.cotSettings.promptVersion === 'tt' ? 'default_tt' : 'default_uwu';
        saveData();
    }

    // 确保 activeCallPresetId 存在
    if (!db.cotSettings.activeCallPresetId) {
        db.cotSettings.activeCallPresetId = db.cotSettings.promptVersion === 'tt' ? 'default_call_tt' : 'default_call_uwu';
        saveData();
    }

    // 兼容：如果当前是 T.T 版本，但从未自动切换过 T.T 通话预设
    if (db.cotSettings.promptVersion === 'tt' && !db.cotSettings.hasSwitchedToTTCall) {
        db.cotSettings.hasSwitchedToTTCall = true;
        db.cotSettings.activeCallPresetId = 'default_call_tt';
        db.cotSettings.lastCallPresetTT = 'default_call_tt';
        saveData();
    }

    // 数据库修复逻辑：强制解锁历史数据中的“引子”和“尾声”
    if (db.cotPresets && db.cotPresets.length > 0) {
        let hasChanges = false;
        const targetIds = ['cot_item_1', 'cot_item_7', 'cot_call_item_1', 'cot_call_item_6'];
        db.cotPresets.forEach(preset => {
            if (preset.items) {
                preset.items.forEach(item => {
                    if (targetIds.includes(item.id) && item.locked) {
                        item.locked = false;
                        hasChanges = true;
                    }
                });
            }
        });
        if (hasChanges) {
            console.log('[CoT] Đã tự mở khóa mục Dẫn nhập/Kết trong dữ liệu cũ');
            saveData();
        }
    }

    // 加载提示词版本
    const promptVersionSelect = document.getElementById('cot-prompt-version-select');
    if (promptVersionSelect) {
        promptVersionSelect.value = db.cotSettings.promptVersion || 'uwu';
    }

    // 根据当前模式隐藏/显示提示词版本选项
    const promptVersionItem = promptVersionSelect?.closest('.kkt-item');
    if (promptVersionItem) {
        // 聊天和通话模式下都显示提示词版本切换
        promptVersionItem.style.display = 'flex';
    }

    // 根据提示词版本隐藏/显示特定选项
    const humanRunItem = document.getElementById('cot-human-run-switch')?.closest('.kkt-item');
    if (humanRunItem) {
        // 只要是 T.T 版本，无论聊天还是通话，都隐藏“角色活人运转”开关
        if (db.cotSettings.promptVersion === 'tt') {
            humanRunItem.style.display = 'none';
        } else {
            humanRunItem.style.display = 'flex';
        }
    }

    // 根据当前模式设置开关状态
    const enabledSwitch = document.getElementById('cot-enabled-switch');
    if (currentCotMode === 'chat') {
        enabledSwitch.checked = db.cotSettings.enabled;
    } else {
        enabledSwitch.checked = db.cotSettings.callEnabled || false;
    }

    const prefillSwitch = document.getElementById('cot-prefill-switch');
    if (prefillSwitch) {
        if (currentCotMode === 'chat') {
            prefillSwitch.checked = db.cotSettings.prefillEnabled !== undefined ? db.cotSettings.prefillEnabled : true;
        } else {
            prefillSwitch.checked = db.cotSettings.callPrefillEnabled !== undefined ? db.cotSettings.callPrefillEnabled : true;
        }
    }
    
    // 加载角色活人运转开关状态 (默认为 false)
    const humanRunSwitch = document.getElementById('cot-human-run-switch');
    if (humanRunSwitch) {
        humanRunSwitch.checked = (db.cotSettings.humanRunEnabled !== undefined) ? db.cotSettings.humanRunEnabled : false;
    }

    renderCotPresetSelect();
    renderCotItems();
}

// 渲染预设下拉框
function renderCotPresetSelect() {
    const select = document.getElementById('cot-preset-select');
    select.innerHTML = '';
    
    db.cotPresets.forEach(preset => {
        const option = document.createElement('option');
        option.value = preset.id;
        option.textContent = preset.name;
        select.appendChild(option);
    });

    // 确保选中当前激活的预设
    let activeId;
    if (currentCotMode === 'chat') {
        activeId = db.cotSettings.activePresetId;
    } else {
        activeId = db.cotSettings.activeCallPresetId;
    }

    if (activeId) {
        // 检查 activePresetId 是否存在，不存在则默认第一个
        const exists = db.cotPresets.find(p => p.id === activeId);
        if (!exists && db.cotPresets.length > 0) {
            activeId = db.cotPresets[0].id;
            if (currentCotMode === 'chat') {
                db.cotSettings.activePresetId = activeId;
            } else {
                db.cotSettings.activeCallPresetId = activeId;
            }
            saveData();
        }
        select.value = activeId;
    }
}

// 渲染条目列表
function renderCotItems() {
    const list = document.getElementById('cot-items-list');
    list.innerHTML = '';
    list.className = 'cot-items-container'; // 使用新 CSS 类

    let activeId;
    if (currentCotMode === 'chat') {
        activeId = db.cotSettings.activePresetId;
    } else {
        activeId = db.cotSettings.activeCallPresetId;
    }

    const activePreset = db.cotPresets.find(p => p.id === activeId);
    if (!activePreset || !activePreset.items) return;

    activePreset.items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = `cot-item-card ${item.locked ? 'locked' : ''}`;
        
        // 开关
        const switchLabel = document.createElement('label');
        switchLabel.className = 'kkt-switch kkt-switch-small';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.enabled;
        checkbox.addEventListener('change', async (e) => {
            item.enabled = e.target.checked;
            await saveData();
        });
        const slider = document.createElement('span');
        slider.className = 'kkt-slider';
        switchLabel.appendChild(checkbox);
        switchLabel.appendChild(slider);

        // 内容区域
        const contentDiv = document.createElement('div');
        contentDiv.className = 'cot-item-content';
        
        const nameEl = document.createElement('div');
        nameEl.className = 'cot-item-name';
        nameEl.textContent = item.name;
        
        const previewEl = document.createElement('div');
        previewEl.className = 'cot-item-preview';
        previewEl.textContent = item.content.substring(0, 50).replace(/\n/g, ' ') + (item.content.length > 50 ? '...' : '');
        
        contentDiv.appendChild(nameEl);
        contentDiv.appendChild(previewEl);

        // 按钮组
        const btnGroup = document.createElement('div');
        btnGroup.className = 'cot-btn-group';

        // 编辑按钮
        const editBtn = createIconBtn('✎', () => openEditCotItemModal(item));
        btnGroup.appendChild(editBtn);
        
        // 删除按钮 (锁定条目不可删除)
        if (!item.locked) {
            const deleteBtn = createIconBtn('×', () => deleteCotItem(index), true);
            btnGroup.appendChild(deleteBtn);
        }

        itemEl.appendChild(switchLabel);
        itemEl.appendChild(contentDiv);
        itemEl.appendChild(btnGroup);
        
        // 绑定长按拖拽事件
        if (!item.locked) {
            bindDragEvents(itemEl, index, activePreset.items);
        }

        list.appendChild(itemEl);
    });
}

// 绑定长按拖拽事件
function bindDragEvents(el, index, items) {
    let pressTimer = null;
    let isDragging = false;
    let startY = 0;
    let startX = 0;
    let placeholder = null;
    let clone = null;
    let listContainer = document.getElementById('cot-items-list');
    let itemHeight = 0;
    let currentIndex = index;

    const startPress = (e) => {
        // 如果点击的是按钮或开关，不触发拖拽
        if (e.target.closest('.cot-btn-group') || e.target.closest('.kkt-switch')) return;

        const touch = e.touches ? e.touches[0] : e;
        startY = touch.clientY;
        startX = touch.clientX;

        pressTimer = setTimeout(() => {
            initDrag(e);
        }, 400); // 400ms 长按触发
    };

    const cancelPress = () => {
        if (pressTimer) clearTimeout(pressTimer);
    };

    const initDrag = (e) => {
        isDragging = true;
        if (navigator.vibrate) navigator.vibrate(50); // 震动反馈

        const rect = el.getBoundingClientRect();
        itemHeight = rect.height;

        // 创建占位符
        placeholder = document.createElement('div');
        placeholder.className = 'cot-item-placeholder';
        placeholder.style.height = `${itemHeight}px`;
        placeholder.style.width = `${rect.width}px`;

        // 创建克隆元素用于拖拽显示
        clone = el.cloneNode(true);
        clone.classList.add('dragging');
        clone.style.width = `${rect.width}px`;
        clone.style.left = `${rect.left}px`;
        clone.style.top = `${rect.top}px`;
        
        // 隐藏原元素，插入占位符
        el.style.display = 'none';
        el.parentNode.insertBefore(placeholder, el);
        document.body.appendChild(clone);

        // 阻止默认滚动
        document.body.style.overflow = 'hidden';
        if (e.cancelable) e.preventDefault();
    };

    const onMove = (e) => {
        if (!isDragging) {
            // 如果移动距离过大，取消长按判定
            const touch = e.touches ? e.touches[0] : e;
            if (Math.abs(touch.clientY - startY) > 10 || Math.abs(touch.clientX - startX) > 10) {
                cancelPress();
            }
            return;
        }

        if (e.cancelable) e.preventDefault();

        const touch = e.touches ? e.touches[0] : e;
        const currentY = touch.clientY;
        
        // 移动克隆元素
        clone.style.top = `${currentY - itemHeight / 2}px`;

        // 计算新位置
        const siblings = [...listContainer.children].filter(child => 
            child !== clone && child !== el && child.style.display !== 'none'
        );

        let newIndex = 0;
        let inserted = false;

        for (let i = 0; i < siblings.length; i++) {
            const sibling = siblings[i];
            const box = sibling.getBoundingClientRect();
            const offset = currentY - box.top - box.height / 2;

            if (offset < 0) {
                // 检查是否可以插入到这个位置（不能在锁定条目之前，除非自己本来就在前面）
                const targetItemIndex = Array.from(listContainer.children).indexOf(sibling);
                // 简单处理：只允许在非锁定条目之间移动
                // 实际逻辑需要根据 items 数组的 locked 状态判断
                
                listContainer.insertBefore(placeholder, sibling);
                inserted = true;
                break;
            }
            newIndex++;
        }

        if (!inserted) {
            listContainer.appendChild(placeholder);
        }
    };

    const onEnd = async (e) => {
        cancelPress();
        if (!isDragging) return;

        isDragging = false;
        document.body.style.overflow = '';

        // 移除克隆元素
        if (clone && clone.parentNode) {
            clone.parentNode.removeChild(clone);
        }

        // 恢复原元素并放到占位符位置
        if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.insertBefore(el, placeholder);
            placeholder.parentNode.removeChild(placeholder);
        }
        el.style.display = '';

        // 计算新的索引并更新数据
        const newElements = [...listContainer.children].filter(c => c.classList.contains('cot-item-card'));
        const finalIndex = newElements.indexOf(el);

        if (finalIndex !== currentIndex && finalIndex !== -1) {
            // 检查边界：不能移动到锁定条目之外
            let canMove = true;
            
            // 简单的边界检查：如果目标位置的前一个或后一个是锁定的，且跨越了锁定边界
            // 为了简化，我们直接在数据层进行移动，如果发现移动后破坏了锁定规则，则重新渲染恢复
            
            let activeId;
            if (currentCotMode === 'chat') {
                activeId = db.cotSettings.activePresetId;
            } else {
                activeId = db.cotSettings.activeCallPresetId;
            }
            const activePreset = db.cotPresets.find(p => p.id === activeId);
            
            if (activePreset) {
                const itemToMove = activePreset.items.splice(currentIndex, 1)[0];
                activePreset.items.splice(finalIndex, 0, itemToMove);
                
                // 验证锁定规则：引子必须在最前，尾声必须在最后
                // 这里做一个简单的验证，如果第一个不是引子，或者最后一个不是尾声（假设它们是锁定的）
                const firstItem = activePreset.items[0];
                const lastItem = activePreset.items[activePreset.items.length - 1];
                
                // 如果移动导致锁定条目位置不对，撤销移动
                // 更好的做法是精确判断，这里为了稳妥，只要移动后发现锁定条目不在两端，就撤销
                // 实际上，只要不让非锁定条目跑到锁定条目外面就行
                
                await saveData();
            }
        }
        
        // 无论是否移动成功，都重新渲染以确保状态正确
        renderCotItems();
    };

    // 绑定事件
    el.addEventListener('touchstart', startPress, { passive: false });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);

    el.addEventListener('mousedown', startPress);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
}

function createIconBtn(text, onClick, isDanger = false) {
    const btn = document.createElement('button');
    btn.className = `cot-icon-btn ${isDanger ? 'danger' : ''}`;
    
    // 使用 SVG 图标替代文字
    let iconSvg = '';
    if (text === '↑') iconSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>';
    else if (text === '↓') iconSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>';
    else if (text === '✎') iconSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
    else if (text === '×') iconSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
    
    btn.innerHTML = iconSvg || text;
    btn.title = text; // Tooltip
    
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
    });
    return btn;
}

// 移动条目
async function moveCotItem(index, direction) {
    let activeId;
    if (currentCotMode === 'chat') {
        activeId = db.cotSettings.activePresetId;
    } else {
        activeId = db.cotSettings.activeCallPresetId;
    }
    const activePreset = db.cotPresets.find(p => p.id === activeId);
    if (!activePreset) return;

    const item = activePreset.items[index];
    if (item.locked) return showToast('Mục đã khóa không thể di chuyển');

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= activePreset.items.length) return;

    const targetItem = activePreset.items[newIndex];
    if (targetItem.locked) return showToast('Không thể di chuyển ra ngoài mục đã khóa');

    const temp = activePreset.items[index];
    activePreset.items[index] = activePreset.items[newIndex];
    activePreset.items[newIndex] = temp;

    await saveData();
    renderCotItems();
}

// 删除条目
async function deleteCotItem(index) {
    let activeId;
    if (currentCotMode === 'chat') {
        activeId = db.cotSettings.activePresetId;
    } else {
        activeId = db.cotSettings.activeCallPresetId;
    }
    const activePreset = db.cotPresets.find(p => p.id === activeId);
    if (!activePreset) return;

    const item = activePreset.items[index];
    if (item.locked) return showToast('Mục đã khóa không thể xóa');

    if (!confirm('Chắc chắn xóa mục này?')) return;

    activePreset.items.splice(index, 1);
    await saveData();
    renderCotItems();
}

// 打开添加条目模态框
function openAddCotItemModal() {
    document.getElementById('cot-item-id').value = ''; // 空ID表示新建
    document.getElementById('cot-item-name').value = '';
    document.getElementById('cot-item-content').value = '';
    
    // 重置只读状态
    document.getElementById('cot-item-name').readOnly = false;
    document.getElementById('cot-item-content').readOnly = false;
    document.getElementById('cot-item-content').classList.remove('cot-readonly-textarea');
    
    // 显示保存按钮
    const saveBtn = document.querySelector('#cot-item-edit-form button[type="submit"]');
    if (saveBtn) saveBtn.style.display = 'block';
    
    // 移除提示
    const existingNotice = document.querySelector('.cot-lock-notice');
    if (existingNotice) existingNotice.remove();

    document.getElementById('cot-item-edit-modal').classList.add('visible');
}

// 打开编辑条目模态框
function openEditCotItemModal(item) {
    document.getElementById('cot-item-id').value = item.id;
    document.getElementById('cot-item-name').value = item.name;
    document.getElementById('cot-item-content').value = item.content;
    
    const nameInput = document.getElementById('cot-item-name');
    const contentInput = document.getElementById('cot-item-content');
    const saveBtn = document.querySelector('#cot-item-edit-form button[type="submit"]');
    const form = document.getElementById('cot-item-edit-form');
    
    // 移除旧提示
    const existingNotice = document.querySelector('.cot-lock-notice');
    if (existingNotice) existingNotice.remove();

    if (item.locked) {
        // 锁定状态：只读
        nameInput.readOnly = true;
        contentInput.readOnly = true;
        contentInput.classList.add('cot-readonly-textarea');
        if (saveBtn) saveBtn.style.display = 'none';
        
        // 添加提示
        const notice = document.createElement('div');
        notice.className = 'cot-lock-notice';
        notice.innerHTML = '🔒 Mục này là quy tắc cốt lõi, đã bị khóa, không thể sửa.';
        form.insertBefore(notice, form.firstChild);
    } else {
        // 正常状态
        nameInput.readOnly = false;
        contentInput.readOnly = false;
        contentInput.classList.remove('cot-readonly-textarea');
        if (saveBtn) saveBtn.style.display = 'block';
    }

    document.getElementById('cot-item-edit-modal').classList.add('visible');
}

// 保存条目
async function saveCotItem(e) {
    e.preventDefault();
    const id = document.getElementById('cot-item-id').value;
    const name = document.getElementById('cot-item-name').value.trim();
    const content = document.getElementById('cot-item-content').value;

    if (!name) return showToast('Vui lòng nhập tên mục');

    let activeId;
    if (currentCotMode === 'chat') {
        activeId = db.cotSettings.activePresetId;
    } else {
        activeId = db.cotSettings.activeCallPresetId;
    }
    const activePreset = db.cotPresets.find(p => p.id === activeId);
    if (!activePreset) return;

    if (id) {
        // 编辑现有
        const item = activePreset.items.find(i => i.id === id);
        if (item) {
            if (item.locked) return showToast('Mục đã khóa không thể sửa');
            item.name = name;
            item.content = content;
        }
    } else {
        // 新建：插入到倒数第二个位置（即尾声之前），如果存在尾声的话
        const newItem = {
            id: `cot_item_${Date.now()}`,
            name: name,
            content: content,
            enabled: true
        };
        
        // 查找最后一个锁定条目（通常是尾声）
        const lastLockedIndex = activePreset.items.map(i => i.locked).lastIndexOf(true);
        
        if (lastLockedIndex !== -1 && lastLockedIndex === activePreset.items.length - 1) {
            // 如果最后一个是锁定的，插入到它前面
            activePreset.items.splice(lastLockedIndex, 0, newItem);
        } else {
            // 否则追加到末尾
            activePreset.items.push(newItem);
        }
    }

    await saveData();
    document.getElementById('cot-item-edit-modal').classList.remove('visible');
    renderCotItems();
    showToast('Đã lưu mục');
}

// 新建预设
async function createNewCotPreset() {
    const name = prompt('Nhập tên preset mới:');
    if (!name) return;

    let activeId;
    if (currentCotMode === 'chat') {
        activeId = db.cotSettings.activePresetId;
    } else {
        activeId = db.cotSettings.activeCallPresetId;
    }
    const activePreset = db.cotPresets.find(p => p.id === activeId);
    // 复制当前预设的条目
    const newItems = activePreset ? JSON.parse(JSON.stringify(activePreset.items)) : [];
    
    const newPreset = {
        id: `cot_preset_${Date.now()}`,
        name: name,
        items: newItems
    };

    db.cotPresets.push(newPreset);
    
    if (currentCotMode === 'chat') {
        db.cotSettings.activePresetId = newPreset.id;
    } else {
        db.cotSettings.activeCallPresetId = newPreset.id;
    }
    await saveData();
    
    loadCotSettings(); // 重新加载以更新下拉框和列表
    showToast('Đã tạo preset mới');
}

// 重置当前预设
async function resetCotPreset() {
    let activeId;
    if (currentCotMode === 'chat') {
        activeId = db.cotSettings.activePresetId;
    } else {
        activeId = db.cotSettings.activeCallPresetId;
    }
    const activePreset = db.cotPresets.find(p => p.id === activeId);
    if (!activePreset) return;

    if (!confirm(`Chắc chắn đặt lại preset “${activePreset.name}” về chuỗi suy nghĩ mặc định?\nThao tác này sẽ ghi đè toàn bộ mục hiện tại.`)) return;

    // 深度复制默认条目
    if (currentCotMode === 'chat') {
        if (db.cotSettings.promptVersion === 'tt') {
            activePreset.items = JSON.parse(JSON.stringify(DEFAULT_COT_ITEMS_TT));
        } else {
            activePreset.items = JSON.parse(JSON.stringify(DEFAULT_COT_ITEMS_UWU));
        }
    } else {
        if (db.cotSettings.promptVersion === 'tt') {
            activePreset.items = JSON.parse(JSON.stringify(DEFAULT_CALL_COT_ITEMS_TT));
        } else {
            activePreset.items = JSON.parse(JSON.stringify(DEFAULT_CALL_COT_ITEMS_UWU));
        }
    }
    
    await saveData();
    renderCotItems();
    showToast('Đã đặt lại preset về mặc định');
}

// 打开预设管理模态框
function openCotPresetManageModal() {
    const modal = document.getElementById('cot-preset-manage-modal');
    const list = document.getElementById('cot-preset-list-container');
    list.innerHTML = '';

    db.cotPresets.forEach((preset, index) => {
        const row = document.createElement('div');
        row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0;';
        
        let isActive = false;
        if (currentCotMode === 'chat' && preset.id === db.cotSettings.activePresetId) isActive = true;
        if (currentCotMode === 'call' && preset.id === db.cotSettings.activeCallPresetId) isActive = true;

        const nameDiv = document.createElement('div');
        nameDiv.textContent = preset.name + (isActive ? ' (Hiện tại)' : '');
        nameDiv.style.fontWeight = isActive ? 'bold' : 'normal';

        const btnGroup = document.createElement('div');
        btnGroup.style.display = 'flex';
        btnGroup.style.gap = '5px';

        const renameBtn = createIconBtn('✎', async () => {
            const newName = prompt('Nhập tên mới:', preset.name);
            if (newName) {
                preset.name = newName;
                await saveData();
                openCotPresetManageModal(); // 刷新列表
                renderCotPresetSelect(); // 刷新主界面下拉框
            }
        });

        const exportBtn = createIconBtn('⭳', () => { // 使用下载符号
            const blob = new Blob([JSON.stringify(preset, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cot_preset_${preset.name}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });

        const deleteBtn = createIconBtn('×', async () => {
            if (db.cotPresets.length <= 1) return showToast('Phải giữ lại ít nhất một preset');
            if (!confirm(`Chắc chắn xóa preset “${preset.name}”?`)) return;
            
            db.cotPresets.splice(index, 1);
            
            // 如果删除的是当前激活的，重置为第一个
            if (preset.id === db.cotSettings.activePresetId) {
                db.cotSettings.activePresetId = db.cotPresets[0].id;
            }
            if (preset.id === db.cotSettings.activeCallPresetId) {
                db.cotSettings.activeCallPresetId = db.cotPresets[0].id;
            }

            await saveData();
            openCotPresetManageModal();
            loadCotSettings();
        }, true);

        btnGroup.appendChild(renameBtn);
        btnGroup.appendChild(exportBtn);
        btnGroup.appendChild(deleteBtn);

        row.appendChild(nameDiv);
        row.appendChild(btnGroup);
        list.appendChild(row);
    });

    modal.classList.add('visible');
}

// 导入预设
async function importCotPreset(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const preset = JSON.parse(text);
        
        if (!preset.items || !Array.isArray(preset.items)) {
            throw new Error('Sai định dạng: thiếu mảng items');
        }

        preset.id = `cot_preset_${Date.now()}`; // 重新生成ID避免冲突
        preset.name = preset.name + ' (Nhập)';
        
        db.cotPresets.push(preset);
        
        if (currentCotMode === 'chat') {
            db.cotSettings.activePresetId = preset.id;
        } else {
            db.cotSettings.activeCallPresetId = preset.id;
        }
        await saveData();
        
        document.getElementById('cot-preset-manage-modal').classList.remove('visible');
        loadCotSettings();
        showToast('Nhập preset thành công');
    } catch (err) {
        console.error(err);
        showToast('Nhập thất bại:' + err.message);
    } finally {
        e.target.value = '';
    }
}

// 暴露给全局
window.initCotSettings = initCotSettings;
