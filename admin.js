document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-guest-form');
    const inputName = document.getElementById('guest-name');
    const tableBody = document.getElementById('guest-table-body');

    const fetchGuests = async () => {
        const res = await fetch('/api/guests');
        const guests = await res.json();
        renderTable(guests);
    };

    const renderTable = (guests) => {
        tableBody.innerHTML = '';
        guests.forEach(guest => {
            const tr = document.createElement('tr');
            // Link a prueba de borrado en Vercel
            const link = `${window.location.origin}/?id=${guest.id}&n=${encodeURIComponent(guest.name)}`;
            
            let statusBadge = '';
            if(guest.status === 'confirmed') statusBadge = '<span class="badge confirmed">Confirmado</span>';
            else if(guest.status === 'declined') statusBadge = '<span class="badge declined">Declinado</span>';
            else statusBadge = '<span class="badge pending">Pendiente</span>';

            tr.innerHTML = `
                <td><strong>${guest.name}</strong></td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn-small copy-btn" data-link="${link}">Copiar Link</button>
                </td>
                <td>
                    <button class="btn-small delete-btn" data-id="${guest.id}">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                navigator.clipboard.writeText(e.target.dataset.link);
                const originalText = e.target.textContent;
                e.target.textContent = '¡Copiado!';
                setTimeout(() => e.target.textContent = originalText, 2000);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if(confirm('¿Eliminar invitado?')) {
                    await fetch(`/api/guests/${id}`, { method: 'DELETE' });
                    fetchGuests();
                }
            });
        });
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = inputName.value.trim();
        if (!name) return;

        await fetch('/api/guests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        
        inputName.value = '';
        fetchGuests();
    });

    fetchGuests();
});
