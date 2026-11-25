/**
 * Rebases every open, ready PR into a base branch that has fallen behind it,
 * the same as "Update with rebase" on the PR, unless it conflicts. The
 * `rebase-prs` skill (SKILL.md next to this file) runs it from the root:
 * `node .claude/skills/rebase-prs/rebase-prs.mts` for PRs into `dev`, with
 * `main` for PRs into `main`, and `--dry-run` to only print what it would do.
 *
 * It acts as whoever `gh` is signed in as. Pushes made with a user's login
 * start CI, so the rebased PRs get their checks again, with no GitHub App or
 * token.
 */
import { execFileSync } from "node:child_process";
import { parseArgs } from "node:util";

type PullRequest = {
  id: string;
  number: number;
  isDraft: boolean;
  isCrossRepository: boolean;
  headRefName: string;
  headRefOid: string;
  author: { login: string } | null;
  mergeable: "MERGEABLE" | "CONFLICTING" | "UNKNOWN";
  mergeStateStatus: string;
};

type Comment = { id: number; body: string; user: { login: string } | null };

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { "dry-run": { type: "boolean", default: false } },
});
const base = positionals[0] ?? "dev";
const dryRun = values["dry-run"];

const conflictMarker = "<!-- rebase-prs:conflict -->";
const resolvedMarker = "<!-- rebase-prs:resolved -->";

function gh(args: string[]): string {
  return execFileSync("gh", args, { encoding: "utf8" });
}

function graphql<T>(query: string, variables: Record<string, string | number>) {
  const args = ["api", "graphql", "-f", `query=${query}`];
  for (const [name, value] of Object.entries(variables)) {
    // -F sends a number as a number, -f always sends a string
    args.push(typeof value === "number" ? "-F" : "-f", `${name}=${value}`);
  }
  return JSON.parse(gh(args)).data as T;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const { owner, name: repo } = JSON.parse(
  gh(["repo", "view", "--json", "owner,name"]),
) as { owner: { login: string }; name: string };
const repoPath = `repos/${owner.login}/${repo}`;
const viewer = gh(["api", "user", "--jq", ".login"]).trim();

const prFields = `
  id number isDraft isCrossRepository headRefName headRefOid author { login }
  mergeable mergeStateStatus
`;

function openPullRequests() {
  const prs: PullRequest[] = [];
  let cursor = "";
  do {
    type Page = {
      repository: {
        pullRequests: {
          pageInfo: { hasNextPage: boolean; endCursor: string };
          nodes: PullRequest[];
        };
      };
    };
    const page = graphql<Page>(
      `query ($owner: String!, $repo: String!, $base: String!, $cursor: String) {
        repository(owner: $owner, name: $repo) {
          pullRequests(states: OPEN, baseRefName: $base, first: 50, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            nodes { ${prFields} }
          }
        }
      }`,
      { owner: owner.login, repo, base, ...(cursor ? { cursor } : {}) },
    ).repository.pullRequests;
    prs.push(...page.nodes);
    cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : "";
  } while (cursor);
  return prs;
}

function fetchPullRequest(number: number) {
  type Result = { repository: { pullRequest: PullRequest } };
  return graphql<Result>(
    `query ($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $number) { ${prFields} }
      }
    }`,
    { owner: owner.login, repo, number },
  ).repository.pullRequest;
}

// GitHub works out whether a PR conflicts in the background after its base
// moves, and answers UNKNOWN until then.
async function pullRequest(number: number) {
  for (let attempt = 1; ; attempt++) {
    const pr = fetchPullRequest(number);
    if (pr.mergeable !== "UNKNOWN" || attempt === 12) return pr;
    await sleep(5000);
  }
}

// The open conflict comment this script left on the PR, if there is one.
function conflictComment(number: number) {
  const pages = JSON.parse(
    gh([
      "api",
      "--paginate",
      "--slurp",
      `${repoPath}/issues/${number}/comments?per_page=100`,
    ]),
  ) as Comment[][];
  return pages
    .flat()
    .findLast(
      (c) => c.user?.login === viewer && c.body.includes(conflictMarker),
    );
}

// One comment per conflict: it's posted when the PR starts conflicting and
// edited once it no longer does, so the next conflict gets a new comment.
function reportConflict(pr: PullRequest) {
  if (conflictComment(pr.number)) {
    console.log(`#${pr.number}: conflicts, already commented`);
    return;
  }
  if (dryRun) {
    console.log(`#${pr.number}: conflicts, would comment`);
    return;
  }
  const body = [
    conflictMarker,
    `This PR conflicts with \`${base}\`, so it couldn't be rebased automatically. Rebase it yourself and push:`,
    "",
    "```bash",
    "git fetch origin",
    `git rebase origin/${base}`,
    "git push --force-with-lease",
    "```",
    "",
    "This comment is updated once the PR no longer conflicts.",
  ].join("\n");
  gh(["api", `${repoPath}/issues/${pr.number}/comments`, "-f", `body=${body}`]);
  console.log(`#${pr.number}: conflicts, commented`);
}

function clearConflict(pr: PullRequest) {
  const comment = conflictComment(pr.number);
  if (!comment || dryRun) return;
  gh([
    "api",
    "-X",
    "PATCH",
    `${repoPath}/issues/comments/${comment.id}`,
    "-f",
    `body=${resolvedMarker}\nThis PR no longer conflicts with \`${base}\`.`,
  ]);
}

function behindBy(pr: PullRequest) {
  return Number(
    gh([
      "api",
      `${repoPath}/compare/${base}...${pr.headRefOid}?per_page=1`,
      "--jq",
      ".behind_by",
    ]),
  );
}

// The mutation returns at once, with the old head, and GitHub rebases the
// branch a few seconds later. A rebase that fails then, on a conflict the
// merge check didn't see, leaves the head where it was.
async function rebase(pr: PullRequest) {
  if (dryRun) {
    console.log(`#${pr.number}: would rebase`);
    return;
  }
  try {
    graphql(
      `
        mutation ($id: ID!, $head: GitObjectID!) {
          updatePullRequestBranch(
            input: {
              pullRequestId: $id
              expectedHeadOid: $head
              updateMethod: REBASE
            }
          ) {
            clientMutationId
          }
        }
      `,
      { id: pr.id, head: pr.headRefOid },
    );
  } catch (error) {
    console.warn(`#${pr.number}: rebase refused: ${String(error)}`);
    // Refused because someone pushed first: the next run looks at it again
    if (fetchPullRequest(pr.number).headRefOid !== pr.headRefOid) {
      console.log(`#${pr.number}: someone pushed to it meanwhile, skipped`);
    } else {
      reportConflict(pr);
    }
    return;
  }
  for (let attempt = 0; attempt < 20; attempt++) {
    await sleep(3000);
    const now = fetchPullRequest(pr.number);
    if (now.headRefOid !== pr.headRefOid) {
      // expectedHeadOid makes the rebase fail if someone pushed first, so
      // a new head that isn't up to date is their push, not the rebase.
      if (behindBy(now) > 0) {
        console.log(`#${pr.number}: someone pushed to it meanwhile, skipped`);
        return;
      }
      console.log(`#${pr.number}: rebased, new head ${now.headRefOid}`);
      clearConflict(pr);
      return;
    }
  }
  reportConflict(pr);
}

// Dependabot's version updates (.github/dependabot.yml). GraphQL names the
// bot `dependabot`, without `[bot]`.
function isDependabot(pr: PullRequest) {
  return (
    pr.author?.login === "dependabot" &&
    pr.headRefName.startsWith("dependabot/")
  );
}

// Dependabot stops updating a PR once someone else has pushed to its branch,
// so it's asked to rebase its own PR instead. Its push starts CI as usual.
function askDependabotToRebase(pr: PullRequest) {
  if (dryRun) {
    console.log(`#${pr.number}: Dependabot PR, would ask Dependabot to rebase`);
    return;
  }
  gh([
    "api",
    `${repoPath}/issues/${pr.number}/comments`,
    "-f",
    "body=@dependabot rebase",
  ]);
  console.log(`#${pr.number}: Dependabot PR, asked Dependabot to rebase`);
}

let failed = 0;
for (const listed of openPullRequests()) {
  const number = listed.number;
  // Drafts are still being worked on, and a rebase would make the author's
  // next push fail. They can't merge anyway, and the author rebases before
  // marking the PR ready.
  if (listed.isDraft) {
    console.log(`#${number}: draft, skipped`);
    continue;
  }
  // Rebasing a fork's branch needs the fork's permission.
  if (listed.isCrossRepository) {
    console.log(`#${number}: from a fork, skipped`);
    continue;
  }
  // The release PR from dev into main: rebasing it would rewrite dev, and
  // main only ever fast-forwards to dev anyway.
  if (listed.headRefName === "dev") {
    console.log(`#${number}: release PR, skipped`);
    continue;
  }

  try {
    const pr = await pullRequest(number);
    console.log(
      `#${number}: mergeable ${pr.mergeable}, merge state ${pr.mergeStateStatus}`,
    );
    if (pr.mergeable === "UNKNOWN") {
      console.warn(`#${number}: GitHub didn't say whether it conflicts`);
      failed++;
      continue;
    }
    if (pr.mergeable === "CONFLICTING") {
      if (isDependabot(pr)) askDependabotToRebase(pr);
      else reportConflict(pr);
      continue;
    }
    const behind = behindBy(pr);
    if (behind === 0) {
      console.log(`#${number}: up to date`);
      clearConflict(pr);
      continue;
    }
    if (isDependabot(pr)) {
      askDependabotToRebase(pr);
      continue;
    }
    console.log(`#${number}: ${behind} commits behind ${base}, rebasing`);
    await rebase(pr);
  } catch (error) {
    failed++;
    console.error(`#${number}: ${String(error)}`);
  }
}
if (failed) {
  console.error(`${failed} PRs couldn't be handled, see above`);
  process.exitCode = 1;
}
