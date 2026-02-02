"use client";

import { useState, useEffect, useCallback } from "react";
import { getTeamMembers } from "@/app/actions/team";

export function useTeam() {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getTeamMembers();
            setMembers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    return {
        members,
        loading,
        refreshTeam: fetchMembers
    };
}
