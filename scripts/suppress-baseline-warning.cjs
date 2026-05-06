#!/usr/bin/env node

const { spawn } = require("node:child_process");

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node scripts/suppress-baseline-warning.cjs <command> [...args]");
  process.exit(1);
}

const child = spawn(args[0], args.slice(1), {
  stdio: ["inherit", "pipe", "pipe"],
  shell: process.platform === "win32",
});

const filter = (chunk) => {
  const text = chunk.toString();
  return text
    .split(/\r?\n/)
    .filter((line) => !line.includes("baseline-browser-mapping"))
    .join("\n");
};

child.stdout.on("data", (chunk) => {
  const text = filter(chunk);
  if (text) process.stdout.write(text);
});

child.stderr.on("data", (chunk) => {
  const text = filter(chunk);
  if (text) process.stderr.write(text);
});

child.on("close", (code) => {
  process.exit(code ?? 0);
});
