// src/app/signup/page.js
"use client";
import { useRouter } from "next/navigation";
import BrandLogo from "../components/BrandLogo";

export default function SignupPage() {
  const router = useRouter();

  function handleSignupClick(e) {
    e.preventDefault();
    router.push("/homepage");
  }
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand-lockup">
          <BrandLogo />
          <p className="brand-tagline">
            Create an account to start sharing and claiming groceries.
          </p>
        </div>

        <form className="login-form">
          <label className="field">
            <span>First name</span>
            <input type="text" name="firstName" placeholder="Jane" required />
          </label>

          <label className="field">
            <span>Last name</span>
            <input type="text" name="lastName" placeholder="Doe" required />
          </label>

          <label className="field">
            <span>Username</span>
            <input type="text" name="username" placeholder="janedoe" required />
          </label>

          <label className="field">
            <span>Email</span>
            <input type="email" name="email" placeholder="you@example.com" required />
          </label>

          <label className="field">
            <span>Phone number</span>
            <input type="tel" name="phone" placeholder="(555) 555-5555" required />
          </label>

          <label className="field">
            <span>Password</span>
            <input type="password" name="password" placeholder="••••••••" required />
          </label>

          <button
            type="submit"
            className="primary-button wide"
            onClick={handleSignupClick}
          >
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
}
