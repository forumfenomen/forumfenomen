import type { Language } from "./feed-types";

export function formatRelativeTime(
  value: string,
  language: Language
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return language === "tr"
      ? "Az önce"
      : "Just now";
  }

  const differenceInSeconds = Math.round(
    (date.getTime() - Date.now()) / 1000
  );

  const formatter =
    new Intl.RelativeTimeFormat(language, {
      numeric: "auto",
    });

  const absoluteSeconds = Math.abs(
    differenceInSeconds
  );

  if (absoluteSeconds < 60) {
    return language === "tr"
      ? "Az önce"
      : "Just now";
  }

  const differenceInMinutes = Math.round(
    differenceInSeconds / 60
  );

  if (Math.abs(differenceInMinutes) < 60) {
    return formatter.format(
      differenceInMinutes,
      "minute"
    );
  }

  const differenceInHours = Math.round(
    differenceInMinutes / 60
  );

  if (Math.abs(differenceInHours) < 24) {
    return formatter.format(
      differenceInHours,
      "hour"
    );
  }

  const differenceInDays = Math.round(
    differenceInHours / 24
  );

  if (Math.abs(differenceInDays) < 30) {
    return formatter.format(
      differenceInDays,
      "day"
    );
  }

  const differenceInMonths = Math.round(
    differenceInDays / 30
  );

  if (Math.abs(differenceInMonths) < 12) {
    return formatter.format(
      differenceInMonths,
      "month"
    );
  }

  const differenceInYears = Math.round(
    differenceInMonths / 12
  );

  return formatter.format(
    differenceInYears,
    "year"
  );
}