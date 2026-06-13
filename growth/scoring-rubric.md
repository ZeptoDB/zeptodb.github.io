# Opportunity Scoring Rubric

Score each opportunity before drafting a response.

## Product Fit

1. Barely related to ZeptoDB.
2. General database, AI, or infra discussion with weak fit.
3. Relevant category but unclear pain or buyer.
4. Clear problem match with agent memory, TSDB, replay, prompt cache, robotics, IoT, or trading.
5. Direct request for an architecture, product, benchmark, or alternative that ZeptoDB can credibly answer.

## Reply Risk

1. User explicitly asks for recommendations or examples.
2. Technical discussion where a helpful disclosed answer is normal.
3. Community allows discussion but vendor mention may be sensitive.
4. Self-promotion risk is high or rules are unclear.
5. Vendor/product mention is prohibited or likely to damage trust.

## Recommended Action

| Product Fit | Reply Risk | Action |
|---:|---:|---|
| 4-5 | 1-2 | Draft response. |
| 4-5 | 3 | Review rules and rewrite with minimal product mention. |
| 3 | 1-2 | Save for later or answer without link. |
| 1-2 | any | Listen only. |
| any | 4-5 | Listen only. |

## Draft Priority

Use this formula:

```text
score = product_fit * 2 - reply_risk
```

Prioritize score 6 or higher.

## Quality Gate

Approve only if the draft:

- Gives a useful architecture answer.
- Names tradeoffs.
- Uses one link at most.
- Discloses affiliation when ZeptoDB is mentioned.
- Avoids repeated language.
- Sends the reader to the most specific landing page.
