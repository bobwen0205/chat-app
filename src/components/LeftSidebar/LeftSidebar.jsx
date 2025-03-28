import React, { useContext, useEffect, useState } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { db, logout } from "../../config/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const {
    userData,
    chatData,
    chatUser,
    setChatUser,
    messagesId,
    setMessagesId,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext);
  // search user
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);
        // Don't find oneself
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false;
          // Check if user is already exist in chat list
          chatData.map((user) => {
            if (user.rId === querySnap.docs[0].data().id) {
              userExist = true;
            }
          });
          if (!userExist) {
            setUser(querySnap.docs[0].data());
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {}
  };

  const addChat = async () => {
    const messagesRef = collection(db, "messages");
    const chatsRef = collection(db, "chats");
    try {
      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: [],
      });
      await updateDoc(doc(chatsRef, user.id), {
        chatData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });
      await updateDoc(doc(chatsRef, userData.id), {
        chatData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });
      const uSnap = await getDoc(doc(db, "users", user.id));
      const uData = uSnap.data();
      setChat({
        messagesId: newMessageRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: uData,
      });
      setShowSearch(false);
      setChatVisible(true);
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const setChat = async (item) => {
    try {
      setMessagesId(item.messageId);
      setChatUser(item);
      if (messagesId && userData) {
        const chatDataRef = doc(db, "chats", userData.id);
        const chatDataSnapShot = await getDoc(chatDataRef);
        if (chatDataSnapShot.exists()) {
          const userChatData = chatDataSnapShot.data();
          const chatIndex = userChatData.chatData.findIndex(
            (c) => c.messageId === messagesId
          );
          userChatData.chatData[chatIndex].messageSeen = true;
          await updateDoc(chatDataRef, {
            chatData: userChatData.chatData,
          });
        }
      }
      setChatVisible(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const updateChatUserData = async () => {
      if (chatUser) {
        const userRef = doc(db, "users", chatUser.rId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        setChatUser((prev) => ({ ...prev, userData: userData }));
      }
    };
    updateChatUserData();
  }, [chatData]);

  return (
    <div className={`ls ${chatVisible && "hidden"}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} alt="logo" className="logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="menu_icon" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p onClick={() => logout()}>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="search_icon" />
          <input
            onChange={inputHandler}
            type="text"
            placeholder="Search here..."
          />
        </div>
      </div>
      <div className="ls-list">
        {showSearch ? (
          user ? (
            <div onClick={addChat} className="friends add-user">
              <img src={user.avatar} alt="avatar" />
              <p>{user.name}</p>
            </div>
          ) : (
            <div className="friends">
              <p>User Not Found</p>
            </div>
          )
        ) : (
          chatData.map((item, index) => (
            <div
              onClick={() => setChat(item)}
              className={`friends ${
                item.messageSeen || item.messageId === messagesId
                  ? ""
                  : "border"
              }`}
              key={index}
            >
              <img src={item.userData.avatar} alt="profile_img" />
              <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage}</span>
              </div>
            </div>
          ))
        )}

        {/* {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar} alt="avatar" />
            <p>{user.name}</p>
          </div>
        ) : (
          Array(12)
            .fill("")
            .map((item, index) => (
              <div className="friends" key={index}>
                <img src={assets.profile_img} alt="profile_img" />
                <div>
                  <p>Mingzhi Wen</p>
                  <span>Hello, How are you?</span>
                </div>
              </div>
            ))
        )} */}
      </div>
    </div>
  );
};

export default LeftSidebar;
