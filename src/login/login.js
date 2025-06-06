import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./login.css";
import googleLogo from "./google_logo.png";

const Login = () => {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem("rememberMe") === "true"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSuccess = () => {
    const redirectData = sessionStorage.getItem('redirectUrl');
    if (redirectData) {
      const { pathname, state } = JSON.parse(redirectData);
      sessionStorage.removeItem('redirectUrl');
      navigate(pathname, { state });
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        setLoading(true);
        setError("");
        await signIn(email, password);

        // Check if user is admin
        if (email === process.env.REACT_APP_ADMIN_EMAIL) {
            navigate("/admin/dashboard");
        } else {
            // For regular users, redirect to products
            handleLoginSuccess();
        }
    } catch (error) {
        console.error('Login error:', error);
        setError('Failed to sign in');
    } finally {
        setLoading(false);
    }
};

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const userEmail = await signInWithGoogle();
      
      // Check if user is admin
      if (userEmail === process.env.REACT_APP_ADMIN_EMAIL) {
          navigate("/admin/dashboard");
      } else {
          handleLoginSuccess();
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleBackButton = (e) => {
    e.preventDefault();
    // Use browser's history to go back
    window.history.back();
  };

  return (
    <div className="login-container">
      <a href="#" className="back-button" onClick={handleBackButton}>
        ←
      </a>
      <h2>Welcome Back</h2>

      <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
        <img src={googleLogo} alt="Google" />
        Sign In with Google
      </button>

      <div className="divider">
        <span>OR</span>
      </div>

      <p>Sign in with your email address and password.</p>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="remember-me">
        <input
          type="checkbox"
          id="remember"
          checked={rememberMe}
          onChange={() => setRememberMe(!rememberMe)}
        />
        <label htmlFor="remember">Remember Me</label>
      </div>

      <button className="sign-in-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? "Signing In..." : "Sign In"}
      </button>
      {error && <p className="error">{error}</p>}
      <hr></hr>
      <p>By clicking on Sign In, you are agreeing to the <span style={{fontWeight: "bold", cursor: "pointer"}}>Terms and Conditions</span>.</p>
    </div>
  );
};

export default Login;
