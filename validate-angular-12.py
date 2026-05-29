#!/usr/bin/env python3
"""
Angular 12 Upgrade Validation Script
Tests the v4.0.0 frontend after Angular upgrade
"""

import subprocess
import sys
import json
from pathlib import Path
from datetime import datetime

FRONTEND_DIR = Path("/Users/seanhalls/Desktop/sh/clients/followup_master/v4.0.0/followup-frontend")
RESULTS_FILE = FRONTEND_DIR / "VALIDATION_RESULTS.md"

def run_command(cmd, cwd=FRONTEND_DIR, verbose=True):
    """Execute shell command and return result."""
    try:
        result = subprocess.run(
            cmd,
            cwd=str(cwd),
            shell=True,
            capture_output=True,
            text=True,
            timeout=300
        )
        if verbose:
            print(f"✓ Command: {cmd}")
            if result.stdout:
                print(f"  Output (first 500 chars): {result.stdout[:500]}")
        return {
            'success': result.returncode == 0,
            'returncode': result.returncode,
            'stdout': result.stdout,
            'stderr': result.stderr
        }
    except subprocess.TimeoutExpired:
        return {'success': False, 'error': 'Command timeout'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def main():
    print(f"Angular 12 Upgrade Validation - {datetime.now().isoformat()}")
    print(f"Working directory: {FRONTEND_DIR}")
    print(f"{'='*60}\n")
    
    results = {
        'timestamp': datetime.now().isoformat(),
        'frontend_dir': str(FRONTEND_DIR),
        'tests': {}
    }
    
    # Test 1: Check Node version
    print("[1/5] Checking Node.js version...")
    node_result = run_command("node --version")
    results['tests']['node_version'] = node_result
    print(f"  Node: {node_result['stdout'].strip()}\n")
    
    # Test 2: Check npm version
    print("[2/5] Checking npm version...")
    npm_result = run_command("npm --version")
    results['tests']['npm_version'] = npm_result
    print(f"  npm: {npm_result['stdout'].strip()}\n")
    
    # Test 3: Verify Angular version in package.json
    print("[3/5] Verifying Angular 12 in package.json...")
    pkg_file = FRONTEND_DIR / "package.json"
    try:
        with open(pkg_file) as f:
            pkg = json.load(f)
        angular_version = pkg['dependencies']['@angular/core']
        print(f"  @angular/core: {angular_version}")
        results['tests']['angular_version'] = {
            'success': '12' in angular_version,
            'version': angular_version
        }
    except Exception as e:
        print(f"  Error reading package.json: {e}")
        results['tests']['angular_version'] = {'success': False, 'error': str(e)}
    print()
    
    # Test 4: Try linting
    print("[4/5] Running ESLint (npm run lint:ts)...")
    lint_result = run_command("npm run lint:ts", verbose=False)
    results['tests']['lint'] = {
        'success': lint_result['success'],
        'returncode': lint_result['returncode']
    }
    if lint_result['success']:
        print("  ✓ ESLint passed\n")
    else:
        print(f"  ✗ ESLint failed (return code: {lint_result['returncode']})")
        if lint_result['stderr']:
            print(f"    Error: {lint_result['stderr'][:200]}\n")
    
    # Test 5: List dist artifacts
    print("[5/5] Checking production build artifacts...")
    dist_dir = FRONTEND_DIR / "dist"
    if dist_dir.exists():
        dist_files = list(dist_dir.glob("*"))
        print(f"  Found {len(dist_files)} files in dist/")
        critical_files = ['index.html', 'styles.*.css', 'main.*.js', 'ngsw-worker.js']
        found_files = [f.name for f in dist_files]
        print(f"  Files: {', '.join(found_files[:10])}{'...' if len(found_files) > 10 else ''}")
        results['tests']['build_artifacts'] = {
            'success': len(dist_files) > 20,  # Production build has many files
            'count': len(dist_files)
        }
    else:
        print("  ✗ dist/ directory not found")
        results['tests']['build_artifacts'] = {'success': False, 'error': 'dist/ not found'}
    
    # Summary
    print(f"\n{'='*60}")
    print("VALIDATION SUMMARY:")
    passed = sum(1 for t in results['tests'].values() if t.get('success', False))
    total = len(results['tests'])
    print(f"✓ Passed: {passed}/{total}")
    
    # Write results to file
    with open(RESULTS_FILE, 'w') as f:
        f.write(f"# Angular 12 Upgrade Validation Results\n")
        f.write(f"Time: {results['timestamp']}\n\n")
        f.write(f"## Summary\n")
        f.write(f"- Tests Passed: {passed}/{total}\n\n")
        f.write(f"## Details\n")
        for test_name, test_result in results['tests'].items():
            status = "✓ PASS" if test_result.get('success') else "✗ FAIL"
            f.write(f"### {test_name}: {status}\n")
            if 'version' in test_result:
                f.write(f"- Version: {test_result['version']}\n")
            if 'error' in test_result:
                f.write(f"- Error: {test_result['error']}\n")
            if 'count' in test_result:
                f.write(f"- Count: {test_result['count']}\n")
            f.write("\n")
    
    print(f"\nResults written to: {RESULTS_FILE}")
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
