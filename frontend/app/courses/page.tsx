"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { createCourse, listCourses, deleteCourse } from '../lib/api';
import { CourseResponse } from '../lib/types';

export default function CoursesPage() {
    const [courses, setCourses] = useState<CourseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    const [form, setForm] = useState({
        id: '', title: '', category: '', difficulty: 'Intermediate',
        duration_hours: '', description: '', provider: '', points: '100', course_type: 'skill',
    });

    useEffect(() => {
        listCourses().then(({ data, error }) => {
            if (data) setCourses(data);
            if (error) toast({ title: 'Error loading courses', description: error, variant: 'destructive' });
            setLoading(false);
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async () => {
        if (!form.id || !form.title) {
            toast({ title: 'Course ID and Title are required', variant: 'destructive' });
            return;
        }
        setSubmitting(true);
        const { data, error } = await createCourse({
            ...form,
            duration_hours: parseFloat(form.duration_hours) || 0,
            points: parseInt(form.points) || 100,
        });
        if (error) toast({ title: 'Error creating course', description: error, variant: 'destructive' });
        else if (data) {
            setCourses(prev => [...prev, data]);
            setForm({ id: '', title: '', category: '', difficulty: 'Intermediate',
                      duration_hours: '', description: '', provider: '', points: '100', course_type: 'skill' });
            toast({ title: 'Course created!', description: `"${data.title}" added to catalog.` });
        }
        setSubmitting(false);
    };

    const handleDelete = async (courseId: string) => {
        await deleteCourse(courseId);
        setCourses(prev => prev.filter(c => c.id !== courseId));
        toast({ title: 'Course deleted' });
    };

    const difficultyColors: Record<string, string> = {
        Beginner: 'bg-green-100 text-green-800',
        Intermediate: 'bg-yellow-100 text-yellow-800',
        Advanced: 'bg-red-100 text-red-800',
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Course Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Create Form */}
                <Card>
                    <CardHeader><CardTitle>Add New Course</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { name: 'id', label: 'Course ID *', placeholder: 'e.g. course-101' },
                            { name: 'title', label: 'Title *', placeholder: 'e.g. Advanced Python' },
                            { name: 'category', label: 'Category', placeholder: 'e.g. Backend' },
                            { name: 'description', label: 'Description', placeholder: 'Short description' },
                            { name: 'provider', label: 'Provider', placeholder: 'e.g. Udemy' },
                            { name: 'duration_hours', label: 'Duration (hours)', placeholder: 'e.g. 10' },
                            { name: 'points', label: 'Points', placeholder: '100' },
                        ].map(field => (
                            <div key={field.name} className="space-y-1">
                                <Label htmlFor={field.name}>{field.label}</Label>
                                <Input id={field.name} name={field.name} value={(form as any)[field.name]}
                                    placeholder={field.placeholder} onChange={handleChange} />
                            </div>
                        ))}
                        <div className="space-y-1">
                            <Label>Difficulty</Label>
                            <select name="difficulty" value={form.difficulty} onChange={handleChange}
                                className="w-full border rounded px-3 py-2 text-sm bg-background">
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label>Type</Label>
                            <select name="course_type" value={form.course_type} onChange={handleChange}
                                className="w-full border rounded px-3 py-2 text-sm bg-background">
                                <option value="skill">Skill</option>
                                <option value="mandatory">Mandatory</option>
                            </select>
                        </div>
                        <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                            {submitting ? 'Creating...' : 'Create Course'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Course List */}
                <Card>
                    <CardHeader><CardTitle>Course Catalog ({courses.length})</CardTitle></CardHeader>
                    <CardContent>
                        {loading ? <p>Loading...</p> : courses.length === 0 ? (
                            <p className="text-gray-500">No courses yet. Create your first course.</p>
                        ) : (
                            <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                                {courses.map(c => (
                                    <li key={c.id} className="border rounded p-3 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">{c.title}</p>
                                                <p className="text-xs text-gray-500">{c.id} · {c.provider || 'Internal'} · {c.duration_hours}h · {c.points} pts</p>
                                            </div>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>✕</Button>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {c.category && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{c.category}</span>}
                                            {c.difficulty && <span className={`text-xs px-2 py-0.5 rounded ${difficultyColors[c.difficulty] || 'bg-gray-100'}`}>{c.difficulty}</span>}
                                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded capitalize">{c.course_type}</span>
                                        </div>
                                        {c.description && <p className="text-xs text-gray-500">{c.description}</p>}
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
