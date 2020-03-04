# Deploy process

- `git clean -fdx` to clean repo
- `yarn install` to install all deps
- `yarn np` - release new version to npm

# ALL DEPLOYMENT SHOULD BE DONE FROM MASTER BRANCH

- modify `deploy.js` to specify which npm versions go where
- `yarn deploy` to deploy all expos according to `deploy.js`
