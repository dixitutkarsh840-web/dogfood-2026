const express = require('express');
const app = express();
app.use(express.json());

// Judge ke sessions -.dogfood.toml se
const SESSIONS = {
  'org_7f2a': { role: 'organizer', name: 'Organizer' },
  'judge_a': { role: 'judge', name: 'Judge A' },
  'judge_b': { role: 'judge', name: 'Judge B' }
};

function getUser(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  return SESSIONS[match[1]] || null;
}

app.get('/', (req, res) => res.send('Dogfood running on 8080'));

app.get('/api/me', (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Not logged in' });
  res.json(user);
});

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log('Running on', PORT));