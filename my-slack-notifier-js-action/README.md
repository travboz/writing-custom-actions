# My Slack Notifier - JavaScript action

## What does this action do?

This action combines uses webhooks to post deployment notifications to Slack.

## Inputs

### `webhook-url`

**Required** Slack incoming webhook URL.

### `environment`

**Not Required** Deployment environment (staging, production). Default `"staging"`.

### `status`

**Required** Deloyment status (success, failure, cancelled, skipped).

## Outputs

### `sent-at`

Local timestamp recorded after Slack accepts the webhook request.

## Example usage

```yaml
- name: Send a deployment notification using Slack custom JavaScript action
  uses: travboz/my-slack-notifier-js-action@v1
  with:
    webhook-url: "https://hooks.slack.com/services/TXXXXXXXX/BXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX"
    environment: "staging"
    status: "${{ steps.some-step-id.outcome }}"
```
