exports.User = {
  usersCollection: "users-collection",
};

exports.Message = {
  messagesCollection: "messages-collection",
};

exports.Post = {
  postsCollection: "posts-collection",
  postHolderId: "postHolderId",
  engagement: "engagement",
  likes: "likes",
  comments: "comments",
};

exports.ConnectionType = {
  sent: "request-sent",
  received: "request-received",
  connected: "connected",
  notConnected: "not-connected",
};

exports.PostTypes = {
  Text: "text",
  Image: "image",
  Video: "video",
  Pdf: "pdf",
  Slide: "slide",
  Poll: "poll",
};

exports.AccountThings = {
  profileImgStorageContainer: "user-profile-img-container",
  connections: "connections",
  posts: "my-posts",
  shares: "shares",
  notifications: "notifications",
  connectionsList: "list",
  postsCollection: "collection",
  feed: "feed",
  feedCollection: "collection",
  notification: "notification",
  notificationList: "notification-list",
  messaging: "messaging",
  chatPartnerId: "partnerId",
  pendingMessaging: "pending-messaging",
};

exports.ChatMsgTypes = {
  text: "text",
  image: "image",
};

exports.SocketEvents = {
  newMessage: "newMessage",
  realTimeNotification: "getRealTimeNotifications",
  addUser: "addUser",
  getUsers:"getUsers",
  getActiveUsers: "getactiveUsersCollection",
  disconnect: "disconnect",
  connection: "connection",
  sendChatMessage: "sendChatMessage",
  acceptIncomingChatMessage: "acceptIncomingChatMessage",
}
