# How to use Custom GitHub Actions

## Same-Repository Actions (Local Actions)

If your custom action lives in the same repo as your workflow, reference it by its **path relative to the repo root**, starting with `./`.

```yaml
# .github/workflows/deploy.yml
name: Deploy Application

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Path must match where your action.yml actually lives
      - name: Setup project
        uses: ./.github/actions/setup-node-project
        with:
          node-version: '20'

      - name: Build and deploy
        run: npm run build && npm run deploy

      - name: Notify Slack
        if: always()   # runs even if a previous step failed
        uses: ./.github/actions/slack-notifier
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          environment: production
          status: ${{ job.status }}
```

> **Important:** The path in `uses:` must point to the directory containing your `action.yml`. If your actions live in a top-level `actions/` folder rather than `.github/actions/`, adjust accordingly — e.g. `uses: ./actions/slack-notifier`.

`actions/checkout@v4` is required before referencing any local action. Without it, the runner hasn't cloned the repo yet and won't be able to find your action files.

---

## Actions in a Separate Repository (Published Actions)

If your action lives in its own repository (e.g. so multiple repos can share it), reference it using `owner/repo@ref`:

```yaml
- name: Run security scan
  uses: travboz/security-scanner@v1
  with:
    scan-path: ./src
    severity-threshold: high
```

The `@ref` part can be:

| Format | Example | When to use |
|---|---|---|
| A tag | `@v1` or `@v1.2.3` | Production — stable, pinned version |
| A branch | `@main` | Development / testing only |
| A full commit SHA | `@a1b2c3d...` | Maximum stability, immune to tag changes |

Using a tag like `@v1` is the standard convention. You create this in GitHub via **Releases** or by manually pushing a git tag.

---

## How Inputs Are Passed

Inputs you define in `action.yml` under `inputs:` are passed via the `with:` block in your workflow:

```yaml
- name: Run my action
  uses: ./actions/my-action
  with:
    some-input: 'value'
    another-input: ${{ secrets.MY_SECRET }}
```

For **Docker container actions** specifically, inputs are passed as positional arguments to your `entrypoint.sh` in the order they are listed under `args:` in `action.yml`:

```yaml
# action.yml (Docker action)
runs:
  using: 'docker'
  image: 'Dockerfile'
  args:
    - ${{ inputs.scan-path }}        # becomes $1 in entrypoint.sh
    - ${{ inputs.severity-threshold }} # becomes $2 in entrypoint.sh
```

---

## Consuming Outputs

If your action sets outputs (via `$GITHUB_OUTPUT` in a shell script, or `core.setOutput()` in JavaScript), you read them in subsequent steps using the `steps` context:

```yaml
steps:
  - name: Run security scan
    id: scan                          # id is required to reference outputs
    uses: ./actions/security-scanner
    with:
      scan-path: ./src

  - name: Print result
    run: echo "Found ${{ steps.scan.outputs.vulnerabilities-found }} issues"
```

The `id:` field on the step is what makes the output referenceable.

---

## Secrets

Never put sensitive values directly in your workflow YAML. Store them as repository or organisation secrets and reference them with `${{ secrets.SECRET_NAME }}`:

```yaml
with:
  webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

Secrets are masked in logs automatically by GitHub Actions.