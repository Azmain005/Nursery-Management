// import { doc, getDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { db } from "../../Auth/firebase.init";
import Loader from "../../components/Loader/Loader";
import { AuthContext } from "../../providers/AuthProvider";

const Home = () => {
  const { user, getRoleFromDatabase } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // const fetchUserData = async () => {
    //     if (user?.uid) {
    //         const docRef = doc(db, "user_data", user.uid);
    //         const docSnap = await getDoc(docRef);

    //         if (docSnap.exists()) {
    //             setUserData(docSnap.data());
    //         } else {
    //             console.log("No such document!");
    //         }
    //     }
    // };

    // fetchUserData();
    getRoleFromDatabase(user)
      .then((user) => {
        setUserData(user);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, [user]);
  console.log(userData);

  useEffect(() => {
    if (userData) {
      if (userData === "NurseryWorker") {
        navigate("/nurseryWorker");
      } else if (userData === "Vendor") {
        navigate("/vendor");
      } else {
        navigate("/supplier");
      }
    }
  }, [userData, navigate]);

  return <Loader></Loader>;
};

export default Home;
