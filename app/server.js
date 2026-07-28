const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🔄 Starting with environment variables...');
console.log('REDIS_PASSWORD loaded:', !!process.env.REDIS_PASSWORD);

// Postgres
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: 'db',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

// Redis with better error handling
const redisClient = redis.createClient({
  url: `redis://cache:6379`,
  password: process.env.REDIS_PASSWORD
});

redisClient.on('error', err => {
  console.error('Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis successfully');
});

// Initialize DB
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ PostgreSQL ready');
  } catch (err) {
    console.error('DB Init Error:', err.message);
  }
}

app.use(express.json());
app.use(express.static('public'));

// Home
app.get('/', async (req, res) => {
  try {
    const visits = await redisClient.incr('visits');
    res.send(`
      <h1>🚀 Docker Mini Project</h1>
      <p><strong>Visits:</strong> ${visits}</p>
      <form action="/note" method="POST">
        <input type="text" name="text" placeholder="Write a note..." style="width:300px" required>
        <button type="submit">Save Note</button>
      </form>
      <br>
      <a href="/notes">📋 View All Notes</a>
    `);
  } catch (err) {
    res.send('<h1>Redis Error - Check logs</h1>');
  }
});

// Save note
app.post('/note', async (req, res) => {
  const { text } = req.body;
  await pool.query('INSERT INTO notes(text) VALUES($1)', [text]);
  res.redirect('/');
});

// Get notes
app.get('/notes', async (req, res) => {
  const result = await pool.query('SELECT * FROM notes ORDER BY created_at DESC');
  let html = '<h1>📋 All Notes</h1><ul>';
  result.rows.forEach(row => {
    html += `<li>${row.text} <small>(${row.created_at})</small></li>`;
  });
  html += '</ul><a href="/">← Back</a>';
  res.send(html);
});

async function start() {
  try {
    await redisClient.connect();
    await initDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Startup Error:', err.message);
  }
}

start();
