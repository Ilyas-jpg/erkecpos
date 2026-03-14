interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = "📋", title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4 opacity-40">{icon}</span>
      <p className="text-text-secondary font-medium text-sm tracking-wide">{title}</p>
      {description && <p className="text-text-muted text-xs mt-2">{description}</p>}
    </div>
  );
}
