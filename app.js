/**
 * 54 | MAFYA DİZİ OYUNU
 * ANTİ&G Productions
 */

document.addEventListener('DOMContentLoaded', () => {

    // Menü Butonları
    const btnContinue = document.getElementById('btn-continue');
    const btnNewGame = document.getElementById('btn-new-game');
    const btnOptions = document.getElementById('btn-options');
    const btnCredits = document.getElementById('btn-credits');

    // Modallar
    const modalChar = document.getElementById('modal-characters');
    const modalContinue = document.getElementById('modal-continue');
    const modalOptions = document.getElementById('modal-options');
    const modalCredits = document.getElementById('modal-credits');

    // Kapatma Butonları
    document.getElementById('close-char-btn').addEventListener('click', () => closeModal(modalChar));
    document.getElementById('close-continue-btn').addEventListener('click', () => closeModal(modalContinue));
    document.getElementById('close-options-btn').addEventListener('click', () => closeModal(modalOptions));
    document.getElementById('close-credits-btn').addEventListener('click', () => closeModal(modalCredits));

    function openModal(modal) {
        modal.classList.add('active');
    }

    function closeModal(modal) {
        modal.classList.remove('active');
    }

    // Bildirim Toast
    const toast = document.getElementById('toast');
    let toastTimeout;
    function notify(text) {
        toast.textContent = text;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }

    // ================= SES / MÜZİK OTOMATİK BAŞLATMA =================
    const bgAudio = document.getElementById('bg-audio');
    const musicToggle = document.getElementById('music-toggle');
    const brightnessSlider = document.getElementById('brightness-slider');
    const brightnessLayer = document.getElementById('brightness-layer');

    bgAudio.volume = 0.65;

    // --- DERİNDEN GELEN TELSİZ CIZIRTISI VE GÖK GÜRÜLTÜSÜ SİSTEMİ (Web Audio) ---
    let ambientAudioCtx = null;
    let ambientTimer = null;

    function initAmbientSoundEngine() {
        if (!ambientAudioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) ambientAudioCtx = new AudioContext();
        }
        if (ambientAudioCtx && ambientAudioCtx.state === 'suspended') {
            ambientAudioCtx.resume();
        }
    }

    // Derinden gelen gök gürültüsü uğultusu
    function playDistantThunder() {
        if (!musicToggle.checked || !ambientAudioCtx) return;
        try {
            const bufferSize = ambientAudioCtx.sampleRate * 3.5;
            const buffer = ambientAudioCtx.createBuffer(1, bufferSize, ambientAudioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + (0.02 * white)) / 1.02; // Brown noise
                lastOut = data[i];
            }

            const noise = ambientAudioCtx.createBufferSource();
            noise.buffer = buffer;

            const filter = ambientAudioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(60, ambientAudioCtx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(110, ambientAudioCtx.currentTime + 1.2);
            filter.frequency.exponentialRampToValueAtTime(45, ambientAudioCtx.currentTime + 3.4);

            const gain = ambientAudioCtx.createGain();
            const now = ambientAudioCtx.currentTime;
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(0.12, now + 1.0);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 3.4);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ambientAudioCtx.destination);

            noise.start(now);
        } catch (e) {}
    }

    // Polis telsizi cızırtısı / anons hışırtısı
    function playRadioSquelch() {
        if (!musicToggle.checked || !ambientAudioCtx) return;
        try {
            const duration = 0.22;
            const bufferSize = ambientAudioCtx.sampleRate * duration;
            const buffer = ambientAudioCtx.createBuffer(1, bufferSize, ambientAudioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.7;
            }

            const noise = ambientAudioCtx.createBufferSource();
            noise.buffer = buffer;

            const bandpass = ambientAudioCtx.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.setValueAtTime(1850, ambientAudioCtx.currentTime);
            bandpass.Q.setValueAtTime(3.8, ambientAudioCtx.currentTime);

            const gain = ambientAudioCtx.createGain();
            const now = ambientAudioCtx.currentTime;
            gain.gain.setValueAtTime(0.07, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            noise.connect(bandpass);
            bandpass.connect(gain);
            gain.connect(ambientAudioCtx.destination);

            noise.start(now);
        } catch (e) {}
    }

    // Rastgele aralıklarla gök gürültüsü ve telsiz sesleri çal
    function startAmbientAtmosphere() {
        clearInterval(ambientTimer);
        ambientTimer = setInterval(() => {
            if (!musicToggle.checked) return;
            const roll = Math.random();
            if (roll < 0.45) {
                playDistantThunder();
            } else if (roll < 0.85) {
                playRadioSquelch();
            }
        }, 14000); // 14 saniyede bir atmosfer efekti
    }

    // Sayfa açılır açılmaz müziği başlatmayı dene
    function tryAutoplayMusic() {
        if (!musicToggle.checked) return;
        initAmbientSoundEngine();
        startAmbientAtmosphere();

        const playPromise = bgAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                const startOnFirstGesture = () => {
                    initAmbientSoundEngine();
                    startAmbientAtmosphere();
                    if (musicToggle.checked && bgAudio.paused) {
                        bgAudio.play().catch(() => {});
                    }
                    window.removeEventListener('pointerdown', startOnFirstGesture);
                    window.removeEventListener('touchstart', startOnFirstGesture);
                    window.removeEventListener('click', startOnFirstGesture);
                };
                window.addEventListener('pointerdown', startOnFirstGesture, { once: true });
                window.addEventListener('touchstart', startOnFirstGesture, { once: true });
                window.addEventListener('click', startOnFirstGesture, { once: true });
            });
        }
    }

    tryAutoplayMusic();
    window.addEventListener('load', tryAutoplayMusic);

    musicToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            bgAudio.play().catch(() => {});
            notify('Müzik Açık');
        } else {
            bgAudio.pause();
            notify('Müzik Kapalı');
        }
    });

    // Parlaklık Kontrolü
    brightnessSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (val < 100) {
            brightnessLayer.style.background = 'black';
            brightnessLayer.style.opacity = ((100 - val) / 100) * 0.8;
        } else {
            brightnessLayer.style.background = 'white';
            brightnessLayer.style.opacity = ((val - 100) / 100) * 0.35;
        }
    });

    // ================= SAVE / LOAD SİSTEMİ =================
    const SAVE_KEY = '54_save';
    const saveContent = document.getElementById('save-content');
    const saveActionsBox = document.getElementById('save-actions-box');

    function getSave() {
        try {
            return JSON.parse(localStorage.getItem(SAVE_KEY));
        } catch {
            return null;
        }
    }

    function renderSave() {
        const s = getSave();
        if (!s) {
            saveContent.innerHTML = `
                <div style="text-align:center; padding: 15px 0;">
                    <p style="color:#9ca3af; font-size: 0.95rem; line-height: 1.5; margin-bottom: 15px;">
                        Kayıtlı ilerleme bulunamadı.<br>Yeni bir oyun başlatmak için karakterini seç.
                    </p>
                </div>
            `;
            saveActionsBox.innerHTML = `
                <button id="btn-start-from-continue" class="action-btn-red">YENİ OYUN BAŞLAT</button>
            `;
            document.getElementById('btn-start-from-continue').addEventListener('click', () => {
                closeModal(modalContinue);
                openModal(modalChar);
            });
        } else {
            saveContent.innerHTML = `
                <div class="save-info-row">
                    <span class="save-info-label">Karakter:</span>
                    <span class="save-info-value" style="color:#e50914;">${s.char}</span>
                </div>
                <div class="save-info-row">
                    <span class="save-info-label">Bölüm:</span>
                    <span class="save-info-value">1. Sezon 1. Bölüm</span>
                </div>
                <div class="save-info-row">
                    <span class="save-info-label">Son Kayıt:</span>
                    <span class="save-info-value" style="color:#4ade80;">${s.time}</span>
                </div>
            `;
            saveActionsBox.innerHTML = `
                <button id="resume-btn" class="action-btn-red">DEVAM ET</button>
            `;
            document.getElementById('resume-btn').addEventListener('click', () => {
                closeModal(modalContinue);
                notify(`Oyun Yükleniyor: ${s.char}`);
            });
        }
    }

    // ================= BUTON TIKLAMALARI (DEVAM ET SABİT KALIR) =================

    // 1. DEVAM ET
    btnContinue.addEventListener('click', () => {
        renderSave();
        openModal(modalContinue);
    });

    // 2. YENİ OYUN (Karakter Seçimi)
    btnNewGame.addEventListener('click', () => {
        openModal(modalChar);
    });

    document.querySelectorAll('.char-card').forEach(card => {
        const name = card.getAttribute('data-name');
        card.querySelector('.char-pick-btn').addEventListener('click', () => {
            const now = new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
            localStorage.setItem(SAVE_KEY, JSON.stringify({ char: name, time: now }));
            closeModal(modalChar);
            notify(`Seçildi: ${name}`);
        });
    });

    // 3. AYARLAR
    btnOptions.addEventListener('click', () => {
        openModal(modalOptions);
    });

    // 4. BÖLÜMLER
    btnCredits.addEventListener('click', () => {
        openModal(modalCredits);
    });

    // Sayfa Başlangıcı
    renderSave();
});
