// --- 跨平台持续运行增强 ---
// 浏览器仍可能被系统挂起；本模块负责提高存活率，并在恢复后补跑全局任务。
(function () {
    const HEARTBEAT_INTERVAL_MS = 15000;
    const RESUME_GAP_MS = 20000;
    const CHECKPOINT_KEY = 'uwu_keep_alive_checkpoint';

    let enabled = false;
    let audio = null;
    let audioUrl = '';
    let wakeLock = null;
    let heartbeatTimer = null;
    let lastHeartbeatAt = Date.now();
    let hiddenAt = 0;
    let gestureHandler = null;
    let listenersBound = false;
    let recoveryRunning = false;

    function getStatusElement() {
        return document.getElementById('keep-alive-status');
    }

    function setStatus(text, state) {
        const element = getStatusElement();
        if (!element) return;
        element.textContent = text;
        element.dataset.state = state || '';
    }

    // 生成低频、极低振幅的长音频。volume=0 的静音音频不会获得 Chrome 后台调度豁免。
    function createLowImpactWavUrl() {
        const sampleRate = 8000;
        const durationSeconds = 8;
        const sampleCount = sampleRate * durationSeconds;
        const buffer = new ArrayBuffer(44 + sampleCount * 2);
        const view = new DataView(buffer);

        function writeString(offset, value) {
            for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
        }

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + sampleCount * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, sampleCount * 2, true);

        for (let i = 0; i < sampleCount; i++) {
            // 55Hz 通常低于手机扬声器的有效频段，但数据并非全静音。
            const fade = Math.min(1, i / 160, (sampleCount - i) / 160);
            const sample = Math.round(Math.sin(2 * Math.PI * 55 * i / sampleRate) * 96 * fade);
            view.setInt16(44 + i * 2, sample, true);
        }

        return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
    }

    function ensureAudio() {
        if (audio) return audio;
        audioUrl = createLowImpactWavUrl();
        audio = new Audio(audioUrl);
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = 1;
        audio.setAttribute('playsinline', '');
        audio.setAttribute('webkit-playsinline', '');
        audio.addEventListener('playing', updateRunningStatus);
        audio.addEventListener('pause', () => {
            if (enabled) setStatus('Kênh media đã tạm dừng, đang chờ khôi phục', 'paused');
        });
        audio.addEventListener('stalled', () => setStatus('Kênh media bị hạn chế, đang chờ khôi phục', 'paused'));
        audio.addEventListener('error', () => setStatus('Kênh media không khả dụng', 'error'));
        return audio;
    }

    function updateMediaSession(active) {
        if (!('mediaSession' in navigator)) return;
        try {
            navigator.mediaSession.playbackState = active ? 'playing' : 'none';
            if (active && 'MediaMetadata' in window) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: 'UwU Tăng cường chạy liên tục',
                    artist: 'Giữ cho tác vụ trang web luôn hoạt động'
                });
            } else if (!active) {
                navigator.mediaSession.metadata = null;
            }
        } catch (error) {
            console.debug('[KeepAlive] Media Session Không khả dụng:', error);
        }
    }

    function removeGestureFallback() {
        if (!gestureHandler) return;
        document.removeEventListener('pointerdown', gestureHandler, true);
        document.removeEventListener('touchstart', gestureHandler, true);
        gestureHandler = null;
    }

    function installGestureFallback() {
        if (gestureHandler) return;
        gestureHandler = () => {
            removeGestureFallback();
            startAudio(true);
        };
        document.addEventListener('pointerdown', gestureHandler, { capture: true, once: true });
        document.addEventListener('touchstart', gestureHandler, { capture: true, once: true });
    }

    async function startAudio(fromUserGesture) {
        if (!enabled) return false;
        try {
            await ensureAudio().play();
            removeGestureFallback();
            updateMediaSession(true);
            updateRunningStatus();
            return true;
        } catch (error) {
            console.warn('[KeepAlive] Khởi động kênh media thất bại:', error);
            setStatus(fromUserGesture ? 'Trình duyệt từ chối kênh media' : 'Chạm vào trang để cấp quyền kênh media', 'waiting');
            installGestureFallback();
            return false;
        }
    }

    async function requestWakeLock() {
        if (!enabled || document.visibilityState !== 'visible' || !('wakeLock' in navigator)) return false;
        if (wakeLock && !wakeLock.released) return true;
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', () => {
                wakeLock = null;
                if (enabled && document.visibilityState === 'visible') {
                    setStatus('Hệ thống đã tắt giữ sáng màn hình, kênh media vẫn chạy', 'partial');
                }
            }, { once: true });
            updateRunningStatus();
            return true;
        } catch (error) {
            console.debug('[KeepAlive] Không giữ sáng màn hình được:', error);
            updateRunningStatus();
            return false;
        }
    }

    function updateRunningStatus() {
        if (!enabled) {
            setStatus('Chưa bật', 'off');
            return;
        }
        if (!audio || audio.paused) return;
        if (document.visibilityState === 'hidden') {
            setStatus('Đang chạy tăng cường hoạt động nền', 'running');
        } else if (wakeLock && !wakeLock.released) {
            setStatus('Đang chạy: đã bật giữ sáng màn hình và kênh media', 'running');
        } else {
            setStatus('Đang chạy: đã bật kênh media', 'partial');
        }
    }

    function writeCheckpoint(reason) {
        const checkpoint = { timestamp: Date.now(), reason: reason || 'heartbeat' };
        try {
            localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(checkpoint));
        } catch (error) {
            console.debug('[KeepAlive] Không lưu được checkpoint vòng đời:', error);
        }
    }

    function startHeartbeat() {
        if (heartbeatTimer) return;
        lastHeartbeatAt = Date.now();
        heartbeatTimer = setInterval(() => {
            lastHeartbeatAt = Date.now();
        }, HEARTBEAT_INTERVAL_MS);
    }

    function stopHeartbeat() {
        if (!heartbeatTimer) return;
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }

    async function runRecovery(reason) {
        if (!enabled || recoveryRunning) return;
        recoveryRunning = true;
        const now = Date.now();
        const inactiveSince = hiddenAt || lastHeartbeatAt;
        const elapsedMs = Math.max(0, now - inactiveSince);

        try {
            await startAudio(false);
            await requestWakeLock();
            lastHeartbeatAt = now;
            hiddenAt = 0;

            if (elapsedMs >= RESUME_GAP_MS) {
                if (typeof updateClock === 'function') updateClock();
                if (typeof checkAutoReply === 'function') await checkAutoReply();
                if (typeof checkBackupReminder === 'function') await checkBackupReminder();
                window.dispatchEvent(new CustomEvent('uwu:app-resume', {
                    detail: { reason, elapsedMs, resumedAt: now }
                }));
                console.log(`[KeepAlive] Trang đã khôi phục, đã chạy bù tác vụ; treo khoảng ${Math.round(elapsedMs / 1000)} giây`);
            }
            updateRunningStatus();
        } finally {
            recoveryRunning = false;
        }
    }

    function handleVisibilityChange() {
        if (!enabled) return;
        if (document.visibilityState === 'hidden') {
            hiddenAt = Date.now();
            writeCheckpoint('hidden');
            updateRunningStatus();
        } else {
            runRecovery('visibilitychange');
        }
    }

    function bindLifecycleListeners() {
        if (listenersBound) return;
        listenersBound = true;
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('freeze', () => {
            if (!enabled) return;
            hiddenAt = hiddenAt || Date.now();
            writeCheckpoint('freeze');
        });
        document.addEventListener('resume', () => runRecovery('resume'));
        window.addEventListener('pagehide', () => {
            if (!enabled) return;
            hiddenAt = hiddenAt || Date.now();
            writeCheckpoint('pagehide');
        });
        window.addEventListener('pageshow', event => {
            if (enabled && event.persisted) runRecovery('pageshow');
        });
        window.addEventListener('online', () => {
            if (enabled) runRecovery('online');
        });
    }

    async function enable(options) {
        enabled = true;
        bindLifecycleListeners();
        startHeartbeat();
        setStatus('Đang khởi động tăng cường chạy liên tục…', 'starting');
        const audioStarted = await startAudio(Boolean(options && options.userInitiated));
        await requestWakeLock();
        updateRunningStatus();
        return audioStarted;
    }

    async function disable() {
        enabled = false;
        removeGestureFallback();
        stopHeartbeat();
        hiddenAt = 0;

        if (wakeLock && !wakeLock.released) {
            try { await wakeLock.release(); } catch (error) {}
        }
        wakeLock = null;

        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            audio.removeAttribute('src');
            audio.load();
            audio = null;
        }
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            audioUrl = '';
        }
        updateMediaSession(false);
        setStatus('Chưa bật', 'off');
        return true;
    }

    async function setEnabled(value, options) {
        return value ? enable(options) : disable();
    }

    window.KeepAliveManager = {
        init(value) {
            bindLifecycleListeners();
            return setEnabled(Boolean(value), { userInitiated: false });
        },
        setEnabled,
        recover: runRecovery,
        isEnabled() { return enabled; }
    };

    // 兼容旧调用入口。
    window.toggleKeepAlive = value => window.KeepAliveManager.setEnabled(Boolean(value), { userInitiated: true });
})();
