<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Scanbell · Luminous Visitor Portal</title>

    <!-- Agora SDKs -->
    <script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.19.0.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/agora-rtm-sdk@1.5.1/index.js"></script>

    <!-- Modern Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,600;14..32,700;14..32,800&display=swap"
        rel="stylesheet">

    <style>
        /* ----- Design System: Glass + Neumorphism Fusion ----- */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: radial-gradient(circle at 10% 20%, #1a1f3c, #0c0f20 80%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            color: rgba(255, 255, 255, 0.95);
            overflow: hidden;
            position: relative;
        }

        /* Floating Orbs for Futuristic Vibe */
        .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(100px);
            z-index: 0;
            opacity: 0.5;
        }

        .orb-1 {
            width: 400px;
            height: 400px;
            background: #007AFF;
            top: -100px;
            right: -100px;
            animation: float 10s infinite;
        }

        .orb-2 {
            width: 300px;
            height: 300px;
            background: #5856D6;
            bottom: -50px;
            left: -50px;
            animation: float 12s infinite reverse;
        }

        @keyframes float {
            0% {
                transform: translate(0, 0);
            }

            50% {
                transform: translate(20px, 40px);
            }

            100% {
                transform: translate(0, 0);
            }
        }

        /* Header */
        .header {
            padding: 1.2rem 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(8, 12, 25, 0.6);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 10;
        }

        .logo-group {
            display: flex;
            align-items: center;
            gap: 0.8rem;
        }

        .logo-icon {
            font-size: 1.8rem;
        }

        .logo-text {
            font-size: 1.5rem;
            font-weight: 800;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, #fff, #bbe1fa);
            -webkit-background-clip: text;
            color: transparent;
        }

        .house-badge {
            background: rgba(255, 255, 255, 0.1);
            padding: 0.5rem 1.2rem;
            border-radius: 30px;
            font-size: 0.9rem;
            font-weight: 700;
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #007AFF;
        }

        /* Container */
        .container {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            z-index: 5;
        }

        /* Glass Panel */
        .glass-panel {
            background: rgba(25, 30, 50, 0.4);
            backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 2.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            max-width: 480px;
            width: 100%;
            padding: 3rem 2rem;
            text-align: center;
        }

        .camera-preview-container {
            width: 140px;
            height: 140px;
            border-radius: 70px;
            margin: 0 auto 1.5rem;
            position: relative;
            background: #000;
            overflow: hidden;
            border: 3px solid #007AFF;
            box-shadow: 0 0 20px rgba(0, 122, 255, 0.3);
        }

        #preview-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transform: scaleX(-1);
        }

        h1 {
            font-size: 2.2rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            color: #fff;
        }

        .sub-message {
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 2rem;
            line-height: 1.5;
        }

        /* Hybrid Button */
        .ring-btn {
            background: linear-gradient(135deg, #007AFF, #0055BB);
            color: white;
            border: none;
            padding: 1.2rem 2.5rem;
            border-radius: 1.5rem;
            font-size: 1.2rem;
            font-weight: 800;
            width: 100%;
            cursor: pointer;
            transition: 0.3s;
            box-shadow: 0 10px 20px rgba(0, 122, 255, 0.3), inset 0 2px 10px rgba(255, 255, 255, 0.2);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .ring-btn:disabled {
            background: #334155;
            opacity: 0.6;
            cursor: not-allowed;
            box-shadow: none;
        }

        .ring-btn:active {
            transform: scale(0.97);
        }

        /* Video Layout */
        .video-container {
            display: none;
            position: absolute;
            inset: 0;
            background: #000;
            z-index: 20;
        }

        #remote-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        #local-video-small {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 110px;
            aspect-ratio: 9/16;
            border-radius: 1.2rem;
            overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
            background: #1a1f30;
        }

        .call-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(15px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 25;
            color: white;
        }

        .status-pill {
            background: rgba(0, 122, 255, 0.2);
            padding: 0.8rem 1.8rem;
            border-radius: 50px;
            font-size: 1.2rem;
            font-weight: 700;
            border: 1px solid #007AFF;
            margin-bottom: 1.5rem;
            color: #fff;
        }

        .loader {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(0, 122, 255, 0.2);
            border-top: 4px solid #007AFF;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        .controls {
            position: absolute;
            bottom: 40px;
            width: 100%;
            display: flex;
            justify-content: center;
            gap: 2rem;
            z-index: 30;
        }

        .icon-btn {
            width: 70px;
            height: 70px;
            border-radius: 35px;
            border: none;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            color: white;
            font-size: 1.8rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.2s;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-end {
            background: rgba(255, 59, 48, 0.8);
        }

        .btn-mute.muted {
            background: #FF3B30;
        }

        canvas#snapshot-canvas {
            display: none;
        }

        .status-footer {
            margin-top: 2rem;
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.3);
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .hidden {
            display: none !important;
        }
    </style>
</head>

<body>
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>

    <header class="header">
        <div class="logo-group">
            <span class="logo-icon">🔔</span>
            <span class="logo-text">SCANBELL</span>
        </div>
        <div class="house-badge">House <span id="houseNum">--</span></div>
    </header>

    <main class="container">
        <!-- Pre-call UI -->
        <div class="glass-panel" id="preCall">
            <div class="camera-preview-container">
                <video id="preview-video" autoplay playsinline muted></video>
            </div>
            <h1>Visitor Access</h1>
            <p class="sub-message">Look at the camera and ring the doorbell.<br>The resident will see you instantly.</p>

            <button class="ring-btn" id="ringBtn" disabled>Connecting...</button>
            <div class="status-footer" id="statusLabel">Initializing RTM...</div>
        </div>

        <!-- In-call UI -->
        <div class="video-container" id="videoLayout">
            <div id="remote-video"></div>
            <div id="local-video-small"></div>

            <div class="call-overlay" id="statusOverlay">
                <div class="status-pill" id="callStatusText">Ringing...</div>
                <div class="loader"></div>
            </div>

            <div class="controls">
                <button class="icon-btn btn-mute" id="muteBtn" onclick="toggleMute()">🎤</button>
                <button class="icon-btn btn-end" onclick="endSession()">📞</button>
            </div>
            <div id="debug-console"
                style="margin-top: 10px; font-family: monospace; font-size: 10px; color: #4CAF50; text-align: left; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; max-height: 80px; overflow-y: auto;">
            </div>
        </div>
    </main>

    <canvas id="snapshot-canvas" width="128" height="128"></canvas>

    <script>
        const debugConsole = document.getElementById('debug-console');
        function log(msg) {
            console.log(msg);
            const div = document.createElement('div');
            div.innerText = `> ${msg}`;
            debugConsole.appendChild(div);
            debugConsole.scrollTop = debugConsole.scrollHeight;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const appId = urlParams.get('appid') || '469ff9909237486f8e9bf8526e09899c';

        let houseNo = urlParams.get('houseNo');
        if (!houseNo) {
            const channel = urlParams.get('channelName') || 'house_32_channel';
            houseNo = channel.split('_')[1] || '32';
        }

        const channelName = `house_${houseNo}_channel`;
        const targetId = `house_${houseNo}`;

        // Use a persistent session ID for RTM, but we will send a unique 
        // Caller Identity in the payload if needed. 
        // For now, let's just make the RTM login unique per refresh:
        const visitorId = "Visitor_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

        document.getElementById('houseNum').innerText = houseNo;

        let rtmClient = null;
        let rtcClient = null;
        let localTracks = { video: null, audio: null };
        let signalTimer = null;
        let isMuted = false;
        let hasAnswered = false;

        async function init() {
            try {
                // 1. Camera Preview
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                document.getElementById('preview-video').srcObject = stream;

                // 2. Signaling
                rtmClient = AgoraRTM.createInstance(appId);
                await rtmClient.login({ uid: visitorId });

                updateStatus('🟢 System Ready');
                const ringBtn = document.getElementById('ringBtn');
                ringBtn.disabled = false;
                ringBtn.innerText = 'Ring Doorbell';

                rtmClient.on('MessageFromPeer', (message) => {
                    console.log("[RTM] From Phone:", message.text);
                    if (message.text === 'CALL_ACCEPTED') {
                        hasAnswered = true;
                        clearInterval(signalTimer);
                        document.getElementById('statusOverlay').classList.add('hidden');
                    }
                    if (message.text === 'CALL_REJECTED') {
                        location.reload();
                        alert("The resident is currently unavailable.");
                    }
                    if (message.text === 'CALL_ENDED') {
                        console.log("[RTM] Host ended the call");
                        endSession();
                    }
                });
            } catch (e) {
                console.error(e);
                updateStatus('❌ Camera Access Required');
            }
        }

        function takeSnapshot() {
            const canvas = document.getElementById('snapshot-canvas');
            const video = document.getElementById('preview-video');
            const ctx = canvas.getContext('2d');
            if (video.videoWidth > 0) {
                ctx.drawImage(video, 0, 0, 128, 128);
                return canvas.toDataURL('image/jpeg', 0.5);
            }
            return null;
        }

        async function ringBell() {
            const snapshot = takeSnapshot();

            // UI Switch
            document.getElementById('preCall').classList.add('hidden');
            document.getElementById('videoLayout').style.display = 'block';

            // Start Signaling Loop
            const payload = JSON.stringify({ event: 'CALL_REQUEST', image: snapshot });
            const sendSignal = () => {
                if (hasAnswered) return;
                rtmClient.sendMessageToPeer({ text: payload }, targetId)
                    .then(() => console.log("[RTM] Signal Sent"))
                    .catch(e => console.error(e));
            };

            sendSignal();
            signalTimer = setInterval(sendSignal, 4000);

            // Init RTC
            try {
                rtcClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
                rtcClient.on('user-published', async (user, mediaType) => {
                    await rtcClient.subscribe(user, mediaType);
                    if (mediaType === 'video') user.videoTrack.play('remote-video');
                    if (mediaType === 'audio') user.audioTrack.play();
                });

                [localTracks.audio, localTracks.video] = await AgoraRTC.createMicrophoneAndCameraTracks();
                localTracks.video.play('local-video-small');

                await rtcClient.join(appId, channelName, null, null);
                await rtcClient.publish([localTracks.audio, localTracks.video]);
            } catch (e) {
                console.error("RTC Error", e);
            }
        }

        function toggleMute() {
            isMuted = !isMuted;
            localTracks.audio.setEnabled(!isMuted);
            const btn = document.getElementById('muteBtn');
            btn.innerText = isMuted ? '🔇' : '🎤';
            btn.classList.toggle('muted', isMuted);
        }

        async function endSession() {
            clearInterval(signalTimer);
            if (localTracks.video) localTracks.video.close();
            if (localTracks.audio) localTracks.audio.close();
            if (rtcClient) await rtcClient.leave();
            location.reload();
        }

        function updateStatus(txt) { document.getElementById('statusLabel').innerText = txt; }
        document.getElementById('ringBtn').onclick = ringBell;

        init();
    </script>
</body>

</html>
