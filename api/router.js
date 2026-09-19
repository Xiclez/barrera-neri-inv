const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// Memoria volátil: Usamos el query param '?n=' en el link para asegurar
// que el nombre sobreviva a los reinicios de Vercel.
let guests = [];

// RUTA PRINCIPAL - INYECTA METADATOS Y NOMBRE (SSR)
app.get('/', (req, res) => {
    const guestId = req.query.id;
    const queryName = req.query.n;
    
    let guest = guests.find(g => g.id === guestId);
    const guestName = guest ? guest.name : (queryName ? queryName : 'Invitado Especial');
    
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${protocol}://${host}`;

    // process.cwd() apunta a la raíz del proyecto en Vercel
    const indexPath = path.join(process.cwd(), 'index.html');
    
    fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error leyendo la plantilla');
        
        const html = data
            .replace(/{{GUEST_NAME}}/g, guestName)
            .replace(/{{BASE_URL}}/g, baseUrl)
            .replace(/{{GUEST_ID}}/g, guestId || '');
            
        res.send(html);
    });
});

// API REST
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

module.exports = app;
