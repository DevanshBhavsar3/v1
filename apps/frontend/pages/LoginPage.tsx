import React, { useRef } from "react";
import axios from "axios";

export default function LogInPage() {
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  async function handleLogin() {
    try {
      await axios.post(
        `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/login`,
        {
          username: usernameRef.current?.value,
          password: passwordRef.current?.value,
        },
        { withCredentials: true }
      );
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div>
      Username
      <input ref={usernameRef} type="email" name="" id="" />
      Password
      <input ref={passwordRef} type="password" name="" id="" />
      <button onClick={() => handleLogin()}>Login</button>
    </div>
  );
}
