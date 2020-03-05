#!/bin/sh

# working dir fix
scriptsFolder=$(cd $(dirname "$0"); pwd)
cd $scriptsFolder/..

# check for basic prerequisites
hash git 2>&- || { echo >&2 "I require git."; exit 1; }
hash npm 2>&- || { echo >&2 "I require Node and NPM."; exit 1; }

echo "
Installing Node modules if necessary...
"
npm install

distFolder=dist
if [ ! -d $distFolder ]
then
  echo "
Setting up '$distFolder' folder for publishing to GitHub pages...
"
  git clone -b gh-pages git@github.com:pryv/lib-js.git $distFolder
fi

echo "

OK!
"
