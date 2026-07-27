export type ForumLanguage = "tr" | "en";

export const FORUM_LANGUAGE_KEY =
  "forumfenomen-language";

export const FORUM_LANGUAGE_CHANGE_EVENT =
  "forumfenomen-language-change";

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

  document.documentElement.lang = language;

  window.dispatchEvent(
    new CustomEvent<ForumLanguage>(
      FORUM_LANGUAGE_CHANGE_EVENT,
      {
        detail: language,
      }
    )
  );
}

export function subscribeForumLanguage(
  callback: (language: ForumLanguage) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleLanguageChange(
    event: Event
  ): void {
    const customEvent =
      event as CustomEvent<ForumLanguage>;

    callback(
      customEvent.detail === "en"
        ? "en"
        : "tr"
    );
  }

  function handleStorageChange(
    event: StorageEvent
  ): void {
    if (event.key !== FORUM_LANGUAGE_KEY) {
      return;
    }

    callback(
      event.newValue === "en"
        ? "en"
        : "tr"
    );
  }

  window.addEventListener(
    FORUM_LANGUAGE_CHANGE_EVENT,
    handleLanguageChange
  );

  window.addEventListener(
    "storage",
    handleStorageChange
  );

  return () => {
    window.removeEventListener(
      FORUM_LANGUAGE_CHANGE_EVENT,
      handleLanguageChange
    );

    window.removeEventListener(
      "storage",
      handleStorageChange
    );
  };
}