import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext<{
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
            <div className="relative inline-block text-left">
                {children}
            </div>
        </DropdownMenuContext.Provider>
    );
};

const DropdownMenuTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, onClick, asChild, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);
    if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu");

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        context.setIsOpen(!context.isOpen);
        onClick?.(e);
    };

    if (asChild) {
        // Basic slot support: clone the child and add onClick
        const child = React.Children.only(children) as React.ReactElement<any>;
        return React.cloneElement(child, {
            onClick: (e: React.MouseEvent<HTMLElement>) => {
                handleClick(e as any);
                child.props.onClick?.(e);
            },
            ref
        } as any);
    }

    return (
        <button
            ref={ref}
            onClick={handleClick}
            className={className}
            {...props}
        >
            {children}
        </button>
    );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" | "center" }
>(({ className, align = "center", ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);
    if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu");

    if (!context.isOpen) return null;

    const alignClasses = {
        start: "left-0",
        end: "right-0",
        center: "left-1/2 -translate-x-1/2",
    };

    return (
        <div
            ref={ref}
            className={cn(
                "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md bg-white",
                alignClasses[align],
                className
            )}
            {...props}
        />
    );
});
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => {

    if (asChild) {
        // Basic slot support
        const child = React.Children.only(children) as React.ReactElement<any>;
        return React.cloneElement(child, {
            className: cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className,
                child.props.className
            ),
            ref
        } as any);
    }

    return (
        <div
            ref={ref}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-gray-100 cursor-pointer",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuLabel = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "px-2 py-1.5 text-sm font-semibold",
            inset && "pl-8",
            className
        )}
        {...props}
    />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-muted bg-gray-200", className)}
        {...props}
    />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
};
