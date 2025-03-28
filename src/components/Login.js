import React, { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, { darkMode: false });
      }

      onLogin();
    } catch (err) {
      setError("🚫 " + err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box animated-pop">
        <h2 className="login-title">
          {isRegistering ? "🚀 Skapa konto" : "🔐 Logga in"}
        </h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>E-post</label>
            <input
              type="email"
              placeholder="Din e-postadress"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Lösenord</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button">
            {isRegistering ? "Skapa konto" : "Logga in"}
          </button>
        </form>

        <div className="login-toggle">
          <span>
            {isRegistering ? "Redan medlem?" : "Inget konto?"}{" "}
            <button onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? "Logga in" : "Registrera dig"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
