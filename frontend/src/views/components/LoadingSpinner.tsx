interface Props {
  size?: 'sm' | 'md';
  center?: boolean;
}

export function LoadingSpinner({ size = 'md', center = true }: Props) {
  const spinner = <div className={`spinner${size === 'sm' ? ' spinner-sm' : ''}`} />;
  if (center) return <div className="loading-center">{spinner}</div>;
  return spinner;
}
