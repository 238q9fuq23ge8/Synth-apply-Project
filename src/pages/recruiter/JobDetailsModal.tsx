import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Job {
  id: string;
  title: string;
  company: string;
  postedDate: string;
  salary: string;
  location: string;
  workType: string;
  description: string;
  requiredSkills: string[];
}

interface Props {
  job: Job;
  onClose: () => void;
  candidateCount: number;
}

export default function JobDetailsModal({ job, onClose, candidateCount }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Job Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Job Title and Company */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 font-bold text-xl">F</span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">{job.title}</h4>
              <p className="text-gray-600">{job.company}</p>
            </div>
          </div>

          {/* Job Meta */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              Remote
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Full-time
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              $80k - $120k
            </span>
          </div>

          {/* Job Description */}
          <div>
            <h5 className="font-semibold text-gray-900 mb-2">Job Description</h5>
            <p className="text-gray-700 leading-relaxed">{job.description}</p>
          </div>

          {/* Required Skills */}
          <div>
            <h5 className="font-semibold text-gray-900 mb-3">Required Skills</h5>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Close
          </Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            Show Candidates [{candidateCount}]
          </Button>
        </div>
      </div>
    </div>
  );
}
