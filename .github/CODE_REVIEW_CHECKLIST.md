# Code Review Checklist

Use this checklist to focus review on the change's risks. CI covers formatting, lint, TypeScript, Jest, and the build. The release workflow runs the browser smoke suite for each new version.

## Review

- [ ] The implementation matches the request and stays within scope.
- [ ] Error cases, boundary inputs, and user-provided data are handled safely.
- [ ] Behavior changes have meaningful tests; tests cover expected and failure cases.
- [ ] UI changes remain usable with keyboard navigation and assistive technology.
- [ ] Static export constraints are respected; no server-only APIs or routes were added.
- [ ] Tool changes follow the logic/configuration/UI registration pattern and preserve the metadata-to-loader mapping.
- [ ] Documentation, changelog, or migration notes are updated when the change requires them.
- [ ] The PR records exact verification commands and calls out checks that were not run.
- [ ] The diff contains only intended files; no secrets or local-only files are included.

## For UI changes

- [ ] Screenshots or concise manual verification steps are included.
- [ ] Responsive behavior and visible error/loading states were considered.

## Before approval

- [ ] Required CI checks pass.
- [ ] Remaining risks or follow-up work are documented.
