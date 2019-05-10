const Confirm = require('prompt-confirm');
const expo = require('./expo');
const execa = require('execa');
// const config = require(`../expos/${expo}/config`)

const live = process.env.EFP_TARGET === "live";

(async () => {

    let answer = true;
    if (live) {
        const prompt = new Confirm({
            message: `Are you sure want to deploy to live ${expo.toUpperCase()}?`,
            default: false
        });
        answer = await prompt.run();
    }

    if (!answer) {
        return;
    }
    const build = await execa('yarn', ['build'], {
        stdio: 'inherit'
    });
    if (build.code !== 0) process.exit(build.code);

    let deployExpo = expo;
    // make all dev deploy to dev-demo so far
    //if (!live) deployExpo = 'demo';
    __logger.log('Deploying dist to ' + deployExpo);

    const path = `/expos/${deployExpo}/${!live ? 'dev' : 'live'}`;
    const bucket = `efp-data${path}`;

    const args = ['./dist/**/!(*.map)', '--cwd', './dist', '--bucket', bucket, '--private', '--profile', 'efp-deploy-fp'];
    // invalidate
    args.push('--distId', "ETXR07B411G19", '--invalidate', `${path}/index*`);

    const deploy = await execa('s3-deploy', args, {
        stdio: 'inherit'
    });

    if (deploy.code !== 0) process.exit(deploy.code);
})();