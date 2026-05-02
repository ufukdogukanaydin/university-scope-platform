"use client";

import { useState } from "react";
import { Clock, CheckCircle, XCircle, Calendar, X, Check, User, AlertCircle } from "lucide-react";

interface Application {
  id: number;
  projectTitle: string;
  projectOwner: string;
  appliedRole: string[];
  status: "Pending" | "Accepted" | "Rejected";
  appliedDate: string;
  projectCategory: string;
  projectId: number;
}

interface IncomingApplication {
  id: number;
  applicantName: string;
  applicantEmail: string;
  projectTitle: string;
  projectId: number;
  appliedRoles: string[];
  appliedDate: string;
  status: "Pending" | "Accepted" | "Rejected";
  technicalSkills: string[];
  interests: string[];
  bio: string;
}

type TabType = "sent" | "incoming";

export default function StudentMyApplicationsAdvanced() {
  const [activeTab, setActiveTab] = useState<TabType>("sent");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<IncomingApplication | null>(null);

  // Applications I Sent
  const [myApplications, setMyApplications] = useState<Application[]>([
    {
      id: 1,
      projectTitle: "Looking for ML Engineer - AI Agriculture Project",
      projectOwner: "Ali Yılmaz",
      appliedRole: ["ML Engineer", "Backend"],
      status: "Pending",
      appliedDate: "March 22, 2026",
      projectCategory: "AI",
      projectId: 101
    },
    {
      id: 2,
      projectTitle: "Frontend Developer Needed for E-Commerce Platform",
      projectOwner: "Elif Çelik",
      appliedRole: ["Frontend"],
      status: "Accepted",
      appliedDate: "March 20, 2026",
      projectCategory: "Web",
      projectId: 102
    },
    {
      id: 3,
      projectTitle: "Mobile Developer for Health & Fitness App",
      projectOwner: "Zeynep Kara",
      appliedRole: ["Frontend", "Designer"],
      status: "Rejected",
      appliedDate: "March 18, 2026",
      projectCategory: "Mobile",
      projectId: 103
    }
  ]);

  // Incoming Applications (to my projects)
  const [incomingApplications, setIncomingApplications] = useState<IncomingApplication[]>([
    {
      id: 1,
      applicantName: "Mehmet Yıldız",
      applicantEmail: "mehmet.yildiz@university.edu.tr",
      projectTitle: "AI-Powered Study Assistant",
      projectId: 1,
      appliedRoles: ["Frontend Developer", "ML Engineer"],
      appliedDate: "March 23, 2026",
      status: "Pending",
      technicalSkills: ["React", "Python", "TensorFlow", "Node.js"],
      interests: ["Machine Learning", "Web Development", "Data Science"],
      bio: "Passionate CS student with experience in ML and full-stack development. Worked on several AI projects and eager to contribute to innovative solutions."
    },
    {
      id: 2,
      applicantName: "Ayşe Demir",
      applicantEmail: "ayse.demir@university.edu.tr",
      projectTitle: "Campus Event Management Platform",
      projectId: 2,
      appliedRoles: ["Backend Developer"],
      appliedDate: "March 22, 2026",
      status: "Pending",
      technicalSkills: ["Node.js", "MongoDB", "Express", "Docker"],
      interests: ["Backend Development", "Cloud Computing", "DevOps"],
      bio: "Backend specialist with strong experience in Node.js and microservices architecture. Love building scalable systems."
    },
    {
      id: 3,
      applicantName: "Can Özkan",
      applicantEmail: "can.ozkan@university.edu.tr",
      projectTitle: "AI-Powered Study Assistant",
      projectId: 1,
      appliedRoles: ["Designer", "Frontend Developer"],
      appliedDate: "March 21, 2026",
      status: "Accepted",
      technicalSkills: ["Figma", "React", "Tailwind CSS", "UI/UX"],
      interests: ["Design", "User Experience", "Frontend Development"],
      bio: "UI/UX designer and frontend developer passionate about creating beautiful, user-friendly interfaces."
    }
  ]);

  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleCancelApplication = (appId: number) => {
    setMyApplications(myApplications.filter(app => app.id !== appId));
    showToastNotification("Application cancelled successfully");
  };

  const handleViewApplicant = (applicant: IncomingApplication) => {
    setSelectedApplicant(applicant);
    setShowApplicantModal(true);
  };

  const handleAcceptApplication = (appId: number) => {
    setIncomingApplications(incomingApplications.map(app =>
      app.id === appId ? { ...app, status: "Accepted" as const } : app
    ));
    setShowApplicantModal(false);
    showToastNotification("Application accepted! Applicant added to team");
  };

  const handleRejectApplication = (appId: number) => {
    setIncomingApplications(incomingApplications.map(app =>
      app.id === appId ? { ...app, status: "Rejected" as const } : app
    ));
    setShowApplicantModal(false);
    showToastNotification("Application rejected");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-5 h-5" strokeWidth={2} />;
      case "Accepted":
        return <CheckCircle className="w-5 h-5" strokeWidth={2} />;
      case "Rejected":
        return <XCircle className="w-5 h-5" strokeWidth={2} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-200 border-yellow-400/30";
      case "Accepted":
        return "bg-green-500/20 text-green-200 border-green-400/30";
      case "Rejected":
        return "bg-red-500/20 text-red-200 border-red-400/30";
      default:
        return "bg-white/10 text-white/70 border-white/20";
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">My Applications</h1>
        <p className="text-white/60 text-lg">Track your applications and review incoming requests</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 flex justify-center">
        <div className="flex space-x-3 p-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-8 py-3 rounded-full font-semibold transition-all cursor-pointer ${
              activeTab === "sent"
                ? "bg-white/90 text-gray-900 shadow-lg"
                : "text-white/70 hover:text-white"
            }`}
          >
            Applications I Sent
          </button>
          <button
            onClick={() => setActiveTab("incoming")}
            className={`px-8 py-3 rounded-full font-semibold transition-all cursor-pointer ${
              activeTab === "incoming"
                ? "bg-white/90 text-gray-900 shadow-lg"
                : "text-white/70 hover:text-white"
            }`}
          >
            Incoming Applications
          </button>
        </div>
      </div>

      {/* Applications I Sent */}
      {activeTab === "sent" && (
        <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
          {myApplications.map((app) => (
            <div
              key={app.id}
              className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[60px] p-10 hover:bg-white/15 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="px-5 py-2 bg-blue-500/20 backdrop-blur-sm text-blue-200 rounded-full text-sm font-medium border border-blue-400/30">
                    {app.projectCategory}
                  </span>
                  <span className={`px-5 py-2 backdrop-blur-sm rounded-full text-sm font-medium border flex items-center space-x-2 ${getStatusColor(app.status)}`}>
                    {getStatusIcon(app.status)}
                    <span>{app.status}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-white/50 text-sm">
                  <Calendar className="w-4 h-4" strokeWidth={2} />
                  <span>{app.appliedDate}</span>
                </div>
              </div>

              {/* Project Title */}
              <h3 className="text-2xl font-bold text-white mb-3">{app.projectTitle}</h3>

              {/* Project Owner */}
              <p className="text-white/60 text-base mb-4">by {app.projectOwner}</p>

              {/* Applied Roles */}
              <div className="mb-6">
                <p className="text-white/60 text-sm font-semibold mb-3">Applied as:</p>
                <div className="flex flex-wrap gap-2">
                  {app.appliedRole.map((role, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-purple-500/20 text-purple-200 rounded-full text-sm border border-purple-400/30"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {app.status === "Pending" && (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleCancelApplication(app.id)}
                    className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 rounded-full font-semibold transition-all cursor-pointer"
                  >
                    Cancel Request
                  </button>
                  <div className="flex items-center space-x-2 text-white/50 text-sm">
                    <Clock className="w-4 h-4" strokeWidth={2} />
                    <span>Waiting for team owner's response...</span>
                  </div>
                </div>
              )}

              {app.status === "Accepted" && (
                null
              )}

              {app.status === "Rejected" && (
                <div className="flex items-center space-x-2 text-red-300/70 text-sm">
                  <XCircle className="w-4 h-4" strokeWidth={2} />
                  <span>Application was not accepted by the team</span>
                </div>
              )}
            </div>
          ))}

          {myApplications.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/50 text-lg">You haven't sent any applications yet</p>
            </div>
          )}
        </div>
      )}

      {/* Incoming Applications */}
      {activeTab === "incoming" && (
        <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
          {incomingApplications.map((app) => (
            <div
              key={app.id}
              className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[60px] p-10 hover:bg-white/15 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{app.applicantName}</h4>
                    <p className="text-white/50 text-sm">{app.applicantEmail}</p>
                  </div>
                </div>
                <span className={`px-5 py-2 backdrop-blur-sm rounded-full text-sm font-medium border flex items-center space-x-2 ${getStatusColor(app.status)}`}>
                  {getStatusIcon(app.status)}
                  <span>{app.status}</span>
                </span>
              </div>

              {/* Project Info */}
              <div className="mb-4 p-4 bg-white/10 rounded-[30px] border border-white/20">
                <p className="text-white/60 text-sm mb-1">Applying to:</p>
                <p className="text-white font-semibold">{app.projectTitle}</p>
              </div>

              {/* Applied Roles */}
              <div className="mb-6">
                <p className="text-white/60 text-sm font-semibold mb-3">Applied as:</p>
                <div className="flex flex-wrap gap-2">
                  {app.appliedRoles.map((role, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-purple-500/20 text-purple-200 rounded-full text-sm border border-purple-400/30"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Applied Date */}
              <div className="flex items-center space-x-2 text-white/50 text-sm mb-6">
                <Calendar className="w-4 h-4" strokeWidth={2} />
                <span>Applied on {app.appliedDate}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleViewApplicant(app)}
                  className="flex-1 px-6 py-4 bg-white/90 hover:bg-white text-gray-900 rounded-[30px] font-bold transition-all shadow-lg hover:shadow-xl cursor-pointer"
                >
                  View Details
                </button>

                {app.status === "Pending" && (
                  <>
                    <button
                      onClick={() => handleAcceptApplication(app.id)}
                      className="px-6 py-4 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 text-green-300 rounded-[30px] font-bold transition-all cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectApplication(app.id)}
                      className="px-6 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 rounded-[30px] font-bold transition-all cursor-pointer"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {incomingApplications.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/50 text-lg">No incoming applications</p>
            </div>
          )}
        </div>
      )}

      {/* Applicant Details Modal */}
      {showApplicantModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fadeIn">
          <div className="bg-white/15 backdrop-blur-2xl rounded-[60px] border border-white/30 p-12 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedApplicant.applicantName}</h2>
                  <p className="text-white/60">{selectedApplicant.applicantEmail}</p>
                </div>
              </div>
              <button
                onClick={() => setShowApplicantModal(false)}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all border border-white/20 cursor-pointer"
              >
                <X className="w-6 h-6 text-white" strokeWidth={2} />
              </button>
            </div>

            {/* Project Info */}
            <div className="mb-8 p-6 bg-white/10 rounded-[40px] border border-white/20">
              <p className="text-white/60 text-sm mb-2">Applying to:</p>
              <h3 className="text-xl font-bold text-white">{selectedApplicant.projectTitle}</h3>
              <p className="text-white/50 text-sm mt-1">Applied on {selectedApplicant.appliedDate}</p>
            </div>

            {/* Applied Roles */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white/80 mb-3">Applied Roles</h3>
              <div className="flex flex-wrap gap-2">
                {selectedApplicant.appliedRoles.map((role, idx) => (
                  <span
                    key={idx}
                    className="px-5 py-3 bg-purple-500/20 text-purple-200 rounded-full text-sm border border-purple-400/30 font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Technical Skills */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white/80 mb-3">Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedApplicant.technicalSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-blue-500/20 text-blue-200 rounded-full text-sm border border-blue-400/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white/80 mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {selectedApplicant.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-purple-500/20 text-purple-200 rounded-full text-sm border border-purple-400/30"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white/80 mb-3">About</h3>
              <p className="text-white/70 text-base leading-relaxed">{selectedApplicant.bio}</p>
            </div>

            {/* Action Buttons */}
            {selectedApplicant.status === "Pending" && (
              <div className="flex gap-4">
                <button
                  onClick={() => handleAcceptApplication(selectedApplicant.id)}
                  className="flex-1 px-8 py-5 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 text-green-300 rounded-[30px] font-bold text-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Check className="w-6 h-6" strokeWidth={2} />
                  <span>Accept Application</span>
                </button>
                <button
                  onClick={() => handleRejectApplication(selectedApplicant.id)}
                  className="flex-1 px-8 py-5 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 rounded-[30px] font-bold text-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <X className="w-6 h-6" strokeWidth={2} />
                  <span>Reject Application</span>
                </button>
              </div>
            )}

            {selectedApplicant.status === "Accepted" && (
              <div className="p-6 bg-green-500/20 rounded-[30px] border border-green-400/30 text-center">
                <p className="text-green-200 font-semibold text-lg">✓ Application Accepted</p>
              </div>
            )}

            {selectedApplicant.status === "Rejected" && (
              <div className="p-6 bg-red-500/20 rounded-[30px] border border-red-400/30 text-center">
                <p className="text-red-200 font-semibold text-lg">✗ Application Rejected</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 animate-slideInFromRight">
          <div className="bg-blue-500/90 backdrop-blur-xl rounded-[30px] border border-blue-400/50 px-8 py-5 shadow-2xl flex items-center space-x-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white font-bold text-lg">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
