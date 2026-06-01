import { readdir, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const uploadsRoot = fileURLToPath(new URL("../public/uploads/", import.meta.url));
const oneMiB = 1024 * 1024;
const totalLimit = 25 * oneMiB;

const rules = {
  images: {
    label: "image",
    extensions: new Set([".webp", ".jpg", ".jpeg", ".png"]),
    maxBytes: oneMiB
  },
  documents: {
    label: "PDF",
    extensions: new Set([".pdf"]),
    maxBytes: 5 * oneMiB
  }
};

const failures = [];
let totalBytes = 0;

const formatBytes = (bytes) => {
  if (bytes < oneMiB) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / oneMiB).toFixed(2)} MB`;
};

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(path)));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }

  return files;
}

const files = await listFiles(uploadsRoot);

for (const file of files) {
  if (file.endsWith(".gitkeep")) {
    continue;
  }

  const relativePath = relative(uploadsRoot, file);
  const [folder] = relativePath.split("/");
  const rule = rules[folder];
  const extension = extname(file).toLowerCase();
  const { size } = await stat(file);

  totalBytes += size;

  if (!rule) {
    failures.push(`${relativePath}: uploads must be in images/ or documents/.`);
    continue;
  }

  if (!rule.extensions.has(extension)) {
    failures.push(
      `${relativePath}: ${extension || "extensionless"} files are not allowed.`
    );
  }

  if (size > rule.maxBytes) {
    failures.push(
      `${relativePath}: ${formatBytes(size)} exceeds the ${formatBytes(
        rule.maxBytes
      )} ${rule.label} limit.`
    );
  }
}

if (totalBytes > totalLimit) {
  failures.push(
    `public/uploads total: ${formatBytes(totalBytes)} exceeds the ${formatBytes(
      totalLimit
    )} limit.`
  );
}

if (failures.length > 0) {
  console.error("Upload guard failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Upload guard passed: ${formatBytes(totalBytes)} in public/uploads.`);
