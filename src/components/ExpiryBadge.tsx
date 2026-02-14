import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface ExpiryBadgeProps {
  expiresAt: string | null;
  className?: string;
}

export function ExpiryBadge({ expiresAt, className }: ExpiryBadgeProps) {
  if (!expiresAt) return null;

  const now = new Date();
  const expiry = new Date(expiresAt);
  const hoursLeft = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursLeft <= 0) {
    return (
      <Badge variant="destructive" className={className}>
        <Clock className="mr-1 h-3 w-3" /> Expired
      </Badge>
    );
  }

  if (hoursLeft <= 24) {
    return (
      <Badge className={`bg-yellow-500 text-white hover:bg-yellow-600 ${className}`}>
        <Clock className="mr-1 h-3 w-3" /> Expiring soon
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={`text-green-700 dark:text-green-400 ${className}`}>
      <Clock className="mr-1 h-3 w-3" /> Fresh
    </Badge>
  );
}

export function getExpiryLabel(expiresAt: string | null): string {
  if (!expiresAt) return "";
  const now = new Date();
  const expiry = new Date(expiresAt);
  const hoursLeft = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursLeft <= 0) return "Expired";
  if (hoursLeft <= 1) return `${Math.round(hoursLeft * 60)}m left`;
  if (hoursLeft <= 24) return `${Math.round(hoursLeft)}h left`;
  return `${Math.round(hoursLeft / 24)}d left`;
}
