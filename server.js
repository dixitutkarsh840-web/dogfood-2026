const express = require('express');
const path = require('path'); // <-- ye add kar
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // <-- ye wali line yaha

// Fixtures - one known project title for checker
const FIXTURES = {
  projects: [{ id: 1, title: "Quantum Garden", description: "AI garden", track: "AI" }],
  event: { name: "Dogfood 2026", submissions_close: "2020-01-01T00:00:00Z" }
};

const SESSIONS = {
  'org_7f2a': { role: 'organizer', id: 'org_7f2a' },
  'jdg_a_91bc': { role: 'judge', judge_id: 'judge_a' },
  'jdg_b_44de': { role: 'judge', judge_id: 'judge_b' },
  'prt_2e88': { role: 'participant', id: 'prt_2e88' }
};

function getSession(req){
  const cookie = req.headers.cookie || '';
  const m = cookie.match(/session=([^;\s]+)/);
  if(!m) return null;
  return SESSIONS[m[1]] || null;
}

// T1: gallery is public - isko mat hatao, run.py isi ko check karta hai
app.get('/projects', (req,res)=>{
  const list = FIXTURES.projects.map(p=>`<li>${p.title}</li>`).join('');
  res.status(200).send(`<html><body><h1>Gallery</h1><ul>${list}</ul></body></html>`);
});

app.get('/', (req,res)=> res.redirect('/projects'));

//... baaki ka code same rehne de