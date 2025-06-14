import { FC, PropsWithChildren } from 'react';
import AdminSidebar, { SidebarSection } from './AdminSidebar';
import { cn } from '@/lib/utils';

interface AdminLayoutProps extends PropsWithChildren {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  adminUsername?: string; // Added adminUsername
}

const AdminLayout: FC<AdminLayoutProps> = ({
  children,
  activeSection,
  onSectionChange,
  isMinimized,
  onToggleMinimize,
  adminUsername, // Added adminUsername
}) => {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        isMinimized={isMinimized}
        onToggleMinimize={onToggleMinimize}
        adminUsername={adminUsername} // Pass to sidebar
      />
      <main
        className={cn(
          "transition-all duration-300 min-h-screen",
          isMinimized ? "ml-16" : "ml-64"
        )}
      >
        <div className="container mx-auto py-8 px-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
