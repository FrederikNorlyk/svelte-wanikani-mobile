# Study session tests

Run `pnpm test` for the suite, or `pnpm test src/lib/state/studySession.test.ts`
for the lifecycle tests. `pnpm check` also checks test types.

The primary seam is `createStudySession`: tests start sessions, answer, continue,
and inspect observable state and effects. The fixture substitutes remote calls,
repositories, and toast delivery; save and refresh promises are controlled by
each test. Completion tests use Vitest's fake clock. The route integration tests
render the real screens and exercise their controls with the same substitutes.

Before moving the handler from commit `d24774a`, its original `onAnswer` and
`getNextQuestion` functions were executed with controlled promises:

- Two overlapping ordinary correct clicks submitted assignments 101 and 202,
  incremented the correct count twice, and advanced index 0 to 2 before saving.
- Two correct clicks on a pending final question both submitted assignment 101
  and counted, kept index 0, and showed completion when a final save settled.
- Subject lookup starts before awaiting; assignment lookup uses the index after
  that await. Overlapping clicks can therefore use the earlier subject's answer
  mapping with the next assignment. The lifecycle tests retain this behavior.

These are characterization expectations, including repeated local accounting;
they are not deduplication requirements. Completion coordination runs once per
session, independently of how many final submissions remain pending.
