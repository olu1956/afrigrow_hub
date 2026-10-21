# Help assistant

Public page: `/help`. API: `POST /api/assistant`.

The assistant answers general questions about AfriGrow Hub. It does not create accounts, submit applications, take payments, change records, or decide funding eligibility.

## Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000/help](http://localhost:3000/help).

No AI key is required. Without `AI_API_KEY`, replies are short excerpts from pages already in this repo. With a key, the server may draft a reply from those same excerpts.

## Environment variables

Set these in `.env.local` or on the host. Names only — do not commit real secrets.

| Name | Required | Purpose |
| --- | --- | --- |
| `AI_API_KEY` | No | Server-side key for an OpenAI-compatible chat API. Empty means no model call. |
| `AI_API_BASE_URL` | No | Defaults to `https://api.openai.com/v1`. Change this to swap provider. |
| `AI_MODEL` | No | Defaults to `gpt-4o-mini`. |
| `ASSISTANT_PRIVACY_PATH` | No | Site path for the privacy notice. Default `/privacy`. |
| `ASSISTANT_SUPPORT_PATH` | No | Site path for a person. Default `/contact`. |
| `ASSISTANT_RATE_LIMIT_PER_MINUTE` | No | In-memory cap per server instance. Default `12`. |
| `ASSISTANT_LOG_DIAGNOSTICS` | No | `true` logs outcome and source paths only. Default off. |
| `ASSISTANT_LOG_MESSAGES` | No | Keep `false`. `true` logs a redacted latest question. |

The request to the model sends `store: false` so providers that honour it do not retain the completion for their own later use. Confirm that in the provider’s contract before launch. This app does not use chats for training or fine-tuning.

## Where content is managed

Excerpts live in `src/lib/assistant/knowledge.ts`.

Each item has a source path, region (`all` or `depends-on-country`), owner, `approvedOn`, and `reviewBy`. AfriGrow set those dates to 21 October 2026 and 21 January 2027.

Edit that file to add or retire an item. Do not scrape other websites into it. Do not add a scheme, deadline, or eligibility rule unless it is already an approved AfriGrow page.

## Privacy notice and human support

The chat links to `ASSISTANT_PRIVACY_PATH` and `ASSISTANT_SUPPORT_PATH`. Those must be real pages AfriGrow controls. The defaults are the existing privacy policy and contact form. The contact page already shows the published email, phone, and office line from `src/lib/site-contact.ts`.

## What is sent, and what is kept

Sent to the model, only when `AI_API_KEY` is set:

- The fixed assistant instructions.
- The few matching excerpts from `knowledge.ts`.
- The current conversation, up to 8 messages, with emails, phone numbers, and long card-like numbers removed.

Not sent: account records, CRM contacts, funding answers, invoices, or other members’ data. The page does not require a login.

Kept by this app:

- Nothing in the database. Closing the page drops the conversation.
- Server logs only if you turn the log flags on. Diagnostics omit the question. Message logging is redacted and should stay off until AfriGrow chooses a retention period with its host (for example Vercel log retention).

The in-memory rate limit stores an IP address for about a minute and then drops it. It is not shared across multiple servers. Add a host-level limit before a busy launch.

People are told not to enter passwords, bank details, or confidential information. If a message looks like it contains those, it is refused and not sent to the model.

This design is meant to support UK GDPR and the Data Protection Act 2018. It does not make AfriGrow legally compliant on its own.

## Limits

- Read-only. It cannot change a profile, campaign, invoice, or application.
- It asks which country the business is in when a funding, tax, or registration question would differ by country. It still will not confirm eligibility.
- If no excerpt matches, it says so and links to the Business Academy and the contact form.
- Existing dashboard agents (profile, marketing, growth, finance, CRM) are unchanged. They draft content inside a signed-in workspace. This chat is separate so it cannot write those records.

## Review before launch

AfriGrow still needs to:

1. Decide whether the privacy policy needs a sentence about this assistant and the AI provider. Do not treat the current policy as automatic cover for a new model provider.
2. Confirm the provider contract: no training on chats, where data is processed, and how long the provider keeps it.
3. Confirm the contact path and escalation route for questions the assistant cannot answer.
4. Replace the in-memory rate limit if production runs more than one instance.
5. Check the wording with whoever owns legal and member support. The assistant must not be described as giving legal, tax, or regulated financial advice.
