
"use client";

import AppLayoutClient from "../../components/layout/app-layout-client";
import { staffNav } from "../../components/layout/nav-links";

export default function StaffLayout({ children }) {
    return (
        <AppLayoutClient navItems={staffNav}>
            {children}
        </AppLayoutClient>
    );
}
