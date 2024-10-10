const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');  
const app = express();
const port = 3000;

const db = new sqlite3.Database('./winners.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado a la base de datos SQLite.');
});

db.run(`CREATE TABLE IF NOT EXISTS winners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
)`);

app.use(cors());
app.use(express.json());

app.get('/winners', (req, res) => {
    db.all(`SELECT name FROM winners`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ winners: rows });
    });
});

app.post('/winners', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Se requiere un nombre.' });
    }

    db.get(`SELECT * FROM winners WHERE name = ?`, [name], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            return res.status(400).json({ error: 'El nombre ya ha ganado. No se puede registrar nuevamente.' });
        }

        db.run(`INSERT INTO winners (name) VALUES (?)`, [name], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Ganador añadido', id: this.lastID });
        });
    });
});


app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
