import { X, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Candidate {
  id: string;
  name: string;
  position: string;
  match_score: number;
  status: string;
  summary?: string;
  experience_details?: any[];
  education?: any[];
  skills?: string[];
}

interface Props {
  candidate: Candidate;
  onClose: () => void;
  onStatusChange: () => void;
}

export default function CandidateDetailFullPage({ candidate, onClose, onStatusChange }: Props) {
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-green-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Shortlisted': return 'bg-purple-500';
      case 'Rejected': return 'bg-red-500';
      case 'Hired': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleStatusChangeClick = () => {
    onStatusChange();
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 flex items-center gap-3 min-w-[300px]">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Status Updated!</div>
              <div className="text-sm text-gray-600">The status has been changed successfully</div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-blue-600">Scope AI</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-xs">📊</span>
                </div>
                <span className="font-medium">Dashboard</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-xs">💼</span>
                </div>
                <span className="font-medium">My Jobs</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs">👥</span>
                </div>
                <span className="font-medium">Candidates</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-xs">📁</span>
                </div>
                <span className="font-medium">Archived Jobs</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-xs">👤</span>
                </div>
                <span className="font-medium">Profile</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-xs">⬆️</span>
                </div>
                <span className="font-medium">Upgrade plan</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-xs">🚪</span>
            </div>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-3xl font-bold text-blue-600">{candidate.name}</h2>
                <p className="text-gray-600 mt-1">Candidate Profile For {candidate.position} Role</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                  G
                </div>
                <div>
                  <div className="font-medium">Google</div>
                  <div className="text-xs">Demo | Free Account</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Main Content - 2 columns */}
            <div className="col-span-2 space-y-6">
              {/* Summary */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Summary</h3>
                <p className="text-gray-700 leading-relaxed">
                  {candidate.summary || 
                    'Dynamic UX Designer with a strong foundation in Software Engineering, leveraging technical expertise to craft user-centric digital experiences. Proven track record in enhancing usability by redesigning key user journeys, leading to significant improvements in user engagement. Passionate about collaborating with cross-functional teams to create impactful, data-driven design solutions that address real user needs.'}
                </p>
              </div>

              {/* Experience */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Experience</h3>
                <div className="space-y-4">
                  {(candidate.experience_details || [
                    {
                      title: 'UX Designer',
                      company: 'Token Masters',
                      period: 'Jan 2021 → Jan 2024',
                    },
                    {
                      title: 'Mid-level UX Designer',
                      company: 'Token Masters',
                      period: 'Jan 2024 → Present',
                    },
                  ]).map((exp, index) => (
                    <div key={index}>
                      <div className="font-semibold text-blue-600">{exp.title}</div>
                      <div className="text-gray-700">
                        {exp.company} • {exp.period}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Education</h3>
                <div className="space-y-3">
                  {(candidate.education || [
                    {
                      degree: "Bachelor's Degree in Interaction Design",
                      university: 'University of Jordan',
                      year: '2018',
                      details: [
                        'Focus on human-centered design, usability, and prototyping',
                        'Capstone project: Redesigned university library app to improve navigation and user engagement',
                      ],
                    },
                  ]).map((edu, index) => (
                    <div key={index}>
                      <div className="font-semibold text-blue-600">{edu.degree}</div>
                      <div className="text-gray-700 mb-2">
                        {edu.university} — {edu.year}
                      </div>
                      {edu.details && (
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {edu.details.map((detail: string, idx: number) => (
                            <li key={idx}>{detail}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Job Title Applied For */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Job Title Applied For</h4>
                <p className="text-blue-600 font-medium">{candidate.position}</p>
              </div>

              {/* Match Score */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Match Score</h4>
                <div className="flex items-center gap-2">
                  <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold ${
                    candidate.match_score >= 90 ? 'border-green-500 text-green-500' :
                    candidate.match_score >= 70 ? 'border-yellow-500 text-yellow-500' :
                    'border-red-500 text-red-500'
                  }`}>
                    {candidate.match_score}%
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Status</h4>
                <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(candidate.status)}`}>
                  {candidate.status}
                </span>
              </div>

              {/* Skills */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {(candidate.skills || ['Communication', 'User Research', 'Interaction Design']).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-200 text-purple-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 right-0 left-64 bg-white border-t border-gray-200 px-8 py-4 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleStatusChangeClick}
            className="text-gray-700 border-gray-300 hover:bg-gray-100 h-10 px-6"
          >
            Change Status
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 h-10 px-6">
            <Download className="w-4 h-4" />
            Download Original CV
          </Button>
        </div>
      </div>
    </div>
  );
}
