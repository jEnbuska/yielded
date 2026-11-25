# Security policy

## Reporting a vulnerability

Report it privately, through the [**Report a vulnerability**](https://github.com/jEnbuska/yielded/security/advisories/new) form on the repository's Security tab. Only the maintainer, and anyone they add to the report, can see it. Never report a vulnerability in a public issue, pull request or discussion.

A good report contains:

- the affected version of `@jenbuska/yielded`;
- the steps to reproduce it;
- the impact: what an attacker could do, and what they need for it.

## Scope

In scope: the published package `@jenbuska/yielded`, and this repository's workflows and the way they publish it.

Out of scope: vulnerabilities in an application that uses the library, unless the library itself causes them, and social engineering.

## What to expect

Yielded is a personal open-source project. There is no bug bounty and no guaranteed response time, but every report is taken seriously. The fix is made privately, in the advisory's temporary private fork, released like any other change, and the advisory is published once the fixed version is on npm.

## Supported versions

Only the latest version on npm is supported. Fixes aren't backported.

## How the repository is checked

- **Dependencies:** the library has no runtime dependencies. The development dependencies are checked with `pnpm audit` in CI and weekly ([`audit.yml`](.github/workflows/audit.yml)).
- **Actions:** every action is pinned to a commit SHA, and Dependabot keeps them current.
- **Code:** GitHub's CodeQL code scanning is required: an alert blocks the merge.
- **Secrets:** GitHub's secret scanning is on, with push protection, and CI runs [gitleaks](https://github.com/gitleaks/gitleaks) over the commits of every PR and push.
