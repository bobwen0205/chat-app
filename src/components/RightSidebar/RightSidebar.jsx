import React, { useContext, useEffect, useState } from "react";
import "./RightSidebar.css";
import assets from "../../assets/assets";
import { logout } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";

const RightSidebar = () => {
  const { chatUser, messages } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);
  useEffect(() => {
    let tempVar = [];
    messages.forEach((msg) => {
      if (msg.image) {
        tempVar.push(msg.image);
      }
    });
    setMsgImages(tempVar);
  }, [messages]);
  return chatUser ? (
    <div className="rs">
      <div className="rs-profile">
        <img src={chatUser.userData.avatar} alt="profile_img" />
        <h3>
          {chatUser.userData.name}
          {Date.now() - chatUser.userData.lastSeen <= 60000 ? (
            <img src={assets.green_dot} alt="green_dot" className="dot" />
          ) : null}
        </h3>
        <p>{chatUser.userData.bio}</p>
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>
          {msgImages.map((url, index) => (
            <img
              onClick={() => window.open(url)}
              src={url}
              key={index}
              alt="image"
            />
          ))}
        </div>
      </div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  ) : (
    <div className="rs">
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

export default RightSidebar;
