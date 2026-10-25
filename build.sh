#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "=== CivicPulse Render Deployment Build ==="

# Select python executable
if command -v python3 &>/dev/null; then
    PY_BIN=python3
else
    PY_BIN=python
fi

echo "1. Installing Python dependencies using $PY_BIN..."
$PY_BIN -m pip install --upgrade pip
$PY_BIN -m pip install -r requirements.txt

echo "2. Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "3. Pre-initializing Database and ML Model..."
$PY_BIN -c "
from backend.app.database import engine, Base, SessionLocal
from backend.app.seed_data import seed_database
Base.metadata.create_all(bind=engine)
db = SessionLocal()
seed_database(db)
db.close()
print('CivicPulse initialization completed successfully.')
"

echo "=== Build Completed Successfully! ==="
