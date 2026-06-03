### We use the Dockerfile to define the container environment for the action

# Set base image:
FROM python:3.11-slim

## Install system dependencies the scanner needs:

# apt-get is the Linux package manager — like Homebrew on macOS.
# "update" refreshes the package list, then we install git and curl.
# The final "rm" cleans up the package cache to keep the image size down.
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install the scanning tool:
# "safety" scans dependencies for known vulnerabilities.
# "bandit" scans Python source code for common security issues.
# --no-cache-dir skips saving downloaded packages locally, keeping the image lean.
RUN pip install --no-cache-dir safety bandit

## Setting the entrypoint:

# Copy the entrypoint script from the repo into the container's root directory
COPY entrypoint.sh /entrypoint.sh

# Give the entrypoint script execution permissions
# chmod +x marks the script as executable — required on Linux before you can run a file
RUN chmod +x /entrypoint.sh

# Set the entrypoint so that GitHub Actions knows which script to run when this container action is triggered
ENTRYPOINT [ "/entrypoint.sh" ]