# Method 4 — manual GitHub path

**Authors:** Test Author (Algorithmacy CI)
**Contact:** test-manual@ludwitt.com
**Type:** Note
**Track:** TR.05 — Methods, Lineage & Practice
**Word count:** 320
**Keywords:** test, methods, ci
**Conflicts of interest:** none

---

## Abstract

This is an automated end-to-end test abstract used to verify that a submission method correctly produces a pull request on the conference repository, and it is not a real submission to the program. It is written to contain between three hundred and five hundred words so that the shared validator used by the web form and the MCP server accepts it during the test run. The nominal subject is coordination through an algorithmic third party at work, but no claims, data, or findings are presented anywhere in this placeholder text. The harness exercises each intake path in turn: the web form posts to the submission endpoint, the MCP server accepts a tool call from an agent, and both then send a one click sign off link that the test completes by reading the pending token directly from the shared key value store and calling the confirmation endpoint. The manual and prompt paths instead open a pull request directly through the version control hosting interface, which is exactly what a researcher or an assisting language model would do when following the written instructions on the submission page. After each path produces a pull request, the harness records the pull request address, confirms that the expected markdown file was added under the submissions directory, and then closes the pull request, deletes the working branch, and removes any per email index entries or rate limit counters that the test created so that the repository and the data store are returned to their original empty state. If you are reading this text inside an open pull request, the automated cleanup step did not complete and the pull request can be closed safely without any review by the program committee or the assigned reviewers. Thank you for tolerating this automated noise, which exists only to give the organizers confidence that every advertised submission method reliably converts a prepared abstract into a timestamped pull request that establishes authorship priority for the submitting researcher.

## Outline

1. setup 2. submit 3. confirm 4. verify 5. cleanup

## Author bios

Test Author is an automated CI process.
