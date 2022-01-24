const CryptoJS = require("crypto-js");

exports.postEncryption = (content) => {
  return CryptoJS.AES.encrypt(
    JSON.stringify(content.toString().split("\n").join("<br/>")),
    process.env.POST_ENCRYPTION_SECRET
  ).toString();
};

exports.postDecryption = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(
    encryptedData,
    process.env.POST_ENCRYPTION_SECRET
  );

  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

exports.messageEncryption = (content) => {
  return CryptoJS.AES.encrypt(
    JSON.stringify(content),
    process.env.MESSAGE_ENCRYPTION_SECRET
  ).toString();
};

exports.messageDecryption = (encryptedMessageData) => {
  const bytes = CryptoJS.AES.decrypt(
    encryptedMessageData,
    process.env.MESSAGE_ENCRYPTION_SECRET
  );
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
