import React, { useRef } from "react";
import axios from "axios";

export default function SignUpPage() {
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  async function handleSignup() {
    try {
      await axios.post(
        `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/signup`,
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
      <input ref={usernameRef} type="text" name="" id="" />
      Password
      <input ref={passwordRef} type="password" name="" id="" />
      <button onClick={() => handleSignup()}>Signup</button>
    </div>
  );
}
