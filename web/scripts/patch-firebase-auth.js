/**
 * postinstall.js — patches @firebase/auth node-esm build to remove `undici`
 * imports that webpack 5 (Next.js 14) cannot parse due to ES2022 private
 * class fields. Browsers have native fetch; undici is only needed server-side.
 *
 * Run automatically after `npm install` via the "postinstall" script.
 */
const fs = require("fs");
const path = require("path");

const nodeEsmDir = path.join(
  __dirname,
  "../node_modules/firebase/node_modules/@firebase/auth/dist/node-esm"
);

// Fallback to top-level @firebase/auth if nested one doesn't exist
const fallbackDir = path.join(
  __dirname,
  "../node_modules/@firebase/auth/dist/node-esm"
);

const dir = fs.existsSync(nodeEsmDir) ? nodeEsmDir : fallbackDir;

if (!fs.existsSync(dir)) {
  console.log("[postinstall] @firebase/auth node-esm dir not found, skipping patch.");
  process.exit(0);
}

let patchCount = 0;

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".js"))) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Replace bare side-effect import
  if (content.includes("import 'undici';")) {
    content = content.replace(/import 'undici';/g, "// undici removed (browser uses native fetch)");
    fs.writeFileSync(filePath, content, "utf8");
    patchCount++;
    console.log(`[postinstall] Patched (removed bare import): ${file}`);
  }

  // Replace named import of fetch/Headers/Response from undici
  if (content.includes("from 'undici'")) {
    const lines = content.split("\n").map((line) => {
      if (line.includes("from 'undici'")) {
        // Extract imported names and replace with globalThis equivalents
        const match = line.match(/import\s*\{([^}]+)\}\s*from\s*'undici'/);
        if (match) {
          const names = match[1].split(",").map((s) => s.trim());
          const replacements = names
            .map((n) => {
              const [orig, alias] = n.split(/\s+as\s+/).map((s) => s.trim());
              const local = alias || orig;
              return `const ${local} = globalThis.${orig};`;
            })
            .join(" ");
          return replacements + " // undici replaced with globalThis";
        }
      }
      return line;
    });
    content = lines.join("\n");
    fs.writeFileSync(filePath, content, "utf8");
    patchCount++;
    console.log(`[postinstall] Patched (replaced named import): ${file}`);
  }
}

console.log(`[postinstall] Firebase Auth undici patch complete. ${patchCount} file(s) patched.`);
