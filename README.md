Certainly Something (Certificate Viewer)
========================================

Uses the new TLS Info API in Firefox to view information about the current state of your HTTPS connection.

<p align="center"><img src="https://i.imgur.com/GEbv434.png" alt="Main Info" width="300">    <img src="https://i.imgur.com/xM13M1E.png" alt="Extensions" width="300"></p>

It currently requires at least Firefox 62.

## Developing and Installing Locally

It is recommend that developers use [web-ext](https://github.com/mozilla/web-ext) for installation and testing.  It provides a number of useful features, such as automated installation and autoreload upon source changes. 

Install web-ext using the following command:

````bash
$ npm install --global web-ext
````
For testing and development, run the following commands in two separate terminal windows:

```bash
$ npm run-script watch
$ web-ext run --browser-console -s build --start-url 'https://badssl.com/'
```

If you are simply looking to give it a single run, you can compile it by running:

```bash
$ npm install
$ npm run-script compile
```

And then in Firefox, go to -> Add-ons -> Extensions -> (Gear Icon) -> Debug Add-ons -> Load Temporary Add-on

Navigate to `build/manifest.json` and it should start running immediately.

## Supported Functionality

* Handshake information (TLS version, cipher suite, signature scheme)
* Subject and issuer information (common name, organization, etc.)
* Validity date ranges
* Subject alternative names
* Subject public key information (SPKI)
* Certificate downloading
* Key usage
* Serial numbers
* Fingerprints
* Extensions, including
  * Basic constraints
  * Extended key usage
  * Certificate revocation list (CRL) endpoints
  * Authority information access (AIA)
  * Certificate policies (most common policies)
  * Subject key identifiers
  * Authority key identifiers
  * OCSP stapling
  * [Embedded SCTs](https://www.certificate-transparency.org/), including CT log names  

## Kudos

Thanks so much to Ryan Hurst and Yury Strozhevsky for doing the painful work in [PKI.js](https://pkijs.org/) and [ASN1.js](https://asn1js.org/), without which this project could not have been accomplished.
