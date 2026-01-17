import { useState } from "react";
import { fetchGitHubStats, calculateVitalityScore } from "@/lib/github";
import { addProject } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

// ✅ Google AI
import { generateGhostLog, generateThumbnailPrompt, generateSecurityReport } from "@/lib/gemini";

// ✅ Free image generator (Pollinations)
import { generateThumbnailUrl } from "@/lib/thumbnail";

// ✅ FCM Notifications
import { requestNotificationPermission } from "@/lib/fcm";

export default function AddProject() {
  const { user, profile } = useAuth();

  const [githubUrl, setGithubUrl] = useState("");
  const [title, setTitle] = useState("");
  const [manualDescription, setManualDescription] = useState(""); // Manual description for image generation
  const [ghostLog, setGhostLog] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");


  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [message, setMessage] = useState("");

  const handleFetch = async () => {
    setMessage("");
    setStats(null);
    setThumbnailUrl("");
    setLoading(true);

    const data = await fetchGitHubStats(githubUrl);

    if (!data) {
      setMessage("❌ Could not fetch repo — check URL.");
      setLoading(false);
      return;
    }

    const vitality = calculateVitalityScore(data);
    setStats({ ...data, vitality });
    setLoading(false);

    // Autofill title (optional)
    if (!title) {
      setTitle(data.name || "");
    }

    // ✅ Generate ghost log + thumbnail
    try {
      setLoading(true);
      setMessage("⚡ Generating Ghost Log + Thumbnail using Google Gemini...");

      const generatedLog = await generateGhostLog(
        data.name || title || "Unknown Project",
        data.description || "",
        {
          stars: data.stars ?? 0,
          forks: data.forks ?? 0,
          lastUpdated: data.lastUpdated ?? "",
        }
      );

      setGhostLog(generatedLog);

      // ✅ Use manual description if provided, otherwise use generated log for image generation
      const imageDescription = manualDescription.trim() || generatedLog;
      
      // ✅ Gemini generates the image prompt
      const prompt = await generateThumbnailPrompt(
        data.name || title || "Ghost Project",
        imageDescription
      );

      // ✅ Free image URL generated from prompt
      const imgUrl = generateThumbnailUrl(prompt);
      setThumbnailUrl(imgUrl);

      // ✅ Generate security report
      const generatedSecurityReport = await generateSecurityReport(
        data.name || title || "Ghost Project",
        data.description || "",
        {
          stars: data.stars ?? 0,
          forks: data.forks ?? 0,
          lastUpdated: data.lastUpdated ?? "",
        }
      );



      setMessage("✅ Repo analyzed. Ghost Log + Thumbnail ready.");
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Repo fetched, but AI generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setMessage("Please sign in first.");
      return;
    }

    if (!profile) {
      setMessage("Loading user profile… try again in 2 seconds.");
      return;
    }

    if (!stats || !title) {
      setMessage("Fill everything first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Step A: Call Gemini API with Professional Template
      const generatedLog = await generateGhostLog(
        title,
        manualDescription || ghostLog,
        {
          stars: stats.stars ?? 0,
          forks: stats.forks ?? 0,
          lastUpdated: stats.lastUpdated ?? "",
        }
      );

      // Step B: await the Firestore addDoc to ensure data is saved first
      try {
        await addProject({
          title,
          githubUrl,

          // ✅ public identity (safe)
          creatorName: profile.ghostHandle,

          // ✅ keep real email for approval + contact unlock later
          creatorEmail: (user.email || "").toLowerCase(),

          // ✅ ownership for security rules
          creatorUid: user.uid,

          ghostLog: generatedLog, // Use the Gemini-generated log
          thumbnailUrl, // ✅ NEW (AI thumbnail)

          vitalityScore: stats.vitality,
          status: "active",

          stars: stats.stars ?? 0,
          forks: stats.forks ?? 0,
          lastUpdated: stats.lastUpdated ?? "",
        });

        setMessage("✅ Project added to vault!");
        
        // Step C: Immediately after success, trigger browser notification
        try {
          if (Notification.permission === "granted") {
            new Notification("👻 Ghost Vault Update", {
              body: "New Soul Captured! Your project is now live.",
              icon: "/favicon.ico"
            });
          }
        } catch (notificationError) {
          console.error("FCM Notification failed:", notificationError);
          // Continue without blocking - project is already saved
        }
      } catch (firestoreError) {
        console.error("Firestore Error:", firestoreError);
        setMessage("❌ Failed to submit project. Check console for details.");
        throw firestoreError; // Re-throw to be caught by outer catch
      }
      
      setGithubUrl("");
      setTitle("");
      setManualDescription(""); // Clear manual description too
      setGhostLog("");
      setThumbnailUrl("");

      setStats(null);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to submit project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-4">
      <h1 className="text-xl font-bold">Add Project</h1>

      {message && <p className="text-sm opacity-80">{message}</p>}

      <input
        className="w-full border p-2"
        placeholder="GitHub Repo URL"
        value={githubUrl}
        onChange={(e) => setGithubUrl(e.target.value)}
      />

      <button
        onClick={handleFetch}
        className="border px-4 py-2 w-full"
        disabled={loading}
      >
        {loading ? "Working..." : "Fetch Repo + Generate AI Ghost Log"}
      </button>

      {stats && (
        <div className="border p-3 space-y-2 rounded">
          <p>
            <strong>Name:</strong> {stats.name}
          </p>
          <p>
            <strong>Stars:</strong> {stats.stars}
          </p>
          <p>
            <strong>Vitality:</strong> {stats.vitality}
          </p>
        </div>
      )}

      {/* ✅ Manual Description - Top Priority */}
      <textarea
        className="w-full border p-2"
        placeholder="Manual Description (for generating beautiful image)"
        rows={3}
        value={manualDescription}
        onChange={(e) => setManualDescription(e.target.value)}
      />

      {/* ✅ Thumbnail preview */}
      {thumbnailUrl && (
        <div className="border p-3 rounded space-y-2">
          <p className="text-sm font-semibold">AI Thumbnail Preview</p>
          <img
            src={thumbnailUrl}
            alt="AI Thumbnail"
            className="w-full h-48 object-cover rounded"
          />
        </div>
      )}

      <input
        className="w-full border p-2"
        placeholder="Project Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full border p-2"
        placeholder="Ghost Log (auto-generated by Gemini, editable)"
        rows={4}
        value={ghostLog}
        onChange={(e) => setGhostLog(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="border px-4 py-2 w-full"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit to Vault"}
      </button>
    </div>
  );
}
