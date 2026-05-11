"use client";

import * as React from "react";
import axios from "axios";
import {
  Airplay,
  AudioWaveform,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  Command,
  Database,
  FileUser,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  Map,
  Megaphone,
  PieChart,
  Settings2,
  SquareTerminal,
  University,
  UserRoundPlus,
  Users,
} from "lucide-react";
import logo from "@/public/images/logo.png";

import { NavMain } from "@/components/layout/nav-main";
import { NavProjects } from "@/components/layout/nav-projects";
import { NavUser } from "@/components/layout/nav-user";
import { TeamSwitcher } from "@/components/layout/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";

// Static Navigation Data
const navData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [],
    },
    {
      title: "Marketplace Jobs",
      url: "/dashboard/marketplace-jobs",
      icon: BriefcaseBusiness,
      items: [],
    },
    {
      title: "Subscribers",
      url: "/dashboard/subscribed",
      icon: UserRoundPlus,
      items: [],
    },

    {
      title: "Members",
      url: "/dashboard/members",
      icon: Users,
      items: [],
    },
    {
      title: "Departments",
      url: "/dashboard/departments",
      icon: University,
      items: [],
    },
    {
      title: "Database",
      url: "/dashboard/database",
      icon: Database,
      items: [],
    },

    {
      title: "AI Mock Interview",
      url: "/dashboard/mock-interview",
      icon: Airplay,
      items: [],
    },
    {
      title: "Assessments",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Assessments",
          url: "/dashboard/assessment",
          icon: FileUser,
        },
        {
          title: "Question Library",
          url: "/dashboard/assessment/question-library",
          icon: FileUser,
        },
      ],
    },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    //   items: [],
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();

  // State for dynamic user data
  const [user, setUser] = React.useState({
    name: "Loading...",
    email: "loading...",
    avatar: "/avatars/shadcn.jpg", // Default placeholder
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1995';

        const response = await axios.get(`${API_BASE}/api/v1/institute/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.user) {
          const u = response.data.user;
          setUser({
            name: `${u.firstname} ${u.lastname || ''}`.trim(),
            email: u.email,
            avatar: "/avatars/shadcn.jpg",
          });
        }
      } catch (error) {
        console.error("Failed to fetch sidebar user profile", error);
        setUser({
          name: "User",
          email: "Error loading profile",
          avatar: "/avatars/shadcn.jpg"
        });
      }
    };

    fetchProfile();
  }, []);

  return (
    <Sidebar collapsible="icon" {...props} className="border-none z-0">
      <SidebarHeader className="bg-[#071526] text-white pt-4">
        {/* <TeamSwitcher teams={data.teams} /> */}
        <Image
          src={logo}
          alt="Logo"
          className={`${open ? "w-[20%]" : "w-full"} pt-4`}
        />
      </SidebarHeader>
      <SidebarContent className="bg-[#071526] text-white">
        <NavMain items={navData.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter className="bg-[#071526] text-white border-t border-[#9E2339]/30">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}