# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please email martin.braquet@hotmail.com. All security
vulnerabilities will be promptly addressed.

Please do not publicly disclose the vulnerability until it has been resolved.

## Security Practices

rct-autism takes security seriously and implements several best practices to protect user data and ensure application
integrity.

### Data Protection

- **Encryption in Transit**: All communications use HTTPS/TLS encryption
- **Environment Variables**: Secrets are managed through secure environment variable configuration
- **Data Minimization**: Only necessary data is collected and stored

### Development Practices

- **Code Reviews**: All changes reviewed by multiple developers
- **Automated Testing**: Security-focused tests integrated into CI/CD pipeline
- **Dependency Management**: Regular updates and security scanning of dependencies
- **Security Audits**: Periodic security assessments and penetration testing

## Common Security Issues and Resolutions

### XSS Prevention

- **Content Security Policy**: Strict CSP headers to prevent cross-site scripting
- **Input Sanitization**: All user-generated content is sanitized before display
- **Output Encoding**: Proper encoding of user data in HTML contexts

### CSRF Protection

- **SameSite Cookies**: CSRF protection through SameSite cookie attributes
- **Anti-Forgery Tokens**: Token-based protection for state-changing operations

### Injection Attacks

- **Command Injection**: Input validation and sanitization
- **Script Injection**: Content Security Policy and input filtering

## Incident Response

In the event of a security incident:

1. **Immediate Containment**: Isolate affected systems
2. **Investigation**: Determine scope and impact of breach
3. **Remediation**: Apply fixes and security patches
4. **Notification**: Inform affected users and stakeholders
5. **Review**: Post-incident analysis and process improvement

## Compliance

rct-autism aims to comply with relevant data protection regulations:

- **GDPR**: General Data Protection Regulation compliance
- **CCPA**: California Consumer Privacy Act compliance
- **Data Retention**: Clear policies for data retention and deletion

## Third-Party Security

We regularly audit third-party services for:

- Security certifications and compliance
- Regular security updates and patches
- Data handling and privacy practices
- Incident response procedures

## Security Contact

For security-related inquiries, contact:

- Email: martin.braquet@hotmail.com
- Response Time: Within 24 hours for critical issues
- Disclosure Policy: Coordinated disclosure with 90-day timeline

---

_Last Updated: March 2026_
