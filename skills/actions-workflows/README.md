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

Use the existing workspace configuration; do not change it for CI. Rhapsodic's
package URL is `https://pnpr.rhapsodic.dev/npm/`, and its resolver uses
`https://pnpr.rhapsodic.dev/`. Preserve different project URLs.

Share authentication at workflow level with `secrets.PNPR_REGISTRY_TOKEN`.
For a workspace using both Rhapsodic endpoints, list root first and `/npm/` last:

```yaml
env:
  PNPM_CONFIG__AUTH: >-
    {
      "https://pnpr.rhapsodic.dev/": {"@": {"authToken": ${{ toJSON(secrets.PNPR_REGISTRY_TOKEN) }}}},
      "https://pnpr.rhapsodic.dev/npm/": {"@": {"authToken": ${{ toJSON(secrets.PNPR_REGISTRY_TOKEN) }}}}
    }
```

If the workspace requires resolver authentication and no token is available,
report the missing credential; do not change the workspace to bypass it.

Let pnpm read the registry from the workspace. Any explicit
`PNPM_CONFIG_REGISTRY` must match it. For pnpm-only workflows, omit redundant `NPM_CONFIG_REGISTRY`,
`NODE_AUTH_TOKEN`, and `setup-node`'s `registry-url`. Retain them when other
package-manager commands require them. For Docker builds, mount the auth as a
BuildKit secret such as `pnpm_auth=PNPM_CONFIG__AUTH`.

Run shared tools with `pnpm dlx --package=<package>@1 <binary>`:

| Package | Binary | Target |
| --- | --- | --- |
| `@rhapsodic/action-changelog` | `changelog` | Git-based changelog generation |
| `@rhapsodic/action-release` | `validate-version-tag` | Local version-tag and branch validation |
| `@rhapsodic/action-release` | `forgejo-release` | Forgejo Releases; verify support before using another platform |

`validate-version-tag` checks Git state without publishing. Registry publication
uses `pnpm publish:package`; Forgejo Releases use `forgejo-release`.

Registry packages must already expose the required CLI options. Omit
`--config.ignoreScripts=true` from ordinary registry CLI calls unless needed;
preserve intentional lifecycle restrictions on other commands. Keep pnpr
credentials separate from the target platform's release API credentials.

Package ranges such as `@1` provide compatible stable updates; use an exact
version when required. Keep exact Git release tags.
