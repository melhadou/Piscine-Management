"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar"
import { useSession, signOut } from "next-auth/react"
import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react"

interface NavUserProps {
	onLinkClick?: () => void
}

export function NavUser({ onLinkClick }: NavUserProps) {
	const { data: session } = useSession()
	const { isMobile } = useSidebar()

	const handleSignOut = async () => {
		await signOut({ callbackUrl: "/login" })
		onLinkClick?.()
	}

	if (!session?.user) {
		return null
	}

	const user = session.user
	const userInitials = user.name
		? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
		: user.email?.[0]?.toUpperCase() || "U"

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={user.image || ""} alt={user.name || ""} />
								<AvatarFallback className="rounded-lg">
									{userInitials}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									{user.name || "User"}
								</span>
								<span className="truncate text-xs">
									{user.email}
								</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={user.image || ""} alt={user.name || ""} />
									<AvatarFallback className="rounded-lg">
										{userInitials}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{user.name || "User"}
									</span>
									<span className="truncate text-xs">
										{user.email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{/* <DropdownMenuItem onClick={onLinkClick}> */}
						{/* 	<User className="mr-2 h-4 w-4" /> */}
						{/* 	Profile */}
						{/* </DropdownMenuItem> */}
						{/* <DropdownMenuItem onClick={onLinkClick}> */}
						{/* 	<Settings className="mr-2 h-4 w-4" /> */}
						{/* 	Settings */}
						{/* </DropdownMenuItem> */}
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleSignOut}>
							<LogOut className="mr-2 h-4 w-4" />
							Sign out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
