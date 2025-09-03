
"use client";

import AppLayoutClient from "../../components/layout/app-layout-client";
import { adminNav } from "../../components/layout/nav-links";

export default function AdminLayout({ children }) {
    return (
        <AppLayoutClient navItems={adminNav}>
            {children}
        </AppLayoutClient>
    );
}
