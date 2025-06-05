import { cn } from "@comp/ui/cn";

interface AnimatedLayoutProps {
        children: React.ReactNode;
        sidebar: React.ReactNode;
        isCollapsed: boolean;
        blurred?: boolean;
}

export function AnimatedLayout({
        children,
        sidebar,
        isCollapsed,
        blurred,
}: AnimatedLayoutProps) {
        return (
                <div className="flex w-full h-screen overflow-hidden">
                        <div
                                className={cn(
                                        "flex-shrink-0 h-full overflow-y-auto border-r bg-background duration-300 ease-in-out hidden md:block",
                                        isCollapsed ? "w-[80px]" : "w-[240px]",
                                        blurred ? "blur-sm select-none pointer-events-none" : "",
                                )}
                        >
                                {sidebar}
                        </div>
                        <div className="flex-1 overflow-y-auto bg-backgroundSoft">
                                {children}
                        </div>
                </div>
        );
}
