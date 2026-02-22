# Contributing to Yielded

Thank you for your interest in contributing to Yielded! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Code Style](#code-style)
- [Submitting Changes](#submitting-changes)
- [Project Structure](#project-structure)
- [Local Testing with npm link](#local-testing-with-npm-link)
- [Example Projects](#example-projects)
- [Beta / Pre-release Process](#beta--pre-release-process)
- [Release Process](#release-process)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. We expect all contributors to:

- Be respectful and considerate of others
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/yielded.git
   cd yielded
   ```
3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/jEnbuska/yielded.git
   ```

## Development Setup

### Prerequisites

- Node.js 20 or higher
- npm (comes with Node.js)

### Installation

Install dependencies:

```bash
npm ci
```

### Available Scripts

- `npm run validate` - Run TypeScript type checking
- `npm run validate:watch` - Run TypeScript type checking in watch mode
- `npm run build` - Remove `dist`, then build the project (compiles TypeScript)
- `npm run link` - Build the project and register it globally via `npm link` for local testing
- `npm test` - Run all tests with coverage
- `npm run test:watch` - Run tests in watch mode with UI
- `npm run lint` - Check code for linting errors
- `npm run lint:fix` - Automatically fix linting errors
- `npm run prettier` - Check code formatting
- `npm run prettier:write` - Format code

## Making Changes

### Creating a Branch

Create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Use descriptive branch names:
- `feature/` for new features
- `fix/` for bug fixes
- `docs/` for documentation changes
- `test/` for test additions or modifications
- `refactor/` for code refactoring

### Coding Guidelines

1. **TypeScript**: All code must be written in TypeScript with proper type annotations
2. **Lazy Evaluation**: Maintain the lazy evaluation principle - operations should not execute until consumed
3. **Memory Efficiency**: Ensure operations process one item at a time without creating intermediate arrays
4. **Error Handling**: Provide clear error messages with helpful context
5. **Documentation**: Document all public APIs with JSDoc comments including:
   - Description of what the function does
   - `@example` showing typical usage
   - Links to MDN documentation for native Iterator methods (when applicable)

### Example Code Structure

```typescript
export interface IYieldedOperation<T, TFlow extends IYieldedFlow> {
  /**
   * Brief description of what this operation does.
   *
   * More detailed explanation if needed, including any important
   * behavioral notes or edge cases.
   *
   * @example
   * ```ts
   * Yielded.from([1, 2, 3])
   *   .operation()
   *   .toArray() // Expected output
   * ```
   */
  operation(param: Type): INextYielded<TOut, TFlow>;
}
```

## Testing

### Writing Tests

All new features and bug fixes must include tests. We use Vitest for testing.

1. **Test Location**: Place tests in the `tests/` directory, mirroring the source structure
2. **Test Coverage**: Aim for high test coverage of new code
3. **Test Types**: Include tests for:
   - Synchronous operations
   - Asynchronous operations
   - Parallel operations
   - Edge cases (empty iterators, single items, etc.)
   - Error conditions

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx vitest run tests/path/to/test.test.ts
```

### Stress Tests

When adding features that handle large datasets, include stress tests in `tests/stress/`:

```typescript
test("should handle large dataset", () => {
  const size = 100_000;
  const result = Yielded.from(function* () {
    for (let i = 0; i < size; i++) {
      yield i;
    }
  }())
    .operation()
    .take(10)
    .toArray();
  
  expect(result).toHaveLength(10);
});
```

## Code Style

### Linting and Formatting

This project uses ESLint and Prettier to maintain code quality and consistency.

**Before committing**, ensure your code passes all checks:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Check formatting
npm run prettier

# Format code
npm run prettier:write

# Validate TypeScript types
npm run validate
```

### Naming Conventions

- **Variables/Functions**: camelCase (`myVariable`, `myFunction`)
- **Classes/Interfaces**: PascalCase (`MyClass`, `IMyInterface`)
- **Types**: PascalCase (`MyType`)
- **Constants**: UPPER_SNAKE_CASE for true constants, camelCase for config objects
- **Private Class Members**: Prefix with `#` (`#privateMethod`)

## Submitting Changes

### Before Submitting

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all checks**:
   ```bash
   npm run lint
   npm run prettier
   npm run validate
   npm test
   npm run build
   ```

3. **Commit your changes** with clear, descriptive messages:
   ```bash
   git commit -m "Add feature: description of what you added"
   ```

### Commit Message Guidelines

Write clear and meaningful commit messages:

- Use the imperative mood ("Add feature" not "Added feature")
- Keep the first line under 50 characters
- Provide detailed explanation in the body if needed
- Reference issue numbers when applicable

Examples:
```
Add parallel processing support for flatMap

Implements configurable concurrency for async operations
in flatMap, allowing up to 50 parallel operations.

Fixes #123
```

### Creating a Pull Request

1. **Push your branch**:
   ```bash
   git push origin your-branch-name
   ```

2. **Create a Pull Request** on GitHub

3. **PR Description** should include:
   - What changes were made and why
   - How to test the changes
   - Links to related issues
   - Screenshots (for UI changes)
   - Breaking changes (if any)

4. **PR Checklist**:
   - [ ] Code follows the project's style guidelines
   - [ ] Tests added/updated and passing
   - [ ] Documentation updated (if applicable)
   - [ ] No new linting errors
   - [ ] Build succeeds
   - [ ] All CI checks pass

### PR Review Process

- Maintainers will review your PR and may request changes
- Address feedback by pushing new commits to your branch
- Once approved, a maintainer will merge your PR

## Project Structure

```
yielded/
├── src/
│   ├── async/          # Async iterator implementations
│   ├── generators/     # Generator operations (map, filter, etc.)
│   │   ├── apply/      # Operation implementations
│   │   ├── async/      # Async generator types
│   │   ├── parallel/   # Parallel processing
│   │   └── sync/       # Sync generator types
│   ├── general/        # Shared utilities and types
│   ├── parallel/       # Parallel iterator implementations
│   ├── resolvers/      # Terminal operations (toArray, reduce, etc.)
│   │   ├── apply/      # Resolver implementations
│   │   ├── async/      # Async resolvers
│   │   ├── parallel/   # Parallel resolvers
│   │   └── sync/       # Sync resolvers
│   ├── sync/           # Sync iterator implementations
│   └── index.ts        # Main entry point
├── tests/              # Test files
│   ├── generators/     # Generator tests
│   ├── resolvers/      # Resolver tests
│   ├── stress/         # Stress tests for large datasets
│   └── utils/          # Test utilities
├── dist/               # Compiled output (generated)
├── README.md           # Project documentation
└── CONTRIBUTING.md     # This file
```

## Local Testing with npm link

Before publishing a new version, you can verify the package works correctly in a real consumer project using `npm link`. This creates a symlink from the global `node_modules` to your local build, letting you test the built output as if it were installed from the registry.

### Step 1 — Build and link the package

In the `yielded` repository directory, run:

```bash
npm run link
```

This runs `npm run build` (which removes the existing `dist`, recompiles JavaScript with `tsup`, and emits TypeScript declarations with `tsc`) and then registers the package globally via `npm link`.

### Step 2 — Link into a consumer project

In the directory of the project you want to test with, run:

```bash
npm link @jenbuska/yielded
```

This replaces the installed copy with a symlink to your local build. You can now import from `@jenbuska/yielded` and see your local changes immediately after each `npm run build`.

### Step 3 — Verify the integration

Write or run whatever tests exist in the consumer project. Typical things to check:

- TypeScript types resolve correctly (run `tsc --noEmit` in the consumer)
- Runtime behavior matches expectations
- Tree-shaking / bundling works as expected with your build toolchain

### Step 4 — Clean up

Once you are done, remove the link from the consumer project and restore the published version:

```bash
# In the consumer project
npm unlink @jenbuska/yielded
npm install

# In the yielded repo (remove the global link)
npm unlink
```

## Example Projects

Two self-contained example projects live in `examples/`. Both reference the local package via `"@jenbuska/yielded": "file:../../"` so they work with or without `npm link`.

### `examples/node-ts` — Barebones Node TypeScript

Verifies that the package works in a plain Node.js environment. Runs sync and async pipelines and prints the results.

```bash
cd examples/node-ts
npm install
npm run build   # tsc compile
npm start       # node dist/index.js
```

### `examples/react-vite` — Vite + React + TypeScript

A minimal React app with a counter button. Each click uses Yielded internally to derive the new state. Includes a **Playwright browser test suite** that tests against Chromium, Firefox, WebKit (Safari), and Edge.

```bash
cd examples/react-vite
npm install
npm run build   # type-check + vite build
npm test        # build + install Playwright browsers + run tests (Chromium, Firefox, WebKit, Edge)
npm run dev     # start dev server
```

> **Note:** `npm test` automatically downloads the required Playwright-managed browsers the first time it runs via `npm run install:browsers`. On subsequent runs, Playwright skips the download if the browsers are already cached — so there is no overhead after the first install. **Edge** is not downloaded by this script; its tests run only when Microsoft Edge is installed on the system, and are skipped otherwise.

#### Playwright tests

The tests live in `examples/react-vite/tests/app.spec.ts`. Playwright's `webServer` option starts `vite preview` automatically before the tests and shuts it down afterwards — no manual server management needed. For each browser the tests check:

- The app loads and shows an initial count of `0`
- Clicking the **Increment** button updates the count to `1`
- Three clicks update the count to `3` and the items list shows the correct doubled values `[2, 4, 6]`

Browsers tested:

| Project | Engine | Equivalent to |
|---------|--------|---------------|
| Chromium | Blink | Chrome |
| Firefox | Gecko | Firefox |
| WebKit (Safari) | WebKit | Safari |
| Edge | Blink | Microsoft Edge (system-installed; tests run only if Edge is present) |

To run the example tests from the repository root (browsers are installed automatically):

```bash
npm run test:examples
```

## Beta / Pre-release Process

Beta releases allow users to test upcoming features before a final release. They are published to npm under the `beta` dist-tag so that a plain `npm install @jenbuska/yielded` **never** installs a beta version.

### Publishing a Beta

1. **Set the pre-release version** in `package.json`:
   ```bash
   # First beta for an upcoming minor release
   npm version 2.1.0-beta.0 --no-git-tag-version

   # Increment beta counter for subsequent fixes
   npm version 2.1.0-beta.1 --no-git-tag-version
   ```

2. **Run all checks**:
   ```bash
   npm run check-all
   ```

3. **Publish with the `beta` tag**:
   ```bash
   npm run publish:beta
   ```
   This runs `npm publish --tag beta --access public`. The `prepublishOnly` hook builds the package automatically before publishing.

4. **Verify the tag on npm**:
   ```bash
   npm dist-tag ls @jenbuska/yielded
   # Expected output:
   #   beta: 2.1.0-beta.0
   #   latest: 2.0.0
   ```
   The `latest` tag must still point to the last stable release — do **not** pass `--tag latest` during a beta publish.

5. **Commit and push** the version bump:
   ```bash
   git add package.json package-lock.json CHANGELOG.md
   git commit -m "chore: 2.1.0-beta.0"
   git push
   ```

### Installing a Beta

Users can opt in to a beta version explicitly. A plain install will never pick up a beta release.

```bash
# Install the latest beta
npm install @jenbuska/yielded@beta

# Install a specific beta version
npm install @jenbuska/yielded@2.1.0-beta.0

# Check which version you have installed
npm ls @jenbuska/yielded
```

To go back to the latest stable release:
```bash
npm install @jenbuska/yielded@latest
```

### Promoting a Beta to Stable

Once the beta has been validated, promote it to stable by:

1. Remove the pre-release suffix from the version (`2.1.0-beta.0` → `2.1.0`):
   ```bash
   npm version 2.1.0 --no-git-tag-version
   ```
2. Follow the standard [Release Process](#release-process) steps.
3. After publishing stable, move the `beta` dist-tag forward (optional):
   ```bash
   npm dist-tag add @jenbuska/yielded@2.1.0 beta
   ```

---

## Release Process

Releases are managed by project maintainers. Since `main` and `release/*` branches are protected and require PRs, follow this workflow:

### Prerequisites

1. Ensure you have npm publish permissions for the `@jenbuska/yielded` package
2. Authenticate with npm:
   ```bash
   npm login
   ```

### Publishing Steps

1. **Create a release branch** from main:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b release/vX.Y.Z
   ```

2. **Ensure all tests pass**:
   ```bash
   npm run lint
   npm run prettier
   npm run validate
   npm test
   npm run build
   ```

3. **Update version in `package.json`**:
   ```bash
   # For patch releases (bug fixes)
   npm version patch --no-git-tag-version
   
   # For minor releases (new features, backward compatible)
   npm version minor --no-git-tag-version
   
   # For major releases (breaking changes)
   npm version major --no-git-tag-version
   ```
   Note: We use `--no-git-tag-version` to prevent automatic tagging; tags are created after merge.

4. **Update CHANGELOG.md** with release notes describing changes

5. **Commit version bump and changelog**:
   ```bash
   git add package.json package-lock.json CHANGELOG.md
   git commit -m "Release vX.Y.Z"
   git push origin release/vX.Y.Z
   ```

6. **Create a Pull Request**:
   - Go to https://github.com/jEnbuska/yielded/pulls
   - Create PR from `release/vX.Y.Z` to `main`
   - Title: "Release vX.Y.Z"
   - Description: Include CHANGELOG content for this release
   - Get approval and merge the PR

7. **After PR is merged, create git tag and publish**:
   ```bash
   git checkout main
   git pull origin main
   git tag vX.Y.Z
   git push origin refs/tags/vX.Y.Z
   
   # Publish to npm as a public scoped package
   npm publish --access public
   ```
   Note: The `prepublishOnly` script will automatically build the package before publishing.

8. **Create GitHub release**:
   - Go to https://github.com/jEnbuska/yielded/releases/new
   - Select tag `vX.Y.Z`
   - Title: "vX.Y.Z"
   - Description: Include CHANGELOG content
   - Publish release

9. **Clean up** (optional):
   ```bash
   git branch -d release/vX.Y.Z
   git push origin --delete release/vX.Y.Z
   ```

### What Gets Published

The npm package includes:
- `dist/` - Compiled JavaScript and TypeScript definitions
- `README.md` - Package documentation
- `LICENSE` - MIT License
- `package.json` - Package metadata

Source files, tests, and development configurations are excluded (see `.npmignore`).

## Questions?

If you have questions or need help:

- Open an issue on GitHub
- Check existing issues and discussions
- Review the README.md for API documentation

## Recognition

Contributors will be recognized in the project's README and release notes.

Thank you for contributing to Yielded! 🎉
