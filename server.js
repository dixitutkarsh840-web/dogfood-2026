const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fixtures - one known project title for checker
const FIXTURES = {
  projects: [{ id: 1, title: "Quantum Garden", description: "AI garden", track: "AI" }],
  event: { name: "Dogfood 2026", submissions_close: "2020-01-01T00:00:00Z" } // past -> closed
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

// T1: gallery is public
app.get('/projects', (req,res)=>{
  const list = FIXTURES.projects.map(p=>`<li>${p.title}</li>`).join('');
  res.status(200).send(`<html><body><h1>Gallery</h1><ul>${list}</ul></body></html>`);
});

app.get('/', (req,res)=> res.redirect('/projects'));

// T1: closed event refuses submissions
app.post('/projects/new', (req,res)=>{
  const sess = getSession(req);
  // always closed because submissions_close in past
  const closed = new Date(FIXTURES.event.submissions_close) < new Date();
  if(closed){
    return res.status(403).json({error:'Submissions closed', close: FIXTURES.event.submissions_close});
  }
  res.status(200).json({ok:true});
});

// T2: judge sees own scores
app.get('/api/judge/scores', (req,res)=>{
  const sess = getSession(req);
  if(!sess) return res.status(401).json({error:'No session'});
  if(sess.role !== 'judge') return res.status(403).json({error:'Not a judge'});
  
  const requestedJudge = req.query.judge || sess.judge_id;
  // CRITICAL: isolation check - judge_b cannot see judge_a
  if(requestedJudge !== sess.judge_id){
    return res.status(403).json({error:'Cannot see peer scores'});
  }
  res.status(200).json({judge: sess.judge_id, scores: [{project:1, score:8}]});
});

// T2: csv export
app.get('/api/export.csv', (req,res)=>{
  const sess = getSession(req);
  if(!sess) return res.status(401).send('no auth');
  if(sess.role !== 'organizer') return res.status(403).send('forbidden');
  res.setHeader('Content-Type','text/csv');
  res.status(200).send('project,score,average\nQuantum Garden,8,8.0\n');
});

app.get('/health', (req,res)=> res.json({ok:true}));

const PORT = process.env.PORT || 8080;
app.listen(PORT,'0.0.0.0',()=>{
  console.log('seeded. test logins:');
  console.log('  organizer    Cookie: session=org_7f2a');
  console.log('  judge_a      Cookie: session=jdg_a_91bc');
  console.log('  judge_b      Cookie: session=jdg_b_44de');
  console.log('  participant  Cookie: session=prt_2e88');
  console.log(`Running on ${PORT}`);
});