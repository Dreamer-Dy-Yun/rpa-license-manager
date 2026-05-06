import { readdirSync, readFileSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";

const root = process.cwd();
const cssPath = join(root, "src", "styles", "app.css");
const srcDir = join(root, "src");
const css = readFileSync(cssPath, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const sourceFiles = walk(srcDir).filter((file) => [".ts", ".tsx"].includes(extname(file)));
const sourceByFile = new Map(sourceFiles.map((file) => [file, readFileSync(file, "utf8")]));
const sourceText = [...sourceByFile.values()].join("\n");

const cssClasses = new Set([...css.matchAll(/(?<![\w-])\.([_a-zA-Z][\w-]*)/g)].map((match) => match[1]));
const generatedClasses = new Set(["notice-info", "notice-danger"]);
const buttonSource = sourceByFile.get(join(srcDir, "shared", "ui", "Button.tsx")) ?? "";
const variantMatch = buttonSource.match(/type ButtonVariant = ([^;]+);/);

if (variantMatch) {
  for (const match of variantMatch[1].matchAll(/"([^"]+)"/g)) {
    generatedClasses.add(`ui-button-${match[1]}`);
  }
}

const unusedCssClasses = [...cssClasses]
  .filter((className) => !sourceText.includes(className) && !generatedClasses.has(className))
  .sort();

const oldClassNames = [
  "primary-button",
  "secondary-button",
  "ghost-button",
  "icon-button",
  "menu-item",
  "dashboard-card",
  "inline-actions",
  "subtabs"
];

const staleSourceRefs = oldClassNames
  .filter((className) => sourceText.includes(className))
  .map((className) => `source still references .${className}`);

const staleCssRefs = oldClassNames
  .filter((className) => cssClasses.has(className))
  .map((className) => `css still defines .${className}`);

const forbiddenCssPatterns = [
  [/button:not\(\.ui-button\)/, "button:not(.ui-button) fallback masks incorrect button usage"],
  [/\.(table-actions|tab-list|date-stepper)\s+button\b/, "component containers must not style raw button descendants"]
];

const forbiddenCssRefs = forbiddenCssPatterns
  .filter(([pattern]) => pattern.test(css))
  .map(([, message]) => message);

const rawButtonRefs = [...sourceByFile.entries()]
  .filter(([file, text]) => basename(file) !== "Button.tsx" && /<button[\s>]/.test(text))
  .map(([file]) => `raw <button> outside shared Button: ${relative(root, file)}`);

const failures = [
  ...unusedCssClasses.map((className) => `unused css class .${className}`),
  ...staleSourceRefs,
  ...staleCssRefs,
  ...forbiddenCssRefs,
  ...rawButtonRefs
];

if (failures.length > 0) {
  console.error("Style audit failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Style audit passed: ${cssClasses.size} CSS classes traced.`);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : path;
  });
}
