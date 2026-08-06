"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import { createClient } from "@/lib/supabase/client";

import styles from "./notification-bell.module.css";

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  message: string;
  related_report_id: string | null;
  related_comment_id: string | null;
  related_topic_id: string | null;
  related_user_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

const POLL_INTERVAL_MS = 120_000;

const LOAD_THROTTLE_MS = 10_000;

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
  const triggerRef =
    useRef<HTMLDivElement | null>(null);

  const panelRef =
    useRef<HTMLDivElement | null>(null);

  const userIdRef =
    useRef<string | null>(null);

  const lastLoadAtRef =
    useRef(0);

  const router = useRouter();

  useEffect(() => {
    router.prefetch("/profil?section=followers");
  }, [router]);

  const [supabase] = useState(() =>
    createClient()
  );

  const [notifications, setNotifications] =
    useState<NotificationRow[]>([]);

  const [isOpen, setIsOpen] =
    useState(false);

  const [panelPosition, setPanelPosition] =
    useState<{
      top: number;
      left: number;
    } | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isMarkingAll, setIsMarkingAll] =
    useState(false);

  const [isClearingRead, setIsClearingRead] =
    useState(false);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const loadNotifications =
    useCallback(
      async (force = false) => {
        const userId = userIdRef.current;

        if (!userId) {
          setIsAuthenticated(false);
          setNotifications([]);
          setIsLoading(false);

          return;
        }

        const now = Date.now();

        if (
          !force &&
          now - lastLoadAtRef.current <
          LOAD_THROTTLE_MS
        ) {
          return;
        }

        lastLoadAtRef.current = now;

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
          related_topic_id,
          related_user_id,
          is_read,
          read_at,
          created_at
        `)
          .order("created_at", {
            ascending: false,
          })
          .limit(10);

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
      },
      [supabase]
    );

  useEffect(() => {
    let isActive = true;

    let notificationChannel:
      ReturnType<typeof supabase.channel> | null =
      null;

    async function setupRealtimeNotifications() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isActive) {
        return;
      }

      const user =
        session?.user ?? null;

      userIdRef.current =
        user?.id ?? null;

      if (notificationChannel) {
        await supabase.removeChannel(
          notificationChannel
        );

        notificationChannel = null;
      }

      void loadNotifications(true);

      if (!user) {
        return;
      }

      notificationChannel = supabase
        .channel(
          `notifications-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            void loadNotifications();
          }
        )
        .subscribe((status) => {
          if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT"
          ) {
            console.error(
              "Bildirim Realtime bağlantısı kurulamadı:",
              status
            );
          }
        });
    }

    void setupRealtimeNotifications();

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

    function handleVisibilityChange() {
      if (
        document.visibilityState === "visible"
      ) {
        void loadNotifications();
      }
    }

    function handleWindowFocus() {
      void loadNotifications();
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "focus",
      handleWindowFocus
    );

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "INITIAL_SESSION") {
          return;
        }

        userIdRef.current =
          session?.user.id ?? null;

        window.setTimeout(() => {
          void setupRealtimeNotifications();
        }, 0);
      }
    );

    return () => {
      isActive = false;

      window.clearInterval(intervalId);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "focus",
        handleWindowFocus
      );

      authListener.subscription.unsubscribe();

      if (notificationChannel) {
        void supabase.removeChannel(
          notificationChannel
        );
      }
    };
  }, [loadNotifications, supabase]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPanelPosition(null);
      return;
    }

    function updatePanelPosition() {
      /*
       * Mobil konumu mevcut CSS yönetiyor.
       */
      if (window.innerWidth <= 620) {
        setPanelPosition(null);
        return;
      }

      const triggerElement =
        triggerRef.current;

      if (!triggerElement) {
        return;
      }

      /*
       * NotificationBell wrapper'ının parent'ı,
       * ay/tema, zil ve kapatma ikonlarının
       * bulunduğu header action grubudur.
       */
      const actionsElement =
        triggerElement.parentElement;

      const anchorRect =
        actionsElement?.getBoundingClientRect() ??
        triggerElement.getBoundingClientRect();

      const panelWidth = 420;
      const viewportPadding = 16;
      const panelGap = 12;

      const calculatedLeft =
        anchorRect.right - panelWidth;

      const maximumLeft =
        window.innerWidth -
        panelWidth -
        viewportPadding;

      const left = Math.max(
        viewportPadding,
        Math.min(
          calculatedLeft,
          maximumLeft
        )
      );

      setPanelPosition({
        top: anchorRect.bottom + panelGap,
        left,
      });
    }

    updatePanelPosition();

    window.addEventListener(
      "resize",
      updatePanelPosition
    );

    window.addEventListener(
      "scroll",
      updatePanelPosition,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        updatePanelPosition
      );

      window.removeEventListener(
        "scroll",
        updatePanelPosition,
        true
      );
    };
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Node;

      const clickedTrigger =
        triggerRef.current?.contains(target) ??
        false;

      const clickedPanel =
        panelRef.current?.contains(target) ??
        false;

      if (
        !clickedTrigger &&
        !clickedPanel
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

  const readCount =
    notifications.filter(
      (notification) =>
        notification.is_read
    ).length;

  const handleToggle = () => {
    const nextOpen = !isOpen;

    setIsOpen(nextOpen);

    if (nextOpen) {
      void loadNotifications(true);
    }
  };

  const getNotificationHref = async (
    notification: NotificationRow
  ): Promise<string | null> => {
    if (
      notification.type === "user_followed" &&
      notification.related_user_id
    ) {
      const { data: profileRows, error } =
        await supabase.rpc(
          "get_profile_summaries_by_ids",
          {
            p_profile_ids: [
              notification.related_user_id,
            ],
          }
        );

      const profileData =
        profileRows?.[0] ?? null;

      if (error) {
        console.error(
          "Takip eden kullanıcının profili alınamadı:",
          error.message
        );

        return "/profil?section=followers";
      }

      const username =
        profileData?.username
          ?.trim()
          .replace(/^@/, "");

      if (username) {
        return `/profil/${encodeURIComponent(username)}`;
      }

      return "/profil?section=followers";
    }

    if (notification.type === "follow_request") {
      return "/profil?section=followers";
    }

    if (!notification.related_topic_id) {
      return null;
    }

    const commentHash =
      notification.related_comment_id
        ? `#comment-${notification.related_comment_id}`
        : "";

    return `/konu/${notification.related_topic_id}${commentHash}`;
  };

  const handleNotificationClick = async (
    notification: NotificationRow
  ) => {
    const href =
      await getNotificationHref(notification);

    if (!notification.is_read) {
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
      } else {
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
      }
    }

    setIsOpen(false);

    if (href) {
      if (notification.related_comment_id) {
        window.location.assign(href);
        return;
      }

      router.push(href);
    }
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

  const handleClearRead = async () => {
    if (
      readCount === 0 ||
      isClearingRead
    ) {
      return;
    }

    setIsClearingRead(true);

    const { error } = await supabase.rpc(
      "clear_read_notifications"
    );

    if (error) {
      console.error(
        "Okunmuş bildirimler temizlenemedi:",
        error.message
      );

      setIsClearingRead(false);
      return;
    }

    setNotifications((current) =>
      current.filter(
        (notification) =>
          !notification.is_read
      )
    );

    setIsClearingRead(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      ref={triggerRef}
      className={styles.wrapper}
    >
      <button
        type="button"
        className={
          isOpen
            ? `ff-round-action active ${styles.bellButton}`
            : `ff-round-action ${styles.bellButton}`
        }
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

      {isOpen &&
        typeof document !== "undefined"
        ? createPortal(
          <div
            ref={panelRef}
            className={styles.panel}
            style={
              panelPosition
                ? {
                  top: `${panelPosition.top}px`,
                  left: `${panelPosition.left}px`,
                  right: "auto",
                }
                : undefined
            }
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

              <div className={styles.headerActions}>
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    disabled={
                      isMarkingAll ||
                      isClearingRead
                    }
                    onClick={() => {
                      void handleMarkAllRead();
                    }}
                  >
                    {isMarkingAll
                      ? "İşleniyor..."
                      : "Tümünü okundu yap"}
                  </button>
                ) : null}

                {readCount > 0 ? (
                  <button
                    type="button"
                    className={styles.clearReadButton}
                    disabled={
                      isClearingRead ||
                      isMarkingAll
                    }
                    onClick={() => {
                      void handleClearRead();
                    }}
                  >
                    {isClearingRead
                      ? "Temizleniyor..."
                      : "Okunanları temizle"}
                  </button>
                ) : null}
              </div>
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
                      className={`${styles.notificationItem} ${notification.is_read
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
          </div>,
          document.body
        )
        : null}
    </div>
  );
}