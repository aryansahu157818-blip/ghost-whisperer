import { useState } from "react";
import { fetchGitHubStats, calculateVitalityScore } from "@/lib/github";
import { addProject } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function AddProject() {
  const { user, profile } = useAuth();

  const [githubUrl, setGithubUrl] = useState("");
  const [title, setTitle] = useState("");
  const [ghostLog, setGhostLog] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [message, setMessage] = useState("");

  const handleFetch = async () => {
    setMessage("");
    setStats(null);
    setLoading(true);

    const data = await fetchGitHubStats(githubUrl);

    if (!data) {
      setMessage("Could not fetch repo — check URL.");
      setLoading(false);
      return;
    }

    const vitality = calculateVitalityScore(data);
    setStats({ ...data, vitality });

    setLoading(false);
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
      await addProject({
        title,
        githubUrl,

        // ✅ public identity (safe)
        creatorName: profile.ghostHandle,

        // ✅ keep real email for approval + contact unlock later
        creatorEmail: user.email || "",

        ghostLog,
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

      {message && <p>{message}</p>}

      <input
        className="w-full border p-2"
        placeholder="GitHub Repo URL"
        value={githubUrl}
        onChange={(e) => setGithubUrl(e.target.value)}
      />

      <button onClick={handleFetch} className="border px-4 py-2">
        {loading ? "Fetching..." : "Fetch Repo Data"}
      </button>

      {stats && (
        <div className="border p-3 space-y-2">
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

      <input
        className="w-full border p-2"
        placeholder="Project Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full border p-2"
        placeholder="Why is this abandoned?"
        value={ghostLog}
        onChange={(e) => setGhostLog(e.target.value)}
      />

      <button onClick={handleSubmit} className="border px-4 py-2">
        {loading ? "Submitting..." : "Submit to Vault"}
      </button>
    </div>
  );
}
