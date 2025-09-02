
"use client";

import { useState } from "react";
import Header from "./header";
import SidebarNav from "./sidebar-nav";
import { adminNav, staffNav, studentNav } from "./nav-links";

export default function AppLayout({ user, onLogout, onNav, children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const getNavItems = (role) => {
    switch (role) {
      case "admin":
        return adminNav;
      case "staff":
        return staffNav;
      case "student":
        return studentNav;
      default:
        return [];
    }
  };

  const navItems = getNavItems(user.role);
  
  const handleLinkClick = (path) => {
    setMobileNavOpen(false);
    onNav(path);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header 
        user={user} 
        onLogout={onLogout}
        onMenuClick={() => setMobileNavOpen(!mobileNavOpen)} 
      />
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block border-r">
          <SidebarNav items={navItems} onLinkClick={handleLinkClick} />
        </aside>
        {mobileNavOpen && (
          <div className="fixed inset-0 top-14 z-20 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setMobileNavOpen(false)}>
            <div className="fixed inset-0 z-40 w-5/6 max-w-sm bg-background">
               <SidebarNav items={navItems} onLinkClick={handleLinkClick} />
            </div>
          </div>
        )}
        <main className="container flex w-full flex-col overflow-hidden py-6 max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  );
}
