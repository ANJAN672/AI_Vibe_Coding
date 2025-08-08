# Contributing to AGEN8

We welcome contributions to AGEN8! This document provides guidelines for contributing to the project.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our code of conduct:
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a professional environment

## 🚀 Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/ANJAN672/AI_Vibe_Coding.git
   cd AI_Vibe_Coding
   ```

2. **Set Up Development Environment**
   ```bash
   npm install
   cp .env.example .env.local
   # Configure your environment variables
   npm run dev
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add JSDoc comments for complex functions

### Component Guidelines

- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow naming conventions (PascalCase for components)
- Keep components small and focused
- Use Radix UI components when possible

### State Management

- Use Zustand for global state
- Keep local state when possible
- Implement proper error handling
- Use React Query for server state

## 🧪 Testing

- Write unit tests for utilities
- Test components with React Testing Library
- Ensure all tests pass before submitting PR
- Add integration tests for API routes

```bash
npm test
npm run type-check
npm run lint
```

## 📤 Submitting Changes

### Pull Request Process

1. **Update Documentation**
   - Update README.md if needed
   - Add/update JSDoc comments
   - Update CHANGELOG.md

2. **Test Your Changes**
   ```bash
   npm run build
   npm run type-check
   npm run lint
   ```

3. **Create Pull Request**
   - Use descriptive title
   - Explain changes in description
   - Link related issues
   - Add screenshots for UI changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## 🐛 Bug Reports

### Before Submitting

1. Check existing issues
2. Update to latest version
3. Test in clean environment

### Bug Report Template

```markdown
**Describe the Bug**
Clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Environment**
- OS: [e.g. Windows, macOS, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Node.js version: [e.g. 18.17.0]
- npm version: [e.g. 9.6.7]

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Before Submitting

1. Check if feature already exists
2. Search existing feature requests
3. Consider if it fits project scope

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Any other relevant information
```

## 🏗️ Architecture

### Project Structure

```
agen8/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application
├── components/            # React components
│   ├── ui/               # Base UI components
│   └── ...               # Feature components
├── docs/                 # Documentation
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── store/                # Zustand stores
└── types/                # TypeScript definitions
```

### Key Technologies

- **Next.js 14**: App Router, API Routes
- **React**: Functional components, hooks
- **TypeScript**: Strict typing
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible components
- **Zustand**: State management
- **Supabase**: Database and auth

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://radix-ui.com)

## 🆘 Getting Help

- Open an issue for bugs or questions
- Join our Discord community
- Check existing documentation
- Review closed issues for solutions

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AGEN8! 🚀
