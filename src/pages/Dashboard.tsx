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
  juniorName?: string;
  juniorEmail?: string;

  // ✅ senior info
  seniorEmail?: string;
  seniorName?: string;

  // ✅ repo info
  githubUrl?: string;

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

    // 👨‍🎓 requests I SENT (junior history)
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

    // 👨‍💻 requests TO my projects (senior history)
    const incoming = query(
      collectionGroup(db, "interests"),
      where("seniorEmail", "==", user.email?.toLowerCase())
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

  const badgeClass = (status: Interest["status"]) => {
    if (status === "approved") return "bg-green-900 text-green-200";
    if (status === "rejected") return "bg-red-900 text-red-200";
    return "bg-yellow-900 text-yellow-200";
  };

  return (
    <Layout>
      <div className="space-y-10">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="opacity-70 text-sm">
            Track handovers, approvals and request history
          </p>
        </div>

        {/* ========================= MY REQUESTS (JUNIOR) ========================= */}
        <section>
          <h2 className="text-xl font-semibold mb-4">My Requests 👨‍🎓</h2>

          {loading && <p>Loading…</p>}

          {!loading && myRequests.length === 0 && (
            <p className="opacity-60 text-sm">No requests sent yet.</p>
          )}

          <div className="grid gap-4">
            {myRequests.map((r) => (
              <div key={r.id} className="cyber-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{r.projectTitle}</p>
                    <p className="text-sm opacity-70 mt-1">{r.message}</p>
                  </div>

                  <span
                    className={`shrink-0 inline-block px-2 py-1 rounded text-xs ${badgeClass(
                      r.status
                    )}`}
                  >
                    {r.status}
                  </span>
                </div>

                {/* ✅ Contact reveal only after approval */}
                {r.status === "approved" ? (
                  <div className="mt-4 p-3 rounded border border-green-500/30 bg-green-500/10">
                    <p className="text-sm font-semibold text-green-200">
                      Contact Unlocked ✅
                    </p>

                    <div className="mt-2 space-y-1 text-sm">
                      {r.seniorName && (
                        <p className="opacity-90">
                          <span className="opacity-70">Senior:</span>{" "}
                          {r.seniorName}
                        </p>
                      )}

                      {r.seniorEmail && (
                        <p className="opacity-90">
                          <span className="opacity-70">Email:</span>{" "}
                          <a
                            href={`mailto:${r.seniorEmail}`}
                            className="underline"
                          >
                            {r.seniorEmail}
                          </a>
                        </p>
                      )}

                      {r.githubUrl && (
                        <p className="opacity-90">
                          <span className="opacity-70">Repo:</span>{" "}
                          <a
                            href={r.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            Open GitHub ↗
                          </a>
                        </p>
                      )}

                      {!r.seniorEmail && !r.githubUrl && (
                        <p className="opacity-70 text-xs">
                          (Old request — contact info not stored)
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-xs opacity-60">
                    Contact details will appear after approval.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ========================= INCOMING REQUESTS (SENIOR) ========================= */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Requests To My Projects 👨‍💻
          </h2>

          {!loading && incomingRequests.length === 0 && (
            <p className="opacity-60 text-sm">
              No one has requested your projects yet.
            </p>
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

                  <span
                    className={`inline-block mt-3 px-2 py-1 rounded text-xs ${badgeClass(
                      r.status
                    )}`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="space-x-2">
                  <button
                    onClick={() => handleDecision(r.projectId, r.id, "approved")}
                    disabled={r.status === "approved"}
                    className="cyber-button px-3 py-1 disabled:opacity-40"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleDecision(r.projectId, r.id, "rejected")}
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
