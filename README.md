# SDLC Security Demo

A demo application with intentional vulnerabilities for testing CI/CD security scanning with Claude + Aikido.

## Intentional Vulnerabilities

This app contains the following vulnerabilities for testing:

| File | Vulnerability | Line |
|------|---------------|------|
| `src/routes/users.js` | SQL Injection | 8, 20 |
| `src/routes/users.js` | XSS | 33 |
| `src/routes/admin.js` | Hardcoded Credentials | 6-8 |
| `src/routes/admin.js` | Command Injection | 14, 26 |
| `src/routes/admin.js` | Path Traversal | 38 |
| `src/db/connection.js` | Hardcoded Credentials | 5-7 |

## Setup

### 1. Add GitHub Secrets

Go to your repo: **Settings → Secrets → Actions**

Add these secrets:

| Secret | Description |
|--------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `AIKIDO_API_KEY` | Your Aikido API key |

### 2. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/sdlc-security-demo.git
git add .
git commit -m "Initial commit with vulnerable demo app"
git push -u origin main
```

### 3. Test the Pipeline

1. Create a new branch:
   ```bash
   git checkout -b test/add-feature
   ```

2. Make a change to any `.js` file

3. Push and create a PR:
   ```bash
   git push -u origin test/add-feature
   ```

4. Open a PR to `main` and watch the security scan run

## Local Testing

Test the scan locally before pushing:

```bash
claude -p "Read src/routes/admin.js and scan it with aikido_full_scan" --allowedTools "mcp__aikido__aikido_full_scan,Read"
```

## Project Structure

```
sdlc-security-demo/
├── .github/
│   └── workflows/
│       └── security-scan.yml    # CI/CD pipeline
├── src/
│   ├── index.js                 # Express app entry
│   ├── db/
│   │   └── connection.js        # Database connection (vulnerable)
│   └── routes/
│       ├── users.js             # User routes (SQL injection, XSS)
│       └── admin.js             # Admin routes (command injection, secrets)
├── package.json
└── README.md
```

## Next Steps

After testing the basic scan, you can:

1. Add app context (`.security/app-spec.yaml`) for smarter risk assessment
2. Add PR commenting with scan results
3. Add auto-fix capabilities
4. Integrate with Linear/Jira for ticket creation
