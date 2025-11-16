"use client";
import { useRouter } from "next/navigation";
import BrandLogo from "./components/BrandLogo";

export default function Home() {
    const router = useRouter();

    function handleLogin(e) {
    e.preventDefault();          // stop form from reloading the page
    // TODO: add real auth later
    router.push("/homepage");    // go to homepage
  }

  function handleGuest() {
    router.push("/homepage");    // same for guest
  }

  function handleSignupClick(e) {
    e.preventDefault();
    router.push("/signup");      // go to signup page
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand-lockup">
          <BrandLogo />
          <p className="brand-tagline">
            A marketplace to share extra groceries and reduce food waste.
          </p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </label>

          <button type="submit" className="primary-button wide">
            Log in
          </button>

          <button type="button" className="secondary-button wide" onClick={handleGuest}>
            Continue as guest
          </button>

          <p className="helper-text">
            Don’t have an account? <a href="#" onClick={handleSignupClick}>Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}
