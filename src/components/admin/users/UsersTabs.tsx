import React, { FC } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserList } from './UserList';
import { StatusAlert } from '../common/StatusAlert';
import { AdminSession } from '@/types/admin';
import { useUsers } from '@/hooks/admin/useUsers';

interface UsersTabsProps {
  session: AdminSession;
}

const UsersTabs: FC<UsersTabsProps> = ({ session }) => {
  const regularUsersHook = useUsers(session, { includeAdmins: false });
  const adminUsersHook = useUsers(session, { includeAdmins: true });

  return (
    <div className="space-y-6">
      {(regularUsersHook.error || adminUsersHook.error) && (
        <StatusAlert error={regularUsersHook.error || adminUsersHook.error} />
      )}
      {(regularUsersHook.successMessage || adminUsersHook.successMessage) && (
        <StatusAlert success={regularUsersHook.successMessage || adminUsersHook.successMessage} />
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <UserList
            users={regularUsersHook.users}
            total={regularUsersHook.total}
            isLoading={regularUsersHook.isLoading}
            error={regularUsersHook.error}
            page={regularUsersHook.page}
            onPageChange={regularUsersHook.setPage}
            search={regularUsersHook.search}
            onSearchChange={regularUsersHook.setSearch}
            limit={regularUsersHook.limit}
            onBan={async (userId) => {
              await regularUsersHook.banUser(userId);
              adminUsersHook.fetchUsers();
            }}
            onUnban={async (userId) => {
              await regularUsersHook.unbanUser(userId);
              adminUsersHook.fetchUsers();
            }}
            onPromote={async (userId) => {
              await regularUsersHook.promoteUser(userId);
              adminUsersHook.fetchUsers();
            }}
            onDelete={async (userId) => {
              await regularUsersHook.deleteUser(userId);
              adminUsersHook.fetchUsers();
            }}
            onUpdate={async (userId, updates) => {
              await regularUsersHook.updateUser(userId, updates);
              adminUsersHook.fetchUsers();
            }}
            showDemoteButton={false}
            showPromoteButton={true}
          />
        </TabsContent>

        <TabsContent value="admins">
          <UserList
            users={adminUsersHook.users}
            total={adminUsersHook.total}
            isLoading={adminUsersHook.isLoading}
            error={adminUsersHook.error}
            page={adminUsersHook.page}
            onPageChange={adminUsersHook.setPage}
            search={adminUsersHook.search}
            onSearchChange={adminUsersHook.setSearch}
            limit={adminUsersHook.limit}
            onBan={async (userId) => {
              await adminUsersHook.banUser(userId);
              regularUsersHook.fetchUsers();
            }}
            onUnban={async (userId) => {
              await adminUsersHook.unbanUser(userId);
              regularUsersHook.fetchUsers();
            }}
            onDemote={async (userId) => {
              await adminUsersHook.demoteUser(userId);
              regularUsersHook.fetchUsers();
            }}
            onDelete={async (userId) => {
              await adminUsersHook.deleteUser(userId);
              regularUsersHook.fetchUsers();
            }}
            onUpdate={async (userId, updates) => {
              await adminUsersHook.updateUser(userId, updates);
              regularUsersHook.fetchUsers();
            }}
            showPromoteButton={false}
            showDemoteButton={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsersTabs;
