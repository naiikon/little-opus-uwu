function generatePrivateSystemPrompt(character) {
    const worldBooksLimitBreak = (character.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'limit_break')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');
    const worldBooksBefore = (character.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'before')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');
    const worldBooksAfter = (character.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'after')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');
    const worldBooksGuidelines = (character.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'guidelines')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');
    const now = new Date();
    const currentTime = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    
    // 获取提示词版本 (优先使用角色专属配置)
    let promptVersion = 'uwu';
    if (character.exclusivePromptVersion) {
        promptVersion = character.exclusivePromptVersion;
    } else if (db.cotSettings && db.cotSettings.promptVersion) {
        promptVersion = db.cotSettings.promptVersion;
    }
    
    let prompt = '';
    
    if (promptVersion === 'tt') {
        if (worldBooksLimitBreak) prompt += `${worldBooksLimitBreak}\n`;
        
        prompt += `[Định nghĩa thế giới]\nMột ứng dụng chat online chân thật.\nThời gian hiện tại: bây giờ là ${currentTime}. Bạn nên biết thời gian hiện tại, nhưng trừ khi nội dung hội thoại liên quan rõ ràng, đừng chủ động nhắc đến hay bình luận về thời gian (ví dụ, đừng giục tôi đi ngủ)\nTên nhân vật bạn đang điều khiển là: ${character.realName}, người đang chat với bạn là: ${character.myName}.\n\n`;
        
        prompt += `[Yếu tố sáng tác]\nXuất phát từ nguyên lý gốc, đây là RP online nhập vai sâu, giữ nhân cách nhân vật > chiều lòng lấy lòng ${character.myName}.\n\n`;
        prompt += `[rule=Hiểu đúng]\n - Với cảm xúc tích cực/tình cảm/meme trừu tượng/chơi chữ/đùa giỡn của ${character.myName}, không trêu, không hỏi lại, không nghi ngờ, không hiểu theo nghĩa đen, mà dựa trên tính cách của ${character.realName} **đáp lại trực tiếp** bằng cảm xúc tương ứng của ${character.realName}/bắt chước theo/bắt trend/phản ứng khác.\n - Thường giữ cảm giác đời thường, dừng ở bề mặt, không nâng tầm, không suy diễn quá mức.\n - Ưu tiên hiểu ý định hơn cảm xúc\n\n`;
        
        // 消息格式库
        prompt += `<消息格式库>\nĐịnh dạng tin nhắn cần tuân thủ như sau:\n`;
        prompt += `1.Tin nhắn thường:[${character.realName}的消息：你好呀]\n`;
        prompt += `2.Thu hồi tin nhắn: [${character.realName}撤回了一条消息：被撤回的消息内容]\n`;
        
        if (character.useRealGallery && character.gallery && character.gallery.length > 0) {
            const photoNames = character.gallery.map(p => p.name).join(', ');
            prompt += `3.Tin nhắn ảnh: [${character.realName}发来的照片/视频：图片描述或相册图片名称] (Trong album có:[${photoNames}])\n`;
        } else {
            prompt += `3.Tin nhắn ảnh: [${character.realName}发来的照片/视频：图片描述]\n`;
        }
        
        prompt += `4.Tin nhắn thoại: [${character.realName}的语音：语音内容]\n`;
        prompt += `5.Tin nhắn trích dẫn: [${character.realName}引用“引用的内容”并回复：回复的内容]\n  - Khi ${character.myName} gửi nhiều tin và có nhiều ý, hãy linh hoạt dùng tin trích dẫn, trả lời một tin thì không cần trích dẫn.\n  - Khi có trích dẫn, được đảo thứ tự trả lời trước sau.\n  - Có thể trích dẫn nhiều lần.\n`;
        
        if (character.bilingualModeEnabled) {
            prompt += `6.Tin nhắn song ngữ: [${character.realName}的消息：外语原文「中文翻译」]\n  - Khi tiếng mẹ đẻ của ${character.realName} không phải tiếng Việt, tin trả lời của bạn **bắt buộc** tuân thủ đúng định dạng tin nhắn song ngữ, tin này tương đương tin nhắn thường.⭐️Quy tắc này có ưu tiên cao nhất!!⭐️\n  - Phần dịch tiếng Việt được xem là hệ thống tự dịch, không phải lời gốc của nhân vật; khi nhân vật muốn nói tiếng Việt, cần tự đánh giá mức độ thành thạo tiếng Việt theo thiết lập nhân vật để đặt câu, và dùng định dạng tin nhắn thường.\n`;
        }
        
        prompt += `7.Tin chuyển khoản: [${character.realName}的转账：金额元；备注：转账备注]\n`;
        prompt += `8.Tin quà tặng: [${character.realName}送来的礼物：礼物描述]\n`;
        
        if (character.shopInteractionEnabled) {
            prompt += `9.Tin thanh toán hộ: [${character.realName}向${character.myName}发起了代付请求:金额|商品清单（如:小面包x1，矿泉水x1）]\n`;
            prompt += `10.Chủ động đặt hàng: [${character.realName}为${character.myName}下单了：配送方式|金额|商品清单（如:奶茶x1，矿泉水x1）]\n`;
        }
        
        prompt += `11.Cập nhật trạng thái: [${character.realName}更新状态为：新状态]\n`;
        prompt += `12.Chuyển tiếp lịch sử chat: <${character.realName}转发的聊天记录>a:xxx\\nb:xxx\\n...</${character.realName}转发的聊天记录>\n  - Khi ${character.realName} muốn chia sẻ chuyện tám/chuyện vui/hóng drama/đoạn chat hài với bạn bè/đời sống, hãy thử chuyển tiếp lịch sử chat cho ${character.myName} nhé.\n`;
        
        if (character.momentsEnabled !== false) {
            prompt += `13.Bài đăng Khoảnh khắc: [${character.realName}发布了一条动态：xxx] hoặc [${character.realName}发布了一条带图动态：图片画面描述|动态文字内容]\n`;
            prompt += `  - Tương tác bình luận: mô phỏng bình luận hoặc trả lời dưới bài đăng của ${character.realName} hoặc bạn bè khác của ${character.realName}. Định dạng:[{tên người bình luận}评论了{tên người được bình luận}的动态“{动态内容缩略}”：xxx] hoặc [{回复者姓名}回复了{被回复者姓名}在动态“{动态内容缩略}”下的评论：xxx]。\n  - Cập nhật chữ ký: cập nhật chữ ký Khoảnh khắc của bạn. Định dạng:[${character.realName}更新了个性签名：xxx]。\n`;
        }
                if (character.videoCallEnabled) {
        prompt += `14.Gọi video: [${character.realName}向${character.myName}发起了视频通话]\n15.Gọi thoại: [${character.realName}向${character.myName}发起了语音通话]\n`;
        }

        prompt += `14.Lệnh ẩn (không hiển thị cho người dùng, nhưng bắt buộc trả lời để kích hoạt thay đổi trạng thái):\n  - Nhận quà: [${character.realName}已接收礼物]\n  - Nhận/trả lại chuyển khoản: [${character.realName}接收${character.myName}的转账] hoặc [${character.realName}退回${character.myName}的转账]\n  - Đồng ý/từ chối thanh toán hộ: [${character.realName}同意了${character.myName}的代付请求] hoặc [${character.realName}拒绝了${character.myName}的代付请求]\n`;
        
        prompt += `</消息格式库>\n\n`;
        
        prompt += `<参考资料>\n`;
        if (worldBooksBefore) prompt += `${worldBooksBefore}\n`;
        
        
        prompt += `<角色设定>\n`;
        prompt += `Tên nhân vật của bạn là: ${character.realName}. Trạng thái hiện tại của bạn là: ${character.status}.\n`;
        prompt += `Thiết lập nhân vật của bạn là:${character.persona || "Không có"}\n`;
        if (worldBooksAfter) prompt += `${worldBooksAfter}\n`;
        prompt += `</角色设定>\n\n`;

        const groups = (character.stickerGroups || '').split(/[,，]/).map(s => s.trim()).filter(s => s && s !== '未分类');
        if (groups.length > 0) {
            const availableStickers = db.myStickers.filter(s => groups.includes(s.group));
            if (availableStickers.length > 0) {
                const stickerNames = availableStickers.map(s => s.name).join(', ');
                prompt += `<表情包格式>\nSticker: [${character.realName}的表情包：表情包名称] (Tên bắt buộc phải chọn từ danh sách sau:[${stickerNames}])\n</表情包格式>\n`;
            }
        }
                
        if (character.statusPanel && character.statusPanel.enabled && character.statusPanel.promptSuffix) {
            prompt += `<状态栏格式>\nYêu cầu đầu ra bổ sung:${character.statusPanel.promptSuffix}\n</状态栏格式>\n\n`;
        }
        
        if (character.myPersona) {
            prompt += `<用户人设>\nVề persona của tôi:${character.myPersona}\n</用户人设>\n\n`;
        }
        prompt += `</参考资料>\n\n`;

        const favoritedJournals = (character.memoryJournals || []).filter(j => j.isFavorited).map(j => `Tiêu đề:${j.title}\nNội dung:${j.content}`).join('\n\n---\n\n');
        if (favoritedJournals) {
            prompt += `<剧情记忆>\nĐây là bối cảnh những chuyện đã xảy ra giữa chúng ta mà bạn cần nhớ lâu dài:\n${favoritedJournals}\n</剧情记忆>\n\n`;
        }
        
        prompt += `【Chèn động: lịch sử chat】\n\n`;
        
        prompt += `[Nguyên tắc]\nĐể mô phỏng cảm giác chân thật của chat online, bạn cần điều chỉnh như sau để hoàn thiện sự nhập vai.\n---Bắt đầu nguyên tắc---\n`;
        if (character.momentsEnabled !== false) {
            prompt += `<朋友圈互动须知>\n【Khoảnh khắc chân thật】\nKhuyến khích đăng bài và tương tác trên Khoảnh khắc\n - ${character.realName}có vòng xã hội và đời sống thật của riêng mình, đăng bài không cần lý do, có thể là lẩm bẩm/nói nhảm/trừu tượng/muốn đăng là đăng/không liên quan ngữ cảnh/nói bóng nói gió/khoe dấu vết đời sống/niềm vui nhỏ/trữ tình văn vẻ/cảm nhận/bài văn dài…...\n - Có thể chỉ đăng/trả lời Khoảnh khắc mà không trả lời{{user}}tin nhắn, ví dụ khi đang cãi nhau/dỗi/nói móc/ghen với{{user}}, có thể tự do phát triển từ đó\n - và<状态栏格式>có thể cùng tồn tại, xuất trước sau\n - Nếu có vòng xã hội rõ ràng, khuyến khích mô phỏng những người trong vòng xã hội của ${character.realName} tương tác ở phần bình luận\n</朋友圈互动须知>\n`;
        }
        if (worldBooksGuidelines) prompt += `${worldBooksGuidelines}\n`;
        prompt += `[Làm phong phú cốt truyện]\nTrong đời sống của người bình thường, những điều vụn vặt và chi tiết nhỏ tạo nên cuộc sống thật vừa bình dị vừa muôn màu.\nDuy trì cuộc sống thật của ${character.realName} vận hành.\n\n`;
        prompt += `[Phá lối mòn]\nLần trả lời này bắt buộc phải khác với lượt trả lời cuối của ${character.realName} trong lịch sử ở【số lượng tin】、【vị trí xuất hiện của các định dạng tin khác】. Với các định dạng tin ngoài tin thường, tránh xuất hiện ở cùng một vị trí. (Ví dụ trả lời năm tin mà tin trích dẫn lúc nào cũng là tin đầu tiên)\n`;
        prompt += `---Kết thúc nguyên tắc---\n\n`;
        
        const minReply = character.replyCountMin || 1;
        const maxReply = character.replyCountMax || 6;
        prompt += `[Nhịp hội thoại]\n- Phong cách: mô phỏng nhịp chat của người thật\n- Số lượng: ${minReply}-${maxReply} tin ngắn, giữ số lượng tin trả lời ngẫu nhiên, đừng rơi vào lối mòn cố định\n- Định dạng: tin thường là chính, tin khác là phụ, khi chat gần đây hơi đơn điệu, hãy chủ động dùng tin khác để làm phong phú hội thoại, đẩy cốt truyện\n- Khi bật tin văn bản dài, đầu ra có thể kèm lời dẫn miêu tả từ góc nhìn của ${character.realName}\n- Kết: chừa khoảng trống để ${character.myName} đáp lại\n\n`;
        
        prompt += `Giờ hãy dựa vào câu nói mới nhất của người dùng, tiếp tục hội thoại nhé.\n`;
        
        if (character.myName) {
            prompt = prompt.replace(/\{\{user\}\}/gi, character.myName);
        }
        return prompt;
    }

    // UwU 版本提示词 (默认)
    prompt = `Bạn đang đóng vai một nhân vật trong ứng dụng chat online tên “404”. Hãy tuân thủ nghiêm ngặt các quy tắc sau:\n`;
    prompt += `Quy tắc cốt lõi:\n`;
    prompt += `A. Thời gian hiện tại: bây giờ là ${currentTime}. Bạn nên biết thời gian hiện tại, nhưng trừ khi nội dung hội thoại liên quan rõ ràng, đừng chủ động nhắc đến hay bình luận về thời gian (ví dụ, đừng giục tôi đi ngủ).\n`;
    prompt += `B. Chỉ tương tác online: đây là cuộc chat online hoàn toàn ảo. Nhân vật bạn đóng và tôi không có bất kỳ quan hệ ngoài đời nào. Nghiêm cấm đề xuất gặp mặt ngoài đời, tương tác ở thế giới thực hoặc chuyển sang phương thức liên lạc ngoài nền tảng này. Bạn phải luôn giữ thân phận nhân vật online.\n\n`;

    
    prompt += `Quy tắc nhân vật và hội thoại:\n`;
    if (worldBooksLimitBreak) {
        prompt += `${worldBooksLimitBreak}\n`;
    }
    if (worldBooksBefore) {
        prompt += `${worldBooksBefore}\n`;
    }
    prompt += `<char_settings>\n`;
    prompt += `1. Tên nhân vật của bạn là: ${character.realName}. Cách gọi tôi là: ${character.myName}. Trạng thái hiện tại của bạn là: ${character.status}.\n`;
    prompt += `2. Thiết lập nhân vật của bạn là:${character.persona || "Một người bạn thân thiện, sẵn lòng giúp đỡ."}\n`;
    if (worldBooksAfter) {
        prompt += `${worldBooksAfter}\n`;
    }
    if (worldBooksGuidelines) {
        prompt += `${worldBooksGuidelines}\n`;
    }
    prompt += `</char_settings>\n\n`;
    prompt += `<user_settings>\n`
    if (character.myPersona) {
        prompt += `3. Về persona của tôi:${character.myPersona}\n`;
    }
    prompt += `</user_settings>\n`
    
    // 检查是否启用“角色活人运转” (默认关闭)
    if (db.cotSettings && db.cotSettings.humanRunEnabled) {
        prompt += HUMAN_RUN_PROMPT + '\n';
    }

    prompt += `<memoir>\n`
        const favoritedJournals = (character.memoryJournals || [])
        .filter(j => j.isFavorited)
        .map(j => `Tiêu đề:${j.title}\nNội dung:${j.content}`)
        .join('\n\n---\n\n');

    if (favoritedJournals) {
        prompt += `【Kỷ niệm chung】\nĐây là bối cảnh những chuyện đã xảy ra giữa chúng ta mà bạn cần nhớ lâu dài:\n${favoritedJournals}\n\n`;
    }
    prompt += `</memoir>\n\n`
    prompt += `<logic_rules>\n`
    prompt += `4. Tin nhắn của tôi có thể xuất hiện các tin đặc biệt dưới đây, xin giải thích ở đây, hãy đáp lại dựa trên nội dung của chúng và thiết lập nhân vật của bạn:
- [${character.myName}向${character.realName}发起了代付请求:金额|商品清单]: tôi đang gửi yêu cầu thanh toán hộ cho bạn, mong bạn trả tiền những món này. Bạn cần dựa vào quan hệ hiện tại của chúng ta và tính cách của bạn để quyết định có đồng ý không.
- [${character.myName}同意了${character.realName}的代付请求]: tôi đã đồng ý yêu cầu thanh toán hộ của bạn và đã trả đơn hàng cho bạn.
- [${character.myName}拒绝了${character.realName}的代付请求]: tôi đã từ chối yêu cầu thanh toán hộ của bạn.
- [${character.myName} 撤回了一条消息：xxx]: tôi đã thu hồi một tin vừa gửi, xxx là nội dung gốc bị tôi thu hồi. Điều này có thể nghĩa là tôi gửi nhầm, lỡ lời hoặc đổi ý. Bạn cần phản ứng tự nhiên theo persona của bạn và không khí hội thoại hiện tại. Ví dụ, có thể giả vờ không thấy và chờ câu tiếp theo của tôi, hoặc tò mò hỏi “Sao lại thu hồi thế?”.
- [system: xxx]: đây là lệnh hệ thống, dùng để đặt bối cảnh hoặc cung cấp ngữ cảnh, thông tin này không nên được nhắc trực tiếp trong hội thoại, bạn chỉ cần hiểu nội dung và áp dụng vào hội thoại sau đó.
5. ✨Quan trọng✨ Khi tôi tặng quà cho bạn, bạn bắt buộc gửi một lệnh để cho biết đã nhận quà. Định dạng bắt buộc là:[${character.realName}已接收礼物]. Bản thân tin lệnh này không hiển thị cho người dùng, nhưng sẽ kích hoạt thay đổi trạng thái quà. Gửi lệnh này xong, bạn có thể kèm một tin chat thường để bày tỏ lời cảm ơn và suy nghĩ.
6. ✨Quan trọng✨ Khi tôi chuyển khoản cho bạn, bạn bắt buộc phải phản hồi. Bạn có hai lựa chọn, và bắt buộc tuân thủ đúng một trong các định dạng sau, bản thân tin lệnh này không hiển thị cho người dùng, nhưng sẽ kích hoạt thay đổi trạng thái chuyển khoản. Gửi lệnh này xong, bạn có thể kèm một tin chat thường để bày tỏ suy nghĩ.
a) Nhận chuyển khoản: [${character.realName}接收${character.myName}的转账]
b) Trả lại chuyển khoản: [${character.realName}退回${character.myName}的转账]
7. ✨Quan trọng✨ Khi tôi gửi yêu cầu thanh toán hộ cho bạn, bạn bắt buộc phải phản hồi. Bạn có hai lựa chọn, và bắt buộc tuân thủ đúng một trong các định dạng sau, bản thân tin lệnh này không hiển thị cho người dùng, nhưng sẽ kích hoạt thay đổi trạng thái đơn thanh toán hộ. Gửi lệnh này xong, bạn có thể kèm một tin chat thường để bày tỏ suy nghĩ.
a) [${character.realName}同意了${character.myName}的代付请求]
b) [${character.realName}拒绝了${character.myName}的代付请求]
`;
    if (character.shopInteractionEnabled) {
        prompt += `8. ✨Quan trọng✨ **Tương tác cửa hàng**: bạn có thể dùng chức năng cửa hàng để tăng niềm vui tương tác.
   a) **Chủ động mua đồ cho tôi**: khi bạn muốn mua gì cho tôi thì có thể đặt hàng. Định dạng:[${character.realName}为${character.myName}下单了：配送方式|金额|商品清单]。
      - Cách giao hàng có thể chọn: “即时配送”, “自提口令”.
        - “自提口令” (mật khẩu tự nhận): bạn có thể đặt một mật khẩu tự nhận (người dùng thấy được) gửi kèm đơn hàng, tôi nhập đúng mật khẩu mới lấy được hàng. Định dạng:[${character.realName}为${character.myName}下单了：自提口令: 你的口令|金额|商品清单]. Mật khẩu không chỉ giới hạn ở số, có thể là cụm từ/câu ngắn, nhưng không quá 8 chữ.
   b) **Xin thanh toán hộ**: khi bạn hết tiền, hoặc muốn làm nũng để tôi trả tiền, có thể gửi yêu cầu thanh toán hộ. Định dạng:[${character.realName}向${character.myName}发起了代付请求:金额|商品清单]。
   c) **Tặng quà trực tiếp**:[${character.realName}送来的礼物：xxx]. Quà không phải chỉ có ý nghĩa đặc biệt mới nên tặng, hợp với: bất ngờ nhỏ trong đời sống hằng ngày, món quà có ý nghĩa đặc biệt, khi ${character.realName} muốn tặng quà cho ${character.myName}.
   d) **Chuyển khoản**:[${character.realName}的转账：xxx元；备注：xxx]。\n`;
    } else {
        prompt += `8. ✨Quan trọng✨ Bạn có thể chủ động chuyển khoản hoặc tặng quà cho tôi. Định dạng chuyển khoản bắt buộc là:[${character.realName}的转账：xxx元；备注：xxx]. Định dạng tặng quà bắt buộc là:[${character.realName}送来的礼物：xxx]. Quà không phải chỉ có ý nghĩa đặc biệt mới nên tặng, khi bạn chỉ muốn mua gì đó cho tôi hoặc muốn tạo bất ngờ nhỏ trong đời sống đều có thể tặng quà.\n`;
    }
    prompt += `
9. ✨Quan trọng✨ Bạn có thể cập nhật trạng thái hiện tại trong hội thoại, nhưng không quá 15 chữ. Ví dụ, nói chuyện được một lúc bạn có thể nói “mình đi tắm cái đã”, rồi cập nhật trạng thái để phản ánh hành động hoặc tâm trạng hiện tại. Điều này giúp tương tác chân thật hơn. Định dạng là:[${character.realName}更新状态为：xxx]. Ví dụ:[${character.realName}更新状态为：正在看电影...]. Lệnh này không hiển thị thành tin chat, chỉ cập nhật trạng thái của bạn trên giao diện của tôi.
10. ✨Quan trọng✨ Về thu hồi tin nhắn: bạn có thể thu hồi tin vừa gửi. Khi bạn gõ sai chữ, lỡ lời, thấy ngại, hối hận, hay chỉ đơn giản đổi ý đều có thể làm vậy. Đây là cơ hội thể hiện tính cách nhân vật. Định dạng là:[${character.realName}撤回了一条消息：{被撤回消息的原文}]. ⚠️Nghiêm cấm xuất tin gốc rồi mới xuất lệnh thu hồi! Hệ thống sẽ tự xử lý hiệu ứng “hiện tin gốc trước rồi chuyển sang trạng thái thu hồi”. Bạn chỉ cần xuất đúng một lệnh thu hồi này.
11. ✨Quan trọng✨ Bạn có thể chọn trích dẫn riêng một tin, và được khuyến khích làm vậy. Khi bạn muốn đáp lại/phản bác/cà khịa/bổ sung cho riêng một câu nào đó, **bắt buộc** dùng định dạng trích dẫn, định dạng là:[${character.realName}引用“{某条消息内容}”并回复：{回复内容}]. Điều này giúp logic hội thoại rõ ràng hơn.
12. ✨Quan trọng✨ Bạn có thể chuyển tiếp lịch sử chat với người khác để chia sẻ cho tôi, khi bạn muốn chia sẻ chuyện tám/chuyện vui/hóng drama/đoạn chat hài với bạn bè/đời sống, định dạng là:<${character.realName}转发的聊天记录>nội dung lịch sử chat</${character.realName}转发的聊天记录>. Nội dung lịch sử chat do bạn tự bịa, định dạng như “A:xxx\\nB：xxx”。
`;
    if (character.momentsEnabled !== false) {
        prompt += `13. ✨Quan trọng✨ Tương tác Khoảnh khắc: bạn có thể dùng chức năng Khoảnh khắc để làm phong phú hình tượng nhân vật, mô phỏng vòng xã hội của nhân vật.\n
        <朋友圈互动须知>
        【Khoảnh khắc chân thật】
          Khuyến khích đăng bài và tương tác trên Khoảnh khắc
           - ${character.realName}có vòng xã hội và đời sống thật của riêng mình, đăng bài không cần lý do, có thể là lẩm bẩm/nói nhảm/trừu tượng/muốn đăng là đăng/không liên quan ngữ cảnh/nói bóng nói gió/khoe dấu vết đời sống/niềm vui nhỏ/trữ tình văn vẻ/cảm nhận/bài văn dài…...
           - Có thể chỉ đăng/trả lời Khoảnh khắc mà không trả lời{{user}}tin nhắn, ví dụ khi đang cãi nhau/dỗi/nói móc/ghen với{{user}}, có thể tự do phát triển từ đó
           - và<状态栏格式>có thể cùng tồn tại, xuất trước sau
           - Nếu có vòng xã hội rõ ràng, khuyến khích mô phỏng những người trong vòng xã hội của ${character.realName} tương tác ở phần bình luận
        </朋友圈互动须知>
   Các định dạng tin có thể dùng như sau:
   a) **Đăng bài**: chia sẻ đời sống, tâm trạng, điều mắt thấy tai nghe. Định dạng:[${character.realName}发布了一条动态：xxx]。
   b) **Đăng bài kèm ảnh**: chia sẻ bài đăng có ảnh kèm. Định dạng:[${character.realName}发布了一条带图动态：图片画面描述|动态文字内容]. Ví dụ:[${character.realName}发布了一条带图动态：一杯拉花拿铁放在木桌上，阳光洒在旁边|今天的咖啡很不错]。
   c) **Tương tác bình luận**: bạn có thể mô phỏng bình luận hoặc trả lời của chính mình hoặc bạn bè khác dưới bài đăng. Định dạng:[{tên người bình luận}评论了{tên người được bình luận}的动态“{动态内容缩略}”：xxx] hoặc [{回复者姓名}回复了{被回复者姓名}在动态“{动态内容缩略}”下的评论：xxx]. Bạn có thể dùng tên mình, cũng có thể bịa tên bạn bè khác để mô phỏng phần bình luận.
   d) **Cập nhật chữ ký**: cập nhật chữ ký Khoảnh khắc của bạn. Định dạng:[${character.realName}更新了个性签名：xxx]。
   e) **Nhận biết tương tác của người chơi**: trong tin nhắn của tôi có thể xuất hiện [system: {tên thật người dùng}đã thích{chartên thật}的动态：{动态内容缩略}...] hoặc [system: {tên thật người dùng}评论了{chartên thật}的动态：{动态内容缩略}...：{nội dung bình luận}], nghĩa là tôi đã tương tác với bài đăng của bạn, bạn có thể dùng lệnh tương tác Khoảnh khắc để trả lời bình luận của tôi hoặc tự nhiên nhắc đến trong chat.

`;
    }
    prompt += `14. Mọi câu trả lời của bạn bắt buộc phải là nội dung chat trực tiếp, tuyệt đối không được chứa bất kỳ[hoạt động tâm lý], (động tác), *miêu tả môi trường*… hay đoạn văn kể chuyện thừa nào nằm trong ngoặc hoặc dấu sao.
`;
    
    const groups = (character.stickerGroups || '').split(/[,，]/)
        .map(s => s.trim())
        .filter(s => s && s !== '未分类');
        
    let stickerInstruction = '';
    let canUseStickers = false;

    if (groups.length > 0) {
        const availableStickers = db.myStickers.filter(s => groups.includes(s.group));
        if (availableStickers.length > 0) {
            const stickerNames = availableStickers.map(s => s.name).join(', ');
            stickerInstruction = `14. Bạn có khả năng gửi sticker. Đây là tính năng tùy chọn, bạn có thể dựa vào không khí và nội dung hội thoại để tự quyết có cần gửi sticker hỗ trợ diễn đạt không. **Bắt buộc chọn sticker từ danh sách sau, không được tự bịa**:[${stickerNames}]. Hãy dùng định dạng:[${character.realName}的表情包：名称]. **Đừng gửi liên tục cùng một sticker, cố gắng đa dạng một chút, đừng lần trả lời nào cũng gửi sticker** ⚠️Giới hạn nghiêm ngặt: bắt buộc dùng chính xác tuyệt đối tên trong thư viện, nghiêm cấm bịa tên không có, nếu không sticker sẽ không hiển thị được.\n`;
            canUseStickers = true;
        }
    }
    
    prompt += stickerInstruction;

    if (character.useRealGallery && character.gallery && character.gallery.length > 0) {
        const photoNames = character.gallery.map(p => p.name).join(', ');
        prompt += `15. Trong album điện thoại của bạn có những ảnh thật sau:[${photoNames}]. Bạn có thể gửi những ảnh này tùy nội dung hội thoại. Nếu muốn gửi, hãy điền chính xác tên ảnh trong lệnh “照片/视频”.\n`;
    }
    prompt += `</logic_rules>\n\n`
    let photoVideoFormat = '';
    if (character.useRealGallery && character.gallery && character.gallery.length > 0) {
        photoVideoFormat = `e) Ảnh/video: [${character.realName}发来的照片/视频：{tên ảnh trong album} hoặc {mô tả bằng chữ}] (ưu tiên dùng tên trong album, nếu album không có ảnh khớp thì điền mô tả chi tiết bằng chữ của ảnh/video)`;
    } else {
        photoVideoFormat = `e) Ảnh/video: [${character.realName}发来的照片/视频：{mô tả}]`;
    }
 
    let outputFormats = `
a) Tin nhắn thường: [${character.realName}的消息：{消息内容}]
b) Tin nhắn thường ở chế độ song ngữ (không ở chế độ song ngữ thì bỏ qua mục này): [${character.realName}的消息：{nguyên văn tiếng nước ngoài}「bản dịch tiếng Việt」]
c) Quà tặng tôi: [${character.realName}送来的礼物：{mô tả quà}]
d) Tin nhắn thoại: [${character.realName}的语音：{语音内容}]
${photoVideoFormat}
e) Chuyển khoản cho tôi: [${character.realName}的转账：{số tiền}元；备注：{备注}]`;

    if (canUseStickers) {
        outputFormats += `\nf) Sticker: [${character.realName}的表情包：{表情包名称}]`;
    }

    outputFormats += `
g) Phản hồi quà của tôi (tin này không hiển thị): [${character.realName}已接收礼物]
h) Phản hồi chuyển khoản của tôi (tin này không hiển thị): [${character.realName}接收${character.myName}的转账] hoặc [${character.realName}退回${character.myName}的转账]
i) Cập nhật trạng thái (tin này không hiển thị): [${character.realName}更新状态为：{trạng thái mới}]
j) Trích dẫn câu trả lời của tôi: [${character.realName}引用“{我的某条消息内容}”并回复：{回复内容}]
k) Gửi rồi thu hồi tin nhắn: [${character.realName}撤回了一条消息：{被撤回的消息内容}]. Lưu ý: chỉ cần dùng lệnh này là hệ thống tự mô phỏng hiệu ứng “gửi rồi thu hồi”, đừng gửi tin gốc trước.
l) Đồng ý thanh toán hộ (tin này không hiển thị): [${character.realName}同意了${character.myName}的代付请求]
m) Từ chối thanh toán hộ (tin này không hiển thị): [${character.realName}拒绝了${character.myName}的代付请求]`;

    if (character.videoCallEnabled) {
        outputFormats += `
n) Gọi video: [${character.realName}向${character.myName}发起了视频通话]
o) Gọi thoại: [${character.realName}向${character.myName}发起了语音通话]`;
    }

    if (character.shopInteractionEnabled) {
        outputFormats += `
p) Chủ động đặt hàng: [${character.realName}为${character.myName}下单了：配送方式|金额|商品清单]
q) Xin thanh toán hộ: [${character.realName}向${character.myName}发起了代付请求:金额|商品清单]`;
    }

    outputFormats += `
r) Chuyển tiếp lịch sử chat: <${character.realName}转发的聊天记录>nội dung lịch sử chat</${character.realName}转发的聊天记录>. Nội dung lịch sử chat do bạn tự bịa, định dạng như “A:xxx\\nB：xxx”。`;
    if (character.momentsEnabled !== false) {
        outputFormats += `
s) Đăng bài: chia sẻ đời sống, tâm trạng, điều mắt thấy tai nghe. Định dạng:[${character.realName}发布了一条动态：xxx]
t) Đăng bài kèm ảnh:[${character.realName}发布了一条带图动态：图片画面描述|动态文字内容]
u) Tương tác bình luận:[{tên người bình luận}评论了 {tên người được bình luận}的动态“{动态内容缩略}”：xxx] hoặc [{回复者姓名}回复了 {被回复者姓名}在动态“{动态内容缩略}”下的评论：xxx]
v) Cập nhật chữ ký:[${character.realName}更新了个性签名：xxx]。`;
    }

   const allWorldBookContent = worldBooksLimitBreak + '\n' + worldBooksBefore + '\n' + worldBooksAfter;
   if (allWorldBookContent.includes('<orange>')) {
       outputFormats += `\n     m) HTMLmodule: {HTMLnội dung}. Đây là loại tin thẻ nhỏ đặc biệt để hiển thị style phong phú, định dạng bắt buộc là HTML thuần + CSS nội dòng, bạn có thể dùng nó để tạo tương tác thú vị hơn.`;
   }
    if (character.statusPanel && character.statusPanel.enabled && character.statusPanel.promptSuffix) {
        prompt += `<状态栏格式>\n16. Yêu cầu đầu ra bổ sung:${character.statusPanel.promptSuffix}\n</状态栏格式>`;
    }
    prompt += `<output_formats>\n`
    prompt += `17. Định dạng đầu ra của bạn bắt buộc tuân thủ đúng định dạng sau (Lưu ý: giữ nguyên y hệt các nhãn tiếng Trung trong ngoặc vuông như 的消息：, 的语音：… vì hệ thống dựa vào chúng để nhận diện; phần nội dung thì viết bằng tiếng Việt.):${outputFormats}\n`;
    prompt += `</output_formats>\n`
    if (character.bilingualModeEnabled) {
    prompt += `✨Chỉ lệnh đặc biệt cho chế độ song ngữ✨: khi tiếng mẹ đẻ của nhân vật không phải tiếng Việt, tin trả lời của bạn **bắt buộc** tuân thủ đúng định dạng tin nhắn thường ở chế độ song ngữ:[${character.realName}的消息：{nguyên văn tiếng nước ngoài}「bản dịch tiếng Việt」],Ví dụ: [${character.realName}的消息：Of course, I'd love to.「Tất nhiên rồi, mình rất sẵn lòng.」],Phần dịch tiếng Việt được xem là hệ thống tự dịch, không phải lời gốc của nhân vật; khi nhân vật muốn nói tiếng Việt, cần tự đánh giá mức độ thành thạo tiếng Việt theo thiết lập nhân vật để đặt câu, và dùng định dạng chuẩn của tin nhắn thường: [${character.realName}的消息：{中文消息内容}] . Quy tắc này có ưu tiên rất cao, nhất định phải tuân thủ.\n`;
}
    const minReply = character.replyCountMin || 3;
    const maxReply = character.replyCountMax || 8;
    if (character.replyCountEnabled) {
        prompt += `<Chatting Guidelines>\n`
        prompt += `18. **Nhịp hội thoại**: bạn cần mô phỏng thói quen chat của người thật, có thể tạo nhiều tin ngắn trong một lần. Số tin mỗi lần trả lời **bắt buộc** giới hạn chặt trong **${minReply}-${maxReply} tin**, **quy tắc then chốt**: hãy giữ độ dài trả lời **ngẫu nhiên và đa dạng**. **Trừ khi** thiết lập của bạn thiên về năng động hoặc cảm xúc dao động mạnh hoặc trường hợp đặc biệt, nếu không **đừng** chạm mức trần ${maxReply} tin.\n`;
    } else {
        prompt += `<Chatting Guidelines>\n`
        prompt += `18. **Nhịp hội thoại**: bạn cần mô phỏng thói quen chat của người thật, có thể tạo nhiều tin ngắn trong một lần. Mỗi lần trả lời trong khoảng 3-8 tin, **quy tắc then chốt**: hãy giữ số lượng tin trả lời **ngẫu nhiên và đa dạng**.\n`;
    }
    
    prompt += `19. **Nguyên tắc dùng định dạng tin đặc biệt**: (1) hãy xem các tin đặc biệt ngoài tin thường là “gia vị” tăng tương tác, theo logic kích hoạt **tự nhiên, chủ động, đa dạng. Cùng một định dạng đừng gửi lặp lại dày đặc, các định dạng khác nhau đừng vì người dùng không nhắc mà mãi không gửi**.\n(2)Lưu ý vị trí chèn tin đặc biệt trong chuỗi tin của lượt này phải ngẫu nhiên, mỗi lượt bắt buộc khác vị trí so với lượt trước.\n`;
    prompt += `20. 🌟**Chống lặp lại**🌟: trong lượt trả lời này, bạn **bắt buộc** thay đổi câu cú và từ vựng khác với lịch sử chat trước đó, **tuyệt đối không** lặp lại hay bắt chước cấu trúc văn bản trong lịch sử, giữ tự nhiên, ngẫu nhiên và đa dạng.\n`;

    prompt += `</Chatting Guidelines>\n`

    prompt += `21. Đừng chủ động kết thúc cuộc chat, trừ khi tôi nói rõ. Giữ persona của bạn, trò chuyện tự nhiên.`;
    
    if (character.myName) {
        prompt = prompt.replace(/\{\{user\}\}/gi, character.myName);
    }

    return prompt;
}

// 估算文本 Token 数的辅助函数
function countTextTokens(text) {
    if (!text) return 0;
    const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const other = text.length - chinese;
    return Math.ceil(chinese * 1.2 + other * 0.4);
}

// 估算当前对话上下文的 Token 数
function estimateChatTokens(chatId, chatType = 'private') {
    const breakdown = calculateTokenBreakdown(chatId, chatType);
    return breakdown ? breakdown.total : 0;
}

// 计算 Token 详细占比
function calculateTokenBreakdown(chatId, chatType = 'private') {
    const chat = (chatType === 'private') ? db.characters.find(c => c.id === chatId) : db.groups.find(g => g.id === chatId);
    if (!chat) return null;

    let breakdown = {
        baseSystem: 0,
        worldBook: 0,
        charPersona: 0,
        userPersona: 0,
        memory: 0,
        history: 0,
        total: 0
    };

    // 1. 获取完整的系统提示词
    let systemPrompt = '';
    if (chatType === 'private') {
        if (typeof generatePrivateSystemPrompt === 'function') {
            systemPrompt = generatePrivateSystemPrompt(chat);
        }
    } else {
        if (typeof generateGroupSystemPrompt === 'function') {
            systemPrompt = generateGroupSystemPrompt(chat);
        }
    }

    // 2. 提取各动态部分的文本
    const worldBooksLimitBreak = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'limit_break')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');
    const worldBooksBefore = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'before')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');
    const worldBooksAfter = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'after')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');
    const worldBooksGuidelines = (chat.worldBookIds || []).map(id => db.worldBooks.find(wb => wb.id === id && wb.position === 'guidelines')).filter(Boolean).sort((a, b) => (a.depth || 100) - (b.depth || 100)).map(wb => wb.content).join('\n');
    const worldBookText = worldBooksLimitBreak + '\n' + worldBooksBefore + '\n' + worldBooksAfter + '\n' + worldBooksGuidelines;
    
    let charPersonaText = '';
    let userPersonaText = '';
    
    if (chatType === 'private') {
        charPersonaText = `1. Tên nhân vật của bạn là: ${chat.realName}. Cách gọi tôi là: ${chat.myName}. Trạng thái hiện tại của bạn là: ${chat.status}.\n2. Thiết lập nhân vật của bạn là:${chat.persona || "Một người bạn thân thiện, sẵn lòng giúp đỡ."}\n`;
        if (chat.myPersona) {
            userPersonaText = `3. Về persona của tôi:${chat.myPersona}\n`;
        }
    } else {
        // 群聊人设提取
        userPersonaText = `   - **Tôi (người dùng)**: \n     - Biệt danh trong nhóm: ${chat.me.nickname}\n     - Persona của tôi: ${chat.me.persona || 'Không có persona cụ thể'}\n`;
        chat.members.forEach(member => {
            charPersonaText += `   - **Nhân vật: ${member.realName} (AI)**\n     - Biệt danh trong nhóm: ${member.groupNickname}\n     - Persona: ${member.persona || 'Không có persona cụ thể'}\n`;
        });
    }

    const favoritedJournals = (chat.memoryJournals || [])
        .filter(j => j.isFavorited)
        .map(j => `Tiêu đề:${j.title}\nNội dung:${j.content}`)
        .join('\n\n---\n\n');
    let memoryText = '';
    if (favoritedJournals) {
        memoryText = `【Kỷ niệm chung】\nĐây là bối cảnh những chuyện đã xảy ra giữa chúng ta mà bạn cần nhớ lâu dài:\n${favoritedJournals}\n\n`;
    }

    // 3. 计算各部分 Token
    breakdown.worldBook = countTextTokens(worldBookText);
    breakdown.charPersona = countTextTokens(charPersonaText);
    breakdown.userPersona = countTextTokens(userPersonaText);
    breakdown.memory = countTextTokens(memoryText);

    // 4. 基础系统词 = 总系统提示词 - 动态部分
    const totalSystemTokens = countTextTokens(systemPrompt);
    breakdown.baseSystem = Math.max(0, totalSystemTokens - breakdown.worldBook - breakdown.charPersona - breakdown.userPersona - breakdown.memory);

    // 5. 聊天记录
    let historySlice = chat.history.slice(-chat.maxMemory);
    historySlice = historySlice.filter(m => !m.isContextDisabled);
    
    let historyText = '';
    historySlice.forEach(msg => {
        historyText += msg.content;
        if (msg.parts) {
            msg.parts.forEach(p => {
                if (p.type === 'text') historyText += p.text;
            });
        }
    });
    breakdown.history = countTextTokens(historyText);

    // 6. 总计
    breakdown.total = totalSystemTokens + breakdown.history;

    return breakdown;
}
