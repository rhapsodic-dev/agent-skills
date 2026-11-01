# Actions Workflows

Create and refactor GitHub Actions and compatible Forgejo or Gitea workflows
using Rhapsodic's formatting and release conventions. See [SKILL.md](SKILL.md) for the agent instructions.

## Example requests

```text
Use $actions-workflows to name every step and add spacing between workflow sections without changing behavior.
```

```text
Use $actions-workflows to migrate this GitHub Actions workflow to Gitea, preserving its triggers, checks, assets, and release policy. Do not publish or commit.
```

```text
Use $actions-workflows to replace Git-based release tools with pnpr packages where they support this project's CI platform.
```

The skill follows the project's platform, runners, release branch, and version
pins. Formatting a GitHub workflow does not migrate it to Forgejo or configure
pnpr. Platform-specific APIs, contexts, tokens, and release clients must match
the target service.

## Workflow layout

Name every step. Separate sections and steps with one blank line, while keeping
related environment variables together. Use folded YAML for one multiline
command and literal YAML for scripts containing multiple commands.

After checkout and package-manager setup, an existing changelog script can be
called with a folded command:

```yaml
- name: Generate changelog and release notes
  run: >-
    pnpm changelog
    --tag "$RELEASE_TAG"
    --package-file package.json
    --output "$CHANGELOG_FILE"
    --notes "$RELEASE_NOTES_FILE"
```

This fragment assumes the project's `changelog` script and output path variables
are already configured. Derive the release tag and temporary paths using the
chosen platform's supported contexts and environment files. Validate the tag,
package version, and release branch before publishing.

## pnpr defaults

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
| `@rhapsodic/changelog` | `changelog` | Git-based changelog generation |
| `@rhapsodic/release` | `validate-version-tag` | Version-tag and branch validation |
| `@rhapsodic/release` | `forgejo-release` | Forgejo Releases |

The setup action bootstraps its package through npm with registry-scoped
credentials. Other shared CLIs run through `pnpm dlx --package=<package>@1 <binary>`.
Publish packages before consuming them, preserve exact Git release tags, and
follow each project's release and image-publication rules.
