#!/bin/bash

# This script is called by Docker's ENTRYPOINT when the GitHub Action runs.
# GitHub Actions passes action inputs as positional arguments ($1, $2, etc.)
# so we capture them into named variables here for readability.
SCAN_PATH=$1   # The directory to scan — passed in as the first action input
SEVERITY=$2    # The minimum severity level to care about (e.g. "HIGH", "MEDIUM")

echo "Starting security scan on: $SCAN_PATH"
echo "Severity threshold: $SEVERITY"

# Run bandit — a Python source code security scanner.
#   -r           recursively scans all .py files under the given path
#   -f json      outputs results as JSON so we can parse it below
#   --output     writes the report to a temp file rather than stdout
#   || true      prevents a non-zero bandit exit code from killing the script
#                early — we want to handle the results ourselves below
bandit -r "$SCAN_PATH" -f json --output /tmp/bandit-report.json || true

# Parse the JSON report with a short inline Python script.
# "cat" pipes the report into Python via stdin, which counts how many findings
# are at or above our chosen severity level. The result is stored in VULN_COUNT.
VULN_COUNT=$(cat /tmp/bandit-report.json | python3 -c "
import sys, json
data = json.load(sys.stdin)
count = len([r for r in data.get('results', []) if r['issue_severity'].lower() >= '$SEVERITY'.lower()])
print(count)
")

# Write outputs to the special $GITHUB_OUTPUT file — this is how a container
# action exposes values to subsequent steps in the workflow.
echo "vulnerabilities-found=$VULN_COUNT" >> $GITHUB_OUTPUT
echo "report-path=/tmp/bandit-report.json" >> $GITHUB_OUTPUT

# Copy the report into the workspace so it can be uploaded as a workflow artifact
cp /tmp/bandit-report.json "$GITHUB_WORKSPACE/security-report.json"

echo "Scan complete. Found $VULN_COUNT vulnerabilities at or above $SEVERITY severity."

# Exit with code 1 to fail the action if any vulnerabilities were found.
# A non-zero exit code is how shell scripts (and by extension, GitHub Actions) signal failure.
if [ "$VULN_COUNT" -gt 0 ]; then
  exit 1
fi