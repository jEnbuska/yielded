/**
 * A knip reporter that runs after the default one (see the `knip` script in
 * package.json) and explains each finding: what knip saw and how to fix it.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Issue, IssueType, Reporter } from "knip";

type Explanation = {
  why: (issue: Issue) => string;
  fix: (issue: Issue, packageName: string) => string;
};

const unusedExport: Explanation = {
  why: (issue) =>
    `\`${issue.symbol}\` is exported, but no other file imports it.`,
  fix: () =>
    "Remove `export` if this file still uses it, or delete it if nothing does.",
};

const unusedDependency = (field: string): Explanation => ({
  why: (issue) =>
    `\`${issue.symbol}\` is in this package's ${field}, but nothing in the package imports it or runs it.`,
  fix: (issue, packageName) =>
    `Remove it from the root with \`pnpm remove ${issue.symbol} --filter ${packageName}\`.`,
});

const explanations: Partial<Record<IssueType, Explanation>> = {
  files: {
    why: () =>
      "No entry point imports this file, directly or through other files.",
    fix: () => "Delete the file, or import it where it's needed.",
  },
  dependencies: unusedDependency("dependencies"),
  devDependencies: unusedDependency("devDependencies"),
  unlisted: {
    why: (issue) =>
      `\`${issue.symbol}\` is imported here, but this package's package.json doesn't list it.`,
    fix: (issue, packageName) =>
      `Add it from the root with \`pnpm add ${issue.symbol} --filter ${packageName}\`.`,
  },
  binaries: {
    why: (issue) =>
      `A script runs \`${issue.symbol}\`, but no dependency of this package provides it.`,
    fix: () => "Add the package that provides it, or change the script.",
  },
  unresolved: {
    why: (issue) => `The import \`${issue.symbol}\` doesn't resolve to a file.`,
    fix: () =>
      "Fix the import path, or the alias or `exports` map it relies on.",
  },
  exports: unusedExport,
  types: unusedExport,
  nsExports: unusedExport,
  nsTypes: unusedExport,
  enumMembers: {
    why: (issue) =>
      `The enum member \`${issue.parentSymbol}.${issue.symbol}\` isn't used anywhere.`,
    fix: () => "Delete the member.",
  },
  duplicates: {
    why: (issue) =>
      `The same value is exported under more than one name: ${(issue.symbols ?? []).map((s) => `\`${s.symbol}\``).join(", ")}.`,
    fix: () => "Keep one name and update the imports of the others.",
  },
};

/** The package's name from its package.json, for `pnpm --filter` */
function readPackageName(cwd: string, workspace: string) {
  try {
    const manifest = readFileSync(join(cwd, workspace, "package.json"), "utf8");
    return JSON.parse(manifest).name ?? workspace;
  } catch {
    return workspace || "<package>";
  }
}

function describe(issue: Issue, type: IssueType, cwd: string) {
  const path = issue.filePath.replace(`${cwd}/`, "");
  const location = issue.line ? `${path}:${issue.line}:${issue.col}` : path;
  const explanation = explanations[type];
  if (!explanation) {
    return [
      location,
      `  \`${issue.symbol}\` (${type})`,
      "  See https://knip.dev/reference/issue-types",
    ];
  }
  const name = readPackageName(cwd, issue.workspace);
  return [
    location,
    `  ${explanation.why(issue)}`,
    `  Fix: ${explanation.fix(issue, name)}`,
  ];
}

const explain: Reporter = ({ report, issues, cwd }) => {
  const findings: string[][] = [];
  for (const [type, isReported] of Object.entries(report)) {
    if (!isReported) continue;
    for (const issuesInFile of Object.values(issues[type as IssueType])) {
      for (const issue of Object.values(issuesInFile)) {
        findings.push(describe(issue, type as IssueType, cwd));
      }
    }
  }
  if (findings.length === 0) return;
  console.log(
    [
      "",
      "What knip found and how to fix it:",
      ...findings.flatMap((lines) => ["", ...lines]),
      "",
      "If something is needed on purpose, ignore it in knip.json with a comment saying why.",
    ].join("\n"),
  );
};

export default explain;
