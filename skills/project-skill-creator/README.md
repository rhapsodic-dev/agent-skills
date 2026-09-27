# Project Skill Creator

Use this skill to create or update agent skills during a project session, using that project's workflows and conventions. See [SKILL.md](SKILL.md) for the writing rules.

## Example requests

```text
Use $project-skill-creator to create a release-checks skill in .agents/skills/release-checks using this project's release workflow.
```

```text
Use $project-skill-creator to make this project's testing skill more concise while preserving its required checks.
```

## Project scope

Specify the intended workflow and destination when you have a preferred location. Otherwise, the skill follows the project's existing agent-skill layout or creates `.agents/skills/<name>/`.

The generated instructions use the project's actual tools and conventions and remain self-contained. Supporting documentation and agent metadata follow project requirements. The skill creates project-local files; it does not install third-party skills or change global agent configuration.
