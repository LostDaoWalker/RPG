CLAUDE.md
Universal constraints for all output. No exceptions.

Foundational: KISS, DRY, SOLID, YAGNI (no premature abstraction), SSOT, CUPID, Law of Demeter

Output
Smallest ideal form factor — zero cruft, zero filler, no minification
All interactions, plans, and commit messages — extremely concise, sacrifice grammar for concision
Active voice — front-load the point, lead with the conclusion
No emotes or static explanatory text
Self-documenting naming — code reads without comments
Optimize for the reader — code is read 10x more than written
Consistent formatting — one style, enforced, never debated
Document why, not what
No magic numbers or strings — name every constant
Semantic markup — elements for meaning, not appearance
Consistent spacing system — use a scale, never arbitrary values
Align everything — nothing is placed arbitrarily
Architecture
Separation of concerns — one responsibility per unit, maximize cohesion
Composition over inheritance
Declarative over imperative
Data-driven over hardcoded — config, tables, and maps over branches
Prefer flat over nested — early returns, guard clauses
Colocation — keep related things together
Structure for extension — invest in foundations that eliminate future code
Minimal moving parts — encapsulate what varies, stabilize the rest
Narrow interfaces, least privilege — expose only what's needed
Depend inward, invert control — high-level never depends on low-level details
Minimize connascence — changing one thing shouldn't ripple
Command query separation
Default to systems and frameworks — implement content only when asked
Do not reinvent the wheel
Prefer standard protocols and formats
Schema-first — define the shape before writing logic
Normalize data, denormalize views — store once, derive for display
Prefer reversible decisions — optimize for deletion, avoid painting into corners
Progressive disclosure of complexity — simple to start, powerful when needed
Complexity budget — every feature costs, spend deliberately
Correctness
Fix root causes — no shims, workarounds, or legacy code
Make bug classes and recurring problems structurally impossible
Make invalid states unrepresentable — zero/empty/unset must be inert
Fail fast — no silent failures, no swallowed errors, warnings are errors
Strong contracts at boundaries — sanitize and validate all inputs
Exhaustive state and error handling — no unhandled cases
Errors are values — explicit propagation, not exceptions as control flow
Backward compatible contracts, forward-looking implementations
Prune aggressively — unused, redundant, misleading, or deprecated code dies
Design for failure — assume anything can fail, handle it
Timeouts on all external calls — nothing waits forever
Deterministic behavior — same input, same output, always
Clean up after yourself — close what you open, free what you allocate
Type safety where available — leverage the type system
Defensive copying — never expose internal data structures
UX
Contain failures — system breaks don't cascade to the user
Feedback on every action — the user should never wonder "did that work?"
Reduce decision fatigue — fewer choices, smarter defaults, right action is easiest action
Recognition over recall — show options, don't expect the user to remember
Chunking — group related info into digestible units
Sensible friction — make destructive actions deliberately harder
Predictable rhythm — consistent patterns reduce learning curve
Responsive by default — works at every viewport
Perceived performance — feel fast even when it isn't
Visual stability — nothing shifts unexpectedly
Compact interfaces — group controls tightly, don't scatter across the viewport
Performance
Operations must be idempotent, atomic, and hermetic
Batch and parallelize — minimize calls, reads, and roundtrips
Stateless where possible — state is liability, no global state
Immutability and purity by default — opt into mutation and side effects explicitly
Prefer async/non-blocking
Lazy evaluation — compute only what's needed, when it's needed
Process
Investigate first, ship only what you can defend
Verify before claiming done
Targeted, incremental edits — never full rewrites
Be proactive — anticipate and resolve, don't wait to be told
Minimize cognitive and maintenance overhead
Convention over configuration — sane defaults, override when needed
Fast feedback loops — builds, tests, deploys should be instant
Zero manual steps — if it can be automated, it must be
Least surprise — behavior matches what the user and developer expect
Show, don't tell — working demo over explanation
One concept per commit — atomic, reviewable, revertable
Leave it better than you found it — write code you'd be happy to maintain
Game Design
Tight core loop — the first 10 seconds must be satisfying before anything else matters
Reward loops — short, medium, and long-term feedback cycles
Clear affordances — the player knows what's interactable without instruction
Balance through constraint — limit options to create depth, not breadth
Game Visual
Information density ceiling — only what the player needs right now, nothing more
Every datum shown once — no redundant displays across elements
Visual hierarchy serves gameplay — most important element is most visually prominent
Readability at a glance — state is understood in under a second
Consistent visual language — same shape/color always means the same thing
Negative space is a resource — screen real estate is finite, emptiness has value
