import { Link } from "wouter";

interface QuickActionProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export default function QuickAction({ href, icon, label }: QuickActionProps) {
  return (
    <Link href={href}>
      <a className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-all">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </a>
    </Link>
  );
}
