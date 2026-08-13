# CLAUDE.md — TorqLens

## 1. Repo Context

Address the operator as **King Flowers**.

**TorqLens** — iPhone identification app. Next.js 16 static export shipped to iOS through Capacitor 6.

| Fact | Value |
| --- | --- |
| Package | `torqlens` v1.0.0 |
| Bundle ID | `com.torqbusinesssolutions.torqlens` |
| App name | **TorqLens** |
| Web | Next.js 16.1, React 19, Radix UI, Tailwind, `react-markdown` |
| Native | Capacitor 6 — app, camera, haptics, preferences, share, splash-screen, status-bar |
| AI | `@anthropic-ai/sdk` — **server-side only**, never in the client bundle |
| Device | **iPhone-only** (`TARGETED_DEVICE_FAMILY = 1`) |
| Git | Own repo nested inside `E:\` |

This repo is **not** TORQ Console, TORQCLAW, TORQ-CLI, or harness work.

### iOS ships as a static export — the opposite of RenoMargin

`capacitor.config.ts` sets `webDir: "out"`. The web shell is statically exported by `npm run cap:build` and **copied into the native project** by `cap sync`.

- A change reaches the app **only through a new native build and App Store release**. There is no live-server escape hatch.
- The client bundle **bakes `NEXT_PUBLIC_API_BASE_URL` at build time** and calls a **remote backend** for identification.
- **No API keys or secrets exist in the client bundle.** Keep it that way — anything `NEXT_PUBLIC_*` ships to every device in plaintext.
- `scripts/check-cap-env.mjs` fails `cap:build` early if that URL is missing, points at localhost, or uses plaintext `http` (iOS App Transport Security blocks it). Do not weaken this guard to make a build pass.
- `.env.production` (or an exported shell/CI var) takes precedence over `.env.local` for production builds. Setting the URL only in `.env.local` is a known way to ship a broken bundle.

> **Staleness check:** verify this context against `package.json`, `capacitor.config.ts`, and recent commits before starting. If this file disagrees with the repo, report the conflict first.

### Instruction precedence

1. Direct operator instruction in the current session
2. This file
3. Global `E:\.claude\CLAUDE.md`
4. General Claude Code defaults

Global rules win where they are **more restrictive** on secrets, destructive actions, signing, production writes, user-owned files, or irreversible actions.

### Boundary

- Do not touch `E:\TORQ-CONSOLE` or `torq_mmh/`.
- Do not touch `E:\TORQCLAW`, `E:\TORQ-CLI`, or `E:\renovation-job-costing`.
- Do not switch into TORQ V5/V6 harness mode.
- TorqLens is a **separate git repo nested inside `E:\`**. Run git commands with this directory as the working tree, and never stage from the `E:\` parent.

---

## 2. Governing Harness

Role map (aligned to the global contract in `E:\.claude\CLAUDE.md`, operator-updated 2026-08-12):

| Role | Model | Model ID | Authority |
| --- | --- | --- | --- |
| **G1D** — planner / orchestrator | Claude Fable 5 | `claude-fable-5` | Planning, decomposition, routing, scope control |
| **G1R** — independent design reviewer | Claude Opus 5 | `claude-opus-5` | Design/risk review before risky implementation |
| **Builder** — implementer | Claude Sonnet 5 | `claude-sonnet-5` | Bounded implementation, UI work, tests, docs |
| **RB** — alternate debug worker | GLM-5.2 | (if available) | Scan, bug isolation, log/test triage, proposals |
| **G2A** — final auditor | Claude Opus 4.8 | `claude-opus-4-8` | Final adversarial review, native + release-risk audit |
| **Memory-writer** | Sonnet 5 or fast model | — | Approved state files after verified progress |

This repo has **no `.claude/agents/`** — only `.claude/settings.local.json`. Role agents do not resolve here. Either run the roles as explicit session models under operator direction, or root the session at a repo that defines them. Do not claim an agent-backed gate ran when no agent exists.

### Authority rules

- G1D plans and routes; it does not approve its own plan when G1R is required.
- G1R reviews before build; it does not build.
- Builder implements bounded approved work and **cannot approve its own work**.
- GLM-5.2 scouts, triages, debugs, or proposes. Never final authority.
- G2A audits after build and tests. **G2A's verdict controls final pass/fail.** Any BLOCKER forces REJECT or a fully specified CONDITIONAL approval.
- Memory-writer records verified progress only.
- Operator controls commit, push, build, archive, upload, App Store submission, signing changes, and every irreversible action.

### G2A review is mandatory for

Native iOS changes · signing / provisioning / bundle ID / app name · `TARGETED_DEVICE_FAMILY` · App Store metadata · `capacitor.config.ts` · `scripts/check-cap-env.mjs` or `configure-ios.sh` · backend URL / CORS / API contract · anything touching the Anthropic SDK boundary · release builds · archive / upload / submission.

Apply `E:\.claude\model-handoff\00_BOOT_CARD.md` always; load the full role manual only for high-risk, native, App Store-facing, or release-facing work.

---

## 3. Key Files

| Path | Purpose |
| --- | --- |
| `src/app/` | App Router — `layout.tsx`, `page.tsx`, `privacy/`, `support/` |
| `src/app/api/` | Server routes — **the only place the Anthropic SDK may be used** |
| `src/components/` | UI components |
| `src/lib/` | Shared logic |
| `src/proxy.ts` | Backend proxy layer |
| `capacitor.config.ts` | Native config — `webDir: "out"`, iOS appearance, safe-area chrome |
| `scripts/check-cap-env.mjs` | Build-time guard on `NEXT_PUBLIC_API_BASE_URL` |
| `scripts/configure-ios.sh` | Post-`cap add` iOS patch (enforces iPhone-only) |
| `scripts/generate-icons.mjs` | Icon generation |
| `ios/App/` | Native Xcode project |
| `out/` | **Generated** static export — never hand-edit |
| `RELEASE_CHECKLIST.md` | Release gate checklist |
| `MAC_HANDOFF.md`, `MACINCLOUD_WALKTHROUGH.md`, `CLOUD_MAC_QUICKSTART.md` | Mac build steps |
| `APP_STORE_LISTING.md`, `BACKEND_DEPLOY.md` | Listing copy, backend deploy notes |

---

## 4. Mandatory Rules

### Client/server boundary — the load-bearing invariant

- The Anthropic SDK and any API key stay **server-side only**. Never import `@anthropic-ai/sdk` into a client component, and never expose a key through `NEXT_PUBLIC_*`.
- The static export means client code ships verbatim to every device. Treat anything in the bundle as public.
- Identification calls go to the remote backend via `NEXT_PUBLIC_API_BASE_URL`. Do not add a same-origin fallback — that was removed deliberately (commit `bfa975f`); the native app has no same-origin backend.
- Backend CORS must permit the Capacitor origin. A missing CORS header presents as a silent failure in the native app while working fine in a browser (commit `ba61679`, and the cause of an App Store 2.1(a) rejection).

### Native iOS and App Store — owner-gated

- Do not change bundle ID (`com.torqbusinesssolutions.torqlens`), signing team, provisioning profile, app name, or App Store metadata without explicit operator approval.
- Do not change `TARGETED_DEVICE_FAMILY` — iPhone-only is deliberate and enforced both in Xcode and by `scripts/configure-ios.sh`.
- Do not alter signing/provisioning to make a build pass.
- Ask before regenerating or overwriting `ios/` native files. `configure-ios.sh` must be re-run after any `cap add ios`.
- Bump the iOS build number for any re-upload — App Store Connect rejects duplicates.

### Change scoping

- Make the smallest correct change; touch only files the task requires.
- Keep web/app changes separate from native config and signing changes.
- Never hand-edit `out/` or `ios/App/public/` — both are generated by `cap:sync`.
- Do not add paid services, analytics, tracking, cloud dependencies, or SDKs unless explicitly approved.
- If the working tree has uncommitted owner edits, preserve and report them before editing.

---

## 5. Test Commands

Verify scripts before running.

```bash
npm run lint          # eslint .
npm run typecheck     # tsc --noEmit
npm run build         # next build (web)
npm run dev           # next dev -p 3000

npm run cap:check-env # validate NEXT_PUBLIC_API_BASE_URL
npm run cap:build     # guard + CAP_BUILD=1 next build  -> out/
npm run cap:sync      # cap:build + cap sync ios
npm run cap:open      # cap open ios
npm run ios           # cap:sync + cap:open
npm run icons         # regenerate icons
```

There is **no test runner configured** — no Vitest, no Playwright, no `npm test`. Verification here is `lint` + `typecheck` + `build`, plus manual device/simulator checks. Say so plainly rather than implying a test suite passed.

Native build and archive steps run on macOS (MacinCloud) — see `MAC_HANDOFF.md` and `MACINCLOUD_WALKTHROUGH.md`. Do not claim a native build result produced on this Windows machine.

---

## 6. Security

- Never expose or commit secrets, API keys, Anthropic keys, tokens, certificates, provisioning profiles, signing files, App Store credentials, or `.env` values.
- **Never put a secret behind a `NEXT_PUBLIC_` prefix.** It ships to every device.
- Do not weaken `scripts/check-cap-env.mjs`; allowing `http://` or localhost through would ship a non-functional or insecure build.
- Do not run destructive commands or live production writes.
- Do not delete, move, overwrite, or clean untracked operator files. **Report them only.**
- Never remove or weaken a check to make a build pass.
- Do not claim completion without evidence, and never invent build logs, simulator results, device results, or App Store status.
- Do not commit, push, build, archive, upload, submit, or release without explicit operator approval.

---

## 7. Verification Requirements

Before reporting completion:

- Run `npm run typecheck` and `npm run lint`; report exact exit status.
- Run `npm run build` for anything touching rendering or routing.
- For a native-affecting change, run `npm run cap:check-env` and state whether `cap sync` was actually run.
- Review the diff for accidental edits, and confirm no generated `out/` content was hand-modified.
- For UI work, check primary interactions, error states, and safe-area/mobile layout. Capture a screenshot when visual behavior matters.
- State explicitly what was **not** verified — device behavior, App Store review status, and backend availability are unverified from this machine unless evidenced.
- Remember a web change does **not** reach installed apps. Only a new native build and release does.

---

## 8. State and Memory

This repo has no `STATE.md` or `MEMORY.md`. Ask before creating one; if approved, use:

```md
# TorqLens — Project Memory

## Global Memory

Read E:\.claude\CLAUDE.md for memory rules and topic files.

## Project Notes
```

- Do not store secrets, raw logs, or one-time prompt payloads.
- Keep entries concise: date, branch, change, checks run, result, next action.
- Do not mark work complete without evidence.

### Startup continuity scan

At session start, report:

1. Current directory, and confirm the git worktree is TorqLens (not `E:\`)
2. Instruction files found and controlling file
3. Git branch and HEAD
4. `git status --short`
5. Confirm stack: Next.js 16 static export + Capacitor 6, npm
6. `NEXT_PUBLIC_API_BASE_URL` presence — **without revealing the value**
7. `ios/` folder status
8. Open items from `RELEASE_CHECKLIST.md`
9. Current task authority
10. Safest next action

---

## 9. Required Output Format

Lead with the result. Then:

1. Outcome
2. Files changed
3. Checks run (`lint` / `typecheck` / `build` / `cap:check-env`)
4. What passed
5. What failed or could not be verified
6. Evidence used
7. Risks or limitations
8. Recommended next step
9. Whether owner approval is needed before commit / push / build / archive / upload / submission

Never bury failures. Never claim completion without evidence. Never imply a change reaches installed apps without a new native release.
