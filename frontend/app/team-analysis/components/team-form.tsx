import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TeamMemberCreate, TeamMemberResponse } from '../../lib/types';
import { addTeamMember, analyzeTeamMemberSkills } from '../../lib/api';
import { useToast } from '@/components/ui/use-toast';

interface TeamFormProps {
    onMemberAdded: (member: TeamMemberResponse) => void;
    onMemberAnalyzed: (member: TeamMemberResponse) => void;
}

const TeamForm: React.FC<TeamFormProps> = ({ onMemberAdded, onMemberAnalyzed }) => {
    const [employeeName, setEmployeeName] = useState('');
    const [designation, setDesignation] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentMemberId, setCurrentMemberId] = useState<number | null>(null);
    const { toast } = useToast();

    const handleAddTeamMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const memberData: TeamMemberCreate = {
            name: employeeName,
            designation,
            github_url: githubUrl || undefined,
        };

        const { data, error } = await addTeamMember(memberData);
        if (error) {
            toast({
                title: "Error adding team member",
                description: error,
                variant: "destructive",
            });
        } else if (data) {
            toast({
                title: "Team member added!",
                description: `"${data.name}" has been added.`,
            });
            onMemberAdded(data);
            setCurrentMemberId(data.id);
            // Clear form
            setEmployeeName('');
            setDesignation('');
            setGithubUrl('');
        }
        setLoading(false);
    };

    const handleAnalyzeTeamMember = async () => {
        if (currentMemberId === null) {
            toast({
                title: "No team member selected",
                description: "Please add a team member first before analyzing.",
                variant: "destructive",
            });
            return;
        }
        setLoading(true);
        const { data, error } = await analyzeTeamMemberSkills(currentMemberId);
        if (error) {
            toast({
                title: "Error analyzing skills",
                description: error,
                variant: "destructive",
            });
        } else if (data) {
            toast({
                title: "Skills analyzed!",
                description: `Skill profile for "${data.name}" generated.`,
            });
            onMemberAnalyzed(data);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleAddTeamMember} className="space-y-4">
            <div><Label htmlFor="employeeName">Employee Name</Label><Input id="employeeName" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} required /></div>
            <div><Label htmlFor="designation">Designation</Label><Input id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} required /></div>
            <div><Label htmlFor="githubUrl">GitHub URL</Label><Input id="githubUrl" type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} required /></div>
            <Button type="submit" disabled={loading}>
                {loading && currentMemberId === null ? 'Adding...' : 'Add Team Member'}
            </Button>
            {currentMemberId && (
                <Button onClick={handleAnalyzeTeamMember} disabled={loading} className="ml-2">
                    {loading && currentMemberId !== null ? 'Analyzing Skills...' : 'Analyze Skills'}
                </Button>
            )}
        </form>
    );
};

export default TeamForm;