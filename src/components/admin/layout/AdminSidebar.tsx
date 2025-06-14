import { FC } from 'react';
import { Squares2X2Icon, UserGroupIcon, TagIcon, UserCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export const SIDEBAR_ITEMS = [
  { label: "Polls", icon: <Squares2X2Icon className="w-6 h-6" aria-hidden="true" /> },
  { label: "Users", icon: <UserGroupIcon className="w-6 h-6" aria-hidden="true" /> },
  { label: "Categories", icon: <TagIcon className="w-6 h-6" aria-hidden="true" /> },
  { label: "Profile", icon: <UserCircleIcon className="w-6 h-6" aria-hidden="true" /> },
] as const;

export type SidebarSection = (typeof SIDEBAR_ITEMS)[number]["label"];

interface AdminSidebarProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const AdminSidebar: FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange,
  isMinimized,
  onToggleMinimize,
}) => {
  return (
    <aside
      className={cn(
        "h-screen fixed left-0 top-0 z-40 bg-background border-r transition-width duration-300",
        isMinimized ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          {!isMinimized && <h2 className="text-xl font-semibold">Admin</h2>}
          <button
            onClick={onToggleMinimize}
            className="p-2 hover:bg-accent rounded-md"
            aria-label={isMinimized ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isMinimized ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <nav className="flex-1 p-2 space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => onSectionChange(item.label)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-md transition-colors",
                activeSection === item.label
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              {item.icon}
              {!isMinimized && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
