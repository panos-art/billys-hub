"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UsersTab } from "./users-tab";
import { DepartmentsTab } from "./departments-tab";
import { HolidaysTab } from "./holidays-tab";
import { AuditLogTab } from "./audit-log-tab";

export function AdminTabs({ userRole }: { userRole: string }) {
  return (
    <Tabs defaultValue="users">
      <TabsList className="flex-wrap">
        <TabsTrigger value="users">Χρήστες</TabsTrigger>
        <TabsTrigger value="departments">Τμήματα</TabsTrigger>
        <TabsTrigger value="holidays">Αργίες</TabsTrigger>
        {userRole === "SUPER_ADMIN" && (
          <TabsTrigger value="audit">Αρχείο Ενεργειών</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="users">
        <UsersTab userRole={userRole} />
      </TabsContent>

      <TabsContent value="departments">
        <DepartmentsTab />
      </TabsContent>

      <TabsContent value="holidays">
        <HolidaysTab />
      </TabsContent>

      {userRole === "SUPER_ADMIN" && (
        <TabsContent value="audit">
          <AuditLogTab />
        </TabsContent>
      )}
    </Tabs>
  );
}
