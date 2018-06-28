const render = (securityInfo) => {
  document.body.innerHTML = Handlebars.templates.certificate(securityInfo);
}

const handleDOMContentLoaded = () => {
  // get the tab id
  const tid = window.location.search.split('=')[1];

  chrome.runtime.sendMessage(
    {
      'action': 'getSecurityInfo',
      'tabId': tid
    },
    (response) => {
      console.log('response is', response);
      render(response);
    }
  )
}

// initialize the document
document.addEventListener('DOMContentLoaded', () => {
  handleDOMContentLoaded();
});
