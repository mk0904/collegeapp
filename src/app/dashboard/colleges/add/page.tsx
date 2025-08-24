
'use client'

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function AddCollegeRedirectPage() {
    useEffect(() => {
        redirect('/dashboard/projects?tab=colleges');
    }, []);

    return null;
}
