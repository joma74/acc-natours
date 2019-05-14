#!/usr/bin/env bash

set -e
set -x

if [[ ! -d $1 ]]; then
    echo "Dir >>$1<< not found, aborting"
    exit -1;
fi

echo "Deploying build to Netlify..."
netlify deploy --prod --dir $1 --auth $NETLIFY_ACCESSTOKEN --site $NETLIFY_SITEID --message "via travis build #${TRAVIS_BUILD_NUMBER} from git branch >>${TRAVIS_BRANCH}<<"

set +x
set +e