const fs = require("fs/promises");
const path = require("path");

const root = process.cwd();
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const storageDir = process.env.NANO_STORAGE_DIR || path.join(root, "storage");
const backupRoot = process.env.NANO_BACKUP_DIR || path.join(storageDir, "backups");
const backupDir = path.join(backupRoot, timestamp);

const sources = [
  {
    name: "data",
    path: process.env.NANO_DATA_DIR || path.join(storageDir, "data"),
  },
  {
    name: "uploads",
    path: process.env.NANO_UPLOADS_DIR || path.join(storageDir, "uploads"),
  },
];

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await fs.mkdir(backupDir, { recursive: true });

  const copied = [];
  for (const source of sources) {
    if (!(await exists(source.path))) continue;

    const destination = path.join(backupDir, source.name);
    await fs.cp(source.path, destination, { recursive: true, force: true });
    copied.push({ from: source.path, to: destination });
  }

  await fs.writeFile(
    path.join(backupDir, "manifest.json"),
    JSON.stringify({ createdAt: new Date().toISOString(), copied }, null, 2)
  );

  console.log(`Backup created: ${backupDir}`);
}

main().catch((error) => {
  console.error("Backup failed:", error);
  process.exit(1);
});
