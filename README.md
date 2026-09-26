# Dogfood 2026 - Hackathon Portal

T1 + T2 verified.

## How to run
```
docker compose up --build
# open http://localhost:8080/projects
```

Test logins are printed on boot:
- organizer Cookie: session=org_7f2a
- judge_a Cookie: session=jdg_a_91bc
- judge_b Cookie: session=jdg_b_44de
- participant Cookie: session=prt_2e88

## Check
```
python run.py .dogfood.toml
```

## Tiers claimed
T1 T2 - both verified, see acceptance-report.txt
