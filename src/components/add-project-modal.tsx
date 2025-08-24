
'use client'

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addProject, getColleges } from "@/lib/firebase/firestore";
import type { College } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

interface AddProjectModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onProjectAdded: () => void;
}

export function AddProjectModal({ isOpen, onOpenChange, onProjectAdded }: AddProjectModalProps) {
    const { toast } = useToast();

    const [colleges, setColleges] = React.useState<College[]>([]);
    const [loadingColleges, setLoadingColleges] = React.useState(true);
    
    const [name, setName] = React.useState('');
    const [collegeId, setCollegeId] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    
    const resetForm = () => {
        setName('');
        setCollegeId('');
        setDescription('');
    }

    React.useEffect(() => {
        async function fetchColleges() {
            if (!isOpen) return;
            try {
                setLoadingColleges(true);
                const fetchedColleges = await getColleges();
                setColleges(fetchedColleges);
            } catch (error) {
                console.error("Error fetching colleges:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch colleges for the dropdown.",
                    variant: "destructive"
                });
            } finally {
                setLoadingColleges(false);
            }
        }
        fetchColleges();
    }, [isOpen, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !collegeId || !description) {
            toast({
                title: "Error",
                description: "Please fill out all fields.",
                variant: "destructive"
            });
            return;
        }
        setLoading(true);
        try {
            const selectedCollege = colleges.find(s => s.id === collegeId);
            if (!selectedCollege) {
                 toast({ title: "Error", description: "Selected college not found.", variant: "destructive" });
                 setLoading(false);
                 return;
            }

            await addProject({
                name,
                description,
                collegeId,
                collegeName: selectedCollege.name,
            });

            toast({
                title: "Success!",
                description: "Project has been added successfully."
            });
            onProjectAdded();
            onOpenChange(false);
            resetForm();
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Project</DialogTitle>
          <DialogDescription>Fill out the form below to create a new project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" placeholder="e.g. Annual Science Fair" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                {loadingColleges ? (
                    <Skeleton className="h-10 w-full" />
                ) : (
                    <Select onValueChange={setCollegeId} value={collegeId} required>
                        <SelectTrigger id="college">
                            <SelectValue placeholder="Select a college" />
                        </SelectTrigger>
                        <SelectContent>
                            {colleges.map(college => (
                                <SelectItem key={college.id} value={college.id}>{college.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
            <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Provide a brief description of the project." value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading || loadingColleges}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Creating...' : 'Create Project'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
