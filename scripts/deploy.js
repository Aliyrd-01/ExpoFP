const { expo, live } = require('./expo');
const execa = require('execa');

(async () => {
    // const build = await execa('yarn', ['build'], { stdio: 'inherit' });
    // if (build.code !== 0) process.exit(build.code);

    console.log('Deploying dist to ' + expo);

    const path = `efp-data/expos/${expo}/${!live ? 'dev' : 'live'}`;

    const deploy = await execa('s3-deploy',
        ['./dist/**/!(*.map)', '--cwd', './dist', '--bucket', path, '--private', '--profile', 'efp-data'],
        { stdio: 'inherit' });

    if (deploy.code !== 0) process.exit(deploy.code);


})();

