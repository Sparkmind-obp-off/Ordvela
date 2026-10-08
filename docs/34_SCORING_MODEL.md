# ORDVELA INTELLIGENCE — Opportunity Scoring Model
Status: V0 CANONICAL

## Goal
Rank opportunities by commercial usefulness, not by raw engagement or volume.

## Dimensions
Score each dimension 0–100:
- Demand strength
- Intent strength
- Urgency
- Budget signal
- Problem specificity
- Fit
- Reachability
- Evidence confidence

## Suggested weighted score
Opportunity Score =
20% demand strength +
20% intent +
15% urgency +
15% budget signal +
10% fit +
10% reachability +
10% confidence

Weights are configurable and must be versioned.

## Explainability
Every score must expose:
- component scores
- weighting version
- evidence used
- generated timestamp

## Learning
Outcome data should be used to evaluate whether high scores actually correlate with replies, qualified conversations, proposals and revenue. Do not silently rewrite historical scores.
