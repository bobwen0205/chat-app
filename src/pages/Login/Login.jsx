import React, { useState } from "react";
import "./Login.css";
import assets from "../../assets/assets";
import { signup, login, resetPass } from "../../config/firebase";

const Login = () => {
  const [currentState, setCurrentState] = useState("Sign Up");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (currentState === "Sign Up") {
      signup(userName, email, password);
    } else {
      login(email, password);
    }
  };

  return (
    <div className="login">
      <img src={assets.logo_big} alt="logo" className="logo" />
      <form onSubmit={onSubmitHandler} className="login-form">
        <h2>{currentState}</h2>
        {currentState === "Sign Up" && (
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            type="text"
            placeholder="Username"
            className="form-input"
            required
          />
        )}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="form-input"
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="form-input"
          required
        />
        <button type="submit">
          {currentState === "Sign Up" ? "Create account" : "Login now"}
        </button>
        <div className="login-term">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>
        <div className="login-forgot">
          {currentState === "Sign Up" ? (
            <p className="login-toggle">
              Already have an account{" "}
              <span onClick={() => setCurrentState("Login")}>login here</span>
            </p>
          ) : (
            <p className="login-toggle">
              Create an account{" "}
              <span onClick={() => setCurrentState("Sign Up")}>click here</span>
            </p>
          )}
          {currentState === "Login" && (
            <p className="login-toggle">
              Forgot Password?{" "}
              <span onClick={() => resetPass(email)}>reset here</span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
