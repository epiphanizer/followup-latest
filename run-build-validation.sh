#!/bin/bash
set -e

# Change to script directory
cd "$(dirname "$0")"

echo "=== Angular 12 Build Validation ===" > build-validation.log 2>&1
echo "Time: $(date)" >> build-validation.log 2>&1
echo "" >> build-validation.log 2>&1

echo "1. Current directory:" >> build-validation.log 2>&1
pwd >> build-validation.log 2>&1

echo "" >> build-validation.log 2>&1
echo "2. Node/npm versions:" >> build-validation.log 2>&1
node --version >> build-validation.log 2>&1
npm --version >> build-validation.log 2>&1

echo "" >> build-validation.log 2>&1
echo "3. Angular version check:" >> build-validation.log 2>&1
cat package.json | grep -E '"@angular/(cli|core)"' >> build-validation.log 2>&1

echo "" >> build-validation.log 2>&1
echo "4. Running: npm run build -s" >> build-validation.log 2>&1
echo "Build output:" >> build-validation.log 2>&1
npm run build -s >> build-validation.log 2>&1

echo "" >> build-validation.log 2>&1
echo "5. Build completed successfully!" >> build-validation.log 2>&1

# Show results
cat build-validation.log
