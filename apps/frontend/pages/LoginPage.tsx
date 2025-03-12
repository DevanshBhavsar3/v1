import React, { useRef } from "react";
import axios from "axios";

export default function LogInPage() {
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  async function handleLogin() {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/login`,
        {
          email: emailRef.current?.value,
          password: passwordRef.current?.value,
        }
      );

      console.log(response.data);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div>
      Email
      <input ref={emailRef} type="email" name="" id="" />
      Password
      <input ref={passwordRef} type="password" name="" id="" />
      <button onClick={() => handleLogin()}>Login</button>
    </div>
  );
}
