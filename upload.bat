yarn deploy
rem yarn build && aws s3 cp ./dist s3://esm-data/expos/in-cosmetics-2018/ --recursive --exclude "index.html" && aws s3 cp ./dist/index.html s3://esm-data/expos/in-cosmetics-2018/index.html --cache-control max-age=60
rem aws cloudfront create-invalidation --distribution-id E156QNX6Q3CR8L --paths "/*"
rem ./node_modules/.bin/s3-deploy "./dist/**/!(*.map)" --cwd "./dist" --bucket esm-data/expos/in-cosmetics-2018 --private