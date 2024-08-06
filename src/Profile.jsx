import React, { useEffect, useState } from 'react';
import { auth, db } from './firebaseConfig';
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = ({ user }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setName(userData.name || '');
          setEmail(userData.email || user.email);
        }
        setLoading(false);
      };
      fetchUserData();
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      if (name) {
        await updateProfile(auth.currentUser, { displayName: name });
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { name: name });
        toast.success("Profile updated successfully");
      }

      if (email && email !== user.email) {
        await updateEmail(auth.currentUser, email);
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { email: email });
        toast.success("Email updated successfully");
      }

      if (password) {
        await updatePassword(auth.currentUser, password);
        toast.success("Password updated successfully");
      }
    } catch (error) {
      toast.error("Error updating profile: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="profile-container">
      <ToastContainer />
      <h2>Update Profile</h2>
      {loading ? <p>Loading...</p> : (
        <>
          <label>
            Name:
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Email:
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password:
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep the same" />
          </label>
          <button onClick={handleUpdateProfile} disabled={loading}>Update Profile</button>
        </>
      )}
    </div>
  );
};

export default Profile;