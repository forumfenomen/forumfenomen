export type ForumLanguage = "tr" | "en";

export const FORUM_LANGUAGE_KEY =
  "forumfenomen-language";

export function getForumLanguage(): ForumLanguage {
  if (typeof window === "undefined") {
    return "tr";
  }

  const savedLanguage = window.localStorage.getItem(
    FORUM_LANGUAGE_KEY
  );

  return savedLanguage === "en" ? "en" : "tr";
}

export function setForumLanguage(
  language: ForumLanguage
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    FORUM_LANGUAGE_KEY,
    language
  );

  document.documentElement.lang =
    language === "tr" ? "tr" : "en";
}
