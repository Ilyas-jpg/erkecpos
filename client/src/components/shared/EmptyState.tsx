import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-bg-surface flex items-center justify-center mb-4">
        {icon || <Inbox className="w-7 h-7 text-text-muted" />}
      </div>
      <p className="text-text-secondary font-medium text-[15px]">{title}</p>
      {description && <p className="text-text-muted text-[13px] mt-1">{description}</p>}
    </div>
  );
}
