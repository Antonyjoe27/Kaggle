"use client";

import { useState, useEffect } from 'react';
import TeamForm from './components/team-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamMemberResponse } from '../lib/types';
import { getAllTeamMembers } from '../lib/api';

export default function TeamAnalysisPage() {
    const [teamMembers, setTeamMembers] = useState<TeamMemberResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeamMembers = async () => {
            const { data, error } = await getAllTeamMembers();
            if (error) {
                setError(error);
            } else if (data) {
                setTeamMembers(data);
            }
            setLoading(false);
        };
        fetchTeamMembers();
    }, []);

    const handleMemberAdded = (newMember: TeamMemberResponse) => {
        setTeamMembers((prev) => [...prev, newMember]);
    };

    const handleMemberAnalyzed = (updatedMember: TeamMemberResponse) => {
        setTeamMembers((prev) => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    };

    if (loading) return <div className="text-center">Loading team members...</div>;
    if (error) return <div className="text-center text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Team Analysis</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Team Member</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TeamForm onMemberAdded={handleMemberAdded} onMemberAnalyzed={handleMemberAnalyzed} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Team Skill Matrix</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {teamMembers.length === 0 ? (
                            <p>No team members added yet.</p>
                        ) : (
                            <ul className="space-y-4">
                                {teamMembers.map((member) => (
                                    <li key={member.id} className="p-3 border rounded">
                                        <h3 className="font-semibold">{member.name} ({member.designation})</h3>
                                        <p className="text-sm text-gray-500">GitHub: {member.github_url}</p>
                                        <p className="mt-1"><strong>Skills:</strong> {member.skill_profile ? Object.entries(member.skill_profile).map(([skill, level]) => `${skill} (L${level})`).join(', ') : 'N/A'}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}