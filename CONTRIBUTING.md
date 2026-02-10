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
- `npm run build` - Build the project (compiles TypeScript)
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

## Release Process

Releases are managed by project maintainers. The process includes:

### Prerequisites

1. Ensure you have npm publish permissions for the `yielded` package
2. Authenticate with npm:
   ```bash
   npm login
   ```

### Publishing Steps

1. **Ensure all tests pass**:
   ```bash
   npm run lint
   npm run prettier
   npm run validate
   npm test
   ```

2. **Update version in `package.json`**:
   ```bash
   # For patch releases (bug fixes)
   npm version patch
   
   # For minor releases (new features, backward compatible)
   npm version minor
   
   # For major releases (breaking changes)
   npm version major
   ```

3. **Update CHANGELOG.md** with release notes describing changes

4. **Commit version bump and changelog**:
   ```bash
   git add package.json package-lock.json CHANGELOG.md
   git commit -m "Release v1.0.0"
   git tag v1.0.0
   ```

5. **Build and publish to npm**:
   ```bash
   npm publish
   ```
   Note: The `prepublishOnly` script will automatically build the package before publishing.

6. **Push changes and tags to GitHub**:
   ```bash
   git push origin main
   git push origin v1.0.0
   ```

7. **Create GitHub release** with release notes at https://github.com/jEnbuska/yielded/releases/new

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
