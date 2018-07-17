import { parse } from './der.js';


const derParse = async (securityInfo) => {
  // there is some information we need from the parsed securityInfo.certificates as well as
  // information that can only be retrieved from the certificate's raw DER
  securityInfo['certs'] = [];
  for (const siCert of securityInfo.certificates) {
    const parsedCert = await parse(new Uint8Array(siCert.rawDER));

    // store if it's a built-in cert or not
    parsedCert['isBuiltInRoot'] = siCert.isBuiltInRoot;

    securityInfo['certs'].push(parsedCert);
  }

  return securityInfo;
};


const postRender = () => {
  // setup handlers for tabbing between certificates
  const buttons = document.getElementById('certificates').getElementsByClassName('panel-section-tabs-button');
  const certificates = document.getElementsByClassName('certificate');
  const longhexes = document.getElementsByClassName('long-hex');

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

  // make long hex values expand if clicked upon
  for (let node of longhexes) {
    node.addEventListener('click', event => event.target.classList.toggle('long-hex'));
  }
};


const render = (securityInfo) => {
  console.log('about to render with this securityInfo', securityInfo);

  // change the tab title
  document.title = `${securityInfo.certs[0].subject.cn} (Certainly Something)`;

  // render the handlebars template
  document.body.innerHTML = Handlebars.templates.viewer(securityInfo);

  // once handlebars has rendered, let us setup event handlers
  postRender();
}

// closes the current tab of the viewer - can't use window.close()
const closeTab = () => {
  chrome.runtime.sendMessage(
    {
      'action': 'closeTab',
    }
  );
};

const handleDOMContentLoaded = () => {
  // get the tab id
  const tid = window.location.search.split('=')[1];

  chrome.runtime.sendMessage(
    {
      'action': 'getSecurityInfo',
      'tabId': tid
    },
    async response => {
      // close the tab if we don't get a response back
      // this mostly happens because you can't disable the icon on moz-extension pages
      if (response === undefined) {
        closeTab();
        return;
      }

      const securityInfo = await derParse(response);
      render(response);
    }
  );
};


// initialize the document
document.addEventListener('DOMContentLoaded', () => {
  handleDOMContentLoaded();
});
