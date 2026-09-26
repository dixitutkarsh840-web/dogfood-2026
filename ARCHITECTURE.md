# Architecture
- Express server, single file server.js
- In-memory fixtures (Quantum Garden project) - seeded on boot
- Auth via Cookie session=xxx parsed from header
- Critical: judge isolation check in GET /api/judge/scores?judge=...
  if requestedJudge != session.judge_id -> 403
- Closed event: submissions_close = 2020-01-01, so POST /projects/new always 403
