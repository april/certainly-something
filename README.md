Certificate Viewer
==================

Uses the new TLS Info API in Firefox to view information about the current state of your HTTPS connection. Watch it in action here:

https://www.youtube.com/watch?v=5uCY3k6UFB0

It currently requires at least Firefox 62.

## Developing and Installing Locally

It is recommend that developers use [web-ext](https://github.com/mozilla/web-ext) for installation and testing.  It provides a number of useful features, such as automated installation and autoreload upon source changes:

```bash
$ web-ext run --browser-console -s src --ignore-files 'viewer/*.handlebars' --ignore-files 'scripts/*'
$ fswatch src/viewer/viewer.handlebars | xargs -n1 handlebars -f src/viewer/js/viewer.handlebars.js
```

If you are simply looking to give it a single run, you can install it by navigating to:

Firefox -> Tools -> Add-ons -> Extensions -> (Gear Icon) -> Debug Add-ons -> Load Temporary Add-on

Navigate to `src/manifest.json` and it should start running immediately.

