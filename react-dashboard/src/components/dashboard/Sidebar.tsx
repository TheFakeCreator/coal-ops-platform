"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Pickaxe,
  Truck,
  BarChart3,
  Users,
  ChevronLeft,
  ChevronRight,
  Gem,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ============================================================
// Sidebar — Dashboard Navigation
// ============================================================

export interface NavSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navSections: NavSection[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "production", label: "Production", icon: <Pickaxe className="h-4 w-4" /> },
  { id: "fleet", label: "Fleet & Logistics", icon: <Truck className="h-4 w-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "people", label: "People", icon: <Users className="h-4 w-4" /> },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 border-r border-border bg-sidebar",
        "select-none"
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <Gem className="h-4 w-4 text-primary" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="overflow-hidden"
          >
            <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
              Coal Ops
            </span>
            <span className="block text-[10px] text-muted-foreground leading-tight">
              Command Center
            </span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Dashboard navigation">
        {navSections.map((section) => {
          const isActive = activeSection === section.id;

          const buttonClasses = cn(
            "w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          );

          if (collapsed) {
            return (
              <Tooltip key={section.id}>
                <TooltipTrigger
                  className={buttonClasses}
                  onClick={() => onSectionChange(section.id)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="flex-shrink-0">{section.icon}</span>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {section.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={buttonClasses}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="flex-shrink-0">{section.icon}</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
                className="truncate"
              >
                {section.label}
              </motion.span>
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-2 py-3 border-t border-border flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
            "text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
