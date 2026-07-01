// Entrypoint for the action
const core = require("@actions/core");
const github = require("@actions/github");
const https = require("https");

async function run() {
    try {
        // Retrieve inputs defined in action.yml
        const webhookUrl = core.getInput("webhook-url", { required: true });
        const environment = core.getInput("environment");
        const status = core.getInput("status");

        // Access contextual information about the workflow run
        const { repo, sha, actor, workflow } = github.context;
        const repoName = `${repo.owner}/${repo.repo}`;
        const shortSha = sha.substring(0, 7);

        // Build the Slack message payload
        const colour = status === 'success' ? '#3cc75a' : '#e73b4c';
        const emoji = status === 'success' ? ':white_check_mark:' : ':x:';

        const payload = {
            attachments: [
                {
                    color: colour,
                    blocks: [
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: `${emoji} *Deployment ${status}*\n*Repo:* ${repoName}\n*Environment:* ${environment}\n*Commit:* ${shortSha}\n*Actor:* ${actor}`
                            }
                        }
                    ],
                }
            ],
        };

        // Send the notification to Slack
        const messageTimestamp = await postToSlack(webhookUrl, payload);

        // Set the output for use in the subsequent workflow steps
        core.setOutput("message-timestamp", messageTimestamp);
        core.info("Successfully posted notification to Slack");
    } catch (error) {
        // Mark the action as failed if something goes wrong
        core.setFailed(`Action failed: ${error.message}`);
    }
}

// postToSlack is a helper function to send a POST request to the Slack webhook.
function postToSlack(webhookUrl, payload) {
    return new Promise((resolve, reject) => {
        const url = new URL(webhookUrl);
        const data = JSON.stringify(payload);

        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const request = https.request(options, (res) => {
            if (res.statusCode === 200) {
                resolve(Date.now().toString());
            } else {
                reject(new Error("Slack API returned ${res.statusCode}`"));
            }
        });

        request.on('error', reject);
        request.write(data);
        request.end();
    });
}

run();