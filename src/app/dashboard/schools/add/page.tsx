
'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddSchoolPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add a New School</CardTitle>
          <CardDescription>Fill out the form below to register a new school.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
              <Label htmlFor="name">School Name</Label>
              <Input id="name" placeholder="e.g. Kohima Science College" />
          </div>
          <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g. Jotsoma, Kohima" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input id="email" type="email" placeholder="e.g. principal@ksc.ac.in" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input id="phone" placeholder="e.g. +91 98765 43210" />
            </div>
          </div>
          <Button>Add School</Button>
        </CardContent>
      </Card>
    </div>
  )
}
