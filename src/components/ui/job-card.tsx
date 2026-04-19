import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Clock, DollarSign } from "lucide-react";

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  matchPercentage: number;
  postedDate: string;
  salary: string;
  onApply?: () => void;
}

export const JobCard = ({
  title,
  company,
  location,
  salary,
  matchPercentage,
  postedDate,
  onApply,
}: JobCardProps) => {
  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    return "bg-yellow-500";
  };

  return (
    <div className="glass-card p-6 hover:shadow-glass transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              <span>{company}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
            {salary && <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>{salary}</span>
            </div>}
            {/* <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{postedDate}</span>
            </div> */}
          </div>
        </div>
        {/* <Badge className={`${getMatchColor(matchPercentage)} text-white`}>
          {matchPercentage}% Match
        </Badge> */}
      </div>

      <Button onClick={onApply} variant="outline" className=" text w-full">
        View Details
      </Button>
    </div>
  );
};
