import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  onSelect?: () => void;
}

export const PricingCard = ({
  name,
  price,
  features,
  isPopular = false,
  onSelect,
}: PricingCardProps) => {
  return (
    <div
      className={cn(
        "glass-card p-8 relative",
        isPopular && "border-2 border-primary shadow-lg scale-105"
      )}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold gradient-text">{price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm text-foreground/80">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onSelect}
        className={cn(
          "w-full",
          isPopular ? "btn-gradient" : "variant-outline"
        )}
      >
        Get Started
      </Button>
    </div>
  );
};
