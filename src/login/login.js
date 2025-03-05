import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithEmail, signInWithGoogle } from "./authService";
import "./login.css";
import googleLogo from "./google_logo.png";

const Login = () => {
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem("rememberMe") === "true"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const previousPage = location.state?.from || "/product"; // Default to /product if no previous page

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const userEmail = await signInWithEmail(email, password);
      if (userEmail) {
        if (rememberMe) {
          localStorage.setItem("email", email);
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("email");
          localStorage.removeItem("rememberMe");
        }
        navigate('/product'); // Always navigate to product page after successful login
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const userEmail = await signInWithGoogle();
      if (userEmail) {
        navigate('/product');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackButton = (e) => {
    e.preventDefault();
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate("/product");
    }
  };

  return (
    <div className="login-container">
      <a href="#" className="back-button" onClick={handleBackButton}>
        ←
      </a>
      <h2>Welcome Back</h2>

      <button className="google-btn" onClick={handleGoogleLogin}>
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

      <button className="sign-in-btn" onClick={handleLogin} disabled={loading}>
        {loading ? "Signing In..." : "Sign In"}
      </button>
      {error && <p className="error">{error}</p>}
      <hr></hr>
      <p>By clicking on Sign In, you are agreeing to the <span style={{fontWeight: "bold", cursor: "pointer"}}>Terms and Conditions</span>.</p>
    </div>
  );
};

export default Login;
