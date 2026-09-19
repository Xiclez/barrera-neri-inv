const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Base de datos en memoria (Nota: se reiniciará en Vercel tras inactividad)
let guests = [];

app.get('/api/guests', (req, res) => {
    res.json(guests);
});

app.post('/api/guests', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es requerido' });
    
    const newGuest = {
        id: uuidv4(),
        name,
        status: 'pending'
    };
    guests.push(newGuest);
    res.status(201).json(newGuest);
});

app.get('/api/guests/:id', (req, res) => {
    const guest = guests.find(g => g.id === req.params.id);
    if (!guest) return res.status(404).json({ error: 'Invitado no encontrado' });
    res.json(guest);
});

app.put('/api/guests/:id', (req, res) => {
    const { status } = req.body;
    const guest = guests.find(g => g.id === req.params.id);
    
    if (!guest) return res.status(404).json({ error: 'Invitado no encontrado' });
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

// Configuración compatible con Vercel Serverless
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app;
