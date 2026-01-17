import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { user, profile } = useAuth();

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
