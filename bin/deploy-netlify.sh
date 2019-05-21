#!/usr/bin/env bash

set -e
set -x

if [[ ! -d $1 ]]; then
    echo "Dir >>$1<< not found, aborting"
    exit -1;
fi

if [[ -z $2 ]]; then
    echo "NETLIFY SITE ID is not set, aborting"
    exit -1;
fi

echo "Deploying build to Netlify..."
netlify deploy --prod --dir $1 --auth $NETLIFY_ACCESSTOKEN --site $2 --message "via travis build #${TRAVIS_BUILD_NUMBER} from git branch >>${TRAVIS_BRANCH}<<"

set +x
set +e