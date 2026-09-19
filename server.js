const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// IMPORTANTE: index: false evita que express.static bloquee nuestra ruta app.get('/')
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

let guests = [];

// RUTA PRINCIPAL - INYECTA METADATOS Y NOMBRE
app.get('/', (req, res) => {
    const guestId = req.query.id;
    const queryName = req.query.n; // Recupera el nombre de la URL (Truco para Vercel Serverless)
    
    let guest = guests.find(g => g.id === guestId);
    // Si la memoria se borró, usamos el nombre de la URL. Si no hay link personalizado, "Invitado Especial"
    const guestName = guest ? guest.name : (queryName ? queryName : 'Invitado Especial');
    
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = `${protocol}://${host}`;

    const indexPath = path.join(__dirname, 'public', 'index.html');
    
    fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error interno');
        
        // Reemplazamos las variables en el HTML antes de enviarlo
        const html = data
            .replace(/{{GUEST_NAME}}/g, guestName)
            .replace(/{{BASE_URL}}/g, baseUrl)
            .replace(/{{GUEST_ID}}/g, guestId || '');
            
        res.send(html);
    });
});

app.get('/api/guests', (req, res) => {
    res.json(guests);
});

app.post('/api/guests', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es requerido' });
    
    const newGuest = { id: uuidv4(), name, status: 'pending' };
    guests.push(newGuest);
    res.status(201).json(newGuest);
});

app.put('/api/guests/:id', (req, res) => {
    const { status, name } = req.body;
    let guest = guests.find(g => g.id === req.params.id);
    
    // TRUCO VERCEL: Si el invitado no existe en memoria (porque Vercel se reinició), lo recreamos.
    if (!guest) {
        guest = { id: req.params.id, name: name || 'Invitado Recuperado', status: 'pending' };
        guests.push(guest);
    }
    
    if (!['confirmed', 'declined'].includes(status)) {
        return res.status(400).json({ error: 'Estado no válido' });
    }

    guest.status = status;
    res.json(guest);
});

app.delete('/api/guests/:id', (req, res) => {
    guests = guests.filter(g => g.id !== req.params.id);
    res.status(204).send();
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app;
