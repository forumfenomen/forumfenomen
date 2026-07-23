"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { setForumLanguage } from "@/lib/forumfenomen-language";

type Language = "tr" | "en";
type Theme = "light" | "dark";

const translations = {
  tr: {
    welcome: "Tekrar hoş geldin!",
    slogan: "Keşfet, paylaş, konuş!",
    google: "Google ile devam et",
    googleOnly: "ForumFenomen'e Google hesabınla güvenli şekilde giriş yap.",
    apple: "Apple ile devam et",
    separator: "veya e-posta ile",
    emailLabel: "E-posta adresi",
    emailPlaceholder: "ornek@email.com",
    passwordLabel: "Şifre",
    passwordPlaceholder: "Şifreni gir",
    remember: "Beni hatırla",
    forgot: "Şifremi unuttum",
    login: "Giriş Yap",
    noAccount: "Henüz hesabın yok mu?",
    register: "Kayıt Ol",
    legalPrefix: "Devam ederek",
    terms: "Kullanım Koşulları",
    and: "ve",
    privacy: "Gizlilik Politikası",
    legalSuffix: "metinlerini kabul etmiş olursun.",
    light: "Açık",
    dark: "Koyu",
    languageLabel: "Dil seçimi",
    themeLabel: "Tema seçimi",
  },

  en: {
    welcome: "Welcome back!",
    slogan: "Discover, share, connect!",
    google: "Continue with Google",
    googleOnly: "Sign in to ForumFenomen securely with your Google account.",
    apple: "Continue with Apple",
    separator: "or continue with email",
    emailLabel: "Email address",
    emailPlaceholder: "example@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    remember: "Remember me",
    forgot: "Forgot password?",
    login: "Log In",
    noAccount: "Don’t have an account?",
    register: "Sign Up",
    legalPrefix: "By continuing, you agree to the",
    terms: "Terms of Use",
    and: "and",
    privacy: "Privacy Policy.",
    legalSuffix: "",
    light: "Light",
    dark: "Dark",
    languageLabel: "Language selection",
    themeLabel: "Theme selection",
  },
};

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="ff-social-icon"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.996 3.017v2.51h3.232c1.89-1.74 2.982-4.305 2.982-7.35Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.964-.895 6.618-2.423l-3.232-2.51c-.895.6-2.041.955-3.386.955-2.605 0-4.81-1.759-5.6-4.123H3.059v2.59A9.996 9.996 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.899A6.01 6.01 0 0 1 6.086 12c0-.659.114-1.3.314-1.899V7.51H3.059A9.996 9.996 0 0 0 2 12c0 1.614.386 3.141 1.059 4.49L6.4 13.899Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C16.959 2.99 14.695 2 12 2a9.996 9.996 0 0 0-8.941 5.51L6.4 10.1c.79-2.364 2.995-4.123 5.6-4.123Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      viewBox="0 0 384 512"
      aria-hidden="true"
      className="ff-social-icon ff-apple-icon"
    >
      <path
        fill="currentColor"
        d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5 4 299.7 8.8 326.8 18.4 355c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.7-17.9 31.7 0 48.2 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.6-90-61.6-92.2Zm-57.4-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3Z"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.2 15.5A8.5 8.5 0 0 1 8.5 3.8 8.5 8.5 0 1 0 20.2 15.5Z" />
    </svg>
  );
}

export default function GirisPage() {
  const [language, setLanguage] = useState<Language>("tr");
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(
      "forumfenomen-language"
    );

    const savedTheme = window.localStorage.getItem(
      "forumfenomen-theme"
    );

    if (savedLanguage === "tr" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
    } else {
      document.documentElement.dataset.theme = "dark";
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    window.localStorage.setItem(
      "forumfenomen-theme",
      theme
    );
  }, [theme]);

  useEffect(() => {
    setForumLanguage(language);
  }, [language]);

  const t = translations[language];

  return (
    <main className="ff-auth-page">
      <div className="ff-auth-glow ff-auth-glow-left" />
      <div className="ff-auth-glow ff-auth-glow-right" />

      <div className="ff-auth-shell">
        <section className="ff-auth-card">
          <header className="ff-auth-toolbar">
            <div
              className="ff-choice-group"
              aria-label={t.languageLabel}
            >
              <button
                type="button"
                className={
                  language === "tr"
                    ? "ff-choice-button active"
                    : "ff-choice-button"
                }
                onClick={() => setLanguage("tr")}
                title="Türkçe"
                aria-label="Türkçe"
              >
                <Image
                  src="/flags/tr.svg"
                  alt=""
                  width={30}
                  height={20}
                  className="ff-flag-image"
                  aria-hidden="true"
                />
                <span className="ff-sr-only">Türkçe</span>
              </button>

              <button
                type="button"
                className={
                  language === "en"
                    ? "ff-choice-button active"
                    : "ff-choice-button"
                }
                onClick={() => setLanguage("en")}
                title="English"
                aria-label="English"
              >
                <Image
                  src="/flags/gb.svg"
                  alt=""
                  width={30}
                  height={20}
                  className="ff-flag-image"
                  aria-hidden="true"
                />
                <span className="ff-sr-only">English</span>
              </button>
            </div>

            <div
              className="ff-choice-group ff-theme-group"
              aria-label={t.themeLabel}
            >
              <button
                type="button"
                className={
                  theme === "light"
                    ? "ff-choice-button ff-theme-button active"
                    : "ff-choice-button ff-theme-button"
                }
                onClick={() => setTheme("light")}
              >
                <SunIcon />
                <span>{t.light}</span>
              </button>

              <button
                type="button"
                className={
                  theme === "dark"
                    ? "ff-choice-button ff-theme-button active"
                    : "ff-choice-button ff-theme-button"
                }
                onClick={() => setTheme("dark")}
              >
                <MoonIcon />
                <span>{t.dark}</span>
              </button>
            </div>
          </header>

          <div className="ff-brand-panel">
            <Image
              src="/forumfenomen-logo-transparent.png"
              alt="ForumFenomen"
              width={1856}
              height={506}
              priority
              unoptimized
              className="ff-horizontal-logo"
            />
          </div>

          <div className="ff-auth-heading">
            <h1>{t.welcome}</h1>
            <p>{t.slogan}</p>
          </div>

          <div className="ff-social-buttons">
            <button
              className="ff-social-button"
              type="button"
              onClick={() => {
                setForumLanguage(language);
                window.location.assign("/auth/google");
              }}
            >
              <GoogleIcon />
              <span>{t.google}</span>
            </button>
          </div>

          <p className="ff-register-text">
            <span>{t.googleOnly}</span>
          </p>

          <p className="ff-auth-legal">
            <span>{t.legalPrefix}</span>{" "}
            <button type="button">{t.terms}</button>{" "}
            <span>{t.and}</span>{" "}
            <button type="button">{t.privacy}</button>
            {t.legalSuffix ? (
              <>
                {" "}
                <span>{t.legalSuffix}</span>
              </>
            ) : null}
          </p>
        </section>
      </div>
    </main>
  );
}








