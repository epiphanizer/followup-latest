const major = Number(process.versions.node.split('.')[0]);

const supportedMajors = [18, 20, 24];

if (!supportedMajors.includes(major)) {
  console.error('Unsupported Node.js version for followup-frontend: ' + process.versions.node);
  console.error('Use Node 18, 20, or 24 (recommended: 20.x for parity with CI/runtime).');
  process.exit(1);
}

if (major === 24) {
  console.warn('Node 24 is enabled via websocket-driver override patch. Use Node 20 for strict 3.9.9 parity.');
}
