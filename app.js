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
    const audioCurtain = document.getElementById('audio-start-curtain');

    bgAudio.volume = 0.75;

    // --- DERİNDEN GELEN POLİS TELSİZİ, SİREN VE GÖK GÜRÜLTÜSÜ SİSTEMİ (Web Audio) ---
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

    // Uzaktan gelen polis sireni (dalgalı çift ton)
    function playDistantSiren() {
        if (!musicToggle.checked || !ambientAudioCtx) return;
        try {
            const now = ambientAudioCtx.currentTime;
            const osc = ambientAudioCtx.createOscillator();
            const gain = ambientAudioCtx.createGain();
            const filter = ambientAudioCtx.createBiquadFilter();

            osc.type = 'sawtooth';
            // İki ton arasında dalgalanma (Siren)
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.linearRampToValueAtTime(740, now + 1.2);
            osc.frequency.linearRampToValueAtTime(520, now + 2.4);
            osc.frequency.linearRampToValueAtTime(740, now + 3.6);
            osc.frequency.linearRampToValueAtTime(500, now + 4.8);

            // Uzaktan gelmesi için boğuk filtre
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(650, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(0.18, now + 1.0);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 4.8);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ambientAudioCtx.destination);

            osc.start(now);
            osc.stop(now + 4.8);
        } catch (e) {}
    }

    // Telsiz bip/anons sesi (Motorola polis telsizi sesi)
    function playRadioSquelch() {
        if (!musicToggle.checked || !ambientAudioCtx) return;
        try {
            const now = ambientAudioCtx.currentTime;

            // 1. Telsiz açılış bip sesi (chirp)
            const beep = ambientAudioCtx.createOscillator();
            const beepGain = ambientAudioCtx.createGain();
            beep.type = 'sine';
            beep.frequency.setValueAtTime(920, now);
            beep.frequency.setValueAtTime(1150, now + 0.04);
            beepGain.gain.setValueAtTime(0.15, now);
            beepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            beep.connect(beepGain);
            beepGain.connect(ambientAudioCtx.destination);
            beep.start(now);
            beep.stop(now + 0.08);

            // 2. Telsiz hışırtısı / parazit
            const duration = 0.35;
            const bufferSize = ambientAudioCtx.sampleRate * duration;
            const buffer = ambientAudioCtx.createBuffer(1, bufferSize, ambientAudioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.9;
            }

            const noise = ambientAudioCtx.createBufferSource();
            noise.buffer = buffer;

            const bandpass = ambientAudioCtx.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.setValueAtTime(1750, now);
            bandpass.Q.setValueAtTime(3.2, now);

            const gain = ambientAudioCtx.createGain();
            gain.gain.setValueAtTime(0.28, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            noise.connect(bandpass);
            bandpass.connect(gain);
            gain.connect(ambientAudioCtx.destination);

            noise.start(now + 0.05);
        } catch (e) {}
    }

    // Derinden gelen gök gürültüsü
    function playDistantThunder() {
        if (!musicToggle.checked || !ambientAudioCtx) return;
        try {
            const now = ambientAudioCtx.currentTime;
            const bufferSize = ambientAudioCtx.sampleRate * 4.0;
            const buffer = ambientAudioCtx.createBuffer(1, bufferSize, ambientAudioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + (0.025 * white)) / 1.02;
                lastOut = data[i];
            }

            const noise = ambientAudioCtx.createBufferSource();
            noise.buffer = buffer;

            const filter = ambientAudioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(70, now);
            filter.frequency.exponentialRampToValueAtTime(130, now + 1.2);
            filter.frequency.exponentialRampToValueAtTime(40, now + 3.8);

            const gain = ambientAudioCtx.createGain();
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(0.25, now + 1.0);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ambientAudioCtx.destination);

            noise.start(now);
        } catch (e) {}
    }

    // Ortam seslerini döngüye sok (10-12 saniyede bir telsiz/polis sireni/gök gürültüsü)
    function startAmbientAtmosphere() {
        clearInterval(ambientTimer);
        ambientTimer = setInterval(() => {
            if (!musicToggle.checked) return;
            const roll = Math.random();
            if (roll < 0.4) {
                playRadioSquelch(); // Telsiz
            } else if (roll < 0.75) {
                playDistantSiren(); // Polis Sireni
            } else {
                playDistantThunder(); // Gök Gürültüsü
            }
        }, 9000);
    }

    // --- MÜZİK OTOMATİK BAŞLATMA (CHROME VE MOBİL İÇİN KESİN ÇÖZÜM) ---
    function unlockAndPlayAudio() {
        initAmbientSoundEngine();
        startAmbientAtmosphere();
        if (musicToggle.checked) {
            bgAudio.play().then(() => {
                // Müzik başladıysa perdeyi kaldır
                if (audioCurtain) audioCurtain.classList.add('hidden');
            }).catch(() => {
                // Eğer engellendiyse perdeyi göster
                if (audioCurtain) audioCurtain.classList.remove('hidden');
            });
        }
    }

    // İlk deneme: Sayfa açılır açılmaz
    unlockAndPlayAudio();

    // 500ms ve 1000ms sonra tekrar dene
    setTimeout(unlockAndPlayAudio, 400);
    setTimeout(unlockAndPlayAudio, 1000);

    // Ekrana dokunma perdesi veya herhangi bir yere ilk dokunuş
    const startAudioOnTouch = () => {
        initAmbientSoundEngine();
        startAmbientAtmosphere();
        if (musicToggle.checked && bgAudio.paused) {
            bgAudio.play().catch(() => {});
        }
        if (audioCurtain) audioCurtain.classList.add('hidden');
        window.removeEventListener('pointerdown', startAudioOnTouch);
        window.removeEventListener('touchstart', startAudioOnTouch);
        window.removeEventListener('click', startAudioOnTouch);
    };

    window.addEventListener('pointerdown', startAudioOnTouch);
    window.addEventListener('touchstart', startAudioOnTouch);
    window.addEventListener('click', startAudioOnTouch);

    if (audioCurtain) {
        audioCurtain.addEventListener('click', startAudioOnTouch);
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
