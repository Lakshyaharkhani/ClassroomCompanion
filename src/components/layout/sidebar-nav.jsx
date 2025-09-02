"use client";

import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils.js";
import { buttonVariants } from "../ui/button.jsx";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion.jsx";
import { ChevronDown } from "lucide-react";

export default function SidebarNav({ items, onLinkClick }) {
  const pathname = usePathname();

  return (
    <div className="w-full h-full py-6">
      <nav className="grid items-start gap-2 px-4 text-sm font-medium">
        {items.map((item) =>
          item.items ? (
            <Accordion type="single" collapsible key={item.title} className="w-full">
              <AccordionItem value={item.title} className="border-b-0">
                <AccordionTrigger
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "justify-between hover:no-underline"
                  )}
                >
                  <span className="flex items-center gap-2">{item.title}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <div className="flex flex-col space-y-1 ml-7">
                    {item.items.map((subItem) => (
                      <a
                        key={subItem.href}
                        href={subItem.href}
                        onClick={(e) => {
                          e.preventDefault();
                          onLinkClick(subItem.href);
                        }}
                        className={cn(
                          buttonVariants({ variant: "ghost" }),
                          pathname === subItem.href
                            ? "bg-muted hover:bg-muted"
                            : "hover:bg-transparent hover:underline",
                          "justify-start"
                        )}
                      >
                        {subItem.title}
                      </a>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                onLinkClick(item.href);
              }}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === item.href
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start"
              )}
            >
              {item.title}
            </a>
          )
        )}
      </nav>
    </div>
  );
}
