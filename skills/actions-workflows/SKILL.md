---
name: actions-workflows
description: Create, refactor, or migrate CI and release workflows for GitHub Actions, Forgejo, Gitea, and compatible platforms.
---

# Actions Workflows

## Context

- Read repository policy, workflows, package scripts, runner capabilities, and version pins. Preserve the platform and tooling unless migration is requested.
- Treat `pnpm-workspace.yaml` as an input to workflow changes. Read its registry, resolver, and install policies; do not create or edit it to satisfy CI requirements.
- Check the target platform's directories, contexts, tokens, environment files, and release APIs. Preserve documented third-party action input names during migrations.

## Layout

- Name every step, including checkout, setup, installation, checks, and publishing.
- Put one blank line between sections, job configuration blocks, and steps. Keep related variables together, including registry URL and authentication.
- Use `run: >-` for one multiline command: equal argument indentation, no backslashes or internal blank lines. Use `run: |` for scripts with multiple commands or control flow.
- Keep orchestration in YAML and reusable behavior in package scripts or shared CLIs. Comment on why non-obvious release checks exist.

## Setup and credentials

- Share common configuration through workflow-level `env`; retain intentional job and step overrides.
- Follow the project's package manager and runtime pins. Set up pnpm before commands or setup actions that query it.
- Resolve temporary paths at runtime when job-level expressions cannot access them. Export paths needed by later steps through the platform's environment file.
- Pass Docker build credentials through BuildKit secrets, not build arguments or image environment variables. Leave checkout credential persistence off unless later Git operations need it.

## Rhapsodic pnpr defaults

Keep the registry in `pnpm-workspace.yaml` and leave `pnprServer` out of local
workspace defaults. Use Corepack with the runner's persistent tool cache, disable
dependency caching, and configure PNPR authentication explicitly in CI:

```yaml
env:
  COREPACK_HOME: /opt/hostedtoolcache/corepack
  PNPM_CONFIG_REGISTRY: https://pnpr.rhapsodic.dev/npm/
  PNPM_CONFIG_PNPR_SERVER: https://pnpr.rhapsodic.dev/
  PNPM_CONFIG__AUTH: >-
    {
      "https://pnpr.rhapsodic.dev/": {"@": {"authToken": ${{ toJSON(secrets.PNPR_REGISTRY_TOKEN) }}}},
      "https://pnpr.rhapsodic.dev/npm/": {"@": {"authToken": ${{ toJSON(secrets.PNPR_REGISTRY_TOKEN) }}}}
    }

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: https://data.forgejo.org/actions/checkout@v7
        with:
          persist-credentials: false

      - name: Set up Node.js
        uses: https://data.forgejo.org/actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          package-manager-cache: false

      - name: Set up pnpm
        run: |
          corepack enable
          pnpm --version
```

The runner must mount `/opt/hostedtoolcache` persistently. `COREPACK_HOME` caches
pnpm distributions; the dependency store stays outside that cache. Keep the
workspace available during installs and Docker builds. Preserve different
project endpoints and keep tokens in secrets rather than tracked files or
command-line arguments. Pass Docker auth through the `pnpm_auth` BuildKit secret.

Release and changelog are standalone CLI packages. Invoke them through
`pnpm dlx`; their publication workflows remain ordinary package CI. Keep package
credentials separate from release API tokens.

| Package | Binary | Purpose |
| --- | --- | --- |
| `@rhapsodic/changelog` | `changelog` | Changelog and release notes |
| `@rhapsodic/release` | `validate-version-tag` | Local version, tag, commit, and branch validation |
| `@rhapsodic/release` | `forgejo-release` | Forgejo Releases using `FORGEJO_TOKEN` |

## Releases

- Inspect package binaries, options, platform support, and availability before replacing Git-based actions. Fetch release tools on demand, outside application and Docker runtime dependencies; reuse local release scripts in CI.
- Preserve validation, notes and changelog paths, assets, prereleases, and rerun behavior. Replace action outputs explicitly when switching to a CLI.
- Match the tag to the package version and event commit where required by project policy. Peel annotated tags with `^{commit}` before comparing commits.
- Fetch the history needed for branch validation. Use the project's release branch; an ancestry check accepts older commits in that branch's history, not only its tip.
- Default to registry `latest` for stable releases and `next` for prereleases, unless project channels differ. Preserve platform-release and image-tag policies too.
- Use registry ranges such as `@1` for compatible stable package updates. Keep exact Git release tags.
- Report unpublished package prerequisites. Do not publish missing packages or introduce a Git fallback without authorization.

### Release validation and package channel example

After a full-history checkout and Node.js/pnpm setup, use the project's release
branch and platform contexts. This example uses GitHub contexts, a published
validator package, and an existing `publish:package` script. `NPM_DIST_TAG`
selects a registry channel: stable `v1.2.3` uses `latest`; `v1.3.0-beta.1` uses `next`.

```yaml
env:
  RELEASE_TAG: ${{ github.ref_name }}
  RELEASE_SHA: ${{ github.sha }}
  RELEASE_BRANCH: master # Set to the project's release branch.
  NPM_DIST_TAG: ${{ contains(github.ref_name, '-') && 'next' || 'latest' }}

steps:
  - name: Validate version tag
    id: version
    run: >-
      pnpm dlx --package=@rhapsodic/release@1 validate-version-tag
      --tag "$RELEASE_TAG"
      --sha "$RELEASE_SHA"
      --branch "$RELEASE_BRANCH"

  - name: Publish package
    run: pnpm publish:package --tag "$NPM_DIST_TAG"
```

The validator checks the manifest version, tag-to-event commit match, and release
branch ancestry. It performs no API calls or Git writes and exports the peeled
commit as `steps.version.outputs.sha` for later platform-release API calls.
`pnpm publish:package` uploads an npm package; `forgejo-release` separately creates
or updates a Forgejo Release with notes and assets.

## Verification

- Use the platform's available schema validator and check whitespace. For formatting-only edits, preserve behavior and skip tests for blank lines or labels.
- Test changed CLI behavior with package tests, packed artifacts, temporary repositories, or mock APIs. Do not publish releases or alter remote tags to validate an edit.
