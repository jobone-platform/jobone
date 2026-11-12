import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Mail,
  MoreVertical,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  X,
  AlertTriangle,
  User,
  Shield,
  Key,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmployerLayout from "../components/employer/EmployerLayout";

const ROLES = [
  {
    id: "Admin",
    title: "Admin",
    description: "Full recruitment access: post jobs, manage KYC filings, review candidates, and invite team members.",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
  {
    id: "Recruiter",
    title: "Recruiter",
    description: "Pipeline access: review candidate dossiers, update applicant stages, and schedule interviews.",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  {
    id: "Interviewer",
    title: "Interviewer",
    description: "Evaluation access: view assigned candidate profiles, launch interview sessions, and submit notes.",
    badgeClass: "bg-silver/10 text-silver border-silver/30",
  },
];

export default function EmployerTeam() {
  const navigate = useNavigate();

  // Team roster state
  const [teamMembers, setTeamMembers] = useState(() => {
    try {
      const stored = localStorage.getItem("jobone_employer_team");
      if (stored) return JSON.parse(stored);
    } catch (_err) {
      /* ignore */
    }
    return [
      {
        id: "owner-primary",
        name: "Primary Account Owner",
        email: "employer@company.com",
        role: "Admin",
        status: "Active",
        isOwner: true,
        addedAt: "2026-01-10",
        lastActive: "Just now",
      },
    ];
  });

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modals
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "Recruiter",
    note: "",
  });

  const [editRoleMember, setEditRoleMember] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState("Recruiter");

  const [removeMember, setRemoveMember] = useState(null);

  // Sync current employer details on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("employerInfo");
      if (!stored) return navigate("/login");
      const info = JSON.parse(stored);
      const ownerEmail = info.email || info.employer?.email || "employer@company.com";
      const ownerName =
        info.companyName || info.name || info.employer?.companyName || "Primary Account Owner";

      setTeamMembers((prev) => {
        const hasOwner = prev.some((m) => m.isOwner);
        if (hasOwner) {
          return prev.map((m) =>
            m.isOwner ? { ...m, name: ownerName, email: ownerEmail } : m
          );
        }
        return [
          {
            id: "owner-primary",
            name: ownerName,
            email: ownerEmail,
            role: "Admin",
            status: "Active",
            isOwner: true,
            addedAt: "2026-01-10",
            lastActive: "Just now",
          },
          ...prev,
        ];
      });
    } catch (_err) {
      /* ignore */
    }
  }, [navigate]);

  // Save changes to local storage
  const persistTeam = (updatedList) => {
    setTeamMembers(updatedList);
    try {
      localStorage.setItem("jobone_employer_team", JSON.stringify(updatedList));
    } catch (_err) {
      /* ignore */
    }
  };

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || member.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [teamMembers, searchQuery, roleFilter]);

  // Invite Member Handler
  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) return;

    if (teamMembers.some((m) => m.email.toLowerCase() === inviteForm.email.toLowerCase())) {
      alert("A team member with this email already exists.");
      return;
    }

    const newMember = {
      id: `member-${Date.now()}`,
      name: inviteForm.name.trim(),
      email: inviteForm.email.trim(),
      role: inviteForm.role,
      status: "Invited",
      isOwner: false,
      addedAt: new Date().toISOString().split("T")[0],
      lastActive: "Pending signup",
    };

    persistTeam([...teamMembers, newMember]);
    setInviteForm({ name: "", email: "", role: "Recruiter", note: "" });
    setInviteModalOpen(false);
  };

  // Change Role Handler
  const handleRoleChangeSubmit = (e) => {
    e.preventDefault();
    if (!editRoleMember) return;

    const updated = teamMembers.map((m) =>
      m.id === editRoleMember.id ? { ...m, role: selectedNewRole } : m
    );
    persistTeam(updated);
    setEditRoleMember(null);
  };

  // Remove Member Handler
  const handleRemoveSubmit = () => {
    if (!removeMember) return;
    if (removeMember.isOwner) {
      alert("The primary account owner cannot be removed.");
      return;
    }

    const updated = teamMembers.filter((m) => m.id !== removeMember.id);
    persistTeam(updated);
    setRemoveMember(null);
  };

  return (
    <EmployerLayout
      activeTab="team"
      title="Team Management"
      breadcrumbs={[
        { label: "Dashboard", path: "/employerdashboard" },
        { label: "Team Management" },
      ]}
    >
      <div className="space-y-6 pb-20">
        {/* HEADER & INVITE ACTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono tracking-widest text-foreground/50 uppercase">
                Enterprise Administration
              </span>
              <span className="text-foreground/30 font-mono">/</span>
              <span className="text-xs font-mono text-silver uppercase">
                Collaborator Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
              Team Members & Access Roles
            </h1>
            <p className="text-xs font-sans text-foreground/50 mt-1">
              Invite recruiters and hiring managers to collaborate on applicant reviews and interview scheduling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInviteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-foreground text-background font-mono text-xs font-bold hover:bg-silver transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <UserPlus size={16} /> Invite Collaborator
            </button>
          </div>
        </div>

        {/* ROLE PERMISSION CARDS MATRIX */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ROLES.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-2xl bg-surface border border-border shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold border ${r.badgeClass}`}
                >
                  {r.title}
                </span>
                <span className="text-xs font-mono text-foreground/40">
                  {teamMembers.filter((m) => m.role === r.id).length} seat{teamMembers.filter((m) => m.role === r.id).length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="text-xs font-sans text-foreground/60 leading-relaxed">
                {r.description}
              </p>
            </div>
          ))}
        </div>

        {/* SEARCH & ROLE FILTER BAR */}
        <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collaborator by name or email..."
              className="w-full pl-9 pr-3 py-2 bg-elevated border border-border rounded-xl text-xs font-sans text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-silver transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-foreground/50 uppercase">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-elevated border border-border text-foreground text-xs font-mono px-3 py-2 rounded-xl focus:outline-none focus:border-silver cursor-pointer"
            >
              <option value="all">All Roles ({teamMembers.length})</option>
              <option value="Admin">Admins</option>
              <option value="Recruiter">Recruiters</option>
              <option value="Interviewer">Interviewers</option>
            </select>
          </div>
        </div>

        {/* TEAM ROSTER TABLE */}
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-elevated/70 border-b border-border">
                  <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                    Member Name
                  </th>
                  <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                    Email Address
                  </th>
                  <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                    Assigned Role
                  </th>
                  <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                    Account Status
                  </th>
                  <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                    Date Added
                  </th>
                  <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMembers.map((member) => {
                  const roleConfig = ROLES.find((r) => r.id === member.role) || ROLES[1];

                  return (
                    <tr key={member.id} className="hover:bg-elevated/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-elevated border border-border flex items-center justify-center font-display font-bold text-xs text-foreground shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-display font-bold text-sm text-foreground flex items-center gap-1.5">
                              {member.name}
                              {member.isOwner && (
                                <span className="text-[9px] font-mono uppercase bg-silver/20 text-silver px-1.5 py-0.2 rounded border border-silver/30">
                                  Owner
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-foreground/40">
                              Active: {member.lastActive}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-foreground/70">
                        <a
                          href={`mailto:${member.email}`}
                          className="hover:text-silver transition-colors flex items-center gap-1.5"
                        >
                          <Mail size={12} className="text-foreground/40 shrink-0" />
                          <span>{member.email}</span>
                        </a>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold border ${roleConfig.badgeClass}`}
                        >
                          {member.role}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-mono ${
                            member.status === "Active"
                              ? "text-emerald-400 font-bold"
                              : "text-amber-400"
                          }`}
                        >
                          {member.status === "Active" ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <Clock size={12} />
                          )}
                          {member.status}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-foreground/50 whitespace-nowrap">
                        {member.addedAt}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        {member.isOwner ? (
                          <span className="text-foreground/30 font-mono text-[11px] italic">
                            Protected
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedNewRole(member.role);
                                setEditRoleMember(member);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-elevated border border-border text-foreground hover:bg-surface text-xs font-mono"
                              title="Edit Role"
                            >
                              Role
                            </button>
                            <button
                              onClick={() => setRemoveMember(member)}
                              className="p-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                              title="Remove Collaborator"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INVITE COLLABORATOR MODAL                                                 */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {inviteModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
              >
                <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <UserPlus size={18} className="text-silver" />
                    <h3 className="font-display font-bold text-base text-foreground">
                      Invite Team Member
                    </h3>
                  </div>
                  <button
                    onClick={() => setInviteModalOpen(false)}
                    className="p-1 rounded-lg text-foreground/40 hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="block font-mono text-foreground/70 uppercase text-[11px] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                      className="w-full p-2.5 bg-elevated border border-border rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-silver"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-foreground/70 uppercase text-[11px] mb-1">
                      Work Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. priya@company.com"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      className="w-full p-2.5 bg-elevated border border-border rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-silver font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-foreground/70 uppercase text-[11px] mb-1">
                      Role & Permissions *
                    </label>
                    <select
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                      className="w-full p-2.5 bg-elevated border border-border rounded-xl text-foreground font-mono focus:outline-none focus:border-silver cursor-pointer"
                    >
                      <option value="Recruiter">Recruiter (Review & Schedule)</option>
                      <option value="Interviewer">Interviewer (Assessments & Notes)</option>
                      <option value="Admin">Admin (Full Account Administration)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-foreground/70 uppercase text-[11px] mb-1">
                      Personal Welcome Note (optional)
                    </label>
                    <textarea
                      placeholder="e.g. Welcome to our hiring workspace on JobOne..."
                      value={inviteForm.note}
                      onChange={(e) => setInviteForm({ ...inviteForm, note: e.target.value })}
                      className="w-full p-2.5 bg-elevated border border-border rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-silver h-18 resize-y"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setInviteModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-mono border border-border text-foreground hover:bg-elevated"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-background bg-foreground hover:bg-silver transition-colors"
                    >
                      Send Invitation
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* EDIT ROLE MODAL                                                           */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {editRoleMember && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
              >
                <h3 className="font-display font-bold text-base text-foreground">
                  Update Role: {editRoleMember.name}
                </h3>
                <p className="text-xs text-foreground/60 font-sans">
                  Choose the new access permission tier for this team member.
                </p>

                <form onSubmit={handleRoleChangeSubmit} className="space-y-4 text-xs font-mono">
                  <select
                    value={selectedNewRole}
                    onChange={(e) => setSelectedNewRole(e.target.value)}
                    className="w-full p-2.5 bg-elevated border border-border rounded-xl text-foreground focus:outline-none focus:border-silver cursor-pointer"
                  >
                    <option value="Recruiter">Recruiter</option>
                    <option value="Interviewer">Interviewer</option>
                    <option value="Admin">Admin</option>
                  </select>

                  <div className="pt-2 flex justify-end gap-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setEditRoleMember(null)}
                      className="px-4 py-2 rounded-xl text-xs font-mono border border-border text-foreground hover:bg-elevated"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-foreground text-background hover:bg-silver"
                    >
                      Save Role
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* REMOVE MEMBER CONFIRMATION MODAL                                          */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {removeMember && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
              >
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle size={20} />
                  <h3 className="font-display font-bold text-base text-foreground">
                    Revoke Member Access?
                  </h3>
                </div>
                <p className="text-xs font-sans text-foreground/70 leading-relaxed">
                  Are you sure you want to remove{" "}
                  <strong className="text-foreground">{removeMember.name}</strong> (
                  {removeMember.email}) from your employer hiring team?
                </p>

                <div className="pt-2 flex justify-end gap-2 border-t border-border">
                  <button
                    onClick={() => setRemoveMember(null)}
                    className="px-4 py-2 rounded-xl text-xs font-mono border border-border text-foreground hover:bg-elevated"
                  >
                    Keep Member
                  </button>
                  <button
                    onClick={handleRemoveSubmit}
                    className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                  >
                    Revoke Access
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </EmployerLayout>
  );
}
