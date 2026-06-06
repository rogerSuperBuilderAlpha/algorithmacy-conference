# PRD: transparent scholar outreach for the Algorithmacy Conference

Status: draft v01
Owner: Roger Hunt (rhunt@bentley.edu)
Last updated: 2026-06-06

## Summary

This document specifies an open, agent-run program for inviting scholars to the Algorithmacy Conference. The program lives in the conference repository so that its methods are public and auditable, and so that any ambassador can adopt it by pointing an AI agent at the repository. The design goal beyond reach is restraint: each scheduled job loads only the instructions it needs, which keeps the token cost of running outreach low enough that many people can run it at once.

## Background and rationale

The conference already commits to open, signed, and published review. Outreach should meet the same standard. Hiding how scholars are contacted would contradict the conference's own questions about algorithmic opacity and accountability. Putting the program in the repository makes the method legible to participants, lets the community improve it through pull requests, and gives every ambassador the same playbook rather than a private one.

A second motivation is distribution. The conference benefits when more than one person can promote it. A program that any agent can adopt, without sharing credentials and without a central operator, scales past what a single organizer can do by hand.

## Goals and success metrics

The program succeeds if it produces qualified submissions through transparent means. Concrete targets for the cycle ending 1 August 2026:

| Goal | Metric |
|------|--------|
| Reach matched scholars | Verified, track-matched invitations sent, deduplicated |
| Convert reach to submissions | Submissions in `/submissions/` traceable to outreach |
| Stay honest | Bounce rate held low through verified addresses, zero factual misstatements in sent mail |
| Distribute the work | Number of independent ambassadors running the program |
| Run lean | Tokens loaded per job run held at the `PROGRAM.md` plus one task file budget |

## Non-goals

The program does not mass-email. It does not contact a scholar more than once. It does not submit on anyone's behalf without that author's emailed consent. It does not promote anything other than the conference, and it does not require any ambassador to expose credentials in the repository.

## Users and roles

Three roles interact with the program. The conference organizer maintains the program and the facts of record, and is the named contact on invitations. An ambassador is anyone who adopts the program to help promote the conference, using their own agent and their own accounts. The agent is the openclaw or assistant that an ambassador points at the repository to run the jobs.

## The program

The program is a small set of scheduled jobs, each defined by a single file. Every job loads `PROGRAM.md`, which carries the mission, the conference facts of record, and the hard rules, plus its own one file in `crons/`. No job loads the others, and no job loads an ambassador's full workspace.

The core job is scholar outreach. It builds a candidate list from flagged leads and from academic search across the five tracks, verifies each scholar and finds a real email, sends a personalized invitation that leads with the scholar's own work, and logs the contact to a tracker that prevents re-emailing.

Two reporting jobs keep the operator informed. A daily report states what the pipeline did in one short message. A weekly report summarizes momentum by track and surfaces anything that needs a decision.

An optional visibility job engages on Moltbook or a similar platform to keep the conference findable and to discover researchers worth a direct invitation, whom it adds to the leads tracker for the outreach job to pick up.

The full behavior of each job is specified in its file under `crons/`, and the adoption steps are in `SETUP.md`.

## Policies and safeguards

Every ambassador operates under the same rules, stated in `PROGRAM.md`. No external message may misstate a conference fact, and the facts table is the single source of truth. No agent submits for a scholar without that author's one-click email sign-off, which the conference submission flow enforces by returning no token to the agent. Outreach verifies each scholar before contact and never guesses email addresses. Each scholar receives at most one invitation. Credentials never enter the repository, because the program is agent-agnostic by design.

## Adoption and rollout

An ambassador clones or fetches the repository, copies the tracker templates into their own private state, sets the scheduled jobs using the prompt strings in `SETUP.md`, and instructs their agent to follow the program until the conference. The organizer's own agent adopts the program the same way, which doubles as the reference deployment. Improvements arrive as pull requests against this folder, reviewed in the open like any other contribution.

## Risks and open questions

The main risk is reputational: poorly targeted or factually loose outreach would harm the conference under its own name. The safeguards above address this, and the open repository makes lapses visible quickly. An open question is whether to aggregate ambassador activity into a shared, privacy-respecting log so that duplicate invitations across ambassadors can be avoided; the current design prevents duplication only within a single ambassador's tracker. A second open question is the canonical domain, since the repository uses `algorithmacy.com` throughout and that value should be confirmed before wide adoption.

## Out of scope and future work

This version does not coordinate ambassadors with each other, does not provide a shared submission-attribution dashboard, and does not automate post-conference follow-up. Each is a candidate for a later version once the first cycle runs.
