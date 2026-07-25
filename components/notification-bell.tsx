"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import styles from "./notification-bell.module.css";

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  message: string;
  related_report_id: string | null;
  related_comment_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

const POLL_INTERVAL_MS = 30_000;

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M10 21h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatNotificationTime(value: string) {
  const date = new Date(value);
  const differenceMs =
    Date.now() - date.getTime();

  if (
    !Number.isFinite(differenceMs) ||
    differenceMs < 0
  ) {
    return new Intl.DateTimeFormat(
      "tr-TR",
      {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/Istanbul",
      }
    ).format(date);
  }

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (differenceMs < minute) {
    return "Az önce";
  }

  if (differenceMs < hour) {
    return `${Math.floor(
      differenceMs / minute
    )} dakika önce`;
  }

  if (differenceMs < day) {
    return `${Math.floor(
      differenceMs / hour
    )} saat önce`;
  }

  if (differenceMs < 7 * day) {
    return `${Math.floor(
      differenceMs / day
    )} gün önce`;
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Istanbul",
    }
  ).format(date);
}

export default function NotificationBell() {
  const panelRef =
    useRef<HTMLDivElement | null>(null);

  const [supabase] = useState(() =>
    createClient()
  );

  const [notifications, setNotifications] =
    useState<NotificationRow[]>([]);

  const [isOpen, setIsOpen] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isMarkingAll, setIsMarkingAll] =
    useState(false);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const loadNotifications =
    useCallback(async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setIsAuthenticated(false);
        setNotifications([]);
        setIsLoading(false);

        return;
      }

      setIsAuthenticated(true);

      const { data, error } = await supabase
        .from("notifications")
        .select(`
          id,
          type,
          title,
          message,
          related_report_id,
          related_comment_id,
          is_read,
          read_at,
          created_at
        `)
        .order("created_at", {
          ascending: false,
        })
        .limit(20);

      if (error) {
        console.error(
          "Bildirimler alınamadı:",
          error.message
        );

        setIsLoading(false);

        return;
      }

      setNotifications(
        (data ?? []) as NotificationRow[]
      );

      setIsLoading(false);
    }, [supabase]);

  useEffect(() => {
    void loadNotifications();

    const intervalId = window.setInterval(
      () => {
        if (
          document.visibilityState === "visible"
        ) {
          void loadNotifications();
        }
      },
      POLL_INTERVAL_MS
    );

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      () => {
        void loadNotifications();
      }
    );

    return () => {
      window.clearInterval(intervalId);

      authListener.subscription.unsubscribe();
    };
  }, [loadNotifications, supabase]);

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  const handleToggle = () => {
    const nextOpen = !isOpen;

    setIsOpen(nextOpen);

    if (nextOpen) {
      void loadNotifications();
    }
  };

  const handleNotificationClick = async (
    notification: NotificationRow
  ) => {
    if (notification.is_read) {
      return;
    }

    const { error } = await supabase.rpc(
      "mark_notification_read",
      {
        p_notification_id:
          notification.id,
      }
    );

    if (error) {
      console.error(
        "Bildirim okunmuş olarak işaretlenemedi:",
        error.message
      );

      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id
          ? {
              ...item,
              is_read: true,
              read_at:
                new Date().toISOString(),
            }
          : item
      )
    );
  };

  const handleMarkAllRead = async () => {
    if (
      unreadCount === 0 ||
      isMarkingAll
    ) {
      return;
    }

    setIsMarkingAll(true);

    const { error } = await supabase.rpc(
      "mark_all_notifications_read"
    );

    if (error) {
      console.error(
        "Bildirimler okunmuş olarak işaretlenemedi:",
        error.message
      );

      setIsMarkingAll(false);

      return;
    }

    const readAt =
      new Date().toISOString();

    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        is_read: true,
        read_at:
          item.read_at ?? readAt,
      }))
    );

    setIsMarkingAll(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className={styles.wrapper}
    >
      <button
        type="button"
        className={styles.bellButton}
        aria-label="Bildirimleri aç"
        aria-expanded={isOpen}
        onClick={handleToggle}
      >
        <BellIcon />

        {unreadCount > 0 ? (
          <span
            className={styles.unreadBadge}
          >
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          className={styles.panel}
          role="dialog"
          aria-label="Bildirimler"
        >
          <div
            className={styles.panelHeader}
          >
            <div>
              <span>BİLDİRİMLER</span>

              <strong>
                Son bildirimlerin
              </strong>
            </div>

            {unreadCount > 0 ? (
              <button
                type="button"
                disabled={isMarkingAll}
                onClick={() => {
                  void handleMarkAllRead();
                }}
              >
                {isMarkingAll
                  ? "İşleniyor..."
                  : "Tümünü okundu yap"}
              </button>
            ) : null}
          </div>

          <div
            className={
              styles.notificationList
            }
          >
            {isLoading ? (
              <div
                className={styles.emptyState}
              >
                Bildirimler yükleniyor...
              </div>
            ) : notifications.length === 0 ? (
              <div
                className={styles.emptyState}
              >
                Henüz bildirimin yok.
              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <button
                    type="button"
                    key={notification.id}
                    className={`${styles.notificationItem} ${
                      notification.is_read
                        ? styles.readItem
                        : styles.unreadItem
                    }`}
                    onClick={() => {
                      void handleNotificationClick(
                        notification
                      );
                    }}
                  >
                    <span
                      className={
                        styles.notificationIndicator
                      }
                    />

                    <span
                      className={
                        styles.notificationContent
                      }
                    >
                      <strong>
                        {notification.title}
                      </strong>

                      <p>
                        {notification.message}
                      </p>

                      <small>
                        {formatNotificationTime(
                          notification.created_at
                        )}
                      </small>
                    </span>
                  </button>
                )
              )
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}