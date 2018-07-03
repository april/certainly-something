import { parse } from './der.js';


const getSecurityInfo = async (securityInfo) => {
  // there is some information we need from the parsed securityInfo.certificates as well as
  // information that can only be retrieved from the certificate's raw DER
  securityInfo['certs'] = [];
  for (const siCert of securityInfo.certificates) {
    const der = new Uint8Array(siCert.rawDER);
    const parsedCert = await parse(der);

    // store if it's a built-in cert or not
    parsedCert['isBuiltInRoot'] = siCert.isBuiltInRoot;

    securityInfo['certs'].push(parsedCert);
  }

  return securityInfo;
};

const render = (securityInfo) => {
  console.log('about to render', securityInfo);
  document.body.innerHTML = Handlebars.templates.viewer(securityInfo);
}

const handleDOMContentLoaded = () => {
  // get the tab id
  const tid = window.location.search.split('=')[1];

  chrome.runtime.sendMessage(
    {
      'action': 'getSecurityInfo',
      'tabId': tid
    },
    async response => {
      const securityInfo = await getSecurityInfo(response);
      render(response);
    }
  )
};

// initialize the document
document.addEventListener('DOMContentLoaded', () => {
  handleDOMContentLoaded();
});
