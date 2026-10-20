# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.1] - 2026-10-20

### Added
- TODO: curate from commits below (AI: rewrite into Keep-a-Changelog entries)

### Fixed
- 

### Changed
- 



### Planned
- Additional developer tools
- Performance optimizations
- Enhanced accessibility features
- Internationalization support

## [0.3.0] - 2026-10-19

### Added
- Auto-tag release flow: `auto-tag.yml` tags merge commits on `main` and runs the release via reusable workflow
- Manual Pages deploy: `deploy.yml` with tag picker, usable by upstream and forks
- Version guard: PRs into `main` fail without a semver bump (`no-release` label escapes)

### Changed
- Release workflow split: `release.yml` builds + creates GitHub Release only, no automatic deploy
- `scripts/release.sh` no longer tags locally; CI owns tagging

### Fixed
- Pinned `@commitlint/cli` and `@commitlint/config-conventional` to exact 21.2.4 for Dependabot resolution
- Removed tracked 1Password plugin pointer (`.op/` stays local-only)

## [0.2.3] - 2026-10-19

### Changed
- Migrated repository from `hypkey/devpockit` to `yuireidev/devpockit` with production domain `devpockit.yuirei.com`
- Rewrote release workflow into staged `build → github-release → deploy` jobs with SBOM generation
- Release notes now combine Keep-a-Changelog entries with auto-generated GitHub diff notes

### Added
- Tag-truth versioning: `scripts/resolve-version.sh` (`git tag → package.json → dev` fallback) so forks show a version without tags
- `pnpm release:{patch|minor|major}` helper (`scripts/release.sh`) for atomic version bump + changelog draft + tag
- `pnpm changelog:ai` helper (`scripts/ai-changelog.sh`) to draft Keep-a-Changelog entries from commits
- PR preview workflow uploading build artifacts; version-check workflow enforcing tag/package.json match
- Release Drafter config and commitlint for Conventional Commits

### Fixed
- Workflow YAML parse errors from flow-style `${{ }}` mappings (rewrote in block style)

### Security
- Added `.op/` to `.gitignore` so 1Password local plugin credential pointers stay untracked

## [0.1.0] - 2026-01-05

### Added

#### Core Infrastructure
- Next.js 15 setup with App Router
- TypeScript configuration with strict mode
- Tailwind CSS for styling
- Shadcn/ui component library integration
- ESLint and Prettier for code quality
- Jest testing framework setup
- Production build pipeline
- Responsive design system
- Dark/Light theme support
- Mobile-first layout

#### Text Tools
- **Lorem Ipsum Generator**: Generate placeholder text in Latin or Bacon Ipsum format
- **Regex Tester**: Test and debug regular expressions with real-time matching, group extraction, and code generation
- **Diff Checker**: Compare two texts side-by-side and highlight differences with syntax highlighting

#### Formatters
- **JSON Formatter**: Format and beautify JSON data with minify/beautify options
- **XML Formatter**: Format and beautify XML data with error handling

#### Cryptography & Security Tools
- **UUID Generator**: Generate unique identifiers in v1, v4, and v5 formats with bulk generation support
- **JWT Decoder**: Decode and analyze JWT tokens with header, payload, and signature viewing
- **JWT Encoder**: Create and encode JWT tokens with custom headers and payloads
- **Hash Generator**: Generate cryptographic hashes using SHA-1, SHA-256, SHA-512, and SHA-3 algorithms with salt support

#### Encoders & Decoders
- **QR Code Generator**: Generate QR codes for text, URLs, contacts, WiFi, SMS, and email with customizable options
- **QR Code Decoder**: Decode QR codes from uploaded images with support for multiple formats and structured data parsing
- **QR Code Scanner**: Scan QR codes using device camera with real-time detection and instant results
- **URL Encoder**: Encode URLs and text with multiple encoding types including URL, URI, and custom character sets
- **URL Decoder**: Decode URL-encoded text back to its original form with support for multiple encoding types
- **Base Encoder/Decoder**: Encode and decode text using Base64, Base32, Base16 (hex), Base85, and other base encodings

#### Converters
- **Cron Expression Parser**: Build and parse cron expressions visually with a step-by-step form builder
- **Data Format Converter**: Convert between JSON, YAML, Python Dictionary, TypeScript Map, and XML formats
- **Timestamp Converter**: Convert between Unix timestamps, ISO 8601, RFC 2822, and other date formats across timezones
- **List Format Converter**: Convert lists between different formats: line-by-line, comma-separated, JSON array, Python list, and more
- **Schema Converter**: Convert between JSON Schema, Spark Schema, TypeScript, Python, SQL, and more
- **Number Base Converter**: Convert numbers between different bases (binary, octal, decimal, hexadecimal) with bit visualization and range calculator

#### Network Tools
- **CIDR Analyzer**: Analyze CIDR notation and get detailed network information including subnets and statistics
- **IP to CIDR Converter**: Convert an IP address to CIDR notation with network suggestions
- **IP Address Lookup**: Look up information about your current public IP address including location and network details
- **System Information**: View detailed information about your browser, device, display, network, and system capabilities

#### Utilities
- **List Comparison**: Compare two lists of strings and numbers to find differences, intersections, unions, and more
- **JSON Path Finder**: Query and extract data from JSON using JSONPath expressions
- **XML Path Finder**: Query and extract data from XML using XPath expressions
- **YAML Path Finder**: Query and extract data from YAML using YAMLPath expressions
- **JSON/YAML Schema Generator**: Generate JSON Schema (Draft 7) from JSON or YAML data

#### User Interface Features
- Sidebar navigation with expandable categories
- Tool categorization system
- Search functionality for tools
- Responsive design for mobile, tablet, and desktop
- Dark/Light theme toggle
- Copy-to-clipboard functionality
- Syntax highlighting for code outputs
- Monaco Editor integration for code editing
- Real-time processing and instant results
- Error handling and validation
- Loading states and user feedback
- Empty states for tools
- Keyboard shortcuts support

#### Developer Experience
- Comprehensive TypeScript type definitions
- Reusable component library
- Custom React hooks
- Utility functions and helpers
- Tool configuration system
- Consistent tool implementation patterns
- Code splitting and lazy loading
- Performance optimizations

### Changed

- Initial release - no previous versions

### Deprecated

- Nothing yet

### Removed

- Nothing yet

### Fixed

- Initial release - no bugs fixed yet

### Security

- Client-side only processing for all tools (no data sent to servers)
- Secure handling of sensitive data in JWT tools
- Input validation and sanitization
- XSS prevention measures

---

## Release Notes Format

Each release should follow this structure:

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements and vulnerability fixes

## Version History

- **0.1.0** (2026-01-05): Initial open source release with 30+ developer tools

---

For detailed information about each tool, please refer to the [README.md](README.md) file.

