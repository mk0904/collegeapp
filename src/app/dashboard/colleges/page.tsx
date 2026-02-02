'use client';

import * as React from 'react'
import { PlusCircle, Search, Pencil, MapPin, Mail, Phone, Building2, Users as UsersIcon, FolderKanban as ProjectsIcon, Clock } from 'lucide-react'
import { Suspense } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
      // Try to get cached data first for instant display
      const cachedColleges = await getColleges()
      setColleges(cachedColleges)
      setLoading(false)
      
      // Fetch fresh data in background
      const fetchedColleges = await getColleges()
      setColleges(fetchedColleges)
    } catch (e) {
      console.error(e)
      toast({ title: 'Error', description: 'Failed to fetch colleges', variant: 'destructive' })
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
        <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          {/* Header banner */}
          <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground px-8 py-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">{activeCollege?.name || 'College'}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm/relaxed opacity-95">
              {activeCollege?.location && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{activeCollege.location}{activeCollege.district ? `, ${activeCollege.district}` : ''}</span>
                </div>
              )}
              {activeCollege?.email && (
                <a href={`mailto:${activeCollege.email}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>{activeCollege.email}</span>
                </a>
              )}
              {activeCollege?.phone && (
                <a href={`tel:${activeCollege.phone}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>{activeCollege.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50/50 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="card-premium rounded-xl border-0 bg-gradient-to-br from-white to-blue-50/30 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Projects</span>
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <ProjectsIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                    {activeCollege?.projectsCount ?? 0}
                  </div>
                </CardContent>
              </Card>
              <Card className="card-premium rounded-xl border-0 bg-gradient-to-br from-white to-purple-50/30 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Users</span>
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <UsersIcon className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                    {(activeCollege as any)?.usersCount ?? 0}
                  </div>
                </CardContent>
              </Card>
              <Card className="card-premium rounded-xl border-0 bg-gradient-to-br from-white to-emerald-50/30 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Coordinates</span>
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {(activeCollege as any)?.latitude != null && (activeCollege as any)?.longitude != null
                      ? <a target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors" href={`https://www.google.com/maps?q=${(activeCollege as any).latitude},${(activeCollege as any).longitude}`}>
                          {(activeCollege as any).latitude}, {(activeCollege as any).longitude}
                        </a>
                      : <span className="text-muted-foreground">—</span>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="card-premium rounded-xl border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg">
                <CardHeader className="pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between py-2 border-b border-border/30">
                      <span className="text-sm font-semibold text-muted-foreground">Name</span>
                      <span className="text-sm font-medium text-right max-w-[60%]">{activeCollege?.name || '—'}</span>
                    </div>
                    <div className="flex items-start justify-between py-2 border-b border-border/30">
                      <span className="text-sm font-semibold text-muted-foreground">Location</span>
                      <span className="text-sm font-medium text-right max-w-[60%]">{activeCollege?.location || '—'}</span>
                    </div>
                    <div className="flex items-start justify-between py-2">
                      <span className="text-sm font-semibold text-muted-foreground">District</span>
                      <span className="text-sm font-medium text-right max-w-[60%]">{activeCollege?.district || '—'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-premium rounded-xl border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg">
                <CardHeader className="pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between py-2 border-b border-border/30">
                      <span className="text-sm font-semibold text-muted-foreground">Email</span>
                      <div className="text-right max-w-[60%]">
                        {activeCollege?.email ? (
                          <a href={`mailto:${activeCollege.email}`} className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors">
                            {activeCollege.email}
                          </a>
                        ) : <span className="text-sm text-muted-foreground">—</span>}
                      </div>
                    </div>
                    <div className="flex items-start justify-between py-2">
                      <span className="text-sm font-semibold text-muted-foreground">Phone</span>
                      <div className="text-right max-w-[60%]">
                        {activeCollege?.phone ? (
                          <a href={`tel:${activeCollege.phone}`} className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors">
                            {activeCollege.phone}
                          </a>
                        ) : <span className="text-sm text-muted-foreground">—</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Geofencing & Timing Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="card-premium rounded-xl border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg">
                <CardHeader className="pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                    </div>
                    Geofencing Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between py-2 border-b border-border/30">
                      <span className="text-sm font-semibold text-muted-foreground">Latitude</span>
                      <span className="text-sm font-medium text-right max-w-[60%]">
                        {(activeCollege as any)?.latitude != null ? (activeCollege as any).latitude : '—'}
                      </span>
                    </div>
                    <div className="flex items-start justify-between py-2 border-b border-border/30">
                      <span className="text-sm font-semibold text-muted-foreground">Longitude</span>
                      <span className="text-sm font-medium text-right max-w-[60%]">
                        {(activeCollege as any)?.longitude != null ? (activeCollege as any).longitude : '—'}
                      </span>
                    </div>
                    <div className="flex items-start justify-between py-2 border-b border-border/30">
                      <span className="text-sm font-semibold text-muted-foreground">Max Distance</span>
                      <span className="text-sm font-medium text-right max-w-[60%]">
                        {(activeCollege as any)?.maxDistance != null 
                          ? `${(activeCollege as any).maxDistance} km` 
                          : '—'}
                      </span>
                    </div>
                    {(activeCollege as any)?.latitude != null && (activeCollege as any)?.longitude != null && (
                      <div className="flex items-start justify-between py-2">
                        <span className="text-sm font-semibold text-muted-foreground">Map</span>
                        <a 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                          href={`https://www.google.com/maps?q=${(activeCollege as any).latitude},${(activeCollege as any).longitude}`}
                        >
                          View on Google Maps →
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-premium rounded-xl border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg">
                <CardHeader className="pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10">
                      <Phone className="h-4 w-4 text-purple-600" />
                    </div>
                    Attendance Timing
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between py-2 border-b border-border/30">
                      <span className="text-sm font-semibold text-muted-foreground">Start Time</span>
                      <span className="text-sm font-medium text-right max-w-[60%]">
                        {(activeCollege as any)?.startTime != null 
                          ? `${String((activeCollege as any).startTime).padStart(2, '0')}:00` 
                          : '—'}
                      </span>
                    </div>
                    <div className="flex items-start justify-between py-2 border-b border-border/30">
                      <span className="text-sm font-semibold text-muted-foreground">End Time</span>
                      <span className="text-sm font-medium text-right max-w-[60%]">
                        {(activeCollege as any)?.endTime != null 
                          ? `${String((activeCollege as any).endTime).padStart(2, '0')}:00` 
                          : '—'}
                      </span>
                    </div>
                    {(activeCollege as any)?.startTime != null && (activeCollege as any)?.endTime != null && (
                      <div className="flex items-start justify-between py-2">
                        <span className="text-sm font-semibold text-muted-foreground">Duration</span>
                        <span className="text-sm font-medium text-right max-w-[60%]">
                          {(() => {
                            const start = (activeCollege as any).startTime;
                            const end = (activeCollege as any).endTime;
                            const duration = end >= start ? end - start : (24 - start + end);
                            return `${duration} hours`;
                          })()}
                        </span>
                      </div>
                    )}
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
                  location: (activeCollege as any).location || '',
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
                  startTime: (activeCollege as any).startTime,
                  endTime: (activeCollege as any).endTime,
                  maxDistance: (activeCollege as any).maxDistance,
                } as Parameters<typeof updateCollege>[1])
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
              <div className="text-xs text-muted-foreground mb-1">Location</div>
              <Input value={(activeCollege as any)?.location || ''} onChange={(e)=>activeCollege && setActiveCollege({ ...activeCollege, location: e.target.value } as any)} />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Start Time (Hour)</div>
                <Input 
                  type="number" 
                  min="0" 
                  max="23" 
                  value={(activeCollege as any)?.startTime ?? ''} 
                  onChange={(e)=>activeCollege && setActiveCollege({ ...activeCollege, startTime: e.target.value === '' ? undefined : parseInt(e.target.value) } as any)} 
                />
                <p className="text-xs text-muted-foreground mt-1">24-hour format (0-23)</p>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">End Time (Hour)</div>
                <Input 
                  type="number" 
                  min="0" 
                  max="23" 
                  value={(activeCollege as any)?.endTime ?? ''} 
                  onChange={(e)=>activeCollege && setActiveCollege({ ...activeCollege, endTime: e.target.value === '' ? undefined : parseInt(e.target.value) } as any)} 
                />
                <p className="text-xs text-muted-foreground mt-1">24-hour format (0-23)</p>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Max Distance (km)</div>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.1"
                  value={(activeCollege as any)?.maxDistance ?? ''} 
                  onChange={(e)=>activeCollege && setActiveCollege({ ...activeCollege, maxDistance: e.target.value === '' ? undefined : parseFloat(e.target.value) } as any)} 
                />
                <p className="text-xs text-muted-foreground mt-1">Maximum geofence distance in kilometers</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={()=>setEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Card className="card-premium rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50">
        <CardHeader className="px-6 pt-6 pb-4">
          <h2 className="text-xl font-bold mb-1">College Management</h2>
          <CardDescription className="text-sm">Manage registered colleges.</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search colleges by name..."
                className="pl-10 w-full h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={() => setIsAddCollegeModalOpen(true)} className="btn-premium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add College
            </Button>
          </div>

          <div className="rounded-xl border border-border/50 bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="h-12 py-3">College Name</TableHead>
                  <TableHead className="hidden md:table-cell h-12 py-3">Location</TableHead>
                  <TableHead className="hidden md:table-cell h-12 py-3">District</TableHead>
                  <TableHead className="hidden md:table-cell h-12 py-3">Contact Email</TableHead>
                  <TableHead className="hidden md:table-cell h-12 py-3">Phone</TableHead>
                  <TableHead className="h-12 py-3">Projects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="py-3"><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell className="hidden md:table-cell py-3"><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell py-3"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell py-3"><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell className="hidden md:table-cell py-3"><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell className="py-3"><Skeleton className="h-5 w-12" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filtered.map((college) => (
                    <TableRow key={college.id} className="cursor-pointer" onClick={()=>{setActiveCollege(college); setDetailOpen(true)}}>
                      <TableCell className="font-medium py-3">{college.name}</TableCell>
                      <TableCell className="hidden md:table-cell py-3">{college.location}</TableCell>
                      <TableCell className="hidden md:table-cell py-3">{college.district || 'N/A'}</TableCell>
                      <TableCell className="hidden md:table-cell py-3">
                        <a href={`mailto:${college.email}`} className="hover:underline text-blue-600 dark:text-blue-400">{college.email}</a>
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-3">{college.phone}</TableCell>
                      <TableCell className="py-3"><Badge variant="outline">{college.projectsCount}</Badge></TableCell>
                    </TableRow>
                  ))
                )}
                {filtered.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">No colleges found.</TableCell>
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


