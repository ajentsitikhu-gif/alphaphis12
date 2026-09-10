import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertOctagon,
  UserX,
  LogOut,
  Trash2,
  RefreshCw,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  Calendar,
  Phone,
  Mail,
  Gift,
  Info,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserSubmission, AppRoute, SubmissionStatus } from '../types';
import { getSubmissions, clearAllSubmissions, resetToDemoData, deleteSubmission } from '../utils/storage';

interface DashboardPageProps {
  onNavigate: (route: AppRoute) => void;
}

const formatNepaliDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  return year && month && day ? `${day}/${month}/${year}` : dateString;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { isAuthenticated, isAuthReady, username, logout } = useAuth();
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<UserSubmission | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (selectedSubmission) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedSubmission]);

  // Authentication protection: redirect if not logged in
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthReady) return;

      if (!isAuthenticated) {
        onNavigate('/login');
        return;
      }

      const data = await getSubmissions();
      setSubmissions(data);
    };

    void loadData();
  }, [isAuthenticated, isAuthReady, onNavigate]);

  const handleLogout = () => {
    logout();
    onNavigate('/login');
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all logged submissions?')) {
      const updated = await clearAllSubmissions();
      setSubmissions(updated);
    }
  };

  const handleResetDemoData = async () => {
    const fresh = await resetToDemoData();
    setSubmissions(fresh);
  };

  const handleDeleteItem = async (id: string) => {
    const updated = await deleteSubmission(id);
    setSubmissions(updated);
    if (selectedSubmission?.id === id) {
      setSelectedSubmission(null);
    }
  };

  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Phone', 'DOB', 'Age', 'Prize', 'Status', 'Timestamp', 'Flag Reason'];
    const rows = submissions.map((s, idx) => [
      `#${idx + 1}`,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      `"${formatNepaliDate(s.dob)}"`,
      s.calculatedAge,
      `"${s.prize}"`,
      `"${s.status}"`,
      `"${s.timestamp}"`,
      `"${s.flagReason || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `phishing_simulation_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stat Calculations
  const totalCount = submissions.length;
  const verifiedCount = submissions.filter((s) => s.status === 'Verified').length;
  const underageCount = submissions.filter((s) => s.status === 'Underage').length;

  // Filter & Search Logic
  const filteredSubmissions = submissions.filter((item) => {
    const matchesFilter =
      filterStatus === 'ALL'
        ? true
        : item.status === filterStatus;

    const matchesSearch =
      searchQuery === '' ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery) ||
      item.prize.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Verified
          </span>
        );
      case 'Underage':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            Underage
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="dashboard-page" className="min-h-screen pb-16 bg-neutral-50/60">
      {/* Top Admin Sub-bar */}
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                Recent Winner List
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Live Active
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Congratulations winners! • Celebrate the amazing winners and their fantastic prizes
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="dashboard-new-spin-btn"
              onClick={() => onNavigate('/')}
              className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Simulate New Spin</span>
            </button>

            <button
              id="dashboard-reset-demo-btn"
              onClick={handleResetDemoData}
              className="px-3.5 py-2 rounded-xl bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Reset to default educational dataset"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>

            <button
              id="dashboard-export-btn"
              onClick={handleExportCSV}
              disabled={submissions.length === 0}
              className="px-3.5 py-2 rounded-xl bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              id="dashboard-logout-btn"
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* Stat Cards Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Submissions */}
          <div
            id="stat-card-total"
            className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-neutral-300 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Total Submissions
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-neutral-900">{totalCount}</div>
            <p className="text-xs text-neutral-500 mt-1">
              Participants entered credentials
            </p>
          </div>

          {/* Verified Submissions */}
          <div
            id="stat-card-verified"
            className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-neutral-300 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Verified (Compromised)
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">{verifiedCount}</div>
            <p className="text-xs text-emerald-600/80 mt-1">
              High risk: legitimate student data
            </p>
          </div>

          {/* Underage Submissions */}
          <div
            id="stat-card-underage"
            className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-neutral-300 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                Underage (Age &lt; 13)
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <UserX className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-purple-600">{underageCount}</div>
            <p className="text-xs text-purple-600/80 mt-1">
              Minor privacy & consent violation
            </p>
          </div>
        </div>

        {/* Classification Summary */}
        <div className="p-4 rounded-xl bg-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                Underage Classification Rate: {totalCount > 0 ? Math.round((underageCount / totalCount) * 100) : 0}%
              </h3>
              <p className="text-xs text-neutral-300 mt-0.5">
                Total Underage: <strong>{underageCount}</strong> | Total Verified Targets: <strong>{verifiedCount}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-mono">
              localStorage Persistence Active
            </span>
          </div>
        </div>

        {/* Submissions Table & Controls Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          {/* Filter & Search Bar */}
          <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { label: 'All', value: 'ALL', count: totalCount },
                { label: 'Verified', value: 'Verified', count: verifiedCount },
                { label: 'Underage', value: 'Underage', count: underageCount },
              ].map((tab) => (
                <button
                  key={tab.value}
                  id={`filter-tab-${tab.value.toLowerCase()}`}
                  onClick={() => setFilterStatus(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    filterStatus === tab.value
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input & Clear All */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="dashboard-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search email, phone, prize..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              {submissions.length > 0 && (
                <button
                  id="dashboard-clear-all-btn"
                  onClick={handleClearAll}
                  className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Clear all logs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table id="submissions-table" className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">DOB</th>
                  <th className="py-3.5 px-4">Prize</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Logged Time</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/70">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-neutral-400">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="font-semibold text-neutral-600">No submissions found</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {searchQuery ? 'Try adjusting your search query or filter.' : 'Simulate a spin on the homepage or click Reset Demo Data.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub, index) => (
                    <tr
                      key={sub.id}
                      id={`submission-row-${sub.id}`}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* # (Index) */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-neutral-400">
                        {index + 1}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 font-semibold text-neutral-900">
                        {sub.name}
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-neutral-900">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate max-w-[180px] sm:max-w-[220px]">{sub.email}</span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono text-neutral-700">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{sub.phone}</span>
                        </div>
                      </td>

                      {/* DOB & Age */}
                      <td className="py-3.5 px-4 text-neutral-700">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{formatNepaliDate(sub.dob)}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            sub.calculatedAge < 13 ? 'bg-purple-100 text-purple-800' : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {sub.calculatedAge} yrs
                          </span>
                        </div>
                      </td>

                      {/* Prize */}
                      <td className="py-3.5 px-4 font-bold text-neutral-900">
                        <div className="flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{sub.prize}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(sub.status)}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">
                        {new Date(sub.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`inspect-btn-${sub.id}`}
                            onClick={() => setSelectedSubmission(sub)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                            title="Inspect details"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button
                            id={`delete-btn-${sub.id}`}
                            onClick={() => handleDeleteItem(sub.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="p-4 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Showing {filteredSubmissions.length} of {totalCount} total captured attempts
            </span>
            <span className="text-[11px]">
              Classified by: <strong>Underage (&lt;13)</strong> or <strong>Verified (age 13+)</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Row Detail Inspection Modal */}
      {selectedSubmission && (
        <div
          id="submission-inspect-modal"
          className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-extrabold text-neutral-900">
                  Submission Forensic Inspection
                </h3>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Classification:</span>
                  <span>{getStatusBadge(selectedSubmission.status)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Target Prize:</span>
                  <span className="font-bold text-neutral-900">{selectedSubmission.prize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Captured Name:</span>
                  <span className="font-semibold text-neutral-900">{selectedSubmission.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Captured Email:</span>
                  <span className="font-mono text-neutral-900">{selectedSubmission.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Captured Phone:</span>
                  <span className="font-mono text-neutral-900">{selectedSubmission.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">DOB & Age:</span>
                  <span>{formatNepaliDate(selectedSubmission.dob)} ({selectedSubmission.calculatedAge} years old)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Captured At:</span>
                  <span className="font-mono">{new Date(selectedSubmission.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                <p className="font-bold text-[11px] uppercase tracking-wider mb-1">
                  Educational Evaluation:
                </p>
                <p className="leading-relaxed">
                  {selectedSubmission.flagReason || 'Standard verification criteria applied.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
