"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import InfoPageShell from "@/components/info-page-shell";
import {
  getForumLanguage,
  type ForumLanguage,
} from "@/lib/forumfenomen-language";

import styles from "@/components/info-pages.module.css";

type ContactSubject =
  | ""
  | "general"
  | "advertising"
  | "social";

const contactEmails = {
  general: "merhaba@forumfenomen.com",
  advertising: "reklam@forumfenomen.com",
  social: "sosyal@forumfenomen.com",
} as const;

const copy = {
  tr: {
    eyebrow: "ForumFenomen",
    title: "İletişim",
    description:
      "Soruların, reklam taleplerin ve sosyal platformlarla ilgili konular için bizimle iletişime geçebilirsin.",

    cards: [
      {
        label: "Genel",
        title: "Genel İletişim",
        text:
          "ForumFenomen, üyelik, profil, içerik ve genel kullanım hakkındaki sorular için.",
        email: contactEmails.general,
      },
      {
        label: "Reklam",
        title: "Reklam ve İş Birliği",
        text:
          "Reklam alanları, marka iş birlikleri, sponsorluklar ve kurumsal projeler için.",
        email: contactEmails.advertising,
      },
      {
        label: "Sosyal",
        title: "Sosyal Platformlar",
        text:
          "ForumFenomen sosyal medya hesapları, içerikler ve sosyal platform iletişimi için.",
        email: contactEmails.social,
      },
    ],

    formLabel: "İletişim Formu",
    formTitle: "Bize Mesaj Gönder",
    formDescription:
      "Aşağıdaki alanları doldurarak mesajını ForumFenomen ekibine iletebilirsin.",

    name: "Ad Soyad",
    namePlaceholder: "Adını ve soyadını yaz",

    email: "E-posta Adresin",
    emailPlaceholder: "ornek@mail.com",

    subject: "İletişim Konusu",
    select: "Bir konu seç",
    general: "Genel iletişim",
    advertising: "Reklam ve marka iş birliği",
    social: "Sosyal platformlar",

    message: "Mesajın",
    messagePlaceholder:
      "Bizimle paylaşmak istediğin konuyu ayrıntılı biçimde yaz...",

    required: "Zorunlu alan",
    send: "Mesajı Gönder",

    notice:
      "Form başarıyla doğrulandı. Gerçek mesaj gönderim altyapısı bağlandığında bu buton mesajını doğrudan ForumFenomen ekibine iletecek.",

    directMail: "Doğrudan e-posta gönder",
  },

  en: {
    eyebrow: "ForumFenomen",
    title: "Contact",
    description:
      "Contact us about questions, advertising requests and social platform matters.",

    cards: [
      {
        label: "General",
        title: "General Contact",
        text:
          "For questions about ForumFenomen, membership, profiles, content and general usage.",
        email: contactEmails.general,
      },
      {
        label: "Advertising",
        title: "Advertising and Partnerships",
        text:
          "For advertising spaces, brand partnerships, sponsorships and corporate projects.",
        email: contactEmails.advertising,
      },
      {
        label: "Social",
        title: "Social Platforms",
        text:
          "For ForumFenomen social accounts, content and platform communication.",
        email: contactEmails.social,
      },
    ],

    formLabel: "Contact Form",
    formTitle: "Send Us a Message",
    formDescription:
      "Complete the fields below to send your message to the ForumFenomen team.",

    name: "Full Name",
    namePlaceholder: "Enter your full name",

    email: "Your Email Address",
    emailPlaceholder: "example@mail.com",

    subject: "Contact Subject",
    select: "Choose a subject",
    general: "General contact",
    advertising: "Advertising and brand partnership",
    social: "Social platforms",

    message: "Your Message",
    messagePlaceholder:
      "Describe the matter you would like to share with us...",

    required: "Required field",
    send: "Send Message",

    notice:
      "The form was validated successfully. When the message infrastructure is connected, this button will send your message directly to the ForumFenomen team.",

    directMail: "Send email directly",
  },
} as const;

export default function ContactPage() {
  const [language, setLanguage] =
    useState<ForumLanguage>("tr");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [subject, setSubject] =
    useState<ContactSubject>("");

  const [message, setMessage] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  useEffect(() => {
    setLanguage(getForumLanguage());
  }, []);

  const t = copy[language];

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !subject ||
      !message.trim()
    ) {
      return;
    }

    setSubmitted(true);

    window.setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  }

  function clearNotice() {
    if (submitted) {
      setSubmitted(false);
    }
  }

  return (
    <InfoPageShell
      language={language}
      eyebrow={t.eyebrow}
      title={t.title}
      description={t.description}
    >
      <div className={styles.contactLayout}>
        <div className={styles.contactCards}>
          {t.cards.map((card) => (
            <article
              key={card.email}
              className={styles.contactCard}
            >
              <span>{card.label}</span>

              <h2>{card.title}</h2>

              <p>{card.text}</p>

              <a
                href={`mailto:${card.email}`}
                className={styles.contactEmailLink}
                aria-label={`${t.directMail}: ${card.email}`}
              >
                <i aria-hidden="true">@</i>

                {card.email}
              </a>
            </article>
          ))}
        </div>

        <form
          className={styles.contactForm}
          onSubmit={handleSubmit}
        >
          <span>{t.formLabel}</span>

          <h2>{t.formTitle}</h2>

          <p className={styles.contactFormDescription}>
            {t.formDescription}
          </p>

          <div className={styles.requiredInfo}>
            <i aria-hidden="true">*</i>
            {t.required}
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="contact-name">
                {t.name}
                <span
                  className={styles.requiredMark}
                  aria-hidden="true"
                >
                  *
                </span>
              </label>

              <input
                id="contact-name"
                type="text"
                value={name}
                required
                minLength={2}
                autoComplete="name"
                placeholder={t.namePlaceholder}
                onChange={(event) => {
                  setName(event.target.value);
                  clearNotice();
                }}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="contact-email">
                {t.email}
                <span
                  className={styles.requiredMark}
                  aria-hidden="true"
                >
                  *
                </span>
              </label>

              <input
                id="contact-email"
                type="email"
                value={email}
                required
                autoComplete="email"
                placeholder={t.emailPlaceholder}
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearNotice();
                }}
              />
            </div>

            <div
              className={`${styles.field} ${styles.fieldFull}`}
            >
              <label htmlFor="contact-subject">
                {t.subject}
                <span
                  className={styles.requiredMark}
                  aria-hidden="true"
                >
                  *
                </span>
              </label>

              <select
                id="contact-subject"
                required
                value={subject}
                onChange={(event) => {
                  setSubject(
                    event.target.value as ContactSubject
                  );

                  clearNotice();
                }}
              >
                <option value="" disabled>
                  {t.select}
                </option>

                <option value="general">
                  {t.general}
                </option>

                <option value="advertising">
                  {t.advertising}
                </option>

                <option value="social">
                  {t.social}
                </option>
              </select>
            </div>

            <div
              className={`${styles.field} ${styles.fieldFull}`}
            >
              <label htmlFor="contact-message">
                {t.message}
                <span
                  className={styles.requiredMark}
                  aria-hidden="true"
                >
                  *
                </span>
              </label>

              <textarea
                id="contact-message"
                value={message}
                required
                minLength={10}
                placeholder={t.messagePlaceholder}
                onChange={(event) => {
                  setMessage(event.target.value);
                  clearNotice();
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
          >
            {t.send}
          </button>

          {submitted && (
            <div
              className={styles.formNotice}
              role="status"
              aria-live="polite"
            >
              {t.notice}
            </div>
          )}
        </form>
      </div>
    </InfoPageShell>
  );
}
