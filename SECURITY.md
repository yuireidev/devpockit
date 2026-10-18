# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisories** (Preferred):
   - Go to [Security Advisories](https://github.com/yuireidev/devpockit/security/advisories/new)
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **Email**: If you prefer email, please contact the maintainers directly

### What to Include

When reporting a vulnerability, please include:
- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- The location of the affected code
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Depends on severity and complexity

### Disclosure Policy

- We will acknowledge receipt of your vulnerability report
- We will confirm the issue and determine affected versions
- We will release a fix as soon as possible
- We will credit you for the discovery (unless you prefer to remain anonymous)

## Security Measures

### Client-Side Security

DevPockit is a client-side application. All processing happens in the user's browser:

- **No Data Transmission**: No user data is sent to servers
- **No Backend**: No server-side code that could be exploited
- **Privacy First**: All tools run locally in the browser

### Input Validation

- All user inputs are validated before processing
- XSS prevention through React's built-in escaping
- No use of `eval()` or similar dangerous functions
- Content Security Policy (CSP) can be configured

### Dependencies

- Dependencies are regularly updated via Dependabot
- Security vulnerabilities are monitored via GitHub Security
- CodeQL analysis runs on every push

### Environment Variables

#### Optional Frontend Variables

Environment variables are optional for this client-side application:

- `NEXT_PUBLIC_APP_NAME`: Application name (defaults to "DevPockit")
- `NEXT_PUBLIC_APP_VERSION`: Application version (defaults to package.json version)

**Note**: Since this is a client-side app, there are no secrets or sensitive environment variables required.

## 🔒 Security Best Practices

### For Users

- **HTTPS Only**: Always access the application over HTTPS
- **Browser Updates**: Keep your browser updated
- **Privacy**: All processing is local - no data leaves your browser

### For Developers

- **Dependencies**: Keep dependencies updated
- **Code Review**: Review all code changes for security issues
- **Input Validation**: Always validate user inputs
- **No Secrets**: Never commit secrets or API keys
- **Security Headers**: Configure appropriate security headers if deploying

### Content Security Policy

If deploying, consider adding CSP headers:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';
```

### Environment Security

- Never commit `.env` files to version control
- Use `.gitignore` to exclude sensitive files
- Review all environment variables before deployment

## 🛡️ Security Checklist

### Before Deployment
- [ ] No hardcoded secrets or API keys in code
- [ ] All dependencies are up to date
- [ ] Security vulnerabilities scanned (via Dependabot/CodeQL)
- [ ] HTTPS is enabled in production
- [ ] Security headers configured (if applicable)
- [ ] Input validation implemented
- [ ] No use of dangerous functions (eval, innerHTML with user input)

### Regular Maintenance
- [ ] Update dependencies regularly (Dependabot handles this)
- [ ] Monitor for security vulnerabilities (GitHub Security)
- [ ] Review and merge security updates
- [ ] Run CodeQL analysis regularly
- [ ] Review code changes for security issues

## 🚨 Security Incident Response

If you discover a security vulnerability:

1. **Do NOT** create a public GitHub issue
2. **Do** report it via [GitHub Security Advisories](https://github.com/yuireidev/devpockit/security/advisories/new)
3. **Do** provide detailed information about the vulnerability
4. **Do** allow time for the maintainers to address the issue before public disclosure

### Incident Response Process

1. **Acknowledgment**: We will acknowledge receipt within 48 hours
2. **Assessment**: We will assess the severity and impact
3. **Fix**: We will develop and test a fix
4. **Release**: We will release a security update
5. **Disclosure**: We will disclose the vulnerability after the fix is available

## 📞 Security Contact

For security-related issues:

- **Preferred**: [GitHub Security Advisories](https://github.com/yuireidev/devpockit/security/advisories/new)
- **Alternative**: Contact maintainers directly (see repository maintainers)

Please follow responsible disclosure practices:
- Give us reasonable time to fix the issue before public disclosure
- Do not access or modify data that doesn't belong to you
- Act in good faith and avoid privacy violations

## 🔍 Security Features

This application implements the following security measures:

- ✅ **Client-Side Only**: No server-side code, reducing attack surface
- ✅ **No Data Collection**: All processing happens locally
- ✅ **Input Validation**: All user inputs are validated
- ✅ **XSS Prevention**: React's built-in XSS protection
- ✅ **No Dangerous Functions**: No use of eval() or similar
- ✅ **Dependency Scanning**: Automated via Dependabot
- ✅ **Code Analysis**: CodeQL security scanning
- ✅ **HTTPS Required**: Production deployment uses HTTPS

## 🔄 Security Updates

- **Dependabot**: Automatically creates PRs for security updates
- **CodeQL**: Runs security analysis on every push
- **GitHub Security**: Monitors for known vulnerabilities
- **Regular Reviews**: Code changes are reviewed for security issues

## 📋 Security Considerations for Tools

Some tools in DevPockit process sensitive data:

- **JWT Decoder/Encoder**: Processes JWT tokens (handled client-side)
- **Hash Generator**: Generates cryptographic hashes (local processing)
- **URL Encoder/Decoder**: Processes URLs (local processing)

All tools process data entirely in the browser - no data is transmitted to servers.

---

**Last Updated**: 2026-01-05
