# How to contribute

It's important to us that you feel you can contribute towards the evolution of coset framework. This can take many forms: from helping to fix bugs or improve the docs, to adding in new features to the source. This guide should help you in making that process as smooth as possible.

Before contributing, please read the [Code of Conduct](CODE_OF_CONDUCT.md) which is adapted from [Contributor Covenant, version 1.4](https://www.contributor-covenant.org/version/1/4).

## Reporting issues

To report a bug, request a feature or simply ask a question, make use of GiHub Issues section for [Issues](https://github.com/Dreaded-Gnu/coset/issues). When submitting an issue please take care of the following stepsÖ

1. **Search for alreadz existing issues.** Your question or bug may already have been answered or fixed. Be sure to search issues first before putting in a duplicate issue.

2. **Create an isolated and reproducible test case.** If you are reporting a bug, make sure you also have a minimal, runnable, code example that reproduces the problem you have. That makes it easier to fix something.

3. **Share as much information as possible.** Include browser version affected, your OS, version of the library, steps to reproduce as also written within issue template. Something like "X isn't working!!!1!" will probably just be closed.

## Contributing changes

### Setting up

To setup for making changes you'll need to take a few steps, which we've outlined below:

1. Ensure that node.js is installed. You can download it from [nodejs.org](https://nodejs.org). Because we're using modern JavaScript features via TypeScript, you'll need a modern version of node.js, starting with version 8 and above.

2. Fork repository [coset](https://github.com/Dreaded-Gnu/coset). If you're not sure how to fork the repository, GitHub has a [guid](https://help.github.com/articles/fork-a-repo/) for the process.

3. Checkout created fork and run `npm install` from within the root repository. That will install all necessary dev dependencies and start bootstrap of package dependencies by using lerna.

### Making a change

Once nodejs is ready, the repository has been checked out and the dependencies have been installed, you're almost ready to make the change. The last point to be done before you start is checking out the correct branch for the change itself. Which branch shall be used depends on the type of change you're going to do.

Short branch breakdown

- `master` - Make your change at the `master` branch in case that it is an *urgent* hotfix
- `dev` - Make your change at the `dev` branch, when it's a *non-urgent* bugfix or some backwards-compatible feature.
- `next` - Make your change at the `next` branch, when it leads to a breaking change and is not backwards-compatible.

The change should be made directly to the correct branch within your fork or to a branch branched from the correct branch listed above.

### Testing Your change

You can test your change by executing the automatic test of all packages via `npm test` via commandline from root project folder. If you're going to fix a bug, please add a new test, that catches the fixed bug, to prevent incoming regressions.

### Submitting Your change

After you've made and tested the change, commit and push it to the fork. After that open a Pull Request from your fork to the main repository on the branch used in `Making a change` section of this document. Keep the fork up to date by using rebase instead of normal merge which would result in more merge commits than necessary.

## Code style guide

- Use 2 spaces for tabs, never tab characters.
- No trailing whitespace and consecutive blank lines, blank lines should have no whitespace.
- Always favor strict equals `===` unless you *need* to use type coercion.
- Follow conventions already in the code, and listen to tslint.
- **Ensure changes are tslint validated.**
- After making a change be sure to run the test process to ensure that you didn't break anything. You can do this with `npm test` from root project folder which will execute the test suite of all packages.

## Contributor Code of Conduct

[Code of Conduct](CODE_OF_CONDUCT.md) is adapted from [Contributor Covenant, version 1.4](http://contributor-covenant.org/version/1/4)

## Post scriptum

Thanks to the author who created the original [Pixi.js](https://github.com/pixijs/pixi.js) contributing file which we adapted for this project.
