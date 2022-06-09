# Developers Guide

## Releasing

Currrently we release this project by hand. In the future it should be done by release-droid 
(see [#3](https://github.com/exasol/extension-manager-interface/issues/3)).

Steps:

* Write a changelog file
* Add a link to doc/changes/changelog.md
* Update the version in package.json
* Run `npm login` The credentials can be found in Keeper
* Run `npm publish --access public`
* Make a release on GitHub
