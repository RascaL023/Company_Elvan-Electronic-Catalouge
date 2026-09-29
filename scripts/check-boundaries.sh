#!/usr/bin/env bash
# Boundary checks for the migration-ready architecture (issue #1).
# Fails if infrastructure concerns leak outside their boundary.
# Run: npm run check:boundaries
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAIL=0

fail() { echo "boundary-check FAILED: $1"; FAIL=1; }
pass() { echo "boundary-check ok: $1"; }

# 1. Firebase SDK imports only in src/data/firebase and src/config.
if grep -rEn "from 'firebase" "$ROOT/src" --include='*.ts' --include='*.tsx' | grep -vE "src/(data/firebase|config)/"; then
  fail "firebase imports found outside src/data/firebase and src/config"
else
  pass "firebase imports contained in src/data/firebase and src/config"
fi

# 2. Firestore-specific types only in the Firebase layer.
if grep -rEn "DocumentSnapshot" "$ROOT/src" --include='*.ts' --include='*.tsx' | grep -vE "src/data/firebase/"; then
  fail "DocumentSnapshot found outside src/data/firebase"
else
  pass "DocumentSnapshot contained in src/data/firebase"
fi

# 3. No direct env reads in UI layers (features, hooks, components).
if grep -rEn "import\.meta\.env" "$ROOT/src/features" "$ROOT/src/hooks" "$ROOT/src/components" --include='*.ts' --include='*.tsx'; then
  fail "import.meta.env found in src/features, src/hooks, or src/components (use src/config/* or the composition root)"
else
  pass "no import.meta.env in features/hooks/components"
fi

# 4. No direct ImageKit module imports in UI layers (use imageUploadService).
if grep -rEn "services/imagekit|imagekit-javascript" "$ROOT/src/features" "$ROOT/src/hooks" "$ROOT/src/components" --include='*.ts' --include='*.tsx'; then
  fail "direct ImageKit imports found in features/hooks/components (use imageUploadService from the composition root)"
else
  pass "no direct ImageKit imports in features/hooks/components"
fi

exit "$FAIL"
