---
name: worksession
description: Use the worksession CLI to start, inspect, stop, and reconnect to persistent workspace services and interactive terminals.
---

# worksession

Run `worksession config` to validate configuration and see resolved paths.
Defaults: `/etc/worksession/config.toml` on Unix;
`%ProgramData%\worksession\config.toml` on Windows. Keep the same `--config`
and `--state-dir` overrides across related commands.

Use an explicit project, group, or configured target alias. `workspace` selects
all projects; `current` or `.` selects the project containing the current directory.
Omitting the target uses `default_target` or `workspace`, except `logs` and
`attach`, which use `current`.

| Command | Purpose |
| --- | --- |
| `start <target>` | Start missing/exited sessions; reuse unchanged running sessions |
| `status <target> --json` | Inspect state without starting sessions |
| `stop <target>` | Stop selected sessions |
| `restart <target>` | Relaunch selected sessions, applying changed launch settings |
| `logs <project>` | Print recent output without starting the session |
| `logs <project> -f` | Follow output until the session exits |
| `monitor <target>` | Start sessions and watch combined output; does not restart exited sessions |
| `attach <project>` | Start or reconnect to one interactive terminal |
| `daemon stop` | Stop the supervisor and every session it owns |

Prefer finite `logs` and JSON `status` for automated inspection. Ctrl-C exits
`monitor` or `logs -f` without stopping sessions.

`attach` needs a real local terminal and an interactive project. Only one
attachment is allowed at a time. Ctrl-] detaches and keeps the session running;
Ctrl-C reaches the remote program. Without a terminal, give the user the
attachment command. Sessions survive CLI exit, but not supervisor crash or reboot.

After a failure, inspect the affected project's status and logs. Do not restart
sessions or stop the daemon merely to inspect them. Never expose supervisor
credentials or project environment values.
