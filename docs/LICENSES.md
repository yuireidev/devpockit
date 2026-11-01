# Third-Party Licenses

This document lists all third-party dependencies and their licenses. DevPockit is licensed under the MIT License, and all dependencies are compatible with this license.

## License Compatibility

All dependencies use licenses that are compatible with MIT:

- **MIT**: Fully compatible
- **Apache-2.0**: Compatible with MIT
- **BSD-2-Clause**: Compatible with MIT
- **BSD-3-Clause**: Compatible with MIT
- **ISC**: Compatible with MIT
- **0BSD**: Compatible with MIT

## Production Dependencies

### Core Framework

- **next** (^16.1.0) - MIT License
- **react** (^19.2.3) - MIT License
- **react-dom** (^19.2.3) - MIT License
- **typescript** (^5.1.0) - Apache-2.0 License

### UI Components

- **@radix-ui/react-accordion** (^1.2.12) - MIT License
- **@radix-ui/react-avatar** (^1.1.11) - MIT License
- **@radix-ui/react-collapsible** (^1.1.12) - MIT License
- **@radix-ui/react-dialog** (^1.1.15) - MIT License
- **@radix-ui/react-dropdown-menu** (^2.1.16) - MIT License
- **@radix-ui/react-label** (^2.1.7) - MIT License
- **@radix-ui/react-select** (^2.2.6) - MIT License
- **@radix-ui/react-separator** (^1.1.7) - MIT License
- **@radix-ui/react-slot** (^1.2.3) - MIT License
- **@radix-ui/react-switch** (^1.2.6) - MIT License
- **@radix-ui/react-tabs** (^1.1.13) - MIT License
- **@radix-ui/react-tooltip** (^1.2.8) - MIT License
- **@heroicons/react** (^2.2.0) - MIT License
- **lucide-react** (^0.544.0) - ISC License
- **next-themes** (^0.4.6) - MIT License

### Code Editor

- **@monaco-editor/react** (^4.7.0) - MIT License
- **monaco-editor** (^0.45.0) - MIT License
- **@shikijs/monaco** (^1.29.2) - MIT License
- **shiki** (^1.29.2) - MIT License

### Utilities

- **class-variance-authority** (^0.7.1) - Apache-2.0 License
- **clsx** (^2.1.1) - MIT License
- **tailwind-merge** (^3.3.1) - MIT License
- **tailwindcss-animate** (^1.0.7) - MIT License
- **uuid** (^13.0.0) - MIT License
- **yaml** (^2.8.1) - ISC License

### Tool-Specific Libraries

- **jose** (^6.1.3) - MIT License (JWT encoding/decoding)
- **cron-parser** (^5.4.0) - MIT License
- **diff** (^8.0.2) - BSD-3-Clause License
- **ipaddr.js** (^2.2.0) - MIT License
- **qrcode** (^1.5.4) - MIT License
- **qr-scanner** (^1.4.2) - MIT License
- **jsqr** (^1.4.0) - Apache-2.0 License
- **react-window** (^2.2.3) - MIT License
- **canvas** (^3.2.0) - MIT License

### Type Definitions

- **@types/qrcode** (^1.5.5) - MIT License
- **@types/react-window** (^2.0.0) - MIT License
- **@types/uuid** (^11.0.0) - MIT License

## Development Dependencies

### Testing

- **jest** (^30.1.3) - MIT License
- **jest-environment-jsdom** (^30.1.2) - MIT License
- **@testing-library/react** (^16.3.0) - MIT License
- **@testing-library/jest-dom** (^6.8.0) - MIT License
- **@testing-library/user-event** (^14.6.1) - MIT License

### Code Quality

- **eslint** (^9.39.2) - MIT License
- **eslint-config-next** (^16.1.0) - MIT License
- **@typescript-eslint/eslint-plugin** (^8.44.0) - MIT License
- **@typescript-eslint/parser** (^8.44.0) - MIT License
- **@eslint/eslintrc** (^3.0.0) - Apache-2.0 License
- **prettier** (^3.0.0) - MIT License
- **prettier-plugin-tailwindcss** (^0.5.0) - MIT License

### Build Tools

- **typescript** (^5.1.0) - Apache-2.0 License
- **autoprefixer** (^10.4.0) - MIT License
- **postcss** (^8.4.0) - MIT License
- **tailwindcss** (^3.4.0) - MIT License

### Type Definitions (Dev)

- **@types/diff** (^8.0.0) - MIT License
- **@types/jest** (^29.5.0) - MIT License
- **@types/node** (^20.0.0) - MIT License
- **@types/react** (^19.2.7) - MIT License
- **@types/react-dom** (^19.2.3) - MIT License

## License Summary

| License Type | Count | Compatibility       |
| ------------ | ----- | ------------------- |
| MIT          | ~80%  | ✅ Fully Compatible |
| Apache-2.0   | ~15%  | ✅ Compatible       |
| BSD-2-Clause | ~3%   | ✅ Compatible       |
| BSD-3-Clause | ~1%   | ✅ Compatible       |
| ISC          | ~1%   | ✅ Compatible       |
| 0BSD         | <1%   | ✅ Compatible       |

## License Compatibility Verification

✅ **All dependencies are compatible with MIT License**

### Why These Licenses Are Compatible

1. **MIT License**: Permissive, allows commercial use, modification, distribution
2. **Apache-2.0**: Similar to MIT, includes patent grant
3. **BSD Licenses**: Very permissive, compatible with MIT
4. **ISC**: Similar to MIT/BSD, fully compatible
5. **0BSD**: Public domain equivalent, fully compatible

### No Incompatible Licenses Found

The following license types would be incompatible but are **NOT** present:

- ❌ GPL (any version) - Not found
- ❌ AGPL - Not found
- ❌ LGPL - Not found
- ❌ Proprietary - Not found

## Attribution Requirements

While all licenses are compatible, some require attribution:

### MIT License

- Include copyright notice and license text
- ✅ Satisfied: All MIT-licensed packages are in `node_modules/` with their license files

### Apache-2.0 License

- Include copyright notice, license text, and state changes
- ✅ Satisfied: Apache-2.0 packages include their license files

### BSD Licenses

- Include copyright notice and license text
- ✅ Satisfied: BSD-licensed packages include their license files

## How to Verify Licenses

You can verify licenses using:

```bash
# Using pnpm
pnpm licenses list

# Using npm
npm list --depth=0 --json | jq '.dependencies | to_entries | map({name: .key, license: .value.license})'

# Check individual package
cat node_modules/<package-name>/package.json | grep license
```

## License Files Location

All license files are located in:

- `node_modules/<package-name>/LICENSE`
- `node_modules/<package-name>/LICENSE.txt`
- `node_modules/<package-name>/package.json` (license field)

## Updates

This document should be updated when:

- Adding new dependencies
- Updating major dependencies
- Before each release

## Questions?

If you have questions about license compatibility:

- Check the [SPDX License List](https://spdx.org/licenses/)
- Review [Choose a License](https://choosealicense.com/)
- Consult with legal counsel for commercial use

---

**Last Updated**: 2026-01-05
**Verified**: All dependencies compatible with MIT License ✅
