const showNotification = async () => {
  const notification = document.createElement('certainly-something-notification');
  notification.textContent = 'Please refresh the page and try again.';

  document.body.appendChild(notification);
};

// show the notification if the backend code doesn't have the TLS information
browser.runtime.onMessage.addListener(async request => {
  if (request.action === 'notify') {
    await showNotification();
  }

  return(true);
});
