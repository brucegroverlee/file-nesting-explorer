const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const readmePath = path.join(repoRoot, "README.md");

function assertPlatform(platform) {
  const allowed = new Set(["vscode", "openvsx"]);
  if (!allowed.has(platform)) {
    throw new Error(
      `Invalid platform "${platform}". Use "vscode" or "openvsx".`
    );
  }
}

function replaceUtmSource(content, target) {
  return content.replace(
    /utm_source=(github|vscode|openvsx)/g,
    `utm_source=${target}`
  );
}

function setReadmeUtmSource(target) {
  const original = fs.readFileSync(readmePath, "utf8");
  const updated = replaceUtmSource(original, target);

  if (updated !== original) {
    fs.writeFileSync(readmePath, updated, "utf8");
  }

  return original;
}

function main() {
  const platform = process.argv[2];
  if (!platform) {
    console.error(
      "Usage: node scripts/package-with-platform.js <vscode|openvsx>"
    );
    process.exit(2);
  }

  assertPlatform(platform);

  let originalReadme;
  try {
    originalReadme = setReadmeUtmSource(platform);

    const result = spawnSync("vsce", ["package"], {
      cwd: repoRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    const code = typeof result.status === "number" ? result.status : 1;
    process.exitCode = code;
  } finally {
    try {
      if (typeof originalReadme === "string") {
        const restored = replaceUtmSource(originalReadme, "github");
        fs.writeFileSync(readmePath, restored, "utf8");
      } else {
        // Fallback: attempt to restore from current file content
        const current = fs.readFileSync(readmePath, "utf8");
        const restored = replaceUtmSource(current, "github");
        fs.writeFileSync(readmePath, restored, "utf8");
      }
    } catch (e) {
      console.error(
        "Failed to restore README.md utm_source back to github:",
        e
      );
      process.exitCode = process.exitCode || 1;
    }
  }
}

main();
