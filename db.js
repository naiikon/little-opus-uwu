// --- 数据库与全局状态 (js/db.js) ---

// 常量定义
const BLOCKED_API_DOMAINS = [
    'api522.pro',
    'api521.pro',
    'api520.pro'
];

const colorThemes = {
    'white_pink': {
        name: 'Trắng/Hồng',
        received: {bg: 'rgba(255,255,255,0.9)', text: '#6D6D6D'},
        sent: {bg: 'rgba(255,204,204,0.9)', text: '#A56767'}
    },
    'white_blue': {
        name: 'Trắng/Xanh dương',
        received: {bg: 'rgba(255,255,255,0.9)', text: '#6D6D6D'},
        sent: {bg: 'rgba(173,216,230,0.9)', text: '#4A6F8A'}
    },
    'white_yellow': {
        name: 'Trắng/Vàng',
        received: {bg: 'rgba(255,255,255,0.9)', text: '#6D6D6D'},
        sent: {bg: 'rgba(249,237,105,0.9)', text: '#8B7E4B'}
    },
    'white_green': {
        name: 'Trắng/Xanh lá',
        received: {bg: 'rgba(255,255,255,0.9)', text: '#6D6D6D'},
        sent: {bg: 'rgba(188,238,188,0.9)', text: '#4F784F'}
    },
    'white_purple': {
        name: 'Trắng/Tím',
        received: {bg: 'rgba(255,255,255,0.9)', text: '#6D6D6D'},
        sent: {bg: 'rgba(185,190,240,0.9)', text: '#6C5B7B'}
    },
    'black_red': {
        name: 'Đen/Đỏ',
        received: {bg: 'rgba(30,30,30,0.85)', text: '#E0E0E0'},
        sent: {bg: 'rgb(226,62,87,0.9)', text: '#fff'}
    },
    'black_green': {
        name: 'Đen/Xanh lá',
        received: {bg: 'rgba(30,30,30,0.85)', text: '#E0E0E0'},
        sent: {bg: 'rgba(119,221,119,0.9)', text: '#2E5C2E'}
    },
    'black_white': {
        name: 'Đen/Trắng',
        received: {bg: 'rgba(30,30,30,0.85)', text: '#E0E0E0'},
        sent: {bg: 'rgba(245,245,245,0.9)', text: '#333'}
    },
    'white_black': {
        name: 'Trắng/Đen',
        received: {bg: 'rgba(255,255,255,0.9)', text: '#6D6D6D'},
        sent: {bg: 'rgba(50,50,50,0.85)', text: '#F5F5F5'}
    },
    'yellow_purple': {
        name: 'Vàng/Tím',
        received: {bg: 'rgba(255,250,205,0.9)', text: '#8B7E4B'},
        sent: {bg: 'rgba(185,190,240,0.9)', text: '#6C5B7B'}
    },
    'pink_blue': {
        name: 'Hồng/Xanh dương',
        received: {bg: 'rgba(255,231,240,0.9)', text: '#7C6770'},
        sent: {bg: 'rgba(173,216,230,0.9)', text: '#4A6F8A'}
    },
};

const defaultWidgetSettings = {
    centralCircleImage: 'https://i.postimg.cc/mD83gR29/avatar-1.jpg',
    topLeft: { emoji: '🎧', text: '𝑀𝑒𝑚𝑜𝑟𝑖𝑒𝑠✞' },
    topRight: { emoji: '🐈‍⬛', text: '𐙚 ♰.𝐾𝑖𝑡𝑡𝑒𝑛.♰' },
    bottomLeft: { emoji: '💿', text: '᪗₊𝔹𝕒𝕓𝕖𝕚𝕤₊' },
    bottomRight: { emoji: '🥛', text: '.☘︎ ˖+×+.' }
};

const defaultIcons = {
    'chat-list-screen': {name: '404', url: 'https://i.postimg.cc/VvQB8dQT/chan-143.png'},
    'api-settings-screen': {name: 'api', url: 'https://i.postimg.cc/50FqT8GL/chan-125.png'},
    'wallpaper-screen': {name: 'Hình nền', url: 'https://i.postimg.cc/3wqFttL3/chan-90.png'},
    'world-book-screen': {name: 'World book', url: 'https://i.postimg.cc/prCWkrKT/chan-74.png'},
    'customize-screen': {name: 'Tùy chỉnh', url: 'https://i.postimg.cc/vZVdC7gt/chan-133.png'},
    'font-settings-screen': {name: 'Font', url: 'https://i.postimg.cc/FzVtC0x4/chan-21.png'},
    'tutorial-screen': {name: 'Hướng dẫn', url: 'https://i.postimg.cc/6QgNzCFf/chan-118.png'},
    'day-mode-btn': {name: 'Chế độ ngày', url: 'https://i.postimg.cc/Jz0tYqnT/chan-145.png'},
    'night-mode-btn': {name: 'Chế độ đêm', url: 'https://i.postimg.cc/htYvkdQK/chan-146.png'},
    'music-screen': {name: 'Nhạc', url: 'https://i.postimg.cc/ydd65txK/1758451018266.png'},
    'console-screen': {name: 'Console', url: 'https://i.postimg.cc/sfMwnRvn/ji-lichan-(128).png'},
    'storage-analysis-screen': {name: 'Phân tích lưu trữ', url: 'https://i.postimg.cc/J0F3Lt0T/chan-107.png'},
    'widget-market-screen': {name: 'Widget', url: 'https://i.postimg.cc/NG2k67zS/ji-lichan-(138).png'},
    'reader-bookshelf-screen': {name: 'Trình đọc', url: 'https://i.postimg.cc/FHkvm6WG/ji-lichan-(41).png'},
    'placeholder-app': {name: '<3', url: 'https://i.postimg.cc/kGSN7qSq/ji-lichan-(136).png'}
};

const peekScreenApps = {
    'messages': { name: 'Tin nhắn', url: 'https://i.postimg.cc/Kvs4tDh5/export202509181826424260.png' },
    'memos': { name: 'Ghi chú', url: 'https://i.postimg.cc/JzD0xH1C/export202509181829064550.png' },
    'cart': { name: 'Giỏ hàng', url: 'https://i.postimg.cc/pLwT6VTh/export202509181830143960.png' },
    'transfer': { name: 'Trạm trung chuyển', url: 'https://i.postimg.cc/63wQBHCB/export202509181831140230.png' },
    'browser': { name: 'Trình duyệt', url: 'https://i.postimg.cc/SKcsF02Z/export202509181830445980.png' },
    'drafts': { name: 'Hộp nháp', url: 'https://i.postimg.cc/ZKqC9D2R/export202509181827225860.png' },
    'album': { name: 'Album', url: 'https://i.postimg.cc/qBcdpqNc/export202509221549335970.png' },
    'steps': { name: 'Số bước', url: 'https://i.postimg.cc/5NndFrq6/export202509181824532800.png' },
    'unlock': { name: 'unlock！', url: 'https://i.postimg.cc/28zNyYWs/export202509221542593320.png' },
    'bag': { name: 'Lục túi', url: 'https://i.postimg.cc/kGSN7qSq/ji-lichan-(136).png' }
};

const DEFAULT_COT_PRESETS = [
    {
        id: 'default',
        name: 'Chuỗi suy nghĩ mặc định',
        items: [
            {
                id: 'cot_item_1',
                name: 'Dẫn nhập',
                content: '[System Directive]:\nBạn bắt buộc phải tuân thủ nghiêm ngặt giao thức [incipere] . Trước khi trả lời, hãy vào thẻ <thinking> để suy luận sâu.\nHãy xem các module trong System Prompt theo các bước sau và suy nghĩ:',
                enabled: true
            },
            {
                id: 'cot_item_2',
                name: 'Sẵn sàng vận động não chưa?',
                content: '---\n## 【Quy tắc tiên quyết】\n### **Bắt buộc** đọc tất cả<logic_rules>và<output_formats>: nắm **toàn bộ** quy tắc cần tuân thủ, sau đó suy nghĩ ngắn gọn, chính xác theo các bước sau',
                enabled: true
            },
            {
                id: 'cot_item_3',
                name: 'Đọc thiết lập cho tôi!',
                content: '---\n## 【Hiệu chỉnh hành vi】\nDựa trên<char_settings>và<角色活人运转>xây dựng nhân cách nhân vật\n### Phase1: person\n1. **Kiểm tra ý thức bản thân (Ref: <char_settings>và<角色活人运转>)**\n   - Đã khắc họa được nhân cách sống động, chân thật chưa?\n   - Bạn (nhân vật) có thói quen/phong cách chat riêng không?\n   - Bạn muốn đáp lại tôi thế nào?',
                enabled: true
            },
            {
                id: 'cot_item_4',
                name: 'Làm người đi nào.',
                content: '### Phase2: Verisimilitude\n2.**Chat chân thật**\n   - Đã áp dụng lối chat của người thật theo hai yêu cầu sau chưa?\n    - Sự chú ý của người bình thường có hạn, không nhất thiết câu nào cũng phải trả lời từng câu.\n    - Không hỏi ngược lặp lại những thông tin đã có.\n    - Xử lý khoảng ngắt: nếu cách tin nhắn trước khá lâu, mặc định hai bên chỉ bận việc rồi cầm điện thoại lên lại, hoặc mặc định trong lúc đó vẫn giữ liên lạc theo cách khác, tự nhiên nối tiếp chủ đề.',
                enabled: true
            },
            {
                id: 'cot_item_5',
                name: 'Có định dạng đặc biệt nào không?',
                content: '### Phase3: chat role\n3. **Truy xuất logic (Ref: <logic_rules>)**\n   - Hiện có phải bối cảnh hội thoại song ngữ không? Nếu không, bỏ qua mục này\n   - Có cần xuất thanh trạng thái không? Nếu không có yêu cầu liên quan thì bỏ qua mục này',
                enabled: true
            },
            {
                id: 'cot_item_6',
                name: 'Xác nhận lần cuối nào.',
                content: '## 【Xác nhận cuối】\n\n4. Tổng hợp<Chatting Guidelines>, đã trả lời hợp lý tự nhiên và không lệch persona chưa? Xem lại<output_formats>, định dạng tin nhắn xuất ra đã đúng chưa?',
                enabled: true
            },
            {
                id: 'cot_item_7',
                name: 'Kết',
                content: 'Trước mỗi lượt xuất, bắt buộc phải suy nghĩ lần lượt từng mục theo đúng các bước trong<thinking>…</thinking>, không cần chép lại các mục, nhưng nội dung suy nghĩ phải ngắn gọn, chính xác, rõ ràng, khả thi, không được nhảy bước.\n<thinking>Mọi phân tích trong\n\nĐịnh dạng:\n<thinking>\n...Quá trình suy nghĩ...\n</thinking>',
                enabled: true
            }
        ]
    }
];

const globalSettingKeys = [
    'apiSettings', 'wallpaper', 'homeScreenMode', 'fontUrl', 'customIcons',
    'apiPresets', 'bubbleCssPresets', 'myPersonaPresets', 'globalCss',
    'globalCssPresets', 'fontPresets', 'homeSignature', 'insWidgetSettings', 'homeWidgetSettings',
    'chatFolders', 'fontSizeScale', 'activePersonaId', 'moreProfileCardBg', 'statusBarPresets', 'themeSettings', 'themePresets', 'savedKeyboardHeight',
    'globalSendSound', 'globalReceiveSound', 'multiMsgSoundEnabled', 'soundPresets', 'galleryPresets',
    'cotSettings', 'cotPresets', 'hasSeenVideoCallDisclaimer', 'hasSeenVideoCallAvatarHint',
    'workshopSettings', 'workshopLlmPresets', 'workshopPromptPresets', 'homeLayoutOrder',
    'homeLayoutPages', 'widgetTemplates', 'addedWidgets', 'backupReminderSettings',
    'stUnlocked'
];


const appVersion = "1.8.9";
const updateLog = [
    {
        version: "1.8.9",
        date: "2026-07-28",
        notes: [
            "Đổi vị trí chèn world book: World book·Trước tách thành World book·Phá giới hạn và World book·Trước; World book·Sau tách thành World book·Sau và World book·Bổ sung chat.",
            "Thêm bộ prompt thứ hai (T.T), có cho cả chat và gọi điện, phần gọi điện chưa test. Chuyển đổi ở giao diện chuỗi suy nghĩ, có cấu hình sẵn chuỗi suy nghĩ mặc định. Xem giải thích chi tiết ởdc",
            "Làm lại lớn phần dung lượng lưu trữ cũ, thêm: trực quan hóa chi tiết, xuất/nhập theo loại, dọn bộ nhớ đệm ảnh.",
            "Thêm logic: lượt nói mới nhất của user sẽ được bọc trong<user_input>, khi viết chuỗi suy nghĩ có thể tham chiếu thẻ này.",
            "Thêm: tạo ảnh noval mở khóa dùng nhóm vibe, có thể nhập nhóm vibe từ trang chính thức, lên diễn đàn vẽ ảnh wbz tìm cũng có nhiều thầy chia sẻ nhóm vibe, trước khi dùng hãy hỏi xem có hỗ trợ nhập vào điện thoại mini không. (Xin đề cử mạnh vibe của thầy “Wow wow wow”)",
            "Thêm: Trình đọc, thêm tính năng cùng char… đùa đấy, chỉ là một trình đọc bình thường thôi! Nhưng có thể tạo ảnh từ chữ (mới test với noval), làm cả nồi chỉ vì chút giấm này đó! Sau khi tạo sẽ chèn dấu bình luận đoạn nhỏ vào chương hiện tại, bấm vào để xem ảnh.",
        ]
    },
    {
        version: "1.8.6",
        date: "2026-04-23",
        notes: [
            "Dùng model claude thì không dùng được chuỗi suy nghĩ, đừng bật!",
            "Thử sửa lỗi 400 của Claude (không biết sửa được chưa, có thể phản hồi)",
            "Đổi vị trí lịch sử chat trong prompt, ai dùng chuỗi suy nghĩ mặc định có thể thử tắt chuỗi suy nghĩ (dù sao chuỗi suy nghĩ mình viết cũng không hay lắm). Tự test thấy tình trạng học theo ngữ cảnh khiến câu cú bị đóng khuôn đã đỡ hơn.",
            "Đổi yêu cầu định dạng khi tạo nhật ký, chuyển sang xuất thẻ xml, các điều khoản liên quan bắt buộc json thuần trong world book định dạng nhật ký cũ cần sửa lại",
        ]
    },
    {
        version: "1.8.5",
        date: "2026-02-18",
        notes: [
            "Chat thêm chức năng: gọi video/gọi thoại, lối vào để user gọi nằm trong bảng chức năng, muốn char chủ động gọi thì bật công tắc trong cài đặt chat",
            "Trang chuỗi suy nghĩ thêm: cài đặt cot riêng cho cuộc gọi, bật hay không tùy, có sẵn chuỗi suy nghĩ mặc định, hỗ trợ tùy chỉnh",
            "**Hướng dẫn thao tác: tất cả mọi người! Lên kênh chính điện thoại mini trên dc xem video hướng dẫn!**",
            "—————————————",
            "Tự tóm tắt sau khi kết thúc cuộc gọi, chỉ nội dung tóm tắt được đưa vào ngữ cảnh.",
            "Nếu tóm tắt thất bại, có thể tìm lại lần đó trong lịch sử cuộc gọi, mở ra, tóm tắt lại. Nếu thất bại thường xuyên, có thể sao chép toàn bộ nội dung trong lịch sử cuộc gọi nhờ AI khác tóm tắt giúp.",
            "Xem nội dung tóm tắt thế nào?: vào chế độ debug, bấm vào tin hệ thống “Kết thúc gọi video” là thấy nội dung tóm tắt",
        ]
    },
    {
        version: "1.8.4",
        date: "2026-02-14",
        notes: [
            "Thêm chuỗi suy nghĩ COT kẹt thẻ, nguyên lý giống Tavern, một số mục preset sửa từ preset quá cảnh của Chi Chi, cách kẹt cot lấy từ hướng dẫn preset của KKM, cảm ơn rất nhiều!",
            "Chuỗi suy nghĩ hiện chắc chỉ có hiệu lực với model **Gemini** qua **Open AI**, model khác chưa test.",
            "Vị trí: giao diện 404-Menu, mặc định tắt, bật khi cần, có sẵn chuỗi suy nghĩ mặc định, hỗ trợ chuỗi suy nghĩ tùy chỉnh, hỗ trợ xuất/nhập chuỗi suy nghĩ tùy chỉnh.",
            "Chuỗi suy nghĩ có thể ảnh hưởng phong cách trả lời của AI, nhưng khi bật thì độ tự nhiên của số tin trả lời và việc dùng các tin đặc biệt tiến bộ rõ, hãy tùy tình hình mà bật.",
        ]
    },
    {
        version: "1.8.3",
        date: "2026-01-27",
        notes: [
            "1.Nâng cấp nhật ký! Thêm phong cách tóm tắt, hỗ trợ phong cách tùy chỉnh.",
            "Giờ tạo nhật ký sẽ tự đưa bối cảnh phòng chat vào, không cần liên kết lại.",
            "Tối ưu prompt tạo nhật ký, phong cách tóm tắt khách quan hơn, dòng thời gian rõ hơn.",
            "Chuyển đổi thông minh: liên kết nhật ký bản cũ đã được tự tối ưu, bỏ phần thiết lập bối cảnh bị lặp.",
            "Gộp rút gọn: thêm chọn nhiều nhật ký để gộp, hợp nhiều nhật ký thành một bản “hồi ký” liền mạch, súc tích, tự sắp xếp dòng thời gian.",
            "Tham khảo trước đây: khi tạo nhật ký mới, có thể chọn **tham khảo các nhật ký đã yêu thích**. AI sẽ đọc những hồi ức trọng điểm bạn đã lưu, đảm bảo nội dung mới liền mạch, tránh ghi lặp.",
            "—————————————",
            "2. Hệ thống Cửa hàng hoàn toàn mới",
            "Danh mục tùy chỉnh: hỗ trợ tùy chỉnh tên danh mục và prompt. Ở trang chủ cửa hàng bấm “＋” góc trên bên phải",
            "Công tắc tùy chọn: nếu không thích cửa hàng làm phiền lúc chat, có thể tắt tính năng này trong cài đặt. (Chỉ tắt việc char chủ động mua đồ và thanh toán hộ cho bạn, bạn vẫn dùng cửa hàng một chiều được)",
            "—————————————",
            "3. Liên kết Nhìn lén x Cửa hàng",
            "Ở chế độ Nhìn lén, vào ứng dụng “Giỏ hàng”, bấm nút “Thanh toán” ở dưới là có thể trả tiền giúp Ta. Sau khi thanh toán ở giao diện Nhìn lén, hệ thống sẽ tự quay lại giao diện chat và gửi một tin đơn hàng “Tôi đã xóa sạch giỏ hàng cho Ta”.",
            "4. Cứu hộ css toàn cục",
            "Ở bất kỳ giao diện nào bấm nhanh 5 lần, gọi bảng cứu hộ để xóa sạch ô css toàn cục bằng một nút"
        ]
    },
    {
        version: "1.8.2",
        date: "2025-01-24",
        notes: [
            "Sửa chút bug, âm báo giờ đã dùng bình thường được",
            "Bỏ giới hạn vùng css tùy chỉnh, giờ có thể dùng biến toàn cục các kiểu, nhưng vẫn chỉ có hiệu lực trong phòng chat!",
            "Các theme trước đây có vài tên class chưa thêm #chat-room-screen phía trước có thể bị lệch! Ví dụ vài chỗ nhỏ ở thanh trên/dưới, xin quỳ trước các thầy làm themeTT",
            "Sửa vài bug, làm âm báo,【Bắt đầu tạo】là âm thanh khi bấm nút để ai trả lời, nhận trả lời là âm thanh khi được nhắn tin",
            "Làm tính năng một bạn đặt riêng, chọn đoạn cụ thể để chụp màn hình, nhưng có bug không chụp được bong bóng các thứ, chỉ có chữ và nền",
            "—————————Đường phân cách————————",
            "Mới tiếp xúc máy Bạch Tuộc, có thắc mắc về cách dùng thì trước tiên xem màn hình chính→Hướng dẫn→nhật ký cập nhật, lật hết một lượt!",
            "Tiếp theo xem thanh điều hướng dưới danh sách chat→icon gọi điện, bấm vào có ghi chú cập nhật phiên bản mới chi tiết, lật hết một lượt!",
            "Nếu có log báo lỗi mà tự đọc không hiểu thì sao chép nội dung log gửi cho ai hỏi",
            "Vẫn còn vấn đề thì lên Vĩ Ba Trấn→eekhu điện thoại mini→tìm trong ghim: Tự xử lý sự cố Bạch Tuộc Nhỏ UwU",
            "Thanh trạng thái thì chắc chắn phải vật lộn với ai, khó mà xong ngay một bước, thanh trạng thái không phải thứ bắt buộc, sẽ ảnh hưởng chất lượng trả lời của ai",
            "Những thứ trên bao quát 90% cách giải quyết, cố gắng đừng vì những câu hỏi cơ bản mà tiêu hao nhiệt tình của các thầy giải đáp miễn phí nha, thương mọi người!",
        ]
    },
    {
        version: "1.8.0",
        date: "2025-01-15",
        notes: [
            "Khoan bấm【Mình biết rồi】, đọc hết đọc hết đọc hết",
            "Lần cập nhật này, chat riêng giữa thành viên nhóm và Album của Ta đều là【đang thử nghiệm】tính năng, không biết hiệu quả thế nào, đều có công tắc tùy chọn, không bật cũng không ảnh hưởng chơi bình thường",
            "🔍 Trang tìm kiếm: tìm nhanh lịch sử chat, hỗ trợ tô sáng từ khóa.",
            "🖼️ TA Album: quản lý album riêng của nhân vật trong cài đặt chat, bật công tắc này trong cài đặt chat thì lúc chat nhân vật có thể gửi thẳng ảnh bạn đã tải lên (nên dùng url).",
            "📢 Thông báo nhóm: cài đặt nhóm thêm chức năng thông báo, thông tin quan trọng được ghim lên đầu.",
            "🤫 Chat riêng trong nhóm: chat nhóm hỗ trợ thành viên chat riêng với nhau, bấm đúp tiêu đề nhóm để xem, tám chuyện tiện hơn.",
            "📝 Tóm tắt nhóm: tóm tắt thông minh lịch sử chat nhóm, tự liên kết world book của nhóm hiện tại, có sẵn prompt.",
            "📒 token: ở thẻ hồ sơ nhân vật (bấm ảnh đại diện nhân vật trong danh bạ), thống kê sơ bộ số token của phòng chat hiện tại, không hoàn toàn chính xác, chỉ để tham khảo!",
            "—————————Đường phân cách————————",
            "Mới tiếp xúc máy Bạch Tuộc, có thắc mắc về cách dùng thì trước tiên xem màn hình chính→Hướng dẫn→nhật ký cập nhật, lật hết một lượt!",
            "Tiếp theo xem thanh điều hướng dưới danh sách chat→icon gọi điện, bấm vào có ghi chú cập nhật phiên bản mới chi tiết, lật hết một lượt!",
            "Nếu có log báo lỗi mà tự đọc không hiểu thì sao chép nội dung log gửi cho ai hỏi",
            "Vẫn còn vấn đề thì lên Vĩ Ba Trấn→eekhu điện thoại mini→tìm trong ghim: Tự xử lý sự cố Bạch Tuộc Nhỏ UwU",
            "Thanh trạng thái thì chắc chắn phải vật lộn với ai, khó mà xong ngay một bước, thanh trạng thái không phải thứ bắt buộc, sẽ ảnh hưởng chất lượng trả lời của ai",
            "Những thứ trên bao quát 90% cách giải quyết, cố gắng đừng vì những câu hỏi cơ bản mà tiêu hao nhiệt tình của các thầy giải đáp miễn phí nha, thương mọi người!",
        ]
    },
    {
        version: "1.7.2",
        date: "2025-01-15",
        notes: [
            "Khoan bấm【Mình biết rồi】, đọc hết đọc hết đọc hết",
            "Mới tiếp xúc máy Bạch Tuộc, có thắc mắc về cách dùng thì trước tiên xem màn hình chính→Hướng dẫn→nhật ký cập nhật, lật hết một lượt!",
            "Tiếp theo xem thanh điều hướng dưới danh sách chat→icon gọi điện, bấm vào có ghi chú cập nhật phiên bản mới chi tiết, lật hết một lượt!",
            "Nếu có log báo lỗi mà tự đọc không hiểu thì sao chép nội dung log gửi cho ai hỏi",
            "Vẫn còn vấn đề thì lên Vĩ Ba Trấn→eekhu điện thoại mini→tìm trong ghim: Tự xử lý sự cố Bạch Tuộc Nhỏ UwU",
            "Thanh trạng thái thì chắc chắn phải vật lộn với ai, khó mà xong ngay một bước, thanh trạng thái không phải thứ bắt buộc, sẽ ảnh hưởng chất lượng trả lời của ai",
            "Những thứ trên bao quát 90% cách giải quyết, cố gắng đừng vì những câu hỏi cơ bản mà tiêu hao nhiệt tình của các thầy giải đáp miễn phí nha, thương mọi người!",
        ]
    },
    {
        version: "1.6.0",
        date: "2025-01-04",
        notes: [
            "Lần cập nhật này: thay đổi cơ chế sticker, cơ chế cũ tốn token nên bỏ, vì vậy sticker trong lịch sử chat cũ sẽ không hiển thị nữa.",
            "Khi nhập sticker hàng loạt dùng dấu hai chấm tiếng Anh hay tiếng Trung đều được.",
            "Giờ dùng sticker thế nào? Khi nhập hàng loạt hãy điền tên nhóm, nhất định phải điền! Sticker chưa phân loại thì char không dùng được (sticker cũ của bạn đều thuộc chưa phân loại); sau đó ở thanh bên chọn nhóm sticker char được dùng là xong.",
            "Sticker cũ được gom hết vào mục chưa phân loại, muốn cho char dùng thì nhớ khi chọn nhiều hãy→chuyển nhóm→tự phân loại nhé.",
            "Dữ liệu Nhìn lén giờ không bị xóa khi thoát nữa, muốn tạo lần tiếp thì bấm xóa góc trên bên phải để xóa sạch.",
            "Có báo lỗi gì thì trước tiên tìm uwu trong ghim khu điện thoại mini trên dc, có danh sách tự giải đáp, đừng vì câu hỏi cơ bản mà tiêu hao nhiệt tình của các thầy giải đáp miễn phí nha, thương mọi người!",
            "Chỉ đường xem lại ghi chú cập nhật cũ và hướng dẫn sử dụng→Hướng dẫn ở màn hình chínhapp→ghi chú cập nhật! Bé mới nhất định phải xem nha.",
        ]
    },
    {
        version: "1.5.0",
        date: "2025-12-17",
        notes: [
            "Lần cập nhật này: chắc đã giảm mạnh tỉ lệ lỗi khi tạo nhật ký, cảm ơn bạn nhỏ ẩn danh đã tự sửa, test và gửi code sửa lỗi!",
            "Bạn nhỏ ẩn danh nhắn rằng: cảm ơn tất cả các thầy làm điện thoại mini luôn làm vì đam mê, chia sẻ code không vụ lợi!",
            "Nhân đây mình cũng muốn cảm ơn tất cả các thầy làm theme UwU và giải đáp thắc mắc vì đam mê! Cúi chào——!",
        ]
    },
    {
version: "1.4.0",
date: "2025-12-12",
notes: [
    "Lần cập nhật này: ra mắt tính năng sao lưu đám mây GitHub! Chỉ đường→trên màn hình chính【Hướng dẫn】app→lướt xuống cuối trang là thấy. (UI bê từ chỗ khác sang, lười trang trí rồi! Dùng tạm nha xin lỗi!)",
    "Chức năng chính: tải lên/khôi phục bản sao lưu mới nhất bằng một nút. Cấu hình xong, dữ liệu sao lưu được lưu thẳng vào repo GitHub riêng tư của bạn, khôi phục thì tự chọn file sao lưu có mốc thời gian mới nhất trong repo để nhập.",
    "Cấu hình khó quá không biết làm? Đừng hoảng! Bấm vào【icon dấu hỏi nhỏ màu xanh】cạnh ô cấu hình, bên trong có hướng dẫn cầm tay chỉ việc. Đừng sợ tiếng Anh, làm theo từng bước bấm vài cái, cấu hình một lần, dùng cả đời.",
    "Tính năng đang thử nghiệm, chưa chắc hữu ích: cấu hình xong có thể tùy nhu cầu bật【công tắc sao lưu tự động】! Đặt tần suất (ví dụ mỗi 24 giờ), sau này chỉ cần bạn mở trang này, nó sẽ lặng lẽ tải bản lưu lên đám mây trong nền, không còn lo quên sao lưu.",
    "Lưu ý đặc biệt: vì an toàn dữ liệu của bạn, Token lấy trong tài khoản GitHub (chuỗi bắt đầu bằng ghp_) và tên repo nhất định phải tự cất kỹ, đừng gửi cho người khác nhé!",
    "Chỉ đường xem lại ghi chú cập nhật cũ→Hướng dẫn ở màn hình chínhapp→ghi chú cập nhật!",
    ]
    },
    {
        version: "1.3.0",
        date: "2025-11-11",
        notes: [
            "Nhất định phải xem kỹ! Chỉ đường xem lại→Hướng dẫn ở màn hình chínhapp→ghi chú cập nhật!",
            "Thêm: chế độ song ngữ, nằm trong thanh bên của giao diện chat, khi char là người nước ngoài mà bạn muốn hội thoại nhập vai hơn thì bật khi cần, bật lên sẽ nhận diện tin dạng “tiếng nước ngoài（bản dịch）” thành bong bóng song ngữ, lưu ý! Bản dịch phải nằm trong ngoặc, bấm vào bong bóng để mở bản dịch.",
            "Thêm: công tắc truyền stream, nằm ở giao diện cài đặt api, bật với không bật khác gì cũng không rõ, tóm lại là làm rồi ừm ừm. Trước khi sửa mặc định là stream, nếu không stream mà không ra thì bật stream, stream không ra thì tắt stream, cả hai không ra thì mình cũng chịu!",
            "Hướng dẫn bổ sung: thấy có bé vẫn chưa rõ cách dùng vài chỗ, nên bổ sung thêm",
            "2. Nhật ký hồi ức: sau khi tạo nhật ký, cần bấm sáng nút ☆ góc trên bên phải nhật ký đó để yêu thích, yêu thích rồi nhật ký đó mới được đưa vào ngữ cảnh chat làm hồi ức của char",
            "3. Cách dùng nhật ký mở rộng: nội dung nhật ký sửa được, khi nhật ký quá nhiều/char bị các mô tả chủ quan trong nhật ký ảnh hưởng tính cách nhiều, có thể sao chép phần nhật ký cần giữ cho một ai nào đó (Doubao, deepseek, Gemini đều được) để tổng hợp lớn, lệnh tham khảo: tóm tắt các sự kiện đã xảy ra và các câu then chốt theo thứ tự thời gian, bằng ngôi thứ ba, hoàn toàn khách quan, không xen cảm xúc chủ quan. Rồi nhét bản tóm tắt trả về vào nhật ký yêu thích để đưa vào ngữ cảnh là được.",
        ]
    },
    {
        version: "1.2.0",
        date: "2025-10-15",
        notes: [
            "Thêm: xóa hàng loạt world book, nhấn giữ một mục để vào chế độ chọn nhiều để xóa, hỗ trợ chọn tất cả theo phân loại.",
        ]
    },
    {
        version: "1.1.0",
        date: "2025-10-13",
        notes: [
            "Thêm: đồng hồ Pomodoro, có thể tạo nhiệm vụ tập trung và gắn với char cùng preset persona của bạn (chỉ chọn được từ preset), vuốt trái trong danh sách để xóa nhiệm vụ. Trong lúc tập trung muốn lười thì chọc vào ảnh đại diện, ta sẽ trả lời bạn. Nút cài đặt ở mỗi màn tập trung cho tùy chỉnh tần suất cổ vũ và giới hạn số lần chọc, quá số lần thì ta sẽ không thèm để ý bạn nữa, đừng lười nha, cố gắng tập trung nào!",
            "Thêm: hai widget màn hình chính, giờ mọi widget đều bấm vào để tùy chỉnh ảnh và chữ được",
        ]
    },
    // ... 其他更新日志可以在 tutorial.js 中处理，这里保留最新的即可，或者全部保留
];

// 全局变量
var db = {
    characters: [],
    groups: [],
    apiSettings: {},
    wallpaper: 'https://i.postimg.cc/W4Z9R9x4/ins-1.jpg',
    myStickers: [],
    homeScreenMode: 'night',
    worldBooks: [],
    fontUrl: '',
    customIcons: {},
    apiPresets: [],
    bubbleCssPresets: [],
    myPersonaPresets: [],
    fontPresets: [],
    globalCss: '',
    globalCssPresets: [],
    homeSignature: 'Sửa chữ ký...',
    insWidgetSettings: {
        avatar1: 'https://i.postimg.cc/Y96LPskq/o-o-2.jpg',
        bubble1: 'love u.',
        avatar2: 'https://i.postimg.cc/GtbTnxhP/o-o-1.jpg',
        bubble2: 'miss u.'
    },
    chatFolders: [],
    fontSizeScale: 1.0,
    savedKeyboardHeight: null,
    activePersonaId: null,
    moreProfileCardBg: 'https://i.postimg.cc/XvFDdTKY/Smart-Select-20251013-023208.jpg',
    statusBarPresets: [],
    themeSettings: {
        global: {
            iconColor: '#000000',
            textColor: '#2a3032',
            titleColor: '#000000',
            backgroundColor: '#ffffff'
        },
        wallpapers: {
            contacts: '',
            chats: '',
            more: ''
        },
        bottomNav: {
            iconColor: '#999999',
            activeIconColor: '#2a3032',
            items: [
                { defaultIcon: '', activeIcon: '' },
                { defaultIcon: '', activeIcon: '' },
                { defaultIcon: '', activeIcon: '' },
                { defaultIcon: '', activeIcon: '' }
            ]
        },
        chatScreen: {
            bottomBarColor: '#ffffff',
            iconColor: '#000000',
            folderPillColor: '#ffffff'
        }
    },
    themePresets: [],
    globalSendSound: '',
    globalReceiveSound: '',
    multiMsgSoundEnabled: false,
    soundPresets: [],
    galleryPresets: [],
    cotSettings: {
        enabled: false,
        activePresetId: 'default',
        prefillEnabled: true,
        callPrefillEnabled: true
    },
    cotPresets: JSON.parse(JSON.stringify(DEFAULT_COT_PRESETS)),
    workshopSettings: {
        provider: '',
        apiType: 'official',
        apiUrl: '',
        apiKey: '',
        model: '',
        width: 832,
        height: 1216,
        cfgScale: 5.0,
        rateLimit: 45,
        positivePrompt: '',
        characterPrompt: '',
        negativePrompt: '',
        llmIndependentApi: false,
        llmApiPresetId: '',
        gptLlmIndependentApi: false,
        gptLlmApiPresetId: '',
        boundCharacters: []
    },
    workshopLlmPresets: [],
    workshopPromptPresets: [],
    widgetTemplates: [],
    addedWidgets: [],
    backupReminderSettings: {
        enabled: true,
        interval: 3,
        lastReminderTime: 0
    }
};


var currentChatId = null;
var currentChatType = null;
var isGenerating = false;
var longPressTimer = null;
var isInMultiSelectMode = false;
var editingMessageId = null;
var currentPage = 1;
var currentTransferMessageId = null;
var currentEditingWorldBookId = null;
var currentStickerActionTarget = null;
var currentJournalDetailId = null;
var currentQuoteInfo = null;
var isDebugMode = false;
var currentFolderId = 'all';
var currentFolderActionTarget = null;
var currentGroupAction = {type: null, recipients: []};
var isRawEditMode = false;
var isStickerManageMode = false;
var selectedStickerIds = new Set();
var isWorldBookMultiSelectMode = false;
var selectedWorldBookIds = new Set();
var generatingPeekApps = new Set();
var selectedMessageIds = new Set();
var currentStickerCategory = 'recent';
const MESSAGES_PER_PAGE = 50;


// Dexie 数据库初始化
var dexieDB; // 声明全局变量，但不初始化

function initDatabase() {
    dexieDB = new Dexie('章鱼喷墨机DB_ee');
    dexieDB.version(1).stores({
        storage: 'key, value'
    });
    dexieDB.version(8).stores({
        characters: '&id',
        groups: '&id',
        worldBooks: '&id',
        myStickers: '&id',
        globalSettings: 'key',
        workshopHistory: '++id, timestamp',
        workshopVibeGroups: '++id',
        characterPhotos: '++id, charId, timestamp',
        customFonts: '&id',
        reader_books: '&id, lastReadTime',
        reader_chapters: '&id, bookId',
        reader_comments: '++id, bookId, [bookId+chapterIndex+paragraphIndex]'
    });
    dexieDB.version(7).stores({
        characters: '&id',
        groups: '&id',
        worldBooks: '&id',
        myStickers: '&id',
        globalSettings: 'key',
        workshopHistory: '++id, timestamp',
        workshopVibeGroups: '++id',
        characterPhotos: '++id, charId, timestamp',
        customFonts: '&id',
        reader_books: '&id, lastReadTime',
        reader_chapters: '&id, bookId'
    });
    dexieDB.version(6).stores({
        characters: '&id',
        groups: '&id',
        worldBooks: '&id',
        myStickers: '&id',
        globalSettings: 'key',
        workshopHistory: '++id, timestamp',
        workshopVibeGroups: '++id',
        characterPhotos: '++id, charId, timestamp',
        customFonts: '&id',
        reader_books: '&id',
        reader_chapters: '&id, bookId'
    });
    dexieDB.version(5).stores({
        characters: '&id',
        groups: '&id',
        worldBooks: '&id',
        myStickers: '&id',
        globalSettings: 'key',
        workshopHistory: '++id, timestamp',
        workshopVibeGroups: '++id',
        characterPhotos: '++id, charId, timestamp',
        customFonts: '&id'
    });
    dexieDB.version(4).stores({
        characters: '&id',
        groups: '&id',
        worldBooks: '&id',
        myStickers: '&id',
        globalSettings: 'key',
        workshopHistory: '++id, timestamp',
        workshopVibeGroups: '++id',
        characterPhotos: '++id, charId, timestamp'
    }).upgrade(async tx => {
        console.log("Upgrading database to version 2...");
        const oldData = await tx.table('storage').get('章鱼喷墨机');
        if (oldData && oldData.value) {
            console.log("Old data found, starting migration.");
            const data = JSON.parse(oldData.value);
            if (data.characters) await tx.table('characters').bulkPut(data.characters);
            if (data.groups) await tx.table('groups').bulkPut(data.groups);
            if (data.worldBooks) await tx.table('worldBooks').bulkPut(data.worldBooks);
            if (data.myStickers) await tx.table('myStickers').bulkPut(data.myStickers);
            
            const settingsToMigrate = {
                apiSettings: data.apiSettings || {},
                wallpaper: data.wallpaper || 'https://i.postimg.cc/W4Z9R9x4/ins-1.jpg',
                homeScreenMode: data.homeScreenMode || 'night',
                fontUrl: data.fontUrl || '',
                customIcons: data.customIcons || {},
                apiPresets: data.apiPresets || [],
                bubbleCssPresets: data.bubbleCssPresets || [],
                myPersonaPresets: data.myPersonaPresets || [],
                globalCss: data.globalCss || '',
                globalCssPresets: data.globalCssPresets || [],
                homeSignature: data.homeSignature || 'Sửa chữ ký...',
                insWidgetSettings: data.insWidgetSettings || { avatar1: 'https://i.postimg.cc/Y96LPskq/o-o-2.jpg', bubble1: 'love u.', avatar2: 'https://i.postimg.cc/GtbTnxhP/o-o-1.jpg', bubble2: 'miss u.' },
                homeWidgetSettings: data.homeWidgetSettings || defaultWidgetSettings,
            moreProfileCardBg: data.moreProfileCardBg || 'https://i.postimg.cc/XvFDdTKY/Smart-Select-20251013-023208.jpg',
            cotSettings: data.cotSettings || { enabled: false, activePresetId: 'default' },
            cotPresets: data.cotPresets || JSON.parse(JSON.stringify(DEFAULT_COT_PRESETS)),
            workshopSettings: {
                provider: '', apiType: 'official', apiUrl: '', apiKey: '', model: '',
                width: 832, height: 1216, cfgScale: 5.0, rateLimit: 45,
                positivePrompt: '', characterPrompt: '', negativePrompt: '', llmIndependentApi: false, llmApiPresetId: '', gptLlmIndependentApi: false, gptLlmApiPresetId: '', boundCharacters: []
            },
            workshopLlmPresets: [],
            workshopPromptPresets: [],
            homeLayoutOrder: ['widget-top', 'widget-ins', 'app-chat', 'app-api', 'app-wallpaper', 'app-worldbook', 'app-customize', 'app-tutorial', 'app-reader', 'widget-heart', 'app-placeholder'],
            widgetTemplates: [],
            addedWidgets: []
        };


            const settingsPromises = Object.entries(settingsToMigrate).map(([key, value]) =>
                tx.table('globalSettings').put({ key, value })
            );
            await Promise.all(settingsPromises);
            
            await tx.table('storage').delete('章鱼喷墨机');
            console.log("Migration complete. Old data removed.");
        } else {
            console.log("No old data found to migrate.");
        }
    });
}

// 数据保存与加载
const saveData = async () => {
    if (!dexieDB) return;
    if (typeof syncAllActiveArchives === 'function') {
        syncAllActiveArchives();
    }
    await dexieDB.transaction('rw', dexieDB.tables, async () => {
        await dexieDB.characters.bulkPut(db.characters);
        await dexieDB.groups.bulkPut(db.groups);
        await dexieDB.worldBooks.bulkPut(db.worldBooks);
        await dexieDB.myStickers.bulkPut(db.myStickers);

        const settingsPromises = globalSettingKeys.map(key => {
            if (db[key] !== undefined) {
                return dexieDB.globalSettings.put({ key: key, value: db[key] });
            }
            return null;
        }).filter(p => p);
        await Promise.all(settingsPromises);
    });
};

const loadData = async () => {
    const [characters, groups, worldBooks, myStickers, settingsArray] = await Promise.all([
        dexieDB.characters.toArray(),
        dexieDB.groups.toArray(),
        dexieDB.worldBooks.toArray(),
        dexieDB.myStickers.toArray(),
        dexieDB.globalSettings.toArray()
    ]);

    db.characters = characters;
    db.groups = groups;
    db.worldBooks = worldBooks;
    db.myStickers = myStickers;

    // 兼容旧数据：为没有 type 的世界书条目默认设置为 'entry'
    db.worldBooks.forEach(item => {
        if (!item.type) {
            item.type = 'entry';
        }
    });

    const settings = settingsArray.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
    }, {});

    globalSettingKeys.forEach(key => {
        const defaultValue = {
            apiSettings: {},
            wallpaper: 'https://i.postimg.cc/W4Z9R9x4/ins-1.jpg',
            homeScreenMode: 'night',
            fontUrl: '',
            customIcons: {},
            apiPresets: [],
            bubbleCssPresets: [],
            myPersonaPresets: [],
            fontPresets: [],
            globalCss: '',
            globalCssPresets: [],
            homeSignature: 'Sửa chữ ký...',
            insWidgetSettings: { avatar1: 'https://i.postimg.cc/Y96LPskq/o-o-2.jpg', bubble1: 'love u.', avatar2: 'https://i.postimg.cc/GtbTnxhP/o-o-1.jpg', bubble2: 'miss u.' },
            homeWidgetSettings: defaultWidgetSettings,
            activePersonaId: null,
            moreProfileCardBg: 'https://i.postimg.cc/XvFDdTKY/Smart-Select-20251013-023208.jpg',
            globalSendSound: '',
            globalReceiveSound: '',
            multiMsgSoundEnabled: false,
            soundPresets: [],
            galleryPresets: [],
            cotSettings: { enabled: false, activePresetId: 'default', prefillEnabled: true, callPrefillEnabled: true },
            cotPresets: JSON.parse(JSON.stringify(DEFAULT_COT_PRESETS)),
            hasSeenVideoCallDisclaimer: false,
            hasSeenVideoCallAvatarHint: false,
            workshopSettings: {
                provider: '', apiType: 'official', apiUrl: '', apiKey: '', model: '',
                width: 832, height: 1216, cfgScale: 5.0, rateLimit: 45,
                positivePrompt: '', characterPrompt: '', negativePrompt: '', llmIndependentApi: false, llmApiPresetId: '', gptLlmIndependentApi: false, gptLlmApiPresetId: '', boundCharacters: []
            },
            workshopLlmPresets: [],
            workshopPromptPresets: [],
            homeLayoutOrder: ['widget-top', 'widget-ins', 'app-chat', 'app-api', 'app-wallpaper', 'app-worldbook', 'app-customize', 'app-tutorial', 'app-reader', 'widget-heart', 'app-placeholder'],
            homeLayoutPages: null,
            backupReminderSettings: { enabled: true, interval: 3, lastReminderTime: 0 },
            stUnlocked: false
        };
        db[key] = settings[key] !== undefined ? settings[key] : (defaultValue[key] !== undefined ? JSON.parse(JSON.stringify(defaultValue[key])) : undefined);
    });

    // Data integrity checks
    db.characters.forEach(c => {
        if (!c.peekData) c.peekData = {}; 
        if (c.isPinned === undefined) c.isPinned = false;
        if (c.status === undefined) c.status = 'Online';
        if (!c.worldBookIds) c.worldBookIds = [];
        if (c.customBubbleCss === undefined) c.customBubbleCss = '';
        if (c.useCustomBubbleCss === undefined) c.useCustomBubbleCss = false;
        if (c.showTimestamp === undefined) c.showTimestamp = false;
        if (c.timestampPosition === undefined) c.timestampPosition = 'below_avatar';
        if (!c.statusPanel) {
            c.statusPanel = {
                enabled: false,
                promptSuffix: '',
                regexPattern: '',
                replacePattern: '',
                historyLimit: 3,
                currentStatusRaw: '',
                currentStatusHtml: '',
                history: []
            };
        }
        if (!c.autoReply) {
            c.autoReply = {
                enabled: false,
                interval: 60,
                lastTriggerTime: 0
            };
        }
        if (!c.gallery) c.gallery = [];
        if (c.useRealGallery === undefined) c.useRealGallery = false;
        if (!c.callHistory) c.callHistory = [];
    });
    db.groups.forEach(g => {
        if (g.isPinned === undefined) g.isPinned = false;
        if (!g.worldBookIds) g.worldBookIds = [];
        if (g.customBubbleCss === undefined) g.customBubbleCss = '';
        if (g.useCustomBubbleCss === undefined) g.useCustomBubbleCss = false;
        if (g.showTimestamp === undefined) g.showTimestamp = false;
        if (g.timestampPosition === undefined) g.timestampPosition = 'below_avatar';
        if (!g.callHistory) g.callHistory = [];
    });
    
    // Handle old localStorage data if it exists
    const oldLocalStorageData = localStorage.getItem('gemini-chat-app-db');
    if(oldLocalStorageData) {
        console.log("Found old localStorage data, migrating...");
        const data = JSON.parse(oldLocalStorageData);
        await dexieDB.transaction('rw', dexieDB.tables, async () => {
            if (data.characters) await dexieDB.characters.bulkPut(data.characters);
            if (data.groups) await dexieDB.groups.bulkPut(data.groups);
        });
        localStorage.removeItem('gemini-chat-app-db');
        await loadData();
    }
};

// 存储分析工具
const dataStorage = {
    getStorageInfo: async function() {
        const stringify = (obj) => {
            try {
                return JSON.stringify(obj).length;
            } catch (e) {
                console.warn("Could not stringify object for size calculation:", obj, e);
                return 0;
            }
        };

        let categorizedSizes = {
            messages: 0,
            charactersAndGroups: 0,
            worldAndForum: 0,
            personalization: 0,
            apiAndCore: 0,
            other: 0
        };

        if (!db || !db.characters) {
            await loadData();
        }

        // 1. Messages (History)
        (db.characters || []).forEach(char => {
            categorizedSizes.messages += stringify(char.history);
        });
        (db.groups || []).forEach(group => {
            categorizedSizes.messages += stringify(group.history);
        });

        // 2. Characters and Groups (metadata)
        (db.characters || []).forEach(char => {
            const charWithoutHistory = { ...char, history: undefined };
            categorizedSizes.charactersAndGroups += stringify(charWithoutHistory);
        });
        (db.groups || []).forEach(group => {
            const groupWithoutHistory = { ...group, history: undefined };
            categorizedSizes.charactersAndGroups += stringify(groupWithoutHistory);
        });

        // 3. World and Forum
        categorizedSizes.worldAndForum += stringify(db.worldBooks);

        // 4. Personalization
        categorizedSizes.personalization += stringify(db.myStickers);
        categorizedSizes.personalization += stringify(db.wallpaper);
        categorizedSizes.personalization += stringify(db.homeScreenMode);
        categorizedSizes.personalization += stringify(db.fontUrl);
        categorizedSizes.personalization += stringify(db.customIcons);
        categorizedSizes.personalization += stringify(db.bubbleCssPresets);
        categorizedSizes.personalization += stringify(db.myPersonaPresets);
        categorizedSizes.personalization += stringify(db.globalCss);
        categorizedSizes.personalization += stringify(db.globalCssPresets);
        categorizedSizes.personalization += stringify(db.homeSignature);
        categorizedSizes.personalization += stringify(db.insWidgetSettings);
        categorizedSizes.personalization += stringify(db.homeWidgetSettings);
        categorizedSizes.personalization += stringify(db.moreProfileCardBg);
        categorizedSizes.personalization += stringify(db.soundPresets);

        // 5. API and Core
        categorizedSizes.apiAndCore += stringify(db.apiSettings);
        categorizedSizes.apiAndCore += stringify(db.apiPresets);
        categorizedSizes.apiAndCore += stringify(db.cotSettings);
        categorizedSizes.apiAndCore += stringify(db.cotPresets);
        categorizedSizes.apiAndCore += stringify(db.workshopSettings);
        categorizedSizes.apiAndCore += stringify(db.workshopLlmPresets);

        // 6. Workshop Data (from Dexie directly as it might be large)
        try {
            const historyCount = await dexieDB.workshopHistory.count();
            // Rough estimation: assume each history item is ~500KB (base64 image + metadata)
            categorizedSizes.other += historyCount * 500 * 1024; 
            
            const vibeCount = await dexieDB.workshopVibeGroups.count();
            // Rough estimation: assume each vibe group is ~200KB
            categorizedSizes.other += vibeCount * 200 * 1024;
        } catch (e) {
            console.warn("Could not calculate workshop data size:", e);
        }

        const totalSize = Object.values(categorizedSizes).reduce((sum, size) => sum + size, 0);

        return {
            totalSize,
            categorizedSizes
        };
    }
};
