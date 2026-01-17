import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { Layout } from "@/components/Layout";

import {
  collectionGroup,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

interface Interest {
  id: string;
  projectId: string;
  projectTitle: string;

  juniorUid: string;
  juniorName: string;
  juniorEmail: string;

  // ✅ new secure field
  seniorUid: string;

  message: string;
  status: "pending" | "approved" | "rejected";
}

export default function Dashboard() {
  const { user } = useAuth();

  const [myRequests, setMyRequests] = useState<Interest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let loaded = { sent: false, received: false };

    // 👨‍🎓 Interests sent by me
    const sent = query(
      collectionGroup(db, "interests"),
      where("juniorUid", "==", user.uid)
    );

    const unsub1 = onSnapshot(
      sent,
      (snap) => {
        setMyRequests(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        loaded.sent = true;
        if (loaded.sent && loaded.received) setLoading(false);
      },
      (err) => {
        console.error("Sent interests listener error:", err);
        loaded.sent = true;
        if (loaded.sent && loaded.received) setLoading(false);
      }
    );

    // 👨‍💻 Interests received on my projects
    const incoming = query(
      collectionGroup(db, "interests"),
      where("seniorUid", "==", user.uid)
    );

    const unsub2 = onSnapshot(
      incoming,
      (snap) => {
        setIncomingRequests(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        );
        loaded.received = true;
        if (loaded.sent && loaded.received) setLoading(false);
      },
      (err) => {
        console.error("Incoming interests listener error:", err);
        loaded.received = true;
        if (loaded.sent && loaded.received) setLoading(false);
      }
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  const handleDecision = async (
    projectId: string,
    interestId: string,
    status: "approved" | "rejected"
  ) => {
    const ref = doc(db, "projects", projectId, "interests", interestId);
    await updateDoc(ref, { status });
  };

  return (
    <Layout>
      <div className="space-y-10">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="opacity-70 text-sm">
            Track handovers and request history
          </p>
        </div>

        {/* MY REQUESTS */}
        <section>
          <h2 className="text-xl font-semibold mb-4">My Requests 👨‍🎓</h2>

          {loading && <p>Loading…</p>}

          {myRequests.length === 0 && !loading && (
            <p className="opacity-60 text-sm">No requests yet.</p>
          )}

          <div className="grid gap-4">
            {myRequests.map((r) => (
              <div key={r.id} className="cyber-card p-4">
                <p className="font-semibold">{r.projectTitle}</p>

                <p className="text-sm opacity-70 mt-1">{r.message}</p>

                <span
                  className={`inline-block mt-3 px-2 py-1 rounded text-xs
                    ${
                      r.status === "approved"
                        ? "bg-green-900 text-green-200"
                        : r.status === "rejected"
                        ? "bg-red-900 text-red-200"
                        : "bg-yellow-900 text-yellow-200"
                    }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* REQUESTS TO MY PROJECTS */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Requests To My Projects 👨‍💻
          </h2>

          {incomingRequests.length === 0 && !loading && (
            <p className="opacity-60 text-sm">No incoming requests yet.</p>
          )}

          <div className="grid gap-4">
            {incomingRequests.map((r) => (
              <div key={r.id} className="cyber-card p-4 flex justify-between">
                <div>
                  <p className="font-semibold">{r.projectTitle}</p>

                  <p className="text-sm mt-1">
                    {r.juniorName} — {r.juniorEmail}
                  </p>

                  <p className="opacity-70 text-sm mt-1">{r.message}</p>

                  <p className="text-xs opacity-60 mt-2">Status: {r.status}</p>
                </div>

                <div className="space-x-2">
                  <button
                    onClick={() =>
                      handleDecision(r.projectId, r.id, "approved")
                    }
                    disabled={r.status === "approved"}
                    className="cyber-button px-3 py-1 disabled:opacity-40"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      handleDecision(r.projectId, r.id, "rejected")
                    }
                    disabled={r.status === "rejected"}
                    className="cyber-button px-3 py-1 disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
