import fs from 'fs';
console.log("Checking for P2O5 in data...");
const data = fs.readFileSync('src/data/equations.ts', 'utf8');
if (data.includes("eq-p-o2")) console.log("eq-p-o2 exists.");
