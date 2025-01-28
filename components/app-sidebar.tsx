"use client"

import * as React from "react"
import {  Frame,
  GalleryVerticalEnd,
  PieChart,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Admin",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Sınav Sistemi",
      logo: GalleryVerticalEnd,
      plan: "Sınavlar",
    },
  ],
  navMain: [
    {
      title: "Panel",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Testlerim",
          url: "/dashboard"
        },
        {
          title: "Test Ekle",
          url: "/dashboard/test-ekle",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Testlerim",
      url: "/dashboard",
      icon: Frame,
    },
    {
      name: "Test Ekle",
      url: "/dashboard/test-ekle",
      icon: PieChart,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
