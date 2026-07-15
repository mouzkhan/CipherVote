import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./components/ToastProvider";
import ChatAssistant from "./components/ChatAssistant";

// Public Pages
import Landing from "./pages/Landing";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import AuditLog from "./pages/AuditLog";
import Pricing from "./pages/Pricing";

// Platform User Pages
import UserDashboard from "./pages/UserDashboard";
import CreateOrganization from "./pages/CreateOrganization";
import OrganizationLogin from "./pages/OrganizationLogin";

// Organization Admin Pages
import OrganizationDashboard from "./pages/OrganizationDashboard";
import ElectionManagement from "./pages/ElectionManagement";
import CreateElectionWizard from "./pages/CreateElectionWizard";
import ElectionDetails from "./pages/ElectionDetails";
import CandidateManagement from "./pages/CandidateManagement";
import VoterManagement from "./pages/VoterManagement";
import ElectionAnalytics from "./pages/ElectionAnalytics";

// Voter Pages (Invitation Link Only)
import ElectionInvitation from "./pages/ElectionInvitation";
import VoterRegistration from "./pages/VoterRegistration";
import VoterLogin from "./pages/VoterLogin";
import VoterBiometric from "./pages/VoterBiometric";
import VoterVote from "./pages/VoterVote";
import VoteConfirmation from "./pages/VoteConfirmation";
import FraudAlert from "./pages/FraudAlert";

import "./App.css";

/**
 * CipherVote VaaS Platform Routes
 * 
 * Three user types:
 * 1. Platform User - Can create organizations
 * 2. Organization Admin - Manages elections (after creating org)
 * 3. Voter - Accesses election via invitation link only
 */

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ChatAssistant />
          <Routes>
            {/* ==================== PUBLIC ROUTES ==================== */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/audit/:electionId" element={<AuditLog />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/org-login" element={<OrganizationLogin />} />

            {/* ==================== PLATFORM USER ROUTES ==================== */}
            {/* After login, user can access dashboard and create organizations */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-organization"
              element={
                <ProtectedRoute>
                  <CreateOrganization />
                </ProtectedRoute>
              }
            />

            {/* ==================== ORGANIZATION ADMIN ROUTES ==================== */}
            {/* Only accessible if user owns an organization */}
            <Route
              path="/org/:orgId/dashboard"
              element={
                <ProtectedRoute requireOrganization>
                  <OrganizationDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/org/:orgId/elections"
              element={
                <ProtectedRoute requireOrganization>
                  <ElectionManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/org/:orgId/elections/create"
              element={
                <ProtectedRoute requireOrganization>
                  <CreateElectionWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/org/:orgId/elections/:electionId"
              element={
                <ProtectedRoute requireOrganization>
                  <ElectionDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/org/:orgId/elections/:electionId/candidates"
              element={
                <ProtectedRoute requireOrganization>
                  <CandidateManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/org/:orgId/elections/:electionId/voters"
              element={
                <ProtectedRoute requireOrganization>
                  <VoterManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/org/:orgId/elections/:electionId/analytics"
              element={
                <ProtectedRoute requireOrganization>
                  <ElectionAnalytics />
                </ProtectedRoute>
              }
            />

            {/* ==================== VOTER ROUTES (Invitation Link Only) ==================== */}
            {/* Voters do NOT need to login - they access via unique election code */}
            <Route path="/election/:code" element={<ElectionInvitation />} />
            <Route path="/election/:code/register" element={<VoterRegistration />} />
            <Route path="/election/:code/login" element={<VoterLogin />} />
            <Route path="/election/:code/biometric" element={<VoterBiometric />} />
            <Route path="/election/:code/vote" element={<VoterVote />} />
            <Route path="/election/:code/confirm" element={<VoteConfirmation />} />
            <Route path="/election/:code/fraud-alert" element={<FraudAlert />} />

            {/* ==================== LEGACY REDIRECTS ==================== */}
            {/* Redirect old routes to new structure */}
            <Route path="/vote" element={<Navigate to="/dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
            <Route path="/biometric-enroll" element={<Navigate to="/dashboard" replace />} />
            <Route path="/platform-dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/voter-portal" element={<Navigate to="/dashboard" replace />} />
            <Route path="/organization-dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/election-workspace" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
