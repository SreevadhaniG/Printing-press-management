import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmail, signInWithGoogle } from "./authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const userEmail = await signInWithEmail(email, password);
    if (userEmail) handleNavigation(userEmail);
  };

  const handleGoogleLogin = async () => {
    const userEmail = await signInWithGoogle();
    if (userEmail) handleNavigation(userEmail);
  };

  const handleNavigation = (userEmail) => {
    if (userEmail === "admin.pentagonprinters@gmail.com") {
      navigate("/admin/home");
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="login-container">
      <h2>Welcome Back</h2>
      <p>Sign in with your email address and your password.</p>

      <button className="google-btn" onClick={handleGoogleLogin}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png" alt="Google" />
        Sign In with Google
      </button>

      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button className="sign-in-btn" onClick={handleLogin}>Sign In</button>

      <p className="forgot-password">Forgot your password?</p>
      <p className="one-time-link">Or use a one-time login link to sign in. <a href="#">Email me the link</a></p>

      <p>Don't have an account? <a href="#">Create an Account</a></p>
    </div>
  );
};

export default Login;
