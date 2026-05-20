const major = Number(process.versions.node.split('.')[0]);

// Angular 11 + webpack 4 has known instability on Node 24 in this app build pipeline.
const supportedMajors = [18, 20];

if (!supportedMajors.includes(major)) {
  console.error('Unsupported Node.js version for followup-frontend: ' + process.versions.node);
  console.error('Use Node 18 or 20 (recommended: 20.x).');
  console.error('Node 24 can trigger webpack/mini-css stack overflow during alpha builds.');
  process.exit(1);
}
