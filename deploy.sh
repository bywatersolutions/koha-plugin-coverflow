#!/bin/bash

if echo $TRAVIS_BRANCH | grep master
then
  echo "Building release"
  node increment_version.js
  git commit -a -m "Version auto-incremented  - $TRAVIS_JOB_NUMBER [skip ci]"
  gulp build
  gulp release
  git remote add github https://$GITHUB_TOKEN@github.com/bywatersolutions/koha-plugin-coverflow
  git fetch --all
  git push github HEAD:master
fi
