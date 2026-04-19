import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Candidate {
  id: string;
  name: string;
  position: string;
  matchScore: number;
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

export default function CandidateDetailModal({ candidate, onClose, onStatusChange }: Props) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="grid grid-cols-3 gap-8">
              {/* Main Content */}
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

              {/* Sidebar */}
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
                      candidate.matchScore >= 90 ? 'border-green-500 text-green-500' :
                      candidate.matchScore >= 70 ? 'border-yellow-500 text-yellow-500' :
                      'border-red-500 text-red-500'
                    }`}>
                      {candidate.matchScore}%
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
        </div>

        {/* Footer */}
        <div className="border-t px-8 py-4 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onStatusChange}
            className="text-gray-700 border-gray-300 hover:bg-gray-100"
          >
            Change Status
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Original CV
          </Button>
        </div>
      </div>
    </div>
  );
}
