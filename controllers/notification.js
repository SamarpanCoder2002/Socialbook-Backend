exports.addNotification = ({ message, link }) => {
  const newNotification = {
    [Date.now()]: {
      message: message,
      link: link,
    },
  };
};
