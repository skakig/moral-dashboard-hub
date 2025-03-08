
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface PrimaryBadgeProps {
  show: boolean;
}

export function PrimaryBadge({ show }: PrimaryBadgeProps) {
  if (!show) return null;
  
  return (
    <div className="absolute top-0 right-0 -mt-2 -mr-2">
      <Badge className="bg-yellow-500">
        <Star className="h-3 w-3 mr-1 fill-current" />
        Primary
      </Badge>
    </div>
  );
}
