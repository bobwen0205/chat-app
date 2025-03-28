import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";
import upload from "../../lib/upload";

const ChatBox = () => {
  const {
    userData,
    messagesId,
    chatUser,
    messages,
    setMessages,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext);
  const [input, setInput] = useState("");
  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        // update messages collection
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createAt: new Date(),
          }),
        });
        // update chats collection
        const userIDs = [chatUser.rId, userData.id];
        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapShot = await getDoc(userChatsRef);
          if (userChatsSnapShot.exists()) {
            const userChatData = userChatsSnapShot.data();
            const chatIndex = userChatData.chatData.findIndex(
              (c) => c.messageId === messagesId
            );
            userChatData.chatData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatData[chatIndex].rId === userData.id) {
              userChatData.chatData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, {
              chatData: userChatData.chatData,
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
    setInput("");
  };

  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);
      if (fileUrl && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createAt: new Date(),
          }),
        });
        const userIDs = [chatUser.rId, userData.id];
        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapShot = await getDoc(userChatsRef);
          if (userChatsSnapShot.exists()) {
            const userChatData = userChatsSnapShot.data();
            const chatIndex = userChatData.chatData.findIndex(
              (c) => c.messageId === messagesId
            );
            userChatData.chatData[chatIndex].lastMessage = "[Image]";
            userChatData.chatData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatData[chatIndex].rId === userData.id) {
              userChatData.chatData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, {
              chatData: userChatData.chatData,
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const convertTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const date = timestamp.toDate();
    let hour = date.getHours();
    let minute = date.getMinutes();

    const ampm = hour >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hour = hour % 12;
    hour = hour === 0 ? 12 : hour;

    // Add leading zeros
    const hourStr = hour.toString();
    const minuteStr = minute.toString().padStart(2, "0");

    return `${hourStr}:${minuteStr}${ampm}`;
  };

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        setMessages(res.data().messages.reverse());
      });
      return () => {
        unSub();
      };
    }
  }, [messagesId]);

  return chatUser ? (
    <div className={`chat-box ${!chatVisible && "hidden"}`}>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="profile_img" />
        <p>
          {chatUser.userData.name}{" "}
          {Date.now() - chatUser.userData.lastSeen <= 60000 ? (
            <img src={assets.green_dot} alt="green_dot" className="dot" />
          ) : null}
        </p>
        <img src={assets.help_icon} alt="help_icon" className="help" />
        <img
          onClick={() => setChatVisible(false)}
          src={assets.arrow_icon}
          alt="arrow_icon"
          className="arrow"
        />
      </div>

      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sId === userData.id ? "s-msg" : "r-msg"}
          >
            {msg.image ? (
              <img src={msg.image} alt="image" className="msg-img" />
            ) : (
              <p className="msg">{msg.text}</p>
            )}
            <div>
              <img
                src={
                  msg.sId === userData.id
                    ? userData.avatar
                    : chatUser.userData.avatar
                }
                alt="profile_img"
              />
              <p>{convertTimestamp(msg.createAt)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Send a message"
        />
        <input
          onChange={sendImage}
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          hidden
        />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="gallery_icon" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="send_button" />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${!chatVisible && "hidden"}`}>
      <img src={assets.logo_icon} alt="logo_icon" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
