import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, Star, GitFork, Calendar, Activity, Shield, FileText } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { getProjectById, Project } from "@/lib/firebase";
import ReactMarkdown from "react-markdown";

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        const proj = await getProjectById(id);
        setProject(proj);
        setError(null);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-destructive">Error: {error || "Project not found"}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Project Header */}
          <div className="cyber-card mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 neon-text-intense">{project.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    Status: 
                    <span className={`ml-1 px-2 py-1 rounded text-xs uppercase ${
                      project.status === "active" 
                        ? "bg-primary/20 text-primary" 
                        : project.status === "dormant"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-destructive/20 text-destructive"
                    }`}>
                      {project.status}
                    </span>
                  </span>
                  
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {project.stars || 0} stars
                  </span>
                  
                  <span className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" />
                    {project.forks || 0} forks
                  </span>
                  
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Updated {project.lastUpdated}
                  </span>
                </div>
                
                <p className="text-lg text-muted-foreground mb-4">{project.ghostLog}</p>
              </div>
              
              {project.thumbnailUrl && (
                <div className="md:ml-6">
                  <img
                    src={project.thumbnailUrl}
                    alt={`${project.title} thumbnail`}
                    className="w-48 h-32 object-cover rounded-lg border border-border shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Creator Info */}
          <div className="cyber-card mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Creator Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Creator Name</label>
                <div className="cyber-input w-full bg-secondary/50">
                  {project.creatorName || "Unknown"}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Vitality Score</label>
                <div className="cyber-input w-full bg-secondary/50">
                  {project.vitalityScore}%
                </div>
              </div>
            </div>
          </div>

          {/* GitHub Link */}
          {project.githubUrl && (
            <div className="cyber-card mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Github className="w-5 h-5" />
                Repository
              </h2>
              
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cyber-button w-full flex items-center justify-center gap-2"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </a>
            </div>
          )}

          {/* Security Report */}
          {project.ghostDossier && (
            <div className="cyber-card mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Ghost Security Dossier
              </h2>
              
              <div className="prose prose-invert max-w-none bg-secondary/20 p-6 rounded-lg markdown-content">
                <ReactMarkdown>
                  {project.ghostDossier}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Interest Form - Only if user is logged in */}
          {user && (
            <div className="cyber-card">
              <h2 className="text-xl font-bold mb-4">Request Access</h2>
              <p className="text-muted-foreground mb-4">
                Interested in this project? Send a request to the creator.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Your Name</label>
                  <input
                    value={user.displayName || user.email?.split("@")[0] || ""}
                    disabled
                    className="cyber-input w-full opacity-70"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Your Email</label>
                  <input
                    value={user.email || ""}
                    disabled
                    className="cyber-input w-full opacity-70"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Why are you interested in this project?
                  </label>
                  <textarea
                    rows={4}
                    className="cyber-input w-full"
                    placeholder="Explain your interest in reviving this project..."
                  />
                </div>
                
                <button className="cyber-button w-full">
                  Send Interest Request
                </button>
              </div>
            </div>
          )}
          
          {!user && (
            <div className="cyber-card text-center">
              <p className="text-muted-foreground">
                Sign in to request access to this project
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}