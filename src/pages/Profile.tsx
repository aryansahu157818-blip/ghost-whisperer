import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Profile() {
  const { user, profile } = useAuth();
  
  const [linkedInUsername, setLinkedInUsername] = useState(profile?.linkedInUsername || "");
  const [githubProfileUrl, setGithubProfileUrl] = useState(profile?.githubProfileUrl || "");
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    setLinkedInUsername(profile?.linkedInUsername || "");
    setGithubProfileUrl(profile?.githubProfileUrl || "");
  }, [profile]);

  const ghostHandle =
    profile?.ghostHandle ||
    (user?.email ? `@ghost_${user.email.split("@")[0]}` : "Anonymous Ghost 👻");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ghostHandle);
      toast.success("Ghost username copied ✅");
    } catch {
      toast.error("Copy failed");
    }
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    // Debug: Log the data being saved
    console.log("Saving Profile Data:", { 
      linkedInUsername: linkedInUsername.trim() || null,
      githubProfileUrl: githubProfileUrl.trim() || null
    });
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        linkedInUsername: linkedInUsername.trim() || null,
        githubProfileUrl: githubProfileUrl.trim() || null,
      }, { merge: true });
      
      toast.success("Professional Identity Linked ✅");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="cyber-card">
            <h1 className="text-2xl font-bold neon-text mb-2">Profile</h1>
            <p className="opacity-70 text-sm">
              Your public identity on Ghost Whisperer
            </p>
          </div>

          <div className="cyber-card space-y-4">
            <div>
              <p className="text-sm opacity-70 mb-1">Ghost Username</p>
              <div className="flex items-center justify-between gap-3 p-3 rounded border border-border bg-sidebar-accent">
                <span className="font-semibold">{ghostHandle}</span>

                <button
                  onClick={handleCopy}
                  className="cyber-button px-3 py-2 text-sm flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm opacity-70 mb-1">Real Email (Private)</p>
              <p className="text-sm">{user?.email}</p>
            </div>
            
            {/* LinkedIn Username */}
            <div>
              <p className="text-sm opacity-70 mb-1">LinkedIn Username</p>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={linkedInUsername}
                    onChange={(e) => setLinkedInUsername(e.target.value)}
                    placeholder="your-linkedin-username"
                    className="w-full cyber-input"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveProfile}
                      className="cyber-button text-sm px-3 py-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={async () => {
                        // Fetch fresh profile data on cancel
                        if (user) {
                          const userDocRef = doc(db, "users", user.uid);
                          const userSnap = await getDoc(userDocRef);
                          if (userSnap.exists()) {
                            const freshProfile = userSnap.data();
                            setLinkedInUsername(freshProfile.linkedInUsername || "");
                            setGithubProfileUrl(freshProfile.githubProfileUrl || "");
                          }
                        }
                        setIsEditing(false);
                      }}
                      className="cyber-button text-sm px-3 py-2 bg-secondary text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 p-3 rounded border border-border bg-sidebar-accent">
                  <span className="font-semibold">
                    {profile?.linkedInUsername ? `@${profile.linkedInUsername}` : "Not set"}
                  </span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="cyber-button px-3 py-2 text-sm"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            
            {/* GitHub Profile URL */}
            <div>
              <p className="text-sm opacity-70 mb-1">GitHub Profile URL</p>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={githubProfileUrl}
                    onChange={(e) => setGithubProfileUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full cyber-input"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveProfile}
                      className="cyber-button text-sm px-3 py-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={async () => {
                        // Fetch fresh profile data on cancel
                        if (user) {
                          const userDocRef = doc(db, "users", user.uid);
                          const userSnap = await getDoc(userDocRef);
                          if (userSnap.exists()) {
                            const freshProfile = userSnap.data();
                            setLinkedInUsername(freshProfile.linkedInUsername || "");
                            setGithubProfileUrl(freshProfile.githubProfileUrl || "");
                          }
                        }
                        setIsEditing(false);
                      }}
                      className="cyber-button text-sm px-3 py-2 bg-secondary text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 p-3 rounded border border-border bg-sidebar-accent">
                  <span className="font-semibold">
                    {profile?.githubProfileUrl ? profile.githubProfileUrl : "Not set"}
                  </span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="cyber-button px-3 py-2 text-sm"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div className="p-3 rounded border border-primary/30 bg-primary/10 text-sm">
              🔒 Your real name/email are hidden in Ghost Vault. Juniors can only
              unlock contact after you approve their request.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
