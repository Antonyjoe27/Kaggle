"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { getAllTeamMembers, getProject, autoAssignCourses, assignCourses, listCourses } from '../lib/api';
import { TeamMemberResponse, ProjectResponse, CourseResponse, AutoAssignResponse } from '../lib/types';

export default function AssignLearningPage() {
    const [members, setMembers]       = useState<TeamMemberResponse[]>([]);
    const [projects, setProjects]     = useState<ProjectResponse[]>([]);
    const [courses, setCourses]       = useState<CourseResponse[]>([]);
    const [selectedMember, setSelectedMember] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [autoResult, setAutoResult] = useState<AutoAssignResponse | null>(null);
    const [loading, setLoading]       = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        getAllTeamMembers().then(({ data }) => { if (data) setMembers(data); });
        getProject(1).then(({ data }) => { if (data) setProjects([data]); });
        listCourses().then(({ data }) => { if (data) setCourses(data); });
    }, []);

    const handleAutoAssign = async () => {
        if (!selectedMember || !selectedProject) {
            toast({ title: 'Select a team member and project', variant: 'destructive' }); return;
        }
        setLoading(true);
        const { data, error } = await autoAssignCourses(parseInt(selectedMember), parseInt(selectedProject));
        if (error) toast({ title: 'Auto-assign failed', description: error, variant: 'destructive' });
        else if (data) {
            setAutoResult(data);
            toast({ title: `${data.assigned_courses.length} courses assigned!`, description: data.message });
        }
        setLoading(false);
    };

    const handleManualAssign = async () => {
        if (!selectedMember || selectedCourses.length === 0) {
            toast({ title: 'Select a team member and at least one course', variant: 'destructive' }); return;
        }
        setLoading(true);
        const { data, error } = await assignCourses(parseInt(selectedMember), selectedCourses, 'mid-level');
        if (error) toast({ title: 'Assignment failed', description: error, variant: 'destructive' });
        else toast({ title: `${(data || []).length} courses assigned successfully!` });
        setLoading(false);
    };

    const toggleCourse = (id: string) =>
        setSelectedCourses(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Learning Path Assignment</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Auto Assign */}
                <Card>
                    <CardHeader>
                        <CardTitle>AI Auto-Assign</CardTitle>
                        <p className="text-sm text-gray-500">
                            The AI selects courses based on the employee's experience level and project skill gaps.
                            Freshers get assigned automatically; mid-level and senior require HR approval.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Team Member</label>
                            <Select onValueChange={setSelectedMember} value={selectedMember}>
                                <SelectTrigger><SelectValue placeholder="Select team member" /></SelectTrigger>
                                <SelectContent>
                                    {members.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name} — {m.designation}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project (for skill-gap matching)</label>
                            <Select onValueChange={setSelectedProject} value={selectedProject}>
                                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                                <SelectContent>
                                    {projects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleAutoAssign} disabled={loading} className="w-full">
                            {loading ? 'Assigning with AI...' : 'Auto-Assign Learning Path'}
                        </Button>

                        {autoResult && (
                            <div className="mt-4 space-y-3 border rounded p-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">{autoResult.employee_name}</span>
                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded capitalize">
                                        {autoResult.experience_level}
                                    </span>
                                </div>
                                <p className={`text-sm font-medium ${autoResult.requires_hr_approval ? 'text-yellow-600' : 'text-green-600'}`}>
                                    {autoResult.requires_hr_approval ? '⚠ Requires HR Approval' : '✓ Auto-approved'}
                                </p>
                                <p className="text-sm text-gray-500">{autoResult.message}</p>
                                <ul className="space-y-2">
                                    {autoResult.assigned_courses.map((c, i) => (
                                        <li key={i} className="border rounded p-2 text-sm">
                                            <p className="font-medium">{c.title}</p>
                                            <p className="text-xs text-gray-500">{c.difficulty} · {c.reason}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Manual Assign */}
                <Card>
                    <CardHeader>
                        <CardTitle>Manual Assignment</CardTitle>
                        <p className="text-sm text-gray-500">Hand-pick courses from the catalog and assign directly.</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Team Member</label>
                            <Select onValueChange={setSelectedMember} value={selectedMember}>
                                <SelectTrigger><SelectValue placeholder="Select team member" /></SelectTrigger>
                                <SelectContent>
                                    {members.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name} — {m.designation}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Courses ({selectedCourses.length} selected)</label>
                            {courses.length === 0 ? (
                                <p className="text-sm text-gray-500">No courses in catalog yet. Add some on the Courses page first.</p>
                            ) : (
                                <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                    {courses.map(c => (
                                        <li key={c.id}
                                            onClick={() => toggleCourse(c.id)}
                                            className={`border rounded p-2 cursor-pointer text-sm transition-colors
                                                ${selectedCourses.includes(c.id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:border-gray-400'}`}>
                                            <div className="flex justify-between">
                                                <span className="font-medium">{c.title}</span>
                                                {selectedCourses.includes(c.id) && <span className="text-blue-500">✓</span>}
                                            </div>
                                            <p className="text-xs text-gray-500">{c.category} · {c.difficulty} · {c.duration_hours}h · {c.points} pts</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <Button onClick={handleManualAssign} disabled={loading || selectedCourses.length === 0} className="w-full">
                            {loading ? 'Assigning...' : `Assign ${selectedCourses.length} Course${selectedCourses.length !== 1 ? 's' : ''}`}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
