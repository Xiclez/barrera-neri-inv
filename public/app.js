document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('id');

    const stepStart = document.getElementById('step-start');
    const stepVid1 = document.getElementById('step-vid1');
    const stepEnvelope = document.getElementById('step-envelope');
    const stepVid2 = document.getElementById('step-vid2');
    const stepFlyer = document.getElementById('step-flyer');
    const stepFinal = document.getElementById('step-final');
    
    const btnStart = document.getElementById('btn-start');
    const video1 = document.getElementById('video1');
    const video2 = document.getElementById('video2');
    const guestNameDisplay = document.getElementById('guest-name-display');
    const openEnvelopeBtn = document.getElementById('open-envelope-btn');
    const btnConfirm = document.getElementById('btn-confirm');
    const btnDecline = document.getElementById('btn-decline');
    const finalTitle = document.getElementById('final-title');
    const finalSubtitle = document.getElementById('final-subtitle');

    if (!guestId) {
        guestNameDisplay.textContent = "Invitado Especial";
    } else {
        try {
            const res = await fetch(`/api/guests/${guestId}`);
            if (res.ok) {
                const guest = await res.json();
                guestNameDisplay.textContent = guest.name;
            } else {
                guestNameDisplay.textContent = "Invitado Especial";
            }
        } catch (error) {
            guestNameDisplay.textContent = "Invitado Especial";
        }
    }

    btnStart.addEventListener('click', () => {
        stepStart.classList.replace('active', 'hidden');
        stepVid1.classList.replace('hidden', 'active');
        video1.play();
    });

    video1.addEventListener('ended', () => {
        stepVid1.classList.replace('active', 'hidden');
        stepEnvelope.classList.replace('hidden', 'active');
    });

    openEnvelopeBtn.addEventListener('click', () => {
        stepEnvelope.classList.replace('active', 'hidden');
        stepVid2.classList.replace('hidden', 'active');
        video2.play();
    });

    video2.addEventListener('ended', () => {
        stepVid2.classList.replace('active', 'hidden');
        stepFlyer.classList.replace('hidden', 'active');
    });

    btnConfirm.addEventListener('click', async () => {
        await updateStatus('confirmed');
        showFinalMessage('¡Nos vemos en el dancefloor!', 'Tu reservación ha sido confirmada exitosamente.');
    });

    btnDecline.addEventListener('click', async () => {
        await updateStatus('declined');
        showFinalMessage('Qué lástima', 'Nos harás falta, pero esperamos verte en la próxima.');
    });

    async function updateStatus(status) {
        if (!guestId) return;
        try {
            await fetch(`/api/guests/${guestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error("Error updating status", error);
        }
    }

    function showFinalMessage(title, subtitle) {
        stepFlyer.classList.replace('active', 'hidden');
        stepFinal.classList.replace('hidden', 'active');
        finalTitle.textContent = title;
        finalSubtitle.textContent = subtitle;
    }
});
