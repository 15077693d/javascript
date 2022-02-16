// @ts-nocheck
import { createRequire } from 'module';
import fetch from 'node-fetch';
import semver from 'semver';

const require = createRequire(import.meta.url);
const version = require('../../backend-core/package.json').version;
const parsedVersion = semver.parse(version);
const prerelease = parsedVersion.prerelease[0];
const major = parsedVersion.major;

try {
  if (!prerelease) {
    await fetch(
      `https://purge.jsdelivr.net/npm/@clerk/clerk-js@${major}/dist/clerk.browser.js`,
    );
  } else if (prerelease === 'staging') {
    await fetch(
      `https://purge.jsdelivr.net/npm/@clerk/clerk-js@staging/dist/clerk.browser.js`,
    );
    return;
  } else {
    await fetch(
      `https://purge.jsdelivr.net/npm/@clerk/clerk-js@next/dist/clerk.browser.js`,
    );
  }
} catch (err) {
  console.error('Something went wrong with `postpublish` in clerk-js!');
  console.error(err);
  process.exit(1);
}
