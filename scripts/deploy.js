const Confirm = require('prompt-confirm');
const expo = require('./expo');
const execa = require('execa');
const cloudfront = require(`../expos/${expo}/cloudfront`)

const live = process.env.EFP_TARGET === "live";

(async () => {

    let answer = true;
    if (live) {
        const prompt = new Confirm({ message: `Are you sure want to deploy to live ${expo.toUpperCase()}?`, default: false });
        answer = await prompt.run();
    }

    if (!answer) { return; }
    const build = await execa('yarn', ['build'], { stdio: 'inherit' });
    if (build.code !== 0) process.exit(build.code);

    console.log('Deploying dist to ' + expo);

    const path = `efp-data/expos/${expo}/${!live ? 'dev' : 'live'}`;
    const invalidate = `/index*.html`;

    const distId = live ? cloudfront.live : cloudfront.dev;

    const args = ['./dist/**/!(*.map)', '--cwd', './dist', '--bucket', path, '--private', '--profile', 'efp-data'];
    if (live && distId) {
        args.push('--distId', distId, '--invalidate', invalidate);
    }

    const deploy = await execa('s3-deploy', args, { stdio: 'inherit' });

    if (deploy.code !== 0) process.exit(deploy.code);
})();

