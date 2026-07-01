# Node.js Custom Set Up - Composite action

## What does this action do?

This action combines setting up the specified Node.js version using actions/setup-node, caching node dependencies using actions/cache, installing dependencies if a cache miss occurs, and runs linting on the project.

## Inputs

### `node-version`

**Not Required** The Node.js version to use. Default `"20"`.

### `working-directory`

**Not Required** Path to the directory containing `package.json`. Default `"."`.

## Outputs

### `cache-hit`

Whether there was a cache hit for the dependencies.

## Example usage

```yaml
- name: Setup Node.js project using custom composite action
  uses: travboz/nodejs-setup-composite-action@v1
  with:
    node-version: '20'
    working-directory: 'projects/node-project'
```
