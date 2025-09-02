"use client";

import { Button } from "../ui/button";
import { Badge } from "../ui/badge.jsx";
import { BookOpen, LogOut, Menu } from "lucide-react";

export default function Header({ user, onLogout, onMenuClick }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4 md:gap-6">
          <Button
            variant="ghost"
            className="flex items-center space-x-2 md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <a href="#" className="hidden items-center space-x-2 md:flex">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              Classroom Companion
            </span>
          </a>
        </div>

        {/* Right section */}
        {user && (
          <nav className="flex items-center gap-3 sm:gap-4">
            <Badge
              variant="secondary"
              className="capitalize hidden sm:inline-flex"
            >
              {user.role}
            </Badge>
            <span className="text-sm font-medium text-foreground hidden sm:inline-flex">
              {user.name}
            </span>
            <Button
              onClick={onLogout}
              variant="ghost"
              className="flex items-center gap-2 h-8 px-3"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
