import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  Github,
  Star,
  GitFork,
  User,
  Ghost,
  Brain,
  Shield,
  Database,
  Gamepad2,
  Lock,
} from "lucide-react";
import { Project } from "@/lib/firebase";
import { VitalityBar } from "./VitalityBar";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const getStatusColor = () => {
    switch (project.status) {
      case "active":
        return "bg-primary/20 text-primary border-primary/30";
      case "dormant":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "haunted":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getThemeFromTitle = (title: string = ""): string => {
    if (!title) return "Default";
    const lowerTitle = title.toLowerCase();

    if (
      lowerTitle.includes("api") ||
      lowerTitle.includes("server") ||
      lowerTitle.includes("backend")
    )
      return "Circuit";
    if (
      lowerTitle.includes("ai") ||
      lowerTitle.includes("ml") ||
      lowerTitle.includes("neural") ||
      lowerTitle.includes("learning")
    )
      return "Quantum";
    if (
      lowerTitle.includes("security") ||
      lowerTitle.includes("crypto") ||
      lowerTitle.includes("shield") ||
      lowerTitle.includes("guard")
    )
      return "Shield";
    if (
      lowerTitle.includes("data") ||
      lowerTitle.includes("db") ||
      lowerTitle.includes("storage") ||
      lowerTitle.includes("warehouse")
    )
      return "Data";
    if (
      lowerTitle.includes("game") ||
      lowerTitle.includes("engine") ||
      lowerTitle.includes("unity")
    )
      return "Matrix";
    if (
      lowerTitle.includes("web") ||
      lowerTitle.includes("ui") ||
      lowerTitle.includes("frontend") ||
      lowerTitle.includes("design")
    )
      return "Digital";
    if (
      lowerTitle.includes("mobile") ||
      lowerTitle.includes("ios") ||
      lowerTitle.includes("android")
    )
      return "Future";
    if (
      lowerTitle.includes("bio") ||
      lowerTitle.includes("health") ||
      lowerTitle.includes("medical") ||
      lowerTitle.includes("dna")
    )
      return "Biohazard";
    if (
      lowerTitle.includes("finance") ||
      lowerTitle.includes("bank") ||
      lowerTitle.includes("money") ||
      lowerTitle.includes("trade")
    )
      return "Gold";
    if (
      lowerTitle.includes("social") ||
      lowerTitle.includes("chat") ||
      lowerTitle.includes("messaging") ||
      lowerTitle.includes("network")
    )
      return "Network";
    if (
      lowerTitle.includes("iot") ||
      lowerTitle.includes("sensor") ||
      lowerTitle.includes("device")
    )
      return "Signal";

    const firstChar = lowerTitle.charAt(0);
    const themes = [
      "Nebula",
      "Cyber",
      "Ghost",
      "Fire",
      "Ice",
      "Shadow",
      "Plasma",
      "Hacker",
      "Retro",
    ];
    const i = firstChar.charCodeAt(0) % themes.length;
    return themes[i];
  };

  const getThemeGradient = (title: string = "") => {
    const theme = getThemeFromTitle(title);
    const themeColors: Record<string, string> = {
      Nebula: "from-purple-500/20 via-pink-500/20 to-violet-500/20",
      Circuit: "from-blue-500/20 via-cyan-500/20 to-emerald-500/20",
      Biohazard: "from-green-500/20 via-lime-500/20 to-yellow-500/20",
      Cyber: "from-cyan-500/20 via-blue-500/20 to-indigo-500/20",
      Ghost: "from-slate-500/20 via-gray-500/20 to-zinc-500/20",
      Nuclear: "from-lime-500/20 via-green-500/20 to-emerald-500/20",
      Fire: "from-red-500/20 via-orange-500/20 to-yellow-500/20",
      Ice: "from-blue-300/20 via-cyan-300/20 to-sky-300/20",
      Shadow: "from-gray-700/20 via-slate-700/20 to-zinc-700/20",
      Plasma: "from-purple-600/20 via-pink-600/20 to-rose-600/20",
      Data: "from-blue-400/20 via-indigo-400/20 to-purple-400/20",
      Digital: "from-cyan-400/20 via-blue-400/20 to-indigo-400/20",
      Matrix: "from-green-400/20 via-emerald-400/20 to-teal-400/20",
      Hacker: "from-green-600/20 via-lime-600/20 to-emerald-600/20",
      Retro: "from-pink-500/20 via-purple-500/20 to-indigo-500/20",
      Future: "from-violet-500/20 via-purple-500/20 to-fuchsia-500/20",
      Spectral: "from-indigo-500/20 via-purple-500/20 to-pink-500/20",
      Quantum: "from-fuchsia-500/20 via-purple-500/20 to-violet-500/20",
      Binary: "from-gray-500/20 via-slate-500/20 to-zinc-500/20",
      Shield: "from-blue-600/20 via-indigo-600/20 to-sky-600/20",
      Gold: "from-yellow-500/20 via-amber-500/20 to-orange-500/20",
      Network: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
      Signal: "from-rose-500/20 via-pink-500/20 to-fuchsia-500/20",
      Default: "from-slate-500/20 via-gray-500/20 to-zinc-500/20",
    };

    const normalizedTheme =
      theme.charAt(0).toUpperCase() + theme.slice(1).toLowerCase();
    const gradientClass = themeColors[normalizedTheme] || themeColors.Default;

    return `bg-gradient-to-br ${gradientClass}`;
  };

  const getProjectIcon = (title: string = "Ghost") => {
    const lowerTitle = title.toLowerCase();

    if (
      lowerTitle.includes("api") ||
      lowerTitle.includes("server") ||
      lowerTitle.includes("backend")
    )
      return <GitFork className="w-6 h-6" />;
    if (
      lowerTitle.includes("ai") ||
      lowerTitle.includes("ml") ||
      lowerTitle.includes("neural") ||
      lowerTitle.includes("learning")
    )
      return <Brain className="w-6 h-6" />;
    if (
      lowerTitle.includes("security") ||
      lowerTitle.includes("crypto") ||
      lowerTitle.includes("shield") ||
      lowerTitle.includes("guard")
    )
      return <Shield className="w-6 h-6" />;
    if (
      lowerTitle.includes("data") ||
      lowerTitle.includes("db") ||
      lowerTitle.includes("storage")
    )
      return <Database className="w-6 h-6" />;
    if (lowerTitle.includes("game") || lowerTitle.includes("engine"))
      return <Gamepad2 className="w-6 h-6" />;

    return <Ghost className="w-6 h-6" />;
  };

  const displayHandle = project.creatorName?.trim() || "Anonymous Ghost 👻";

  const openGithub = (e: React.MouseEvent) => {
    e.preventDefault(); // stops Link navigation
    e.stopPropagation();

    if (project.githubUrl) {
      window.open(project.githubUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link to={`/project/${project.id}`} className="block">
        <div
          className={`cyber-card group hover:neon-border-intense transition-all duration-300 h-full ${getThemeGradient(
            project.title
          )}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-primary">{getProjectIcon(project.title)}</span>

              <h3 className="text-lg font-bold text-foreground group-hover:neon-text transition-all truncate">
                {project.title}
              </h3>
            </div>

            <span
              className={`px-2 py-1 text-xs rounded border ${getStatusColor()} uppercase tracking-wider`}
            >
              {project.status}
            </span>
          </div>

          {/* Ghost Log */}
          <div className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {project.ghostLog ? (
              <div className="markdown-wrapper">
                <ReactMarkdown>{project.ghostLog}</ReactMarkdown>
              </div>
            ) : <p>No description available</p>}
          </div>

          {/* Ghost Dossier Indicator */}
          {project.ghostLog && (
            <div className="flex items-center gap-1 text-xs text-primary mb-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              <span>Ghost Dossier available</span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="w-4 h-4" />
              <span>{project.stars || 0}</span>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <GitFork className="w-4 h-4" />
              <span>{project.forks || 0}</span>
            </div>

            {/* ✅ GitHub icon as BUTTON (not <a>) */}
            <button
              type="button"
              onClick={openGithub}
              className="ml-auto text-muted-foreground hover:text-primary transition-colors"
              aria-label="Open GitHub repository"
              title="Open GitHub repository"
            >
              <Github className="w-4 h-4" />
            </button>
          </div>

          {/* Vitality Bar */}
          <div className="mb-4">
            <VitalityBar score={project.vitalityScore} />
          </div>

          {/* Creator */}
          <div className="pt-4 border-t border-border space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span className="truncate">{displayHandle}</span>
            </div>

            {/* 🔒 Contact hidden */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span className="truncate">
                Identity hidden • unlock after approval
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
