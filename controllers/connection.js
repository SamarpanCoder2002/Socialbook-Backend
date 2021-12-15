const { getAuth } = require("firebase/auth");
const {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    doc,
    setDoc,
    where,
    query,
  } = require("firebase/firestore");
const { User } = require("./types/auth-prototype");

exports.ConnectionRequest = async (req, res) => {
  const currentUser = req.body.currentUser;
  const oppositeUser = req.body.oppositeUser;

  const db = getFirestore();
 
  await setDoc(
    doc(
      db,
      User.usersCollection,
      currentUser.id,
      "connections",
      "invitation",
      "sent",
      oppositeUser.id
    ),
    {
        name: oppositeUser.name,
        description: oppositeUser.description,
        profilePic: oppositeUser.profilePic,
    }
  );
  
  await setDoc(
    doc(
      db,
      User.usersCollection,
      oppositeUser.id,
      "connections",
      "invitation",
      "received",
      currentUser.id,
    ),
    {
        name: currentUser.name,
        description: currentUser.description,
        profilePic: currentUser.profilePic,
    }
  );

  return res.status(200).json({     
    message: "Connection Request Sent",
  });
};
