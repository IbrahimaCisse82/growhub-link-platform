import { useState, useEffect, useCallback } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
      // Check existing subscription
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, [isSupported]);

  const showLocalNotification = useCallback((title: string, body: string, url?: string) => {
    if (permission !== "granted") return;
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        data: url ? { url } : undefined,
        tag: `gh-${Date.now()}`,
      });
    });
  }, [permission]);

  return { isSupported, isSubscribed, permission, requestPermission, showLocalNotification };
}

// Hook to listen for new notifications and trigger browser notifications
export function useNotificationPush() {
  const { user } = useAuth();
  const { permission, showLocalNotification } = usePushNotifications();

  useEffect(() => {
    if (!user || permission !== "granted") return;

    const channel = supabase
      .channel("push-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const notif = payload.new as any;
          showLocalNotification(
            notif.title || "GrowHubLink",
            notif.message || "",
            notif.reference_type === "post" ? "/feed" :
            notif.reference_type === "coaching_session" ? "/coaching" :
            notif.reference_type === "event" ? "/events" :
            "/notifications"
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, permission, showLocalNotification]);
}

// UI Component for enabling push notifications  
export default function PushNotificationToggle() {
  const { isSupported, permission, requestPermission } = usePushNotifications();

  if (!isSupported) return null;

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success("Notifications activées !");
    } else {
      toast.error("Notifications refusées. Vous pouvez les activer dans les paramètres du navigateur.");
    }
  };

  if (permission === "granted") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-xl">
        <Bell className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-primary">Notifications activées</span>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-destructive/5 border border-destructive/20 rounded-xl">
        <BellOff className="w-4 h-4 text-destructive" />
        <span className="text-xs font-medium text-muted-foreground">Notifications bloquées dans le navigateur</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleEnable}
      className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors"
    >
      <Bell className="w-4 h-4 text-primary" />
      <span className="text-xs font-bold text-primary">Activer les notifications push</span>
    </button>
  );
}
