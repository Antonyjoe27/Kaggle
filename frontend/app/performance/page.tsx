"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { getAllTeamMembers, evaluateEmployee } from '../lib/api';
import { TeamMemberResponse, PerformanceEvaluationResponse } from '../lib/types';

const competencyColors: Record<string, string> = {
    expert: 'text-purple-600', advanced: 'text-blue-600',
    intermediate: 'text-green-600', beginner: 'text-yellow-600', novice: 'text-red-600',
};

export default function PerformancePage() {
    const [members, setMembers] = useState<TeamMemberResponse[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState<string>('');
    const [result, setResult] = useState<PerformanceEvaluationResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const [form, setForm] = useState({
        courses_completed: '2', total_courses_assigned: '4', average_quiz_score: '85',
        learning_hours: '12', current_streak_days: '3', early_completions: '1',
        tasks_passed: '5', tasks_failed: '1',
        tickets_completed: '8', tickets_assigned: '10',
        skill_gaps: '',
    });

    useEffect(() => {
        getAllTeamMembers().then(({ data }) => { if (data) setMembers(data); });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleEvaluate = async () => {
        if (!selectedMemberId) {
            toast({ title: 'Select a team member first', variant: 'destructive' }); return;
        }
        setLoading(true);
        const skillGaps = form.skill_gaps.split(',').map(s => s.trim()).filter(Boolean);
        const { data, error } = await evaluateEmployee(parseInt(selectedMemberId), {
            learning_data: {
                courses_completed:    parseInt(form.courses_completed),
                total_courses_assigned: parseInt(form.total_courses_assigned),
                average_quiz_score:   parseFloat(form.average_quiz_score),
                learning_hours:       parseFloat(form.learning_hours),
                current_streak_days:  parseInt(form.current_streak_days),
                early_completions:    parseInt(form.early_completions),
            },
            validation_data: {
                tasks_passed: parseInt(form.tasks_passed),
                tasks_failed: parseInt(form.tasks_failed),
            },
            project_data: {
                tickets_completed: parseInt(form.tickets_completed),
                tickets_assigned:  parseInt(form.tickets_assigned),
            },
            skill_gaps: skillGaps.length > 0 ? skillGaps : undefined,
        });
        if (error) toast({ title: 'Evaluation failed', description: error, variant: 'destructive' });
        else if (data) {
            setResult(data);
            toast({ title: 'Evaluation complete!', description: `Competency: ${data.competency_level.toUpperCase()}` });
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Performance Evaluation</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Form */}
                <Card>
                    <CardHeader><CardTitle>Evaluation Input</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label>Team Member</Label>
                            <Select onValueChange={setSelectedMemberId} value={selectedMemberId}>
                                <SelectTrigger><SelectValue placeholder="Select team member" /></SelectTrigger>
                                <SelectContent>
                                    {members.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name} — {m.designation}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Learning</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { name: 'courses_completed', label: 'Completed' },
                                { name: 'total_courses_assigned', label: 'Assigned' },
                                { name: 'average_quiz_score', label: 'Quiz Score %' },
                                { name: 'learning_hours', label: 'Hours' },
                                { name: 'current_streak_days', label: 'Streak Days' },
                                { name: 'early_completions', label: 'Early Finishes' },
                            ].map(f => (
                                <div key={f.name} className="space-y-1">
                                    <Label className="text-xs">{f.label}</Label>
                                    <Input name={f.name} type="number" value={(form as any)[f.name]} onChange={handleChange} />
                                </div>
                            ))}
                        </div>

                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Validation Tasks</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[{ name: 'tasks_passed', label: 'Passed' }, { name: 'tasks_failed', label: 'Failed' }].map(f => (
                                <div key={f.name} className="space-y-1">
                                    <Label className="text-xs">{f.label}</Label>
                                    <Input name={f.name} type="number" value={(form as any)[f.name]} onChange={handleChange} />
                                </div>
                            ))}
                        </div>

                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Project Tickets</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[{ name: 'tickets_completed', label: 'Completed' }, { name: 'tickets_assigned', label: 'Assigned' }].map(f => (
                                <div key={f.name} className="space-y-1">
                                    <Label className="text-xs">{f.label}</Label>
                                    <Input name={f.name} type="number" value={(form as any)[f.name]} onChange={handleChange} />
                                </div>
                            ))}
                        </div>

                        <div className="space-y-1">
                            <Label>Skill Gaps (comma-separated)</Label>
                            <Input name="skill_gaps" value={form.skill_gaps} onChange={handleChange}
                                placeholder="e.g. Kubernetes, System Design" />
                        </div>

                        <Button onClick={handleEvaluate} disabled={loading || !selectedMemberId} className="w-full">
                            {loading ? 'Evaluating with AI...' : 'Run AI Evaluation'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Results */}
                {result && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>Evaluation Results</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">Readiness Score</span>
                                    <span className="text-3xl font-bold">{result.readiness_score}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Competency Level</span>
                                    <span className={`font-bold uppercase text-lg ${competencyColors[result.competency_level] || ''}`}>
                                        {result.competency_level}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Points Earned</span>
                                    <span className="font-bold text-yellow-500">🏆 {result.points_earned} pts</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 italic border-l-4 border-blue-500 pl-3">{result.summary}</p>

                                <div>
                                    <p className="font-semibold text-green-600 mb-1">✓ Strengths</p>
                                    <ul className="list-disc pl-5 text-sm space-y-0.5">
                                        {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <p className="font-semibold text-red-500 mb-1">⚠ Areas to Improve</p>
                                    <ul className="list-disc pl-5 text-sm space-y-0.5">
                                        {result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {result.recommendations.length > 0 && (
                            <Card>
                                <CardHeader><CardTitle>AI Course Recommendations</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    {result.recommendations.map((rec, i) => (
                                        <div key={i} className="border rounded p-3 space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">{rec.title}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase
                                                    ${rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                      'bg-green-100 text-green-700'}`}>
                                                    {rec.priority}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">{rec.skill_category} · {rec.estimated_hours}h · {rec.points_value} pts</p>
                                            <p className="text-sm">{rec.reason}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader><CardTitle>Points Breakdown</CardTitle></CardHeader>
                            <CardContent>
                                <table className="w-full text-sm">
                                    <tbody>
                                        {Object.entries(result.points_breakdown).map(([k, v]) => (
                                            <tr key={k} className="border-b last:border-0">
                                                <td className="py-1">{k}</td>
                                                <td className="py-1 text-right font-mono">{v} pts</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
