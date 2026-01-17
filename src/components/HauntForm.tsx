import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import Layout from "@/components/Layout";

import {
  collectionGroup,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { toast } from "sonner";

type InterestStatus = "pending" | "approved" | "rejected";

interface Interest {
  id: string;
  projectId: string;

  // may be missing in old docs
  projectTitle?: string;

  juniorUid: string;
  juniorName?: string;
  juniorEmail?: string;

  // may be missing in old docs
  seniorEmail?: string;

  message?: string;
  status?: InterestStatus;
}

export default function Dashboard() {
  const { user } = useAuth();

  const [myRequests, setMyRequests] = useState<Interest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    // ✅ My requests (junior)
    const sentQuery = query(
      collectionGroup(db, "interests"),
      where("juniorUid", "==", user.uid)
    );

    const unsub1 = onSnapshot(
      sentQuery,
      (snap) => {
        setMyRequests(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      },
      (err) => {
        console.error("Sent interests listener error:", err);
        toast.error("Firestore blocked: My Requests");
      }
    );

    // ✅ Incoming requests (senior)
    const email = (user.email || "").toLowerCase();

    const incomingQuery = query(
      collectionGroup(db, "interests"),
      where("seniorEmail", "==", email)
    );

    const unsub2 = onSnapshot(
      incomingQuery,
      (snap) => {
        setIncomingRequests(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        );
        setLoading(false);
      },
      (err) => {
        console.error("Incoming interests listener error:", err);
        toast.error("Firestore blocked: Incoming Requests");
        setLoading(false);
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
    try {
      const ref = doc(db, "projects", projectId, "interests", interestId);
      await updateDoc(ref, { status });
      toast.success(`Request ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update request status");
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="p-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="opacity-70 mt-2">Please login first.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 space-y-10">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="opacity-70 text-sm">
            Track your sent + received requests (history stays forever)
          </p>
        </div>

        {/* ================= MY REQUESTS ================= */}
        <section>
          <h2 className="text-xl font-semibold mb-3">My Requests 👨‍🎓</h2>

          {loading && <p>Loading…</p>}

          {myRequests.length === 0 && !loading && (
            <p className="opacity-60 text-sm">No requests sent yet.</p>
          )}

          <div className="grid gap-4">
            {myRequests.map((r) => (
              <div key={r.id} className="cyber-card p-4">
                <p className="font-semibold">
                  {r.projectTitle || "Unknown project (old request)"}
                </p>

                <p className="text-sm opacity-70 mt-1">
                  {r.message || "—"}
                </p>

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
                  {r.status || "pending"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ================= INCOMING REQUESTS ================= */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Incoming 👨‍💻</h2>

          {incomingRequests.length === 0 && !loading && (
            <p className="opacity-60 text-sm">
              No one has requested your projects yet.
            </p>
          )}

          <div className="grid gap-4">
            {incomingRequests.map((r) => (
              <div
                key={r.id}
                className="cyber-card p-4 flex justify-between items-start"
              >
                <div>
                  <p className="font-semibold">
                    {r.projectTitle || "Unknown project (old request)"}
                  </p>

                  <p className="text-sm mt-1">
                    {r.juniorName || "Unknown Junior"} —{" "}
                    {r.juniorEmail || "No email"}
                  </p>

                  <p className="opacity-70 text-sm mt-1">{r.message || "—"}</p>

                  <p className="opacity-60 text-xs mt-2">
                    Status: {r.status || "pending"}
                  </p>
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
