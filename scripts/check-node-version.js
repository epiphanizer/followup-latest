const major = Number(process.versions.node.split('.')[0]);

const supportedMajors = [18, 20, 24];

if (!supportedMajors.includes(major)) {
  console.error('Unsupported Node.js version for followup-frontend: ' + process.versions.node);
  console.error('Use Node 18, 20, or 24 (recommended: 20.x for parity with CI/runtime).');
  process.exit(1);
}
