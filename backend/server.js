const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors()); // Разрешаем нашему сайту слать запросы на бэкенд
app.use(express.json());

// Подключаемся к PostgreSQL (настройки Docker Compose сам подкинет сюда)
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

// Автоматически создаем таблицу отзывов в базе данных, если её еще нет
pool.query(`
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).catch(err => console.error("Ошибка создания таблицы:", err));

// Маршрут 1: Отдать все отзывы из базы данных
app.get('/api/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT text FROM messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Маршрут 2: Сохранить новый отзыв в базу данных
app.post('/api/messages', async (req, res) => {
  try {
    const { text } = req.body;
    await pool.query('INSERT INTO messages (text) VALUES ($1)', [text]);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('Сервер запущен на порту 5000'));
