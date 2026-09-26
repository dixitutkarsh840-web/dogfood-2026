# Data Model
Event: name, submissions_close (past date to enforce closed)
Project: id, title (Quantum Garden), track
Judges: judge_a, judge_b mapped to sessions jdg_a_91bc, jdg_b_44de
Scores: in-memory {judge, project, score}
