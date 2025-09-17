'use client';

import * as React from 'react'
import { PlusCircle, Search, Pencil, MapPin, Mail, Phone, Building2, Users as UsersIcon, FolderKanban as ProjectsIcon } from 'lucide-react'
import { Suspense } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { AddCollegeModal } from '@/components/add-college-modal'
import { updateCollege } from '@/lib/firebase/colleges'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getColleges } from '@/lib/firebase/firestore'
import type { College } from '@/lib/mock-data'

function CollegesContent() {
  const { toast } = useToast()
  const [colleges, setColleges] = React.useState<College[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [isAddCollegeModalOpen, setIsAddCollegeModalOpen] = React.useState(false)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [activeCollege, setActiveCollege] = React.useState<College | null>(null)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      const fetchedColleges = await getColleges()
      setColleges(fetchedColleges)
    } catch (e) {
      console.error(e)
      toast({ title: 'Error', description: 'Failed to fetch colleges', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => { fetchData() }, [fetchData])

  const filtered = React.useMemo(() => {
    const q = searchTerm.toLowerCase()
    return colleges.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.location || '').toLowerCase().includes(q) ||
      (c.district || '').toLowerCase().includes(q)
    )
  }, [colleges, searchTerm])

  return (
    <>
      <AddCollegeModal isOpen={isAddCollegeModalOpen} onOpenChange={setIsAddCollegeModalOpen} onCollegeAdded={fetchData} />
      {/* Details modal: projects & users summary */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {/* Header banner */}
          <div className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground px-6 py-5">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 opacity-90" />
              <h3 className="text-lg font-semibold tracking-tight">{activeCollege?.name || 'College'}</h3>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm/relaxed opacity-95">
              <div className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{activeCollege?.location || '—'}{activeCollege?.district ? `, ${activeCollege?.district}` : ''}</div>
              {activeCollege?.email && (
                <a href={`mailto:${activeCollege.email}`} className="inline-flex items-center gap-1 underline-offset-2 hover:underline">
                  <Mail className="h-4 w-4" />{activeCollege.email}
                </a>
              )}
              {activeCollege?.phone && (
                <a href={`tel:${activeCollege.phone}`} className="inline-flex items-center gap-1 underline-offset-2 hover:underline">
                  <Phone className="h-4 w-4" />{activeCollege.phone}
                </a>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Projects</span>
                    <ProjectsIcon className="h-4 w-4" />
                  </div>
                  <div className="mt-1 text-2xl font-semibold">{activeCollege?.projectsCount ?? 0}</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Users</span>
                    <UsersIcon className="h-4 w-4" />
                  </div>
                  <div className="mt-1 text-2xl font-semibold">{(activeCollege as any)?.usersCount ?? 0}</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Coordinates</div>
                  <div className="mt-1 text-sm">
                    {(activeCollege as any)?.latitude != null && (activeCollege as any)?.longitude != null
                      ? <a target="_blank" rel="noreferrer" className="text-primary hover:underline" href={`https://www.google.com/maps?q=${(activeCollege as any).latitude},${(activeCollege as any).longitude}`}>
                          {(activeCollege as any).latitude}, {(activeCollege as any).longitude}
                        </a>
                      : '—'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardContent className="p-4 text-sm">
                  <div className="grid grid-cols-3 gap-y-2">
                    <div className="text-muted-foreground">Name</div>
                    <div className="col-span-2">{activeCollege?.name || '—'}</div>
                    <div className="text-muted-foreground">District</div>
                    <div className="col-span-2">{activeCollege?.district || '—'}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit modal - full set of fields like creation */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit College</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e)=>{
              e.preventDefault();
              if (!activeCollege) return;
              try {
                await updateCollege(activeCollege.id, {
                  name: activeCollege.name,
                  district: (activeCollege as any).district || '',
                  address: (activeCollege as any).address || '',
                  principalName: (activeCollege as any).principalName || '',
                  principalEmail: (activeCollege as any).principalEmail || '',
                  principalPhone: (activeCollege as any).principalPhone || '',
                  // Additional fields mirrored from AddCollegeModal
                  latitude: (activeCollege as any).latitude,
                  longitude: (activeCollege as any).longitude,
                  email: (activeCollege as any).email,
                  phone: (activeCollege as any).phone,
                })
                toast({ title: 'Saved', description: 'College updated.' })
                setEditOpen(false)
                fetchData()
              } catch (err) {
                console.error(err)
                toast({ title: 'Error', description: 'Failed to update college', variant: 'destructive' })
              }
            }}
            className="space-y-3"
          >
            <div>
              <div className="text-xs text-muted-foreground mb-1">College Name</div>
              <Input value={activeCollege?.name || ''} onChange={(e)=>activeCollege && setActiveCollege({ ...activeCollege, name: e.target.value })} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">District</div>
              <Input value={(activeCollege as any)?.district || ''} onChange={(e)=>activeCollege && setActiveCollege({ ...activeCollege, district: e.target.value } as any)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Latitude</div>
                <Input type="number" value={(activeCollege as any)?.latitude ?? ''} onChange={(e)=>activeCollege && setActiveCollege({ ...activeCollege, latitude: e.target.value === '' ? undefined : Number(e.target.value) } as any)} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Longitude</div>
                <Input type="number" value={(activeCollege as any)?.longitude ?? ''} onChange={(e)=>activeCollege && setActiveCollege({ ...activeCollege, longitude: e.target.value === '' ? undefined : Number(e.target.value) } as any)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Contact Email</div>
                <Input type="email" value={(activeCollege as any)?.email || ''} onChange={(e)=>activeCollege && setActiveCollege({ ...activeCollege, email: e.target.value } as any)} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Contact Phone</div>
                <Input value={(activeCollege as any)?.phone || ''} onChange={(e)=>activeCollege && setActiveCollege({ ...activeCollege, phone: e.target.value } as any)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={()=>setEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Card>
        <CardHeader>
          <CardDescription>Manage registered colleges.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search colleges by name..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={() => setIsAddCollegeModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add College
            </Button>
          </div>

          <div className="rounded-md border">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="h-9 [&>th]:py-2">
                  <TableHead>College Name</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden md:table-cell">District</TableHead>
                  <TableHead className="hidden md:table-cell">Contact Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <TableRow key={i} className="h-9 [&>td]:py-2">
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filtered.map((college) => (
                    <TableRow key={college.id} className="h-9 [&>td]:py-2 cursor-pointer" onClick={()=>{setActiveCollege(college); setDetailOpen(true)}}>
                      <TableCell className="font-medium">{college.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{college.location}</TableCell>
                      <TableCell className="hidden md:table-cell">{college.district || 'N/A'}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <a href={`mailto:${college.email}`} className="hover:underline text-blue-600 dark:text-blue-400">{college.email}</a>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{college.phone}</TableCell>
                      <TableCell><Badge variant="outline">{college.projectsCount}</Badge></TableCell>
                      <TableCell className="text-right" onClick={(e)=>{e.stopPropagation(); setActiveCollege(college); setEditOpen(true)}}>
                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {filtered.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">No colleges found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default function CollegesPage() {
  return (
    <Suspense fallback={<div>Loading colleges...</div>}>
      <CollegesContent />
    </Suspense>
  )
}


