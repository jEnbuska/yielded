/**
 * Turns `pnpm audit --json` output into a Markdown table of the known
 * vulnerabilities of high severity or worse: the package, the installed
 * version, the advisory and the version that fixes it. CI's dependency check
 * and the weekly audit (.github/workflows/audit.yml) run it.
 *
 *   node scripts/audit-report.mts <audit.json> [<base-audit.json>]
 *
 * With a second file, it lists only the findings that aren't in that one:
 * what a PR adds compared with its base branch. It prints the table and exits
 * 1 when there's something to list, prints nothing and exits 0 when there
 * isn't, and exits 2 when a file isn't pnpm audit output, for example when
 * the registry couldn't be reached.
 */
import { readFileSync } from "node:fs";

type Advisory = {
  module_name: string;
  severity: string;
  github_advisory_id: string;
  url: string;
  title: string;
  patched_versions: string;
  findings: { version: string; paths: string[] }[];
};

type Finding = {
  key: string;
  packageName: string;
  version: string;
  severity: string;
  advisory: string;
  url: string;
  title: string;
  fixedIn: string;
  paths: string[];
};

const severities = ["critical", "high"];

function fail(message: string): never {
  console.error(message);
  process.exit(2);
}

function readFindings(file: string): Finding[] {
  let audit: { advisories?: Record<string, Advisory>; error?: unknown };
  try {
    audit = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    fail(`Couldn't read ${file} as JSON: ${String(error)}`);
  }
  if (typeof audit?.advisories !== "object" || audit.advisories === null) {
    fail(
      `${file} isn't pnpm audit output: ${JSON.stringify(audit?.error ?? audit)}`,
    );
  }
  return Object.values(audit.advisories)
    .filter((advisory) => severities.includes(advisory.severity))
    .flatMap((advisory) =>
      advisory.findings.map((finding) => ({
        key: `${advisory.github_advisory_id} ${advisory.module_name}@${finding.version}`,
        packageName: advisory.module_name,
        version: finding.version,
        severity: advisory.severity,
        advisory: advisory.github_advisory_id,
        url: advisory.url,
        title: advisory.title,
        // The advisory database writes "no fix yet" as `<0.0.0`
        fixedIn:
          advisory.patched_versions === "<0.0.0"
            ? "no fix yet"
            : advisory.patched_versions,
        paths: finding.paths,
      })),
    );
}

// Keeps advisory text from breaking out of its table cell
const cell = (text: string) =>
  text.replaceAll("|", "\\|").replaceAll(/\s+/g, " ");

// pnpm writes a workspace package's path with `__` for `/`
const path = (paths: string[]) => {
  const shown = paths
    .slice(0, 3)
    .map((p) => `\`${p.replaceAll("__", "/")}\``)
    .join("<br>");
  return paths.length > 3 ? `${shown}<br>and ${paths.length - 3} more` : shown;
};

const [file, baseFile] = process.argv.slice(2);
if (!file) fail("Usage: node scripts/audit-report.mts <audit.json> [<base>]");

const known = new Set(baseFile ? readFindings(baseFile).map((f) => f.key) : []);
const findings = readFindings(file)
  .filter((finding) => !known.has(finding.key))
  .sort(
    (a, b) =>
      severities.indexOf(a.severity) - severities.indexOf(b.severity) ||
      a.packageName.localeCompare(b.packageName),
  );

if (findings.length > 0) {
  console.log("| Package | Severity | Advisory | Fixed in | Path |");
  console.log("| --- | --- | --- | --- | --- |");
  for (const f of findings) {
    console.log(
      `| \`${f.packageName}@${f.version}\` | ${f.severity} | [${f.advisory}](${f.url}): ${cell(f.title)} | \`${cell(f.fixedIn)}\` | ${path(f.paths)} |`,
    );
  }
  process.exit(1);
}
