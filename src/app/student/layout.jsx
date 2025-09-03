
"use client";

import AppLayoutClient from "../../components/layout/app-layout-client";
import { studentNav } from "../../components/layout/nav-links";

export default function StudentLayout({ children }) {
    return (
        <AppLayoutClient navItems={studentNav}>
            {children}
        </AppLayoutClient>
    );
}
