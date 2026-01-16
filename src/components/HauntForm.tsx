import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

interface HauntFormProps {
  projectId: string;
  projectTitle: string;
  creatorEmail: string;

  // ✅ NEW (for contact reveal / dashboard display)
  creatorName?: string;
  githubUrl?: string;

  onSuccess?: () => void;
}

// ---------------- EMAIL SENDER ----------------
async function sendHauntEmail(values: any) {
  try {
    const res = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID!,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID!,
      values,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY!
    );

    console.log("EMAIL SUCCESS:", res);
    return true;
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    return false;
  }
}
// ------------------------------------------------

export default function HauntForm({
  projectId,
  projectTitle,
  creatorEmail,
  creatorName,
  githubUrl,
  onSuccess,
}: HauntFormProps) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] =
    useState<"none" | "pending" | "approved" | "rejected">("none");

  const [formData, setFormData] = useState({
    fromName: "",
    fromEmail: "",
    message: "",
  });

  // sync logged-in user
  useEffect(() => {
    if (user) {
      setFormData({
        fromName: user.displayName || user.email?.split("@")[0] || "",
        fromEmail: user.email || "",
        message: "",
      });
    }
  }, [user]);

  // watch request status
  useEffect(() => {
    if (!user || !projectId) return;

    const q = query(
      collection(db, "projects", projectId, "interests"),
      where("juniorUid", "==", user.uid)
    );

    return onSnapshot(q, (snap) => {
      if (snap.empty) setStatus("none");
      else setStatus((snap.docs[0].data() as any).status || "pending");
    });
  }, [user, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return toast.error("Please sign in first.");
    if (!formData.message.trim()) return toast.error("Please write a message.");
    if (!creatorEmail) return toast.error("Project owner email missing.");

    setLoading(true);

    try {
      // prevent duplicate requests
      const exists = await getDocs(
        query(
          collection(db, "projects", projectId, "interests"),
          where("juniorUid", "==", user.uid)
        )
      );

      if (!exists.empty) {
        setLoading(false);
        return toast.info("You already sent interest.");
      }

      // ---------- SAVE REQUEST ----------
      await addDoc(collection(db, "projects", projectId, "interests"), {
        projectId,
        projectTitle,

        // 👇 force lowercase to avoid mismatch problems
        seniorEmail: creatorEmail.toLowerCase(),
        seniorName: creatorName || "",

        // ✅ store repo info for dashboard contact reveal
        githubUrl: githubUrl || "",

        juniorUid: user.uid,
        juniorName: formData.fromName,
        juniorEmail: formData.fromEmail.toLowerCase(),

        message: formData.message,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // -------- EMAIL VALUES ----------
      await sendHauntEmail({
        toEmail: creatorEmail,
        projectTitle,
        fromName: formData.fromName,
        fromEmail: formData.fromEmail,
        message: formData.message,
      });

      toast.success("Interest sent!");
      setFormData((f) => ({ ...f, message: "" }));
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const renderButton = () => {
    if (!user)
      return (
        <button className="cyber-button w-full" disabled>
          Sign in to send interest
        </button>
      );

    if (status === "pending")
      return (
        <button className="cyber-button w-full opacity-70" disabled>
          Interest Sent — Waiting
        </button>
      );

    if (status === "approved")
      return (
        <button className="cyber-button w-full bg-green-600" disabled>
          Approved 🎉
        </button>
      );

    if (status === "rejected")
      return (
        <button className="cyber-button w-full bg-red-600" disabled>
          Rejected ❌
        </button>
      );

    return (
      <button className="cyber-button w-full" type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send Interest"}
      </button>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold">Haunt this project 👻</h3>

      <div>
        <label className="text-sm">Your Name</label>
        <input
          value={formData.fromName}
          disabled
          className="cyber-input w-full opacity-70"
        />
      </div>

      <div>
        <label className="text-sm">Your Email</label>
        <input
          value={formData.fromEmail}
          disabled
          className="cyber-input w-full opacity-70"
        />
      </div>

      {status === "none" && (
        <div>
          <label className="text-sm">Why do you want to revive this project?</label>
          <textarea
            rows={4}
            className="cyber-input w-full"
            value={formData.message}
            onChange={(e) =>
              setFormData((f) => ({ ...f, message: e.target.value }))
            }
          />
        </div>
      )}

      {renderButton()}
    </form>
  );
}
