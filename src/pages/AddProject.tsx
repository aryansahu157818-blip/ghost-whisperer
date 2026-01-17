import { useState } from "react";
import { fetchGitHubStats, calculateVitalityScore } from "@/lib/github";
import { addProject } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function AddProject() {
  const { user, profile } = useAuth();

  const [githubUrl, setGithubUrl] = useState("");
  const [title, setTitle] = useState("");
  const [ghostLog, setGhostLog] = useState("");
  const [manualDescription, setManualDescription] = useState(""); // ✅ NEW
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [message, setMessage] = useState("");

  const handleFetch = async () => {
    setMessage("");
    setStats(null);

    if (!githubUrl.trim()) {
      setMessage("Please enter a GitHub repository URL first.");
      return;
    }

    setLoading(true);

    try {
      const data = await fetchGitHubStats(githubUrl);

      if (!data) {
        setMessage("Could not fetch repo — check URL.");
        setLoading(false);
        return;
      }

      const vitality = calculateVitalityScore(data);
      setStats({ ...data, vitality });

      // Auto-fill title if empty
      if (!title.trim()) setTitle(data.name || "");
    } catch (e) {
      console.error(e);
      setMessage("Failed to fetch repository data.");
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

    if (!stats) {
      setMessage("Fetch repo data first.");
      return;
    }

    if (!title.trim()) {
      setMessage("Please enter project title.");
      return;
    }

    if (!ghostLog.trim()) {
      setMessage("Please generate/write ghost log.");
      return;
    }

    if (!manualDescription.trim()) {
      setMessage("Please add manual description (creator notes).");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await addProject({
        title,
        githubUrl,

        // ✅ public identity (safe)
        creatorName: profile.ghostHandle,

        // ✅ keep real email for approval + contact unlock later
        creatorEmail: user.email || "",

        // ✅ for security rules later
        creatorUid: user.uid,

        // AI summary
        ghostLog,

        // ✅ NEW: Manual creator notes
        manualDescription,

        vitalityScore: stats.vitality,
        status: "active",

        stars: stats.stars ?? 0,
        forks: stats.forks ?? 0,
        lastUpdated: stats.lastUpdated ?? "",
      });

      setMessage("✅ Project added to vault!");
      setGithubUrl("");
      setTitle("");
      setGhostLog("");
      setManualDescription(""); // ✅ reset
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
      <h1 className="text-xl font-bold">Submit a Project</h1>

      {message && (
        <p className="text-sm opacity-80 border border-border rounded p-3">
          {message}
        </p>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">GitHub Repo URL</label>
        <input
          className="w-full border p-2 rounded bg-background"
          placeholder="https://github.com/user/repo"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
        />
      </div>

      <button
        onClick={handleFetch}
        className="cyber-button w-full"
        disabled={loading}
      >
        {loading ? "Fetching..." : "Fetch Repo Data"}
      </button>

      {stats && (
        <div className="cyber-card p-4 space-y-2">
          <p>
            <strong>Name:</strong> {stats.name}
          </p>
          <p>
            <strong>Stars:</strong> {stats.stars}
          </p>
          <p>
            <strong>Forks:</strong> {stats.forks}
          </p>
          <p>
            <strong>Vitality:</strong> {stats.vitality}
          </p>
          <p className="text-xs opacity-70">
            Last Updated:{" "}
            {stats.lastUpdated
              ? new Date(stats.lastUpdated).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Project Title</label>
        <input
          className="w-full border p-2 rounded bg-background"
          placeholder="Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Ghost Log (AI/Generated)</label>
        <textarea
          className="w-full border p-2 rounded bg-background"
          placeholder="Why is this project abandoned? Summary for juniors."
          value={ghostLog}
          onChange={(e) => setGhostLog(e.target.value)}
          rows={4}
        />
      </div>

      {/* ✅ NEW FIELD */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Creator Notes (Manual Description) 📝
        </label>
        <textarea
          className="w-full border p-2 rounded bg-background"
          placeholder="Write clear handover notes: what was completed, what is pending, how juniors can continue, required setup, etc."
          value={manualDescription}
          onChange={(e) => setManualDescription(e.target.value)}
          rows={5}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="cyber-button w-full"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit to Vault"}
      </button>
    </div>
  );
}
