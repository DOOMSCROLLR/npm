# Publishing @doomscrollr/api

This package is prepared for public npm publishing, but publishing still requires Adam's explicit approval.

## Pre-publish checklist

1. Confirm package metadata in `package.json`.
2. Run:

   ```bash
   npm ci
   npm test
   npm pack --dry-run
   ```

3. Confirm npm package ownership/access for the `@doomscrollr` scope.
4. Configure npm Trusted Publishing for the GitHub Actions publish workflow, or publish locally with an authenticated npm account that can publish `@doomscrollr/api`.
5. Tag a release or run the publish workflow only after approval.

## GitHub Actions publishing

The workflow at `.github/workflows/publish.yml` uses:

```bash
npm publish --provenance --access public
```

It requests `id-token: write` so npm provenance can be attached when npm Trusted Publishing is configured for this repository/workflow.

## Local publish command

After approval and npm authentication:

```bash
npm publish --provenance --access public
```
