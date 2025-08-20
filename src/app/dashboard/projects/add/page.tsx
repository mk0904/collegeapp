'use client'

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addProject, getSchools } from "@/lib/firebase/firestore";
import type { School } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function AddProjectPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [schools, setSchools] = React.useState<School[]>([]);
    const [loadingSchools, setLoadingSchools] = React.useState(true);
    
    const [name, setName] = React.useState('');
    const [schoolId, setSchoolId] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        async function fetchSchools() {
            try {
                setLoadingSchools(true);
                const fetchedSchools = await getSchools();
                setSchools(fetchedSchools);
            } catch (error) {
                console.error("Error fetching schools:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch schools for the dropdown.",
                    variant: "destructive"
                });
            } finally {
                setLoadingSchools(false);
            }
        }
        fetchSchools();
    }, [toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !schoolId || !description) {
            toast({
                title: "Error",
                description: "Please fill out all fields.",
                variant: "destructive"
            });
            return;
        }
        setLoading(true);
        try {
            const selectedSchool = schools.find(s => s.id === schoolId);
            if (!selectedSchool) {
                 toast({ title: "Error", description: "Selected school not found.", variant: "destructive" });
                 setLoading(false);
                 return;
            }

            await addProject({
                name,
                description,
                schoolId,
                schoolName: selectedSchool.name,
            });

            toast({
                title: "Success!",
                description: "Project has been added successfully."
            });
            router.push('/dashboard/projects');
        } catch (error) {
            console.error("Error adding project:", error);
            toast({
                title: "Error",
                description: "Failed to add project. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add a New Project</CardTitle>
          <CardDescription>Fill out the form below to create a new project.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input id="name" placeholder="e.g. Annual Science Fair" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="school">School</Label>
                    {loadingSchools ? (
                        <Skeleton className="h-10 w-full" />
                    ) : (
                        <Select onValueChange={setSchoolId} value={schoolId} required>
                            <SelectTrigger id="school">
                                <SelectValue placeholder="Select a school" />
                            </SelectTrigger>
                            <SelectContent>
                                {schools.map(school => (
                                    <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Provide a brief description of the project." value={description} onChange={e => setDescription(e.target.value)} required />
                </div>
                <Button type="submit" disabled={loading || loadingSchools}>{loading ? 'Creating...' : 'Create Project'}</Button>
            </form>
        </CardContent>
      </Card>
    </div>
  )
}
