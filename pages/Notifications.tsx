import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { Notification, UserProfile } from "../types";
import { useNavigate, Link } from "react-router-dom";
import Icon from "../components/Icon";

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!auth.currentUser) return;
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (snap.exists()) setUserProfile(snap.data() as UserProfile);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!auth.currentUser || !userProfile) return;

    // Query notifications
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allNotifs = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Notification,
      );

      // Filter logic:
      // 1. Must be targeted to the user OR be a broadcast ('all')
      // 2. Must be created AFTER the user's registration date
      const filtered = allNotifs.filter((n) => {
        const isTargeted =
          n.userId === auth.currentUser?.uid || n.userId === "all";
        const isFresh =
          n.createdAt > (userProfile.registrationDate || userProfile.createdAt);
        return isTargeted && isFresh;
      });

      setNotifications(filtered);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile]);

  const markAsRead = async (notif: Notification) => {
    if (!notif.isRead && notif.id) {
      try {
        await updateDoc(doc(db, "notifications", notif.id), { isRead: true });
      } catch (e) {
        console.warn("Could not mark notif as read");
      }
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 pb-32 min-h-screen bg-background text-foreground font-sans relative overflow-hidden">
        {/* Background Decor */}
        <div
            aria-hidden
            className="fixed inset-0 isolate contain-strict -z-10 opacity-30 dark:opacity-60 pointer-events-none"
        >
            <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(0,0,0,0.06)_0,rgba(0,0,0,0.02)_50%,rgba(0,0,0,0.01)_80%)] dark:bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(255,255,255,0.06)_0,rgba(255,255,255,0.02)_50%,rgba(255,255,255,0.01)_80%)] absolute top-0 right-0 h-[800px] w-[560px] -translate-y-[350px] rounded-full" />
        </div>
      <div className="flex items-center space-x-5 mb-12 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-background border border-border flex items-center justify-center hover:bg-muted rounded-full transition-transform active:scale-95 shadow-sm group"
        >
          <Icon
            name="arrow-left"
            className="text-sm text-muted-foreground group-hover:text-foreground"
          />
        </button>
        <div>
          <h1 className="text-xl md:text-lg font-semibold tracking-tight text-foreground mb-0.5 font-heading">
            System Alerts
          </h1>
          <p className="text-muted-foreground text-xs font-medium tracking-normal">
            Admin Broadcasts & Updates
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-32 flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-full flex items-center justify-center mb-6">
            <Icon name="bell-slash" className="text-xl text-zinc-300" />
          </div>
          <p className="text-xs font-bold tracking-normal  text-zinc-400">
            No Alerts for You
          </p>
          <p className="text-[10px] mt-2 font-medium text-zinc-400">
            New alerts will appear here after they are sent.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => notif.link && markAsRead(notif)}
              className={`bg-zinc-50 dark:bg-zinc-800 p-6 md:p-8 rounded-2xl border transition-all flex flex-col md:flex-row gap-6 ${notif.link ? "cursor-pointer hover:bg-zinc-50 dark:bg-zinc-800 hover:border-emerald-200 hover:shadow-md" : "hover:bg-zinc-50 dark:bg-zinc-800 hover:border-zinc-200 dark:border-zinc-700"} ${notif.isRead === false ? "border-emerald-200 bg-zinc-50 dark:bg-zinc-900/30" : "border-zinc-100 dark:border-zinc-800/50 shadow-sm"}`}
            >
              {notif.type === "ticket" ? (
                // Pill Shape for Ticket Notification
                <div className="w-full flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
                      <Icon
                        name="ticket-alt"
                        className="text-xl text-blue-600"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                          {notif.title}
                        </h3>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 font-medium">
                        {notif.message}
                      </p>
                      <p className="text-[9px] font-bold text-zinc-400  tracking-normal mt-2">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {notif.link && (
                    <button className="sm:w-auto w-full px-6 py-2.5 bg-zinc-900 hover:bg-zinc-900 text-white text-[10px]  font-bold tracking-normal rounded-full transition-colors whitespace-nowrap">
                      Open Ticket
                    </button>
                  )}
                </div>
              ) : (
                // Standard Notification
                <>
                  {notif.image && (
                    <div className="w-full md:w-48 h-32 md:h-auto rounded-2xl overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800 shrink-0">
                      <img
                        src={notif.image}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 pr-2">
                        {notif.title}
                      </h3>
                      <span className="text-[9px] font-bold text-zinc-400  tracking-normal shrink-0 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 px-3 py-1 rounded-full">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      {notif.message}
                    </p>
                    {notif.link && (
                      <button className="mt-4 px-6 py-2 bg-zinc-900 hover:bg-zinc-900 text-white text-[10px]  font-bold tracking-normal rounded-full transition-colors w-fit">
                        View Details
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="mt-16 text-[9px] text-center text-zinc-300 font-bold  tracking-normal">
        Vibegadget all rights reserved
      </p>
    </div>
  );
};

export default NotificationsPage;
