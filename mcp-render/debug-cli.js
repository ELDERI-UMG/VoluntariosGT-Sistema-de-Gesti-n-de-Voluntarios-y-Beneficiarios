#!/usr/bin/env node

console.log('=== DEBUG CLI ===');
console.log('process.argv[1]:', process.argv[1]);
console.log('import.meta.url:', import.meta.url);

const normalized = process.argv[1].replace(/\\/g, '/');
console.log('normalized path:', normalized);
console.log('file://' + normalized);

console.log('Match?', import.meta.url === `file://${normalized}`);