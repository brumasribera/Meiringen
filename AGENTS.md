<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Workflow Defaults

- After finishing a requested code change, commit and push the change to the remote unless the user says not to.
- At the end of every response, mention whether pushing to `origin/main` was successful when a push was attempted.
- Always ensure `npm run dev` is running on localhost:3000 in the background. If it's not running, start it before beginning other work.
