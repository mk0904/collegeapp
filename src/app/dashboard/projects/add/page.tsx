'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AddProjectPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add a New Project</CardTitle>
          <CardDescription>Fill out the form below to create a new project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input id="name" placeholder="e.g. Annual Science Fair" />
          </div>
          <div className="space-y-2">
              <Label htmlFor="school">School</Label>
               <Select>
                <SelectTrigger id="school">
                    <SelectValue placeholder="Select a school" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="school1">Kohima Science College</SelectItem>
                    <SelectItem value="school2">St. Joseph's College</SelectItem>
                    <SelectItem value="school3">Nagaland University</SelectItem>
                </SelectContent>
                </Select>
          </div>
           <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Provide a brief description of the project." />
            </div>
          <Button>Create Project</Button>
        </CardContent>
      </Card>
    </div>
  )
}
