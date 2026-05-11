"use client";

import { ChevronDown, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavProjects({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    icon?: LucideIcon;
    items?: {
      name: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const { open } = useSidebar();
  const [clickedProject, setClickedProject] = useState<string | null>(null);

  const normalize = (p: string) =>
    (p || "").split(/[?#]/)[0].replace(/\/+$/, "") || "/";

  function collectUrls(items: any[]): string[] {
    const urls: string[] = [];
    function walk(item: any) {
      if (item.url) urls.push(normalize(item.url));
      if (item.items) item.items.forEach(walk);
    }
    items.forEach(walk);
    return urls;
  }

  function findDeepestMatch(pathname: string, items: any[]) {
    const normPath = normalize(pathname);
    const urls = collectUrls(items);
    const matches = urls.filter(
      (u) => u === normPath || normPath.startsWith(u + "/")
    );
    if (matches.length === 0) return null;
    return matches.reduce((a, b) => (a.length >= b.length ? a : b));
  }

  const deepestMatch = findDeepestMatch(pathname, projects);

  const handleProjectClick = (project: any) => {
    setClickedProject((prev) => (prev === project.name ? null : project.name));
  };

  return (
    <SidebarGroup className={`gap-1 ${open ? "p-0 pr-2" : ""}`}>
      <SidebarGroupLabel className="text-[#9FB3C8]">UPDATES</SidebarGroupLabel>
      <SidebarMenu className="gap-3">
        {projects.map((project) => {
          const hasSubItems =
            Array.isArray(project.items) && project.items.length > 0;
          const isSelected =
            normalize(project.url) === deepestMatch ||
            project.items?.some((sub) => normalize(sub.url) === deepestMatch);

          return (
            <SidebarMenuItem key={project.name}>
              <div className="w-full flex flex-col gap-2 items-start">
                <div className="w-full flex gap-2">
                  {isSelected && open && (
                    <motion.div
                      layoutId="sidebar-active-project"
                      className="w-4 h-full"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    >
                      <div className="w-full h-full bg-[#9E2339] rounded-[10px]" />
                    </motion.div>
                  )}

                  <div
                    className={`w-full ${
                      isSelected
                        ? "bg-transparent backdrop-blur-2xl border-1 border-white/30 rounded-[10px]"
                        : ""
                    }`}
                  >
                    <SidebarMenuButton
                      asChild
                      tooltip={project.name}
                      onClick={() => handleProjectClick(project)}
                      className={`w-full transition-all duration-200 rounded-[10px] ${
                        isSelected
                          ? "bg-[#9E2339]/25 shadow-[inset_0px_0px_15px_4px_rgba(0,_0,_0,_0.2)] py-5 px-4"
                          : ""
                      }`}
                    >
                      <Link href={project.url}>
                        <div className="flex items-center justify-between w-full text-white py-2 cursor-pointer">
                          <div className="flex gap-2 items-center">
                            {project.icon && <project.icon size={16} />}
                            {open && <span>{project.name}</span>}
                          </div>
                          {hasSubItems && (
                            <ChevronDown
                              className={`transition-transform duration-200 ${
                                clickedProject === project.name
                                  ? "rotate-180"
                                  : ""
                              }`}
                              size={20}
                            />
                          )}
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </div>
                </div>

                {hasSubItems && clickedProject === project.name && (
                  <SidebarMenuSub className="mt-0 p-0 relative gap-3 border-l border-[#FFF4CB]/30 pl-3">
                    {project.items?.map((sub) => {
                      const isSubSelected = normalize(sub.url) === deepestMatch;
                      return (
                        <SidebarMenuSubItem key={sub.name}>
                          <SidebarMenuSubButton asChild>
                            <Link
                              href={sub.url}
                              className={`text-white transition-all ${
                                isSubSelected
                                  ? "text-[#FFF4CB] font-medium"
                                  : "hover:text-[#FFF4CB]/70"
                              }`}
                            >
                              {sub.name}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                    <div className="w-1 h-1 rounded-full bg-[#9E2339] absolute bottom-0 left-[-2px]" />
                  </SidebarMenuSub>
                )}
              </div>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
