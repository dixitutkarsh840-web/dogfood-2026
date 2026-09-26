# Judging
- Judges see own scores only: GET /api/judge/scores returns 200 for own judge_id
- Peer isolation: GET /api/judge/scores?judge=judge_a with judge_b session -> 403
- Participant blocked: same endpoint with participant -> 403
- Normalization: scores are averaged per project for CSV export (simple mean)
- CSV export: GET /api/export.csv with organizer -> text/csv
