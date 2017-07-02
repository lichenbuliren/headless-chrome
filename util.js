const shutdown = ({chrome, protocol}) => {
  protocol.close();
  chrome.kill();
}

exports.shutdown = shutdown;