import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db, getInterestRequestsByProject, InterestRequest } from "@/lib/firebase";
import { Layout } from "@/components/Layout";

import {
  collectionGroup,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";

import { Github, Link as LinkIcon } from "lucide-react";

interface Interest {
  id: string;
  projectId: string;
  projectName: string; // Updated to match InterestRequest

  requesterId?: string; // Updated to match InterestRequest
  requesterName?: string; // Updated to match InterestRequest
  requesterEmail?: string; // Updated to match InterestRequest
  requesterLinkedIn?: string; // Updated to match InterestRequest
  requesterGithub?: string; // Updated to match InterestRequest

  // senior info
  seniorEmail?: string;
  seniorName?: string;

  // repo info
  githubUrl?: string;

  message: string;
  status: "pending" | "approved" | "rejected";

  // 🔓 unlock
  contactUnlocked?: boolean;
  unlockedAt?: any;
}

export default function Dashboard() {
  const { user } = useAuth();

  const [myRequests, setMyRequests] = useState<Interest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    // 👨‍🎓 requests I SENT (junior) - fetch from requests collection
    const sent = query(
      collection(db, "requests"),
      where("requesterId", "==", user.uid)
    );

    const unsub1 = onSnapshot(
      sent,
      async (snap) => {
        const myRequestsData = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setMyRequests(myRequestsData);
      },
      (err) => {
        console.error("Sent requests listener error:", err);
      }
    );

    // 👨‍💻 requests to MY projects (senior) - first get my projects, then requests for those projects
    const projectsQuery = query(
      collection(db, "projects"),
      where("creatorEmail", "==", user.email?.toLowerCase())
    );

    const unsub2 = onSnapshot(
      projectsQuery,
      async (projectsSnap) => {
        const projectIds = projectsSnap.docs.map(doc => doc.id);
        
        if (projectIds.length === 0) {
          setIncomingRequests([]);
          setLoading(false);
          return;
        }
        
        // Get all requests for my projects
        const requestsQuery = query(
          collection(db, "requests"),
          where("projectId", "in", projectIds)
        );
        
        const requestsSnap = await getDocs(requestsQuery);
        const incomingRequestsData = requestsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setIncomingRequests(incomingRequestsData);
        setLoading(false);
      },
      (err) => {
        console.error("My projects listener error:", err);
        setLoading(false);
      }
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  const handleDecision = async (
    _projectId: string, // not needed anymore with new structure
    requestId: string,
    status: "approved" | "rejected"
  ) => {
    const ref = doc(db, "requests", requestId);

    await updateDoc(ref, {
      status,
      decidedAt: serverTimestamp(),
    });
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

        {/* ===================== MY REQUESTS (JUNIOR) ===================== */}
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
                    <p className="font-semibold">{r.projectName}</p>
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

                {/* 🔓 Contact reveal */}
                {r.status === "approved" && r.contactUnlocked ? (
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
                          <a href={`mailto:${r.seniorEmail}`} className="underline">
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
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-xs opacity-60">
                    Identity hidden • unlock after approval
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ===================== INCOMING REQUESTS (SENIOR) ===================== */}
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
                  <p className="font-semibold">{r.projectName}</p>

                  <p className="text-sm mt-1">
                    <span className="font-medium">{r.requesterName}</span>
                  </p>
                  
                  {/* LinkedIn Profile */}
                  {r.requesterLinkedIn && (
                    <p className="text-sm mt-1 flex items-center gap-1">
                      <LinkIcon className="w-4 h-4 text-[#00FF41]" />
                      <a 
                        href={`https://www.linkedin.com/in/${r.requesterLinkedIn}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#00FF41] hover:text-[#00CC33] underline font-medium"
                      >
                        LinkedIn Profile
                      </a>
                    </p>
                  )}
                  
                  {/* GitHub Profile */}
                  {r.requesterGithub && (
                    <p className="text-sm mt-1 flex items-center gap-1">
                      <Github className="w-4 h-4 text-[#00FF41]" />
                      <a 
                        href={r.requesterGithub} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#00FF41] hover:text-[#00CC33] underline font-medium"
                      >
                        GitHub Profile
                      </a>
                    </p>
                  )}

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
                    onClick={() => handleDecision('', r.id, "approved")}
                    disabled={r.status === "approved"}
                    className="cyber-button px-3 py-1 disabled:opacity-40"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleDecision('', r.id, "rejected")}
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
