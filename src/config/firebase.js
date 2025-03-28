// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, doc, getDocs, getFirestore, query, setDoc, where } from 'firebase/firestore'
import { toast } from "react-toastify";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAl4aNDsLZIDHszMSeWnjNsCg2JJJ4bNJ8",
    authDomain: "chat-app-c10d1.firebaseapp.com",
    projectId: "chat-app-c10d1",
    storageBucket: "chat-app-c10d1.firebasestorage.app",
    messagingSenderId: "546822221477",
    appId: "1:546822221477:web:d89836ce2706092982274c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const signup = async (username, email, password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            username: username.toLowerCase(),
            email,
            name: "",
            avatar: "",
            bio: "Hey, There I am using chat app",
            lastSeen: Date.now()
        });
        await setDoc(doc(db, "chats", user.uid), {
            chatData: [],
        });
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

export const login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

export const resetPass = async (email) => {
    if (!email) {
        return toast.error('Enter your email');
    }
    try {
        const userRef = collection(db, 'users');
        const q = query(userRef, where("email", "==", email));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
            await sendPasswordResetEmail(auth, email);
            toast.success("Reset Email Sent");
        } else {
            toast.error("Email doesn't exists");
        }
    } catch (error) {
        console.error(error);
        toast.error(error.message);
    }
}