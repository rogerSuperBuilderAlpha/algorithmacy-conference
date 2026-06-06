# Asphalt for AI agents: is it any good?

**Authors:** Antonio Mele (LSE)
**Contact:** meleantonio@gmail.com
**Type:** Note
**Track:** TR.05
**Word count:** 400
**Keywords:** AI agents, agent infrastructure, observability, access control, workflow automation
**Conflicts of interest:** none

---

## Abstract
AI agents increasingly promise to act across software environments, but their practical value depends less on model autonomy than on the substrate that lets them move safely. This abstract examines "asphalt" as a metaphor and design pattern for agent infrastructure: a durable operational layer of APIs, permissions, logs, queues, state stores, evaluation harnesses, and human review points. It asks whether such asphalt is any good, meaning whether it improves reliability, auditability, and economic value compared with chat-based assistants or ad hoc automation.

The answer is conditional. Asphalt helps when organizations have stable workflows, high-quality operational data, clear authority boundaries, and repetitive decisions whose consequences can be measured. In those settings, agents can route tickets, prepare procurement actions, inspect plant or fleet data, reconcile records, and draft decisions while leaving high-risk execution to governed systems. The asphalt reduces friction, makes agent behavior observable, and turns one-off prompts into repeatable services. It also creates a shared vocabulary between engineers, operators, compliance teams, and managers: what the agent may see, what it may change, how it asks for help, and who is responsible when it acts.

The same approach fails when teams pave over broken processes. If approvals are ambiguous, knowledge lives in private messages, data systems disagree, or no one owns the outcome, agents accelerate confusion. More infrastructure can even hide the problem by making failures look systematic. A polished agent layer may produce dashboards, traces, and task counts while the underlying work still stalls. For that reason, asphalt should be evaluated along five dimensions: integration depth, permission design, recoverability, measurement, and organizational fit. Strong implementations keep tools narrow, issue temporary credentials, log every external action, test agents against historical cases, and define handoff rules before deployment. Weak implementations treat agents as general-purpose workers, grant broad access, and measure activity instead of resolved business outcomes.

The central finding is that asphalt is good for AI agents when it is treated as civil engineering, not decoration. The right substrate gives agents lanes, signs, drainage, speed limits, and maintenance crews. It does not decide where the road should go. Before investing, teams should simplify the workflow, specify accountable owners, and choose tasks where partial automation still creates value. Its value should therefore be judged through field trials that compare cost, error rates, turnaround time, and user trust against simpler automation baselines. Asphalt can make agents useful, but it cannot make an incoherent process intelligent.

## Outline
- Define "asphalt" as the infrastructure layer AI agents need: APIs, permissions, logs, queues, state, evaluations, and review points.
- State the core question: does this layer make agents more reliable and useful, or just add complexity?
- Argue that asphalt helps when workflows are stable, data is clean, and authority boundaries are clear.
- Show the upside: repeatable execution, better audit trails, safer tool use, and clearer human handoffs.
- Note suitable use cases: ticket routing, procurement prep, record reconciliation, operations monitoring, and draft decisions.
- Warn against "paving over" broken processes, where agents speed up confusion instead of solving it.
- Evaluate asphalt through integration depth, permission design, recoverability, measurement, and organizational fit.
- Conclude that asphalt is good for agents when treated as operational engineering, but it cannot fix incoherent workflows.

## Author bios
**Antonio Mele** is an Associate Professor (Education) at the London School of Economics.

---

*Submitted under the conference open-review policy: this submission and all reviews will be public on the repository. The PR timestamp is the priority record.*
