const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");

exports.uploadFileInStorage = async (blob, fileName, bucketName="", type) => {
  const storage = getStorage();
  const storageRef = ref(storage, `${bucketName}/${fileName}`);

  await uploadBytes(storageRef, blob, {
    contentType: type,
  });

  return await getDownloadURL(storageRef);
};
