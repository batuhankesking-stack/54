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

    // Menü Odaklanma (Kırmızı Fırça)
    const menuButtons = [btnContinue, btnNewGame, btnOptions, btnCredits];
    function setFocus(btn) {
        menuButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

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
        }, 2500);
    }

    // ================= SAVE / LOAD SİSTEMİ =================
    const SAVE_KEY = '54_save';
    const saveContent = document.getElementById('save-content');
    const resumeBtn = document.getElementById('resume-btn');
    const testSaveBtn = document.getElementById('test-save-btn');
    const clearSaveBtn = document.getElementById('clear-save-btn');

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
            saveContent.innerHTML = `<p style="color:#9ca3af; text-align:center;">Kayıtlı ilerleme yok.<br>"NEW GAME" ile başlayın.</p>`;
            resumeBtn.style.opacity = '0.5';
            resumeBtn.style.pointerEvents = 'none';
        } else {
            saveContent.innerHTML = `
                <div class="save-line">
                    <span style="color:#9ca3af;">Karakter:</span>
                    <strong style="color:#22c55e;">${s.char}</strong>
                </div>
                <div class="save-line">
                    <span style="color:#9ca3af;">Durum:</span>
                    <span>1. Sezon 1. Bölüm</span>
                </div>
                <div class="save-line">
                    <span style="color:#9ca3af;">Son Kayıt:</span>
                    <span style="color:#e50914;">${s.time}</span>
                </div>
            `;
            resumeBtn.style.opacity = '1';
            resumeBtn.style.pointerEvents = 'auto';
        }
    }

    // 1. CONTINUE (DEVAM ET)
    btnContinue.addEventListener('click', () => {
        setFocus(btnContinue);
        renderSave();
        openModal(modalContinue);
    });

    resumeBtn.addEventListener('click', () => {
        const s = getSave();
        if (s) {
            closeModal(modalContinue);
            notify(`Oyun Açılıyor: ${s.char}`);
        }
    });

    testSaveBtn.addEventListener('click', () => {
        const now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem(SAVE_KEY, JSON.stringify({ char: 'Batuhan Keskin', time: now }));
        renderSave();
        notify('Test kaydı alındı.');
    });

    clearSaveBtn.addEventListener('click', () => {
        localStorage.removeItem(SAVE_KEY);
        renderSave();
        notify('Kayıt silindi.');
    });

    // 2. NEW GAME (KARAKTER SEÇİMİ)
    btnNewGame.addEventListener('click', () => {
        setFocus(btnNewGame);
        openModal(modalChar);
    });

    document.querySelectorAll('.char-card').forEach(card => {
        const name = card.getAttribute('data-name');
        card.querySelector('.char-pick-btn').addEventListener('click', () => {
            const now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            localStorage.setItem(SAVE_KEY, JSON.stringify({ char: name, time: now }));
            closeModal(modalChar);
            setFocus(btnContinue);
            notify(`Seçildi: ${name}`);
        });
    });

    // 3. OPTIONS (AYARLAR)
    btnOptions.addEventListener('click', () => {
        setFocus(btnOptions);
        openModal(modalOptions);
    });

    const bgAudio = document.getElementById('bg-audio');
    const musicToggle = document.getElementById('music-toggle');
    const brightnessSlider = document.getElementById('brightness-slider');
    const brightnessLayer = document.getElementById('brightness-layer');

    musicToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            bgAudio.play().catch(() => {});
            notify('Müzik Açık');
        } else {
            bgAudio.pause();
            notify('Müzik Kapalı');
        }
    });

    // İlk kullanıcı dokunuşunda müzik başlatma
    document.body.addEventListener('click', () => {
        if (musicToggle.checked && bgAudio.paused) {
            bgAudio.play().catch(() => {});
        }
    }, { once: true });

    brightnessSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (val < 100) {
            brightnessLayer.style.background = 'black';
            brightnessLayer.style.opacity = ((100 - val) / 100) * 0.8;
        } else {
            brightnessLayer.style.background = 'white';
            brightnessLayer.style.opacity = ((val - 100) / 100) * 0.3;
        }
    });

    // 4. CREDITS (BÖLÜMLER)
    btnCredits.addEventListener('click', () => {
        setFocus(btnCredits);
        openModal(modalCredits);
    });

    renderSave();
});
