import { parse } from './der.js';
import { pemToBER } from './utils.js';

let template = require('../index.handlebars');


// returns an object with a certs array: it either inserts them into an existing securityInfo
// object, or it creates a new object containing only the certs
const buildChain = async (chain) => {
  let builtChain;

  // probably a PEM encoded certificate
  if (typeof chain === 'string' && chain.includes('-----BEGIN CERTIFICATE-----')) {
    builtChain = chain.trim()
                      .replace(/\r|\n|\0/g, '')
                      .split(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----/g)
                      .filter(v => v.startsWith('MII'));

    builtChain = builtChain.map(cert => { return pemToBER(cert) });
  } else if (chain.buffer) {   // DER encoded
    builtChain = [ chain.buffer ];
  } else if (typeof chain === 'object' && Array.isArray(chain)) {
    builtChain = chain.map(cert => { return new Uint8Array(cert.rawDER).buffer });
  }

  // now we need to parse each of the certificates, and return the parsed chain
  return await Promise.all(builtChain.map(cert => parse(cert)));
};


// redirect to the error page
const error = (message) => {
  if (message === undefined) {
    message = 'Error loading certificate information. Please close this page, refresh your tab, and try again. Sorry!';
  }

  window.location.href = `/viewer/error.html?message=${encodeURIComponent(message)}`;
}


const postRender = () => {
  // setup handlers for tabbing between certificates
  const buttons = document.getElementById('certificates').getElementsByClassName('panel-section-tabs-button');
  const certificates = document.getElementsByClassName('certificate');
  const longhexes = document.getElementsByClassName('long-hex');
  const issuerlinks = document.getElementsByClassName('issuer-link');

  // setup the event handlers for tabs
  for (let node of buttons) {
    node.addEventListener('click', event => {

      Array.from(buttons).forEach(button => {
        if (event.target === button) {
          button.classList.add('selected');
        } else {
          button.classList.remove('selected');
        }
      });

      Array.from(certificates).forEach(certificate => {
        if (event.target.getAttribute('data-certificate-index') == certificate.getAttribute('data-certificate-index')) {
          certificate.removeAttribute('hidden');
        } else {
          certificate.setAttribute('hidden', true);
        }
      });
    });
  }

    // setup event handler for issuer navigation
    for (let node of issuerlinks) {
      node.addEventListener('click', event => {
        for (let button of buttons) {
          if ((parseInt(node.id) + 1) == button.getAttribute('data-certificate-index')) {
            button.dispatchEvent(new Event('click'));
          }
        }
      });
    }

  // make long hex values expand if clicked upon
  for (let node of longhexes) {
    node.addEventListener('click', event => event.target.classList.toggle('long-hex'));
  }
};


const render = (securityInfo) => {
  // console.log('about to render with this securityInfo', securityInfo);

  // change the tab title
  document.title = `${securityInfo.certs[0].subject.cn} (Certainly Something)`;

  // do some minor cleanup on the securityInfo data - we don't want to put this in the handler, as
  // it gets called too frequently
  if (securityInfo.protocolVersion) {
    // TLSv1 --> TLS 1.0
    if (securityInfo.protocolVersion === 'TLSv1') {
      securityInfo.protocolVersion = 'TLS 1.0';
    }

    securityInfo.protocolVersion = securityInfo.protocolVersion.replace('v', ' ');
  }

  // render the handlebars template
  // document.body.innerHTML = Handlebars.templates.viewer(securityInfo);
  document.body.innerHTML = template(securityInfo);

  // once handlebars has rendered, let us setup event handlers
  postRender();
}


const handleDOMContentLoaded = async () => {
  // get the URL parameters, see if cert is defined
  const url = new URL(window.location);
  const params = new URLSearchParams(url.search);

  if (window.location.pathname.includes('upload.html')) {  // do nothing on upload page
    return;
  } else if (window.location.pathname.includes('error.html')) {
    document.getElementById('message').textContent = decodeURIComponent(params.get('message'));
    return;
  } else if (params.get('mode') === 'upload') {                         // sent here from upload page
    const certificate = new Uint8Array(JSON.parse(localStorage.getItem('certificate'))['file']);
    const certificateString = String.fromCharCode.apply(null, certificate);

    if (certificateString.includes('-----BEGIN CERTIFICATE-----')) {  // PEM
      render({
        certs: await buildChain(certificateString),
      });
    } else if (certificate[0] === 0x30 && certificate[1] === 0x82) {  // DER
      render({
        certs: await buildChain(certificate),
      });
    } else {
      // we can't parse it
      error('Unable to parse certificate.');
    }
  } else {                                                 // clicked icon in address bar
    // get the tab id
    const tid = window.location.search.split('=')[1];

    chrome.runtime.sendMessage(
      {
        'action': 'getSecurityInfo',
        'tabId': tid,
      },
      async response => {
        // close the tab if we don't get a response back
        // this shouldn't happen anymore, but lets redirect to an error page
        if (response === undefined) {
          error();
          return;
        }

        // stuff the parsed certificate chain into securityInfo
        response['certs'] = await buildChain(response['certificates']);

        // now we need to copy over any isBuiltInRoot stuff
        response.certificates.forEach((certificate, i) => {
          response.certs[i]['isBuiltInRoot'] = certificate.isBuiltInRoot;
        });

        // and then render the certificate
        render(response);
      }
    );
  }
};


// initialize the document
document.addEventListener('DOMContentLoaded', () => {
  handleDOMContentLoaded();
});


// the upload certificate event handler
if (window.location.pathname.includes('upload.html')) {
  document.getElementById('uploadCertificate').addEventListener('change', (e) => {
    const reader = new FileReader();

    // create the event handler to redirect once the pem file is loaded
    reader.addEventListener('load', (e) => {
      const file = Array.from(new Uint8Array(e.target.result));
      localStorage.setItem('certificate', JSON.stringify({file}));
      document.location = `/viewer/index.html?mode=upload`;
    });

    // read the file in as binary
    reader.readAsArrayBuffer(e.target.files[0]);
  });

  // click the upload button automatically
  document.getElementById('uploadCertificate').click();
}
