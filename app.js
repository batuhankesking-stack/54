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

    // ================= SES & MÜZİK MOTORU (GERÇEK MP3'LER) =================
    const bgAudio = document.getElementById('bg-audio');
    const policeAudio = document.getElementById('police-audio');
    const musicToggle = document.getElementById('music-toggle');
    const brightnessSlider = document.getElementById('brightness-slider');
    const brightnessLayer = document.getElementById('brightness-layer');

    // Ses Seviyeleri
    bgAudio.volume = 0.70;
    if (policeAudio) policeAudio.volume = 0.45;

    function playAllSounds() {
        if (!musicToggle.checked) return;
        
        bgAudio.play().catch(() => {});
        if (policeAudio) policeAudio.play().catch(() => {});
    }

    // İlk deneme: Sayfa açılır açılmaz
    playAllSounds();

    // Ekrana ilk dokunuşta kesin başlat (Tarayıcı engeli varsa anında kırılır)
    const onFirstUserTouch = () => {
        playAllSounds();
        window.removeEventListener('pointerdown', onFirstUserTouch);
        window.removeEventListener('touchstart', onFirstUserTouch);
        window.removeEventListener('click', onFirstUserTouch);
    };

    window.addEventListener('pointerdown', onFirstUserTouch, { once: true });
    window.addEventListener('touchstart', onFirstUserTouch, { once: true });
    window.addEventListener('click', onFirstUserTouch, { once: true });

    // Ayarlardan Aç / Kapat
    musicToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            bgAudio.play().catch(() => {});
            if (policeAudio) policeAudio.play().catch(() => {});
            notify('Sesler Açık');
        } else {
            bgAudio.pause();
            if (policeAudio) policeAudio.pause();
            notify('Sesler Kapalı');
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
            const btnStartFromContinue = document.getElementById('btn-start-from-continue');
            if (btnStartFromContinue) {
                btnStartFromContinue.addEventListener('click', () => {
                    closeModal(modalContinue);
                    openModal(modalChar);
                });
            }
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
            const resumeBtn = document.getElementById('resume-btn');
            if (resumeBtn) {
                resumeBtn.addEventListener('click', () => {
                    closeModal(modalContinue);
                    notify(`Oyun Yükleniyor: ${s.char}`);
                });
            }
        }
    }

    // ================= BUTON TIKLAMALARI =================

    // 1. DEVAM ET
    btnContinue.addEventListener('click', () => {
        playAllSounds();
        renderSave();
        openModal(modalContinue);
    });

    // 2. YENİ OYUN (Karakter Seçimi)
    btnNewGame.addEventListener('click', () => {
        playAllSounds();
        openModal(modalChar);
    });

    // Karakter Kartları Seçimi
    document.querySelectorAll('.char-card').forEach(card => {
        const name = card.getAttribute('data-name');
        const btnPick = card.querySelector('.char-pick-btn');
        if (btnPick) {
            btnPick.addEventListener('click', (e) => {
                e.stopPropagation();
                playAllSounds();
                const now = new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
                localStorage.setItem(SAVE_KEY, JSON.stringify({ char: name, time: now }));
                closeModal(modalChar);
                notify(`Seçildi: ${name}`);
            });
        }
    });

    // 3. AYARLAR
    btnOptions.addEventListener('click', () => {
        playAllSounds();
        openModal(modalOptions);
    });

    // 4. BÖLÜMLER
    btnCredits.addEventListener('click', () => {
        playAllSounds();
        openModal(modalCredits);
    });

    // Başlangıç Yüklemesi
    renderSave();
});
