# Contributing to Auth0 MCP

First off, thank you for considering contributing to Auth0 MCP! It's people like you that make Auth0 MCP such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include any error messages or logs

### Suggesting Enhancements

If you have a suggestion for the project, we'd love to hear it! Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* A clear and descriptive title
* A detailed description of the proposed enhancement
* Examples of how the enhancement would be used
* Any potential drawbacks or considerations

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code follows the existing style
6. Issue that pull request!

## Development Process

1. Clone the repository
```bash
git clone https://github.com/yourusername/auth0-mcp.git
cd auth0-mcp
```

2. Install dependencies
```bash
npm install
```

3. Create a branch
```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/my-fix
```

4. Make your changes and commit them
```bash
git add .
git commit -m "Description of changes"
```

5. Push to your fork and submit a pull request
```bash
git push origin feature/my-feature
```

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### TypeScript Styleguide

* Use TypeScript for all new code
* Follow the existing code style
* Document all functions and complex code blocks
* Add types for all variables and function parameters
* Use interfaces over type aliases where possible
* Write tests for new functionality

### Documentation Styleguide

* Use [Markdown](https://guides.github.com/features/mastering-markdown/)
* Reference functions and classes in backticks: \`Auth0MCP\`
* Include code examples when relevant
* Keep documentation up to date with code changes

## Setting Up Your Development Environment

1. Install Node.js (version >= 18)
2. Install your preferred IDE (we recommend VS Code)
3. Install recommended extensions:
   * ESLint
   * Prettier
   * TypeScript and JavaScript Language Features

4. Configure your environment:
```bash
cp .env.example .env
# Edit .env with your Auth0 credentials
```

5. Start development server:
```bash
npm run dev
```

## Testing

* Write tests for all new features
* Run the test suite before submitting PRs
* Follow existing test patterns
* Include both unit and integration tests where appropriate

```bash
# Run all tests
npm test

# Run specific tests
npm test -- -t "test name"

# Run tests in watch mode
npm test -- --watch
```

## Additional Notes

### Issue and Pull Request Labels

* `bug` - Something isn't working
* `enhancement` - New feature or request
* `documentation` - Documentation only changes
* `good first issue` - Good for newcomers
* `help wanted` - Extra attention is needed
* `invalid` - Something's wrong
* `question` - Further information is requested
* `wontfix` - This will not be worked on

## Recognition

Contributors are recognized in our README.md and GitHub repository. We value every contribution, no matter how small!

## Questions?

Feel free to open an issue with your question or contact the maintainers directly.

Thank you for contributing to Auth0 MCP! 🎉
