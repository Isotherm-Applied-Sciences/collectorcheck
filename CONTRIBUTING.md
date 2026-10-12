# Contributing to CollectorCheck

Thank you for your interest in contributing to CollectorCheck, the free, open‑source receipt verification gateway tool
maintained by Isotherm Applied Sciences Inc.

 We welcome contributions of all kinds — bug fixes, new features, documentation, testing, and discussion.



## How to Contribute

### 1. Fork the Repository
Create your own copy of the project:
https://github.com/Isotherm-Applied-Sciences/collectorcheck

Click “Fork” in the top‑right corner.

### 2. Create a Feature Branch
Use a clear, descriptive branch name:
feature/add-verification-metrics
fix/upload-handler-timeout
docs/update-readme
refactor/metadata-parser

### 3. Make Your Changes
Follow the project structure:

collectorcheck/
    backend/
        app.py
        routes/
        services/
        models/
        utils/
        tests/
    frontend/
        index.html
        static/
        css/
        js/
        components/
    database/
        collectorcheck.db
    uploads/
        (temporary receipt files)
    logs/
    README.md
    LICENSE
    .gitignore

Guidelines:
- Keep functions small and focused
- Write clear, readable code
- Add comments where logic is non‑obvious
- Follow existing naming conventions
- Avoid introducing new dependencies unless necessary

### 4. Add Tests (If Applicable)
Place backend tests in:
backend/tests/

If your change affects verification logic, tests are required.

### 5. Run the Project Locally
Backend:
python backend/app.py

Frontend:
Open frontend/index.html

Ensure your changes work end‑to‑end.

### 6. Commit Your Changes
Use clear commit messages:
Add metadata checksum validation to verification pipeline

Avoid vague messages like “fix stuff”.

### 7. Push Your Branch
git push origin feature/add-verification-metrics

### 8. Open a Pull Request
Go to your fork and click:
Compare & pull request

Provide:
- A clear summary of the change
- Why it’s needed
- Any relevant screenshots or logs
- Notes for reviewers

---

## Pull Request Review Process
Your PR will be reviewed for:
- Code clarity
- Architectural consistency
- Security considerations
- Performance impact
- Documentation completeness
- Test coverage (if applicable)

You may be asked to make adjustments — this is normal.

Once approved, your PR will be merged into main.

---

## Issue Reporting
If you find a bug, please open an issue with:
- A clear title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots or logs (if relevant)

Use the built‑in issue templates:
- Bug Report
- Feature Request
- Good First Issue

---

## Roadmap & Future Work
CollectorCheck’s roadmap is maintained in:
ROADMAP.md

If you want to contribute to roadmap items, comment on the issue or open a PR referencing the roadmap section.

---

## Development Philosophy
CollectorCheck follows a minimal‑systems philosophy:
- Small modules
- Clear boundaries
- Deterministic behavior
- No unnecessary complexity
- Easy for new contributors
- Easy to audit and verify

Build small tools that do one thing well.

---

## License
CollectorCheck is released under the MIT License.
By contributing, you agree that your contributions will be licensed under MIT.

---

## Maintainers
Isotherm Applied Sciences Inc.
Ottawa, Canada
