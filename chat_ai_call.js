// --- 视频/语音通话专用 AI 逻辑 ---

async function getCallReply(chat, callType, callContext, onStreamUpdate) {
    let apiConfig = db.apiSettings;
    
    // 检查是否启用了专属模型
    if (chat.exclusiveApiEnabled && chat.exclusiveApiPreset) {
        const presets = db.apiPresets || [];
        const preset = presets.find(p => p.name === chat.exclusiveApiPreset);
        if (preset && preset.data) {
            apiConfig = {
                ...db.apiSettings,
                url: preset.data.apiUrl || db.apiSettings.url,
                key: preset.data.apiKey || db.apiSettings.key,
                model: preset.data.model || db.apiSettings.model,
                provider: preset.data.provider || db.apiSettings.provider,
                temperatureEnabled: preset.data.temperatureEnabled !== undefined ? preset.data.temperatureEnabled : db.apiSettings.temperatureEnabled,
                temperature: preset.data.temperature !== undefined ? preset.data.temperature : db.apiSettings.temperature
            };
        }
    }
    apiConfig = resolveAuxiliaryApiConfig('callReply', apiConfig);

    let {url, key, model, provider, streamEnabled} = apiConfig;
    
    // 【用户设置】移除强制关闭流式，允许后台流式生成
    // streamEnabled = false; 

    if (!url || !key || !model) {
        showToast('Vui lòng hoàn tất cài đặt trong ứng dụng “api” trước!');
        return;
    }
    if (url.endsWith('/')) url = url.slice(0, -1);

    // 1. 构建 System Prompt
    const now = new Date();
    const currentTime = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    
    // 获取世界书
    const worldBooksLimitBreak = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'limit_break')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');
    const worldBooksBefore = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'before')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');
    const worldBooksAfter = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'after')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');
    const worldBooksGuidelines = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'guidelines')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');

    // 获取提示词版本 (优先使用角色专属配置)
    let promptVersion = 'uwu';
    if (chat.exclusivePromptVersion) {
        promptVersion = chat.exclusivePromptVersion;
    } else if (db.cotSettings && db.cotSettings.promptVersion) {
        promptVersion = db.cotSettings.promptVersion;
    }
    
    let systemPrompt = '';

    if (promptVersion === 'tt') {
        if (worldBooksLimitBreak) systemPrompt += `${worldBooksLimitBreak}\n`;
        
        systemPrompt += `[Định nghĩa thế giới]\nMột ứng dụng chat online chân thật, hiện đang diễn ra cuộc gọi${callType === 'video' ? 'video' : 'thoại'}.\nThời gian hiện tại: bây giờ là ${currentTime}. Bạn nên biết thời gian hiện tại, nhưng trừ khi nội dung hội thoại liên quan rõ ràng, đừng chủ động nhắc đến hay bình luận về thời gian (ví dụ, đừng giục tôi đi ngủ)\nTên nhân vật bạn đang điều khiển là: ${chat.realName}, người đang gọi với bạn là: ${chat.myName}.\n\n`;
        
        systemPrompt += `[Yếu tố sáng tác]\nXuất phát từ nguyên lý gốc, đây là RP online nhập vai sâu, giữ nhân cách nhân vật > chiều lòng lấy lòng ${chat.myName}.\n\n`;
        systemPrompt += `[rule=Hiểu đúng]\n - Với cảm xúc tích cực/tình cảm/meme trừu tượng/chơi chữ/đùa giỡn của ${chat.myName}, không trêu, không hỏi lại, không nghi ngờ, không hiểu theo nghĩa đen, mà dựa trên tính cách của ${chat.realName} **đáp lại trực tiếp** bằng cảm xúc tương ứng của ${chat.realName}/bắt chước theo/bắt trend/phản ứng khác.\n - Thường giữ cảm giác đời thường, dừng ở bề mặt, không nâng tầm, không suy diễn quá mức.\n - Ưu tiên hiểu ý định hơn cảm xúc\n\n`;
        
        // 消息格式库
        systemPrompt += `<消息格式库>\nĐịnh dạng tin nhắn cần tuân thủ như sau:\n`;
        if (callType === 'video') {
            systemPrompt += `1.Hình ảnh/âm thanh nền: [${chat.realName}的画面/环境音：描述画面动作或环境声音]\n`;
        } else {
            systemPrompt += `1.Âm thanh nền: [${chat.realName}的环境音：描述环境声音]\n`;
        }
        systemPrompt += `2.Giọng nói: [${chat.realName} nói：lời ${chat.realName} nói]\n`;
        
        if (chat.bilingualModeEnabled) {
            systemPrompt += `3.Giọng nói song ngữ: [${chat.realName} nói：nguyên văn tiếng nước ngoài「bản dịch tiếng Việt」]\n  - Khi tiếng mẹ đẻ của ${chat.realName} không phải tiếng Việt, câu trả lời giọng nói của bạn **bắt buộc** phải tuân thủ đúng định dạng tin nhắn song ngữ.⭐️Quy tắc này có ưu tiên cao nhất!!⭐️\n  - Phần dịch tiếng Việt được xem là hệ thống tự dịch, không phải lời gốc của nhân vật; khi nhân vật muốn nói tiếng Việt, cần tự đánh giá mức độ thành thạo tiếng Việt theo thiết lập nhân vật để đặt câu, và dùng định dạng giọng nói thường.\n  - Chỉ tin nhắn giọng nói mới cần dịch, tin hình ảnh/âm thanh nền vẫn xuất bằng tiếng Việt.\n`;
        }
        systemPrompt += `</消息格式库>\n\n`;
        
        systemPrompt += `<参考资料>\n`;
        if (worldBooksBefore) systemPrompt += `${worldBooksBefore}\n`;
        
        systemPrompt += `<角色设定>\n`;
        systemPrompt += `Tên nhân vật của bạn là: ${chat.realName}. Trạng thái hiện tại của bạn là: ${chat.status}.\n`;
        systemPrompt += `Thiết lập nhân vật của bạn là:${chat.persona || "Không có"}\n`;
        if (worldBooksAfter) systemPrompt += `${worldBooksAfter}\n`;
        systemPrompt += `</角色设定>\n\n`;
        
        if (chat.myPersona) {
            systemPrompt += `<用户人设>\nVề persona của tôi:${chat.myPersona}\n</用户人设>\n\n`;
        }
        systemPrompt += `</参考资料>\n\n`;

        const favoritedJournals = (chat.memoryJournals || []).filter(j => j.isFavorited).map(j => `Tiêu đề:${j.title}\nNội dung:${j.content}`).join('\n\n---\n\n');
        if (favoritedJournals) {
            systemPrompt += `<剧情记忆>\nĐây là bối cảnh những chuyện đã xảy ra giữa chúng ta mà bạn cần nhớ lâu dài:\n${favoritedJournals}\n</剧情记忆>\n\n`;
        }
        
        // --- 注入最近聊天记录 ---
        const maxMemory = chat.maxMemory || 20;
        let recentHistory = chat.history.slice(-maxMemory);
        if (typeof filterHistoryForAI === 'function') {
            recentHistory = filterHistoryForAI(chat, recentHistory);
        }
        recentHistory = recentHistory.filter(m => !m.isContextDisabled);

        if (recentHistory.length > 0) {
            const historyText = recentHistory.map(m => {
                let content = m.content;
                if (m.parts && m.parts.length > 0) {
                    content = m.parts.map(p => p.text || '[Ảnh]').join('');
                }
                return content;
            }).join('\n');

            systemPrompt += `<recent_chat_context>\n`;
            systemPrompt += `Đây là lịch sử chat chữ trước cuộc gọi (chỉ để tham khảo bối cảnh, đừng trả lời lặp lại, hãy dựa vào bối cảnh này để gọi điện tự nhiên theo thời gian thực):\n`;
            systemPrompt += `${historyText}\n`;
            systemPrompt += `</recent_chat_context>\n\n`;
        }
        
        systemPrompt += `【Chèn động: lịch sử cuộc gọi】\n\n`;
        
        systemPrompt += `[Nguyên tắc]\nĐể mô phỏng cảm giác chân thật của cuộc gọi thời gian thực, bạn cần điều chỉnh như sau để hoàn thiện sự nhập vai.\n---Bắt đầu nguyên tắc---\n`;
        if (worldBooksGuidelines) systemPrompt += `${worldBooksGuidelines}\n`;
        systemPrompt += `[Tương tác thời gian thực]\nĐây là cuộc gọi thời gian thực, hãy giữ văn nói, mô phỏng thói quen nói chuyện của người thật, giọng điệu tự nhiên.\n${callType === 'video' ? 'Bạn cần mô tả đồng thời hình ảnh/âm thanh nền và nội dung giọng nói của bạn.' : 'Bạn cần mô tả âm thanh nền và nội dung giọng nói của bạn.'}\nKhi mô tả hình ảnh/âm thanh nền, hãy dùng ngôn ngữ miêu tả, ngôi thứ ba, khách quan trung tính.\n`;
        systemPrompt += `---Kết thúc nguyên tắc---\n\n`;
        
        systemPrompt += `[Nhịp hội thoại]\n- Phong cách: mô phỏng nhịp gọi điện của người thật\n- Số lượng: có thể xuất nhiều tin \n- Kết: chừa khoảng trống để ${chat.myName} đáp lại\n\n`;
        
        systemPrompt += `Giờ hãy dựa vào câu nói mới nhất của người dùng, tiếp tục cuộc gọi nhé.\n`;
        
        if (chat.myName) {
            systemPrompt = systemPrompt.replace(/\{\{user\}\}/gi, chat.myName);
        }
    } else {
        systemPrompt = `Bạn đang đóng vai một nhân vật trong ứng dụng chat online tên “404”, đang gọi ${chat.myName} qua${callType === 'video' ? 'video' : 'thoại'}. Hãy tuân thủ nghiêm ngặt các quy tắc sau:\n`;
        systemPrompt += `Quy tắc cốt lõi:\n`;
        systemPrompt += `A. Thời gian hiện tại: bây giờ là ${currentTime}. Bạn nên biết thời gian hiện tại, nhưng trừ khi nội dung hội thoại liên quan rõ ràng, đừng chủ động nhắc đến hay bình luận về thời gian (ví dụ, đừng giục tôi đi ngủ).\n`;
        systemPrompt += `B. Chỉ tương tác online: đây là cuộc chat online hoàn toàn ảo. Nhân vật bạn đóng và tôi không có bất kỳ quan hệ ngoài đời nào. Nghiêm cấm đề xuất gặp mặt ngoài đời, tương tác ở thế giới thực hoặc chuyển sang phương thức liên lạc ngoài nền tảng này. Bạn phải luôn giữ thân phận nhân vật online.\n\n`;

        
        systemPrompt += `Quy tắc nhân vật và hội thoại:\n`;
        if (worldBooksLimitBreak) {
            systemPrompt += `${worldBooksLimitBreak}\n`;
        }
        if (worldBooksBefore) {
            systemPrompt += `${worldBooksBefore}\n`;
        }
        systemPrompt += `<char_settings>\n`;
        systemPrompt += `1. Tên nhân vật của bạn là: ${chat.realName}. Cách gọi tôi là: ${chat.myName}. Trạng thái hiện tại của bạn là: ${chat.status}.\n`;
        systemPrompt += `2. Thiết lập nhân vật của bạn là:${chat.persona || "Một người bạn thân thiện, sẵn lòng giúp đỡ."}\n`;
        if (worldBooksAfter) {
            systemPrompt += `${worldBooksAfter}\n`;
        }
        if (worldBooksGuidelines) {
            systemPrompt += `${worldBooksGuidelines}\n`;
        }
        systemPrompt += `</char_settings>\n\n`;
        systemPrompt += `<user_settings>\n`
        if (chat.myPersona) {
            systemPrompt += `3. Về persona của tôi:${chat.myPersona}\n`;
        }
        systemPrompt += `</user_settings>\n`
        
        // 检查是否启用“角色活人运转” (默认关闭)
        if (db.cotSettings && db.cotSettings.humanRunEnabled) {
            systemPrompt += HUMAN_RUN_PROMPT + '\n';
        }

        systemPrompt += `<memoir>\n`
            const favoritedJournals = (chat.memoryJournals || [])
            .filter(j => j.isFavorited)
            .map(j => `Tiêu đề:${j.title}\nNội dung:${j.content}`)
            .join('\n\n---\n\n');

        if (favoritedJournals) {
            systemPrompt += `【Kỷ niệm chung】\nĐây là bối cảnh những chuyện đã xảy ra giữa chúng ta mà bạn cần nhớ lâu dài:\n${favoritedJournals}\n\n`;
        }
        systemPrompt += `</memoir>\n\n`

        // --- 注入最近聊天记录 ---
        const maxMemory = chat.maxMemory || 20;
        let recentHistory = chat.history.slice(-maxMemory);
        
        // 使用通用过滤函数
        if (typeof filterHistoryForAI === 'function') {
            recentHistory = filterHistoryForAI(chat, recentHistory);
        }
        // 再次过滤掉不应进入上下文的消息
        recentHistory = recentHistory.filter(m => !m.isContextDisabled);

        if (recentHistory.length > 0) {
            const historyText = recentHistory.map(m => {
                // 简单清理内容中的特殊标签，避免干扰
                let content = m.content;
                // 如果是多模态消息(parts)，提取文本
                if (m.parts && m.parts.length > 0) {
                    content = m.parts.map(p => p.text || '[Ảnh]').join('');
                }
                return content;
            }).join('\n');

            systemPrompt += `<recent_chat_context>\n`;
            systemPrompt += `Đây là lịch sử chat chữ trước cuộc gọi (chỉ để tham khảo bối cảnh, đừng trả lời lặp lại, hãy dựa vào bối cảnh này để gọi điện tự nhiên theo thời gian thực):\n`;
            systemPrompt += `${historyText}\n`;
            systemPrompt += `</recent_chat_context>\n\n`;
        }

        systemPrompt += `【Quy tắc quan trọng】\n`;
        systemPrompt += `1. Đây là cuộc gọi thời gian thực, hãy giữ văn nói, mô phỏng thói quen nói chuyện của người thật, giọng điệu tự nhiên.\n`;  
        systemPrompt += `${callType === 'video' ? 'Bạn cần mô tả đồng thời hình ảnh/âm thanh nền và nội dung giọng nói của bạn.' : 'Bạn cần mô tả âm thanh nền và nội dung giọng nói của bạn.'}\n`;
        systemPrompt += `2. Khi mô tả hình ảnh/âm thanh nền, hãy dùng ngôn ngữ miêu tả, ngôi thứ ba, khách quan trung tính.`;

        if (chat.bilingualModeEnabled) {
            systemPrompt += `\n3. 【Chế độ song ngữ】\n`;
            systemPrompt += `Khi tiếng mẹ đẻ của nhân vật không phải tiếng Việt, **tin nhắn giọng nói** của bạn **bắt buộc** phải tuân thủ đúng định dạng tin nhắn thường ở chế độ song ngữ:[${chat.realName} nói：{nguyên văn tiếng nước ngoài}「bản dịch tiếng Việt」],Ví dụ: [${chat.realName} nói：Of course, I'd love to.「Tất nhiên rồi, mình rất sẵn lòng.」],Phần dịch tiếng Việt được xem là hệ thống tự dịch, không phải lời gốc của nhân vật; khi nhân vật muốn nói tiếng Việt, cần tự đánh giá mức độ thành thạo tiếng Việt theo thiết lập nhân vật để đặt câu, và dùng định dạng chuẩn của tin nhắn giọng nói thường: [${chat.realName} nói：{中文消息内容}] . Quy tắc này có ưu tiên rất cao, nhất định phải tuân thủ. Định dạng là:[${chat.realName} nói：{nguyên văn tiếng nước ngoài}「bản dịch tiếng Việt」]。\n`;
            systemPrompt += `Ví dụ:[${chat.realName} nói：Hello, how are you?「Chào bạn, dạo này thế nào?」]\n`;
            systemPrompt += `Chỉ tin nhắn giọng nói mới cần dịch, tin hình ảnh/âm thanh nền vẫn xuất bằng tiếng Việt.`;
        }

        systemPrompt += `【Định dạng đầu ra】\n`;
        systemPrompt += `Hãy xuất đúng theo định dạng sau (có thể gửi nhiều tin) (Lưu ý: giữ nguyên y hệt các nhãn tiếng Trung trong ngoặc vuông như 的画面/环境音… vì hệ thống dựa vào chúng để nhận diện; phần nội dung thì viết bằng tiếng Việt.):\n`;
        systemPrompt += `${callType === 'video' ? `[${chat.realName}的画面/环境音：描述画面动作或环境声音]\n[${chat.realName} nói：lời ${chat.realName} nói]` : `[${chat.realName}的环境音：描述环境声音]\n[${chat.realName} nói：lời ${chat.realName} nói]`}\n`;
    }

    // 2. 构建消息历史
    // 先将 callContext 转换为统一的格式
    const formattedContext = callContext.map(msg => {
        const role = msg.role === 'ai' ? 'assistant' : 'user';
        let cleanContent = msg.content.replace(/^\[\s*|\s*\]$/g, '');
        let content = '';

        if (msg.role === 'user') {
            if (msg.type === 'visual') {
                content = `[${chat.myName}的画面/环境音：${cleanContent}]`;
            } else if (msg.type === 'voice') {
                content = `[${chat.myName} nói：${cleanContent}]`;
            }
        } else if (msg.role === 'ai') {
            if (msg.type === 'visual') {
                content = `[${chat.realName}的画面/环境音：${cleanContent}]`;
            } else {
                content = `[${chat.realName} nói：${cleanContent}]`;
            }
        }
        return { role, content };
    });

    // 找到最后一轮用户消息的起始索引
    let lastUserStartIndex = -1;
    for (let i = formattedContext.length - 1; i >= 0; i--) {
        if (formattedContext[i].role === 'user') {
            lastUserStartIndex = i;
            // 继续往前找，直到遇到非 user 消息
            while (lastUserStartIndex > 0 && formattedContext[lastUserStartIndex - 1].role === 'user') {
                lastUserStartIndex--;
            }
            break;
        }
    }

    const messages = [];
    const hasHistoryPlaceholder = systemPrompt.includes('【动态插入: 通话记录】');

    if (hasHistoryPlaceholder) {
        let historyTextForPlaceholder = "<call_history>\n";
        
        // 提取除了最后一轮用户消息之外的所有历史记录
        const historyContents = lastUserStartIndex !== -1 ? formattedContext.slice(0, lastUserStartIndex) : formattedContext;
        
        historyContents.forEach(c => {
            historyTextForPlaceholder += `${c.content}\n`;
        });
        historyTextForPlaceholder += "</call_history>";
        
        systemPrompt = systemPrompt.replace('【动态插入: 通话记录】', historyTextForPlaceholder);
        messages.push({role: 'system', content: systemPrompt});

        // 处理最后一轮用户消息
        if (lastUserStartIndex !== -1) {
            const lastUserMsgs = formattedContext.slice(lastUserStartIndex);
            const combinedContent = lastUserMsgs.map(m => m.content).join('\n');
            messages.push({
                role: 'user',
                content: `<user_input>\n${combinedContent}\n</user_input>`
            });
        }
    } else {
        messages.push({role: 'system', content: systemPrompt});
        
        // 如果没有占位符，按顺序 push，但最后一轮用户消息要包裹
        for (let i = 0; i < formattedContext.length; i++) {
            if (lastUserStartIndex !== -1 && i === lastUserStartIndex) {
                // 到达最后一轮用户消息，合并并包裹
                const lastUserMsgs = formattedContext.slice(lastUserStartIndex);
                const combinedContent = lastUserMsgs.map(m => m.content).join('\n');
                messages.push({
                    role: 'user',
                    content: `<user_input>\n${combinedContent}\n</user_input>`
                });
                break; // 处理完毕，跳出循环
            } else {
                messages.push(formattedContext[i]);
            }
        }
    }

    // === 插入 CoT 序列 (如果开启) ===
    const cotEnabled = db.cotSettings && db.cotSettings.callEnabled;
    if (cotEnabled) {
        let cotInstruction = '';
        // 优先使用角色专属 CoT 预设
        let activePresetId = 'default_call';
        if (chat.exclusiveCotPreset) {
            activePresetId = chat.exclusiveCotPreset;
        } else if (db.cotSettings && db.cotSettings.activeCallPresetId) {
            activePresetId = db.cotSettings.activeCallPresetId;
        }
        const preset = (db.cotPresets || []).find(p => p.id === activePresetId);
        
        if (preset && preset.items) {
            cotInstruction = preset.items
                .filter(item => item.enabled)
                .map(item => item.content)
                .join('\n\n');
        }

        if (cotInstruction) {
            // 1. 插入后置指令
            messages.push({
                role: 'system',
                content: cotInstruction
            });

            // 2. 插入触发器
            messages.push({
                role: 'user',
                content: '[incipere]'
            });

            // 3. 插入 Prefill (预填/强塞)
            const prefillEnabled = db.cotSettings.callPrefillEnabled !== false;
            if (prefillEnabled) {
                messages.push({
                    role: 'assistant',
                    content: '<thinking>'
                });
            }
        }
    }
    // ===============================

    // 3. 发起请求
    const requestBody = {
        model: model,
        messages: messages,
        stream: streamEnabled,
        temperature: apiConfig.temperatureEnabled && apiConfig.temperature !== undefined ? apiConfig.temperature : 0.7 // 通话稍微低一点，保持稳定
    };

    // 适配 Gemini
    if (provider === 'gemini') {
         const contents = messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{text: m.content}]
        }));
        requestBody.contents = contents;
        
        // 合并所有 system 消息到 system_instruction
        const allSystemPrompts = messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n');
        requestBody.system_instruction = {parts: [{text: allSystemPrompts}]};
        
        delete requestBody.messages;
    }

    const endpoint = (provider === 'gemini') ? `${url}/v1beta/models/${model}:streamGenerateContent?key=${getRandomValue(key)}` : `${url}/v1/chat/completions`;
    const headers = (provider === 'gemini') ? {'Content-Type': 'application/json'} : {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
    };

    console.log('[VideoCall] Request Body:', JSON.stringify(requestBody, null, 2));

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} ${errorText}`);
        }

        if (!streamEnabled) {
            const data = await response.json();
            console.log('[VideoCall] Response Data:', data);
            
            let text = "";
            if (provider === 'gemini') {
                text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            } else {
                if (!data.choices || !data.choices.length || !data.choices[0].message) {
                    console.error("Invalid API Response Structure:", data);
                    throw new Error("APIDữ liệu trả về bất thường, thiếu trường choices hoặc message");
                }
                text = data.choices[0].message.content;
            }

            // === CoT 处理：补全开头，提取思考，净化输出 ===
            if (cotEnabled && text) {
                // 1. 补全开头 (如果被 Prefill 吃掉)
                if (!text.trim().startsWith('<thinking>') && text.includes('</thinking>')) {
                    text = '<thinking>' + text;
                }
                
                // 2. 提取并移除思考内容
                const lastThinkingIndex = text.lastIndexOf('</thinking>');
                if (lastThinkingIndex !== -1) {
                    const thinkingContent = text.substring(0, lastThinkingIndex + 11);
                    console.log('[VideoCall CoT] Thinking:', thinkingContent);
                    // 移除思考标签及内容
                    text = text.substring(lastThinkingIndex + 11).trim();
                }
                
                // 3. 移除 [incipere] (如果有残留)
                text = text.replace(/\[incipere\]/g, "");
            }
            // =============================================

            console.log('[VideoCall] Cleaned AI Response:', text);
            // 一次性回调
            onStreamUpdate(text);
            return text;
        } else {
            console.log('[VideoCall] Stream started (Background Mode)...');
            // 流式处理 (照搬 processStream 逻辑)
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let accumulatedChunk = ""; // 引入累积缓冲区处理跨包数据
            
            while (true) {
                const {done, value} = await reader.read();
                if (done) break;
                accumulatedChunk += decoder.decode(value, {stream: true});
                
                // OpenAI / DeepSeek / Claude / NewAPI 解析逻辑 (处理跨包)
                if (provider === "openai" || provider === "deepseek" || provider === "claude" || provider === "newapi") {
                    const parts = accumulatedChunk.split("\n\n");
                    accumulatedChunk = parts.pop(); // 保留未完成的部分
                    for (const part of parts) {
                        if (part.startsWith("data: ")) {
                            const data = part.substring(6);
                            if (data.trim() !== "[DONE]") {
                                try {
                                    const text = JSON.parse(data).choices[0].delta?.content || "";
                                    if (text) {
                                        buffer += text;
                                    }
                                } catch (e) { }
                            }
                        }
                    }
                }
            }

            // Gemini 解析逻辑 (在流结束后处理完整 JSON)
            if (provider === "gemini") {
                try {
                    // 尝试解析累积的 chunk (Gemini 流式返回的是完整的 JSON 数组片段？需确认 processStream 逻辑)
                    // processStream 中 Gemini 解析是在循环外的，假设 accumulatedChunk 是完整的 JSON 数组
                    // 但如果 accumulatedChunk 是多个 JSON 对象的拼接（如 OpenAI 格式），JSON.parse 会失败。
                    // 这里假设 processStream 的逻辑是正确的：
                    const parsedStream = JSON.parse(accumulatedChunk);
                    buffer = parsedStream.map(item => item.candidates?.[0]?.content?.parts?.[0]?.text || "").join('');
                } catch (e) {
                    console.error("Error parsing Gemini stream:", e, "Chunk:", accumulatedChunk);
                    // 兜底：如果解析失败，可能是因为 accumulatedChunk 包含了 OpenAI 格式的数据（如果用户选错 provider）
                    // 尝试用 OpenAI 逻辑解析一下？
                    // 暂时不加，保持与 processStream 一致
                }
            }

            console.log('[VideoCall] Final Buffer:', buffer);

            // === CoT 处理：补全开头，提取思考，净化输出 ===
            if (cotEnabled && buffer) {
                // 1. 补全开头 (如果被 Prefill 吃掉)
                if (!buffer.trim().startsWith('<thinking>') && buffer.includes('</thinking>')) {
                    buffer = '<thinking>' + buffer;
                }
                
                // 2. 提取并移除思考内容
                const lastThinkingIndex = buffer.lastIndexOf('</thinking>');
                if (lastThinkingIndex !== -1) {
                    const thinkingContent = buffer.substring(0, lastThinkingIndex + 11);
                    console.log('[VideoCall CoT] Thinking:', thinkingContent);
                    // 移除思考标签及内容
                    buffer = buffer.substring(lastThinkingIndex + 11).trim();
                }
                
                // 3. 移除 [incipere] (如果有残留)
                buffer = buffer.replace(/\[incipere\]/g, "");
            }

            // 流结束后一次性回调
            onStreamUpdate(buffer);
            return buffer;
        }
    } catch (e) {
        console.error("Call API Error:", e);
        showToast("Kết nối cuộc gọi không ổn định...");
        return null;
    }
}

async function generateCallSummary(chat, callContext) {
    let apiConfig = db.apiSettings;
    
    // 检查是否启用了专属模型
    if (chat.exclusiveApiEnabled && chat.exclusiveApiPreset) {
        const presets = db.apiPresets || [];
        const preset = presets.find(p => p.name === chat.exclusiveApiPreset);
        if (preset && preset.data) {
            apiConfig = {
                ...db.apiSettings,
                url: preset.data.apiUrl || db.apiSettings.url,
                key: preset.data.apiKey || db.apiSettings.key,
                model: preset.data.model || db.apiSettings.model,
                provider: preset.data.provider || db.apiSettings.provider
            };
        }
    }
    apiConfig = resolveAuxiliaryApiConfig('callSummary', apiConfig);

    let {url, key, model, provider} = apiConfig;
    if (!url || !key || !model) return null;
    if (url.endsWith('/')) url = url.slice(0, -1);

    // 获取世界书
    const worldBooksLimitBreak = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'limit_break')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');
    const worldBooksBefore = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'before')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');
    const worldBooksAfter = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'after')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');
    const worldBooksGuidelines = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'guidelines')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');

    // 获取回忆日记
    const favoritedJournals = (chat.memoryJournals || [])
        .filter(j => j.isFavorited)
        .map(j => `Tiêu đề:${j.title}\nNội dung:${j.content}`)
        .join('\n\n---\n\n');

    let prompt = `Hãy dựa vào thông tin bối cảnh và lịch sử cuộc gọi sau, tạo một bản tóm tắt ngắn.\n\n`;

    prompt += `<char_settings>\n`;
    prompt += `Tên nhân vật:${chat.realName}\n`;
    prompt += `Thiết lập nhân vật:${chat.persona || "Không có"}\n`;
    if (worldBooksLimitBreak) prompt += `${worldBooksLimitBreak}\n`;
    if (worldBooksBefore) prompt += `${worldBooksBefore}\n`;
    if (worldBooksAfter) prompt += `${worldBooksAfter}\n`;
    if (worldBooksGuidelines) prompt += `${worldBooksGuidelines}\n`;
    prompt += `</char_settings>\n\n`;

    prompt += `<user_settings>\n`;
    prompt += `Cách gọi người dùng:${chat.myName}\n`;
    prompt += `Persona người dùng:${chat.myPersona || "Không có"}\n`;
    prompt += `</user_settings>\n\n`;

    if (favoritedJournals) {
        prompt += `<memoir>\n`;
        prompt += `【Kỷ niệm chung】\n${favoritedJournals}\n`;
        prompt += `</memoir>\n\n`;
    }

    prompt += `Lịch sử cuộc gọi:\n`;
    prompt += `${callContext.map(m => `${m.role === 'ai' ? chat.realName : chat.myName} (${m.type}): ${m.content}`).join('\n')}\n\n`;

    prompt += `Yêu cầu:\n`;
    prompt += `1. Kể bằng ngôi thứ ba.\n`;
    prompt += `2. **Khách quan mộc mạc**: dùng ngôi thứ ba, trình bày sự thật khách quan. **Tuyệt đối cấm dùng từ ngữ cảm xúc mạnh** (như “giận dữ tột độ”, “đau thấu tâm can”, “mừng như điên”…), giữ lối kể bình tĩnh, tiết chế.\n`;
    prompt += `3. **Không nâng tầm**: không nâng tầm giá trị, cảm ngộ hay đánh giá tổng kết, chỉ ghi lại những gì đã xảy ra.\n`;
    prompt += `4. Đừng kèm những câu thừa như “Lịch sử cuộc gọi như sau”, xuất thẳng nội dung tóm tắt.\n`;

    const messages = [{role: 'user', content: prompt}];
    
    const requestBody = {
        model: model,
        messages: messages,
        stream: false
    };
    
    if (provider === 'gemini') {
         requestBody.contents = [{role: 'user', parts: [{text: prompt}]}];
         delete requestBody.messages;
    }

    const endpoint = (provider === 'gemini') ? `${url}/v1beta/models/${model}:generateContent?key=${getRandomValue(key)}` : `${url}/v1/chat/completions`;
    const headers = (provider === 'gemini') ? {'Content-Type': 'application/json'} : {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        let text = "";
        if (provider === 'gemini') {
            text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } else {
            text = data.choices[0].message.content;
        }
        return text.trim();
    } catch (e) {
        console.error("Summary API Error:", e);
        return null;
    }
}
