# Contributing to React Native Modal Sheet

Thank you for your interest in contributing! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

- Use the bug report template
- Provide a clear description of the issue
- Include steps to reproduce
- Share your environment details (OS, device, RN version, etc.)
- Add code samples and screenshots if possible

### Suggesting Features

Feature requests are welcome! Please:

- Use the feature request template
- Explain the use case clearly
- Describe the proposed solution
- Consider if it fits the project's scope

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following the code style guidelines
3. **Test thoroughly** on both iOS and Android
4. **Update documentation** if needed
5. **Write clear commit messages** following conventional commits
6. **Submit a pull request** using the PR template

#### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ModalSheet.git
cd ModalSheet

# Install dependencies
npm install

# Start the demo app
npm start

# Build the package
cd react-native-modal-sheet
npm run build
```

#### Code Style

- Follow the existing code style
- Use TypeScript for type safety
- Write meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small

#### Testing

- Test on both iOS and Android
- Test with Expo Go and bare React Native
- Verify accessibility features work
- Check gesture handling thoroughly

#### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
refactor: restructure code
test: add tests
chore: update dependencies
```

#### Publishing Process

Only maintainers can publish new versions:

1. Update version in `react-native-modal-sheet/package.json`
2. Update `CHANGELOG.md` with changes
3. Build: `npm run build`
4. Test: verify build works
5. Publish: `npm publish`
6. Tag: `git tag v1.0.x && git push --tags`

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Enforcement

Unacceptable behavior may result in temporary or permanent ban from the project.

## Questions?

- Check existing issues and discussions
- Create a new issue with the question template
- Reach out to maintainers if needed

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
