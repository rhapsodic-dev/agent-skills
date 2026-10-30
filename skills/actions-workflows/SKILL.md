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
- Follow the project's package manager and runtime pins. Enable Corepack before pnpm commands or setup actions that query pnpm for caching.
- Resolve temporary paths at runtime when job-level expressions cannot access them. Export paths needed by later steps through the platform's environment file.
- Pass Docker build credentials through BuildKit secrets, not build arguments or image environment variables. Leave checkout credential persistence off unless later Git operations need it.

## Rhapsodic pnpr defaults

- Follow `pnpm-workspace.yaml`; do not edit it for CI. Keep it available when installing dependencies in CI and Docker.
- Rhapsodic uses `https://pnpr.rhapsodic.dev/npm/` for packages and `https://pnpr.rhapsodic.dev/` for the resolver. Preserve different URLs already configured by the project.
- Put shared auth in workflow-level `env`, using `secrets.PNPR_REGISTRY_TOKEN`. Match the workspace's endpoints: root first, `/npm/` last. Auth entries also affect registry routing.

For a workspace already using both Rhapsodic endpoints:

```yaml
env:
  PNPM_CONFIG__AUTH: >-
    {
      "https://pnpr.rhapsodic.dev/": {"@": {"authToken": ${{ toJSON(secrets.PNPR_REGISTRY_TOKEN) }}}},
      "https://pnpr.rhapsodic.dev/npm/": {"@": {"authToken": ${{ toJSON(secrets.PNPR_REGISTRY_TOKEN) }}}}
    }
```

- Let pnpm read registry settings from the workspace. Any required `PNPM_CONFIG_REGISTRY` must match it. Omit redundant npm auth settings in pnpm-only workflows.
- Public packages can be read anonymously; the resolver needs a token. Report missing credentials instead of changing workspace settings. Downloads need read access; publishing needs write access.
- Pass Docker auth through the `pnpm_auth` BuildKit secret. Keep package credentials separate from release API tokens.
- Run shared CLIs with `pnpm dlx --package=<package>@1 <binary>`. Do not add `--config.ignoreScripts=true` unless needed.

| Package | Binary | Purpose |
| --- | --- | --- |
| `@rhapsodic/action-changelog` | `changelog` | Changelog and release notes |
| `@rhapsodic/action-release` | `validate-version-tag` | Local version, tag, commit, and branch checks on any Actions platform |
| `@rhapsodic/action-release` | `forgejo-release` | Forgejo Releases, using `FORGEJO_TOKEN`; verify support for other platforms |

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
      pnpm dlx --package=@rhapsodic/action-release@1 validate-version-tag
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
