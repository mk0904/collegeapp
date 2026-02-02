
import { collection, doc, getDoc, getDocs, getFirestore, query, where, updateDoc, limit as queryLimit, addDoc, runTransaction, setDoc } from 'firebase/firestore';
import { app } from '../firebase';
import type { User, College, Project, Submission, Ticket, Notification } from '../mock-data';
import { mockUsers, mockColleges, mockProjects, mockSubmissions, mockTickets } from '../mock-data';
import { getCachedData, setCachedData, invalidateCache } from '../cache';

const db = getFirestore(app);

// Users
export async function getUsers(): Promise<User[]> {
  // Check cache first
  const cached = getCachedData<User[]>('users');
  if (cached) return cached;
  
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  if (userSnapshot.docs.length > 0) {
    const userList = userSnapshot.docs.map(doc => {
      const data = doc.data();
      // Map Firebase data to User type, handling both old and new field formats
      const user: User = {
        id: doc.id,
        uid: doc.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || data.phoneNumber || '',
        phoneNumber: data.phoneNumber || data.phone || '',
        // Handle active field: prefer boolean 'active', fallback to 'status' string
        active: data.active !== undefined ? data.active : (data.status === 'Active'),
        status: data.status || (data.active ? 'Active' : 'Inactive'), // Legacy field
        role: data.role || 'Student',
        createdOn: data.createdOn || '',
        updatedAt: data.updatedAt,
        college: data.college || data.collegeId || '',
        collegeId: data.collegeId || data.college || '',
        district: data.district || '',
        designation: data.designation || '',
        profileCompleted: data.profileCompleted ?? false,
        photoUrl: data.photoUrl || null,
        employmentType: data.employmentType || '',
        payBand: data.payBand || '',
        dateOfAppointment: data.dateOfAppointment || '',
        dateOfBirth: data.dateOfBirth || '',
        dateOfConfirmation: data.dateOfConfirmation || '',
        dateOfRetirement: data.dateOfRetirement || '',
        govtQuarter: data.govtQuarter ?? false,
        faceRegistered: data.faceRegistered ?? false,
        faceRegisteredAt: data.faceRegisteredAt || '',
        // Don't include faceEmbedding in the returned object (too large, read-only)
      };
      return user;
    });
        setCachedData('users', userList);
        return userList;
  }
  const result = mockUsers;
  setCachedData('users', result);
  return result;
}

export async function getUserById(userId: string): Promise<User | null> {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return mockUsers.find(u => u.id === userId) || null;
}

export async function updateUserProfile(userId: string, data: Partial<User>): Promise<void> {
    try {
        const userDoc = doc(db, 'users', userId);
        const userSnap = await getDoc(userDoc);
        
        if (userSnap.exists()) {
            // Update existing document
            await updateDoc(userDoc, data);
        } else {
            // Create new document if it doesn't exist
            await setDoc(userDoc, {
                ...data,
                id: userId,
                uid: userId,
                createdOn: new Date().toISOString(),
                active: false, // New users inactive by default
                status: 'Inactive', // Legacy field
                role: data.role || 'Student',
                profileCompleted: false, // Profile incomplete by default
                faceRegistered: false,
            });
        }
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
}

export async function updateUserStatus(userId: string, status: 'Active' | 'Inactive'): Promise<void> {
    const userDoc = doc(db, 'users', userId);
    // Update both 'active' boolean (primary) and 'status' string (legacy) for compatibility
    const active = status === 'Active';
    await updateDoc(userDoc, { 
        active,
        status // Keep legacy field for backward compatibility
    });
    invalidateCache('users'); // Invalidate cache after update
}

export async function updateUserActive(userId: string, active: boolean): Promise<void> {
    const userDoc = doc(db, 'users', userId);
    // Update both 'active' boolean (primary) and 'status' string (legacy) for compatibility
    await updateDoc(userDoc, { 
        active,
        status: active ? 'Active' : 'Inactive' // Keep legacy field for backward compatibility
    });
}

export async function updateUserProfileCompleted(userId: string, profileCompleted: boolean): Promise<void> {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, { profileCompleted });
}


// Colleges
export async function getColleges(): Promise<College[]> {
  // Check cache first
  const cached = getCachedData<College[]>('colleges');
  if (cached) return cached;
  
  const collegesCol = collection(db, 'colleges');
  const collegeSnapshot = await getDocs(collegesCol);
  if (collegeSnapshot.docs.length > 0) {
    const collegeList = collegeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as College));
    setCachedData('colleges', collegeList);
    return collegeList;
  }
  const result = mockColleges;
  setCachedData('colleges', result);
  return result;
}

export async function addCollege(college: Omit<College, 'id' | 'projectsCount'>) {
    await addDoc(collection(db, 'colleges'), {
        ...college,
        projectsCount: 0,
    });
}

// Projects
export async function getProjects(options: { limit?: number } = {}): Promise<Project[]> {
  const cacheKey = `projects_${options.limit || 'all'}`;
  const cached = getCachedData<Project[]>(cacheKey);
  if (cached) return cached;
  
  const projectsCol = collection(db, 'projects');
  let projectsQuery = query(projectsCol);
  if (options.limit) {
      projectsQuery = query(projectsQuery, queryLimit(options.limit));
  }
  const projectSnapshot = await getDocs(projectsQuery);

  // If no real projects, return mock data
  if (projectSnapshot.empty) {
      const projects = options.limit ? mockProjects.slice(0, options.limit) : mockProjects;
      // Calculate submission counts for mock projects
      projects.forEach(p => {
          p.submissionsCount = mockSubmissions.filter(s => s.projectId === p.id).length;
      });
      setCachedData(cacheKey, projects);
      return projects;
  }

  const projectList = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  
  // Fetch all submissions to calculate counts
  const submissions = await getSubmissions();
  
  setCachedData(cacheKey, projectList);

  // Map submissions to projects
  for (const project of projectList) {
      project.submissionsCount = submissions.filter(s => s.projectId === project.id).length;
  }

  return projectList;
}

export async function getProjectById(id: string): Promise<Project | null> {
    const projectDoc = doc(db, 'projects', id);
    const projectSnapshot = await getDoc(projectDoc);
    if(projectSnapshot.exists()){
        return { id: projectSnapshot.id, ...projectSnapshot.data() } as Project;
    }
    return mockProjects.find(p => p.id === id) || null;
}

export async function addProject(project: Omit<Project, 'id' | 'submissionsCount' | 'status'> & { description: string }) {
    const collegeRef = doc(db, "colleges", project.collegeId);
    
    await runTransaction(db, async (transaction) => {
        const collegeDoc = await transaction.get(collegeRef);
        if (!collegeDoc.exists()) {
            throw "College document does not exist!";
        }

        const newProjectsCount = (collegeDoc.data().projectsCount || 0) + 1;
        transaction.update(collegeRef, { projectsCount: newProjectsCount });

        const projectRef = doc(collection(db, "projects"));
        transaction.set(projectRef, {
            name: project.name,
            collegeId: project.collegeId,
            collegeName: project.collegeName,
            description: project.description,
            submissionsCount: 0,
            status: 'Ongoing',
        });
    });
}

export async function updateProjectStatus(projectId: string, status: 'Completed'): Promise<void> {
    const projectDoc = doc(db, 'projects', projectId);
    await updateDoc(projectDoc, { status });
}


// Submissions
export async function getSubmissions(): Promise<Submission[]> {
  const submissionsCol = collection(db, 'submissions');
  const submissionSnapshot = await getDocs(submissionsCol);
  if (submissionSnapshot.docs.length > 0) {
    const submissionList = submissionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
    return submissionList;
  }
  return mockSubmissions;
}

export async function getSubmissionsByProjectId(projectId: string): Promise<Submission[]> {
  const submissionsCol = collection(db, 'submissions');
  const q = query(submissionsCol, where('projectId', '==', projectId));
  const submissionSnapshot = await getDocs(q);
  if (submissionSnapshot.docs.length > 0) {
    const submissionList = submissionSnapshot.docs.map(doc => {
      const data = doc.data();
      // Map Firebase data structure to Submission type
      // Handle createdAt timestamp conversion
      let timestamp = '';
      if (data.createdAt) {
        if (data.createdAt.toDate) {
          timestamp = data.createdAt.toDate().toISOString();
        } else if (typeof data.createdAt === 'string') {
          timestamp = data.createdAt;
        } else {
          timestamp = new Date(data.createdAt).toISOString();
        }
      }
      
      // Format timestamp for display
      const formattedTimestamp = timestamp 
        ? new Date(timestamp).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '';
      
      return {
        id: doc.id,
        projectId: data.projectId || projectId,
        userName: data.userName || 'Unknown',
        timestamp: formattedTimestamp || data.timestamp || '',
        status: data.status || 'Pending',
        title: data.title || data.projectName || 'Submission',
        description: data.description || data.notes || '',
        images: data.images || [],
        percentage: data.percentage || 0,
        _rawTimestamp: timestamp, // Store raw timestamp for sorting
      } as Submission & { percentage?: number; _rawTimestamp?: string };
    });
    // Sort by timestamp descending (most recent first)
    submissionList.sort((a, b) => {
      const dateA = (a as any)._rawTimestamp ? new Date((a as any)._rawTimestamp).getTime() : 0;
      const dateB = (b as any)._rawTimestamp ? new Date((b as any)._rawTimestamp).getTime() : 0;
      return dateB - dateA;
    });
    // Remove _rawTimestamp before returning, but keep percentage
    return submissionList.map(({ _rawTimestamp, ...submission }) => submission) as Submission[];
  }
  return mockSubmissions.filter(s => s.projectId === projectId);
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
    const submissionDoc = doc(db, 'submissions', id);
    const submissionSnapshot = await getDoc(submissionDoc);
    if(submissionSnapshot.exists()){
        const data = submissionSnapshot.data();
        
        // Handle createdAt timestamp conversion
        let timestamp = '';
        if (data.createdAt) {
          if (data.createdAt.toDate) {
            timestamp = data.createdAt.toDate().toISOString();
          } else if (typeof data.createdAt === 'string') {
            timestamp = data.createdAt;
          } else {
            timestamp = new Date(data.createdAt).toISOString();
          }
        }
        
        // Format timestamp for display
        const formattedTimestamp = timestamp 
          ? new Date(timestamp).toLocaleString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : '';
        
        // Map Firebase data structure to Submission type
        return {
          id: submissionSnapshot.id,
          projectId: data.projectId || '',
          userName: data.userName || 'Unknown',
          timestamp: formattedTimestamp || data.timestamp || '',
          status: data.status || 'Pending',
          title: data.title || data.projectName || 'Submission',
          description: data.description || data.notes || '',
          images: data.images || [],
          // Additional fields from Firebase
          notes: data.notes || '',
          percentage: data.percentage || 0,
          projectName: data.projectName || '',
          userId: data.userId || '',
          createdAt: timestamp || data.createdAt || '',
        } as Submission & { notes?: string; percentage?: number; projectName?: string; userId?: string; createdAt?: string };
    }
    return mockSubmissions.find(s => s.id === id) || null;
}


// Tickets
export async function getTickets(): Promise<Ticket[]> {
  const cached = getCachedData<Ticket[]>('tickets');
  if (cached) return cached;
  
  const ticketsCol = collection(db, 'tickets');
  const ticketSnapshot = await getDocs(ticketsCol);
  if (ticketSnapshot.docs.length > 0) {
    const ticketList = ticketSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
    setCachedData('tickets', ticketList);
    return ticketList;
  }
  const result = mockTickets;
  setCachedData('tickets', result);
  return result;
}

// Fetch support tickets from the `supportTickets` collection and map to the Ticket shape
export async function getSupportTickets(): Promise<Ticket[]> {
  // Fetch support tickets, users, and colleges in parallel
  const [supportSnap, collegesSnap] = await Promise.all([
    getDocs(collection(db, 'supportTickets')),
    getDocs(collection(db, 'colleges'))
  ]);
  
  if (supportSnap.docs.length === 0) {
    return [];
  }

  // Create a map of college ID to college name
  const collegeIdToName: Record<string, string> = {};
  collegesSnap.docs.forEach(doc => {
    const collegeData = doc.data();
    collegeIdToName[doc.id] = collegeData.name || 'Unknown College';
  });

  const toIsoDate = (value: any): string => {
    try {
      if (value?.toDate) {
        // Firestore Timestamp
        return value.toDate().toISOString().slice(0, 10);
      }
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    } catch (_) {}
    return '';
  };

  const tickets: Ticket[] = supportSnap.docs.map((d) => {
    const data: any = d.data();
    return {
      id: d.id,
      subject: typeof data.subject === 'string' && data.subject.trim().length > 0 ? data.subject : (data.message || 'Support request'),
      userName: data.name || data.email || 'User',
      userEmail: data.email || '',
      userId: data.userId || '',
      collegeName: '',
      issueType: 'Support',
      dateRaised: toIsoDate(data.createdAt) || toIsoDate(new Date()),
      dateClosed: null,
      status: data.status === 'Resolved' ? 'Resolved' : 'Open',
      description: data.message || '',
    } as Ticket;
  });

  // Enrich with college name by joining on users collection
  const userIds = tickets.map(t => t.userId).filter(Boolean) as string[];
  const uniqueUserIds = Array.from(new Set(userIds));
  if (uniqueUserIds.length > 0) {
    const usersCol = collection(db, 'users');
    // Firestore doesn't support 'in' for more than 10; for simplicity, fetch individually
    const userDocs = await Promise.all(uniqueUserIds.map(async (uid) => {
      try { const udoc = await getDoc(doc(usersCol, uid)); return udoc.exists() ? { id: uid, ...udoc.data() } as any : null; } catch { return null; }
    }));
    const idToCollegeId: Record<string, string> = {};
    userDocs.forEach(u => { 
      if (u) {
        const collegeId = u.college || u.collegeId || '';
        idToCollegeId[u.id] = collegeId;
      }
    });
    
    // Map college IDs to college names
    tickets.forEach(t => { 
      if (t.userId && idToCollegeId[t.userId]) {
        const collegeId = idToCollegeId[t.userId];
        // Check if collegeId is actually a name (not a long alphanumeric ID)
        const isCollegeIdAnId = collegeId && collegeId.length > 15 && /^[a-zA-Z0-9]+$/.test(collegeId);
        if (isCollegeIdAnId && collegeIdToName[collegeId]) {
          t.collegeName = collegeIdToName[collegeId];
        } else if (!isCollegeIdAnId) {
          t.collegeName = collegeId; // It's already a name
        }
      }
    });
  }

  return tickets;
}

// Attendance
export type FirestoreAttendance = {
  user_id?: string
  userId?: string
  user_name?: string
  userName?: string
  teacher_id?: string
  teacher_name?: string
  college_name?: string
  collegeName?: string
  latitude?: number
  longitude?: number
  timestamp?: string | any
  checkinTime?: string
  checkoutTime?: string
  date?: string
  method?: string
  similarity?: number
  synced?: boolean
  synced_at?: string | any
}

export async function getAttendanceRecords(): Promise<any[]> {
  const colRef = collection(db, 'attendance')
  const snap = await getDocs(colRef)

  // Extract all records - now they should have an events array
  const allRecords = snap.docs.map((d) => {
    const data = d.data() as FirestoreAttendance & { 
      personName?: string
      personId?: string
      type?: string
      confidence?: number
      checkInTime?: string
      checkoutTime?: string
      events?: Array<{type: string, time: string, confidence: number}>
      date?: string
      checkInConfidence?: number
      checkoutConfidence?: number
      autoCheckedOut?: boolean
    }
    
    // Get date from date field or parse from timestamp
    let dateStr = data.date || ''
    let timestamp = ''
    
    // Get events array (new format) or create from old format
    let events: Array<{type: string, time: string, confidence: number, latitude?: number, longitude?: number}> = []
    if (data.events && Array.isArray(data.events)) {
      events = data.events.map((e: any) => ({
        type: e.type || e['type'] || '',
        time: e.time || e['time'] || '',
        confidence: typeof e.confidence === 'number' ? e.confidence : (typeof e['confidence'] === 'number' ? e['confidence'] : 0),
        latitude: typeof e.latitude === 'number' ? e.latitude : (typeof e['latitude'] === 'number' ? e['latitude'] : undefined),
        longitude: typeof e.longitude === 'number' ? e.longitude : (typeof e['longitude'] === 'number' ? e['longitude'] : undefined),
      }))
    } else {
      // Handle backward compatibility
      if (data.checkInTime) {
        events.push({
          type: 'check_in',
          time: data.checkInTime,
          confidence: data.checkInConfidence || 0
        })
      }
      if (data.checkoutTime) {
        events.push({
          type: 'check_out',
          time: data.checkoutTime,
          confidence: data.checkoutConfidence || 0
        })
      }
    }
    
    // Sort events by time
    events.sort((a, b) => {
      try {
        return new Date(a.time).getTime() - new Date(b.time).getTime()
      } catch {
        return 0
      }
    })
    
    if (!dateStr) {
      // Parse from timestamp
      const ts = (data as any).timestamp
      let jsDate: Date
      if (ts && typeof ts === 'object' && 'toDate' in ts) {
        jsDate = (ts as any).toDate() as Date
      } else if (typeof ts === 'string') {
        jsDate = new Date(ts)
      } else {
        jsDate = new Date()
      }
      const isValid = !isNaN(jsDate.getTime())
      dateStr = isValid ? jsDate.toISOString().slice(0, 10) : ''
      timestamp = isValid ? jsDate.toISOString() : ''
    } else {
      // Use first event time as timestamp
      timestamp = events.length > 0 ? events[0].time : data.timestamp || new Date().toISOString()
    }

    // Check multiple possible name fields
    const userName = data.userName || data.user_name || data.personName || data.teacher_name || 'Unknown'
    const userId = data.userId || data.user_id || data.personId || (data as any).employeeId || 'unknown'

    // Extract check-ins and check-outs from events
    const checkInTimes = events.filter(e => e.type === 'check_in').map(e => e.time)
    const checkoutTimes = events.filter(e => e.type === 'check_out').map(e => e.time)

    // Calculate total working hours by pairing check-ins with check-outs
    let workingHours = 0
    let checkInIndex = 0
    let checkoutIndex = 0
    
    while (checkInIndex < checkInTimes.length && checkoutIndex < checkoutTimes.length) {
      try {
        const checkIn = new Date(checkInTimes[checkInIndex]).getTime()
        const checkout = new Date(checkoutTimes[checkoutIndex]).getTime()
        if (!isNaN(checkIn) && !isNaN(checkout) && checkout >= checkIn) {
          workingHours += Math.max(0, (checkout - checkIn) / (1000 * 60 * 60))
          checkInIndex++
          checkoutIndex++
        } else if (checkout < checkIn) {
          // Skip orphaned checkout
          checkoutIndex++
        } else {
          checkInIndex++
        }
      } catch (e) {
        checkInIndex++
        checkoutIndex++
      }
    }

    return {
      id: d.id,
      userName,
      userId,
      date: dateStr,
      timestamp: timestamp,
      checkinTime: checkInTimes.length > 0 ? checkInTimes[0] : undefined, // First check-in for display
      checkoutTime: checkoutTimes.length > 0 ? checkoutTimes[checkoutTimes.length - 1] : undefined, // Last check-out for display
      checkinTimes: checkInTimes, // All check-ins
      checkoutTimes: checkoutTimes, // All check-outs
      events: events, // All events in order
      workingHours,
      college: data.collegeName || data.college_name || '',
      method: data.method || 'Face Recognition',
      similarity: data.similarity ?? data.confidence ?? 0,
      // Get coordinates from last event (most recent) - always use last event's location
      latitude: events.length > 0 ? events[events.length - 1].latitude : undefined,
      longitude: events.length > 0 ? events[events.length - 1].longitude : undefined,
      autoCheckedOut: data.autoCheckedOut || false,
      // Keep original data for reference
      _needsUserNameLookup: userName === 'Unknown' && userId !== 'unknown',
    }
  })

  // Get all unique user IDs for lookup
  const allUserIds = Array.from(new Set(allRecords.map(r => r.userId).filter(id => id !== 'unknown')))
  
  // Fetch user data to get names and college IDs
  const usersCol = collection(db, 'users')
  const userDocs = await Promise.all(
    allUserIds.map(async (uid) => {
      try {
        const udoc = await getDoc(doc(usersCol, uid))
        if (udoc.exists()) {
          const userData = udoc.data()
          return {
            id: uid,
            name: userData.name || userData.userName || 'Unknown',
            collegeId: userData.college || userData.collegeId || '',
          }
        }
        return null
      } catch {
        return null
      }
    })
  )

  // Get all unique college IDs
  const collegeIds = Array.from(new Set(
    userDocs
      .filter(u => u && u.collegeId)
      .map(u => u!.collegeId)
  ))

  // Fetch college names
  const collegesCol = collection(db, 'colleges')
  const collegeDocs = await Promise.all(
    collegeIds.map(async (cid) => {
      try {
        const cdoc = await getDoc(doc(collegesCol, cid))
        if (cdoc.exists()) {
          const collegeData = cdoc.data()
          return {
            id: cid,
            name: collegeData.name || '',
          }
        }
        return null
      } catch {
        return null
      }
    })
  )

  const collegeIdToName: Record<string, string> = {}
  collegeDocs.forEach(c => {
    if (c && c.id) {
      collegeIdToName[c.id] = c.name
    }
  })

  const userIdToUser: Record<string, { name: string; college: string }> = {}
  userDocs.forEach(u => {
    if (u && u.id) {
      const collegeName = u.collegeId ? (collegeIdToName[u.collegeId] || '') : ''
      userIdToUser[u.id] = { name: u.name, college: collegeName }
    }
  })

  // Enrich records with user data
  allRecords.forEach(record => {
    if (userIdToUser[record.userId]) {
      if (record._needsUserNameLookup) {
        record.userName = userIdToUser[record.userId].name
      }
      if (!record.college) {
        record.college = userIdToUser[record.userId].college
      }
    }
  })

  // Remove temporary field and return
  return allRecords
    .map(({ _needsUserNameLookup, ...record }) => record)
    .sort((a, b) => {
      // Sort by date descending, then by timestamp descending
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date)
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
}

export async function updateTicketStatus(ticketId: string, status: 'Resolved', resolutionDate: string): Promise<void> {
    const ticketDoc = doc(db, 'tickets', ticketId);
    await updateDoc(ticketDoc, { status, dateClosed: resolutionDate });
}

// Colleges
// Duplicate definition removed (consolidated above)

// Notifications
export async function addNotification(notification: Omit<Notification, 'id'>): Promise<string> {
    // Initialize invitation responses if it's an invitation
    let notificationData = {
        ...notification,
        createdAt: new Date().toISOString(),
        readBy: [],
    };

    if (notification.type === 'invitation') {
        // Initialize all recipients with pending status
        const responses: { [userId: string]: { status: 'pending' } } = {};
        notification.recipients.forEach(userId => {
            responses[userId] = { status: 'pending' };
        });
        notificationData.responses = responses;
    }

    const notificationRef = await addDoc(collection(db, 'notifications'), notificationData);
    return notificationRef.id;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
    const notificationsCol = collection(db, 'notifications');
    const q = query(notificationsCol, where('recipients', 'array-contains', userId));
    const notificationSnapshot = await getDocs(q);
    if (notificationSnapshot.docs.length > 0) {
        return notificationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    }
    return [];
}

export async function updateInvitationResponse(
    notificationId: string, 
    userId: string, 
    status: 'accepted' | 'declined' | 'maybe',
    message?: string
): Promise<void> {
    const notificationRef = doc(db, 'notifications', notificationId);
    await runTransaction(db, async (transaction) => {
        const notificationDoc = await transaction.get(notificationRef);
        if (notificationDoc.exists()) {
            const data = notificationDoc.data();
            const responses = data.responses || {};
            responses[userId] = {
                status,
                respondedAt: new Date().toISOString(),
                ...(message && { message })
            };
            transaction.update(notificationRef, { responses });
        }
    });
}

export async function getInvitationStats(notificationId: string): Promise<{
    total: number;
    pending: number;
    accepted: number;
    declined: number;
    maybe: number;
}> {
    const notificationDoc = await getDoc(doc(db, 'notifications', notificationId));
    if (!notificationDoc.exists()) {
        throw new Error('Notification not found');
    }
    
    const data = notificationDoc.data();
    const responses = data.responses || {};
    
    const stats = {
        total: Object.keys(responses).length,
        pending: 0,
        accepted: 0,
        declined: 0,
        maybe: 0
    };
    
    type StatusKey = 'pending' | 'accepted' | 'declined' | 'maybe';
    
    Object.values(responses).forEach((response: any) => {
        const status = response?.status as string;
        if (status && (status === 'pending' || status === 'accepted' || status === 'declined' || status === 'maybe')) {
            stats[status as StatusKey]++;
        }
    });
    
    return stats;
}

// Circular functions
export async function addCircular(circular: any): Promise<string> {
    try {
        const circularsCol = collection(db, 'circulars');
        const docRef = await addDoc(circularsCol, {
            ...circular,
            createdAt: new Date()
        });
        
        // Create notifications for each recipient
        const notificationsCol = collection(db, 'notifications');
        const notificationPromises = circular.recipients.map(async (userId: string) => {
            return addDoc(notificationsCol, {
                type: 'circular',
                title: `New Circular: ${circular.title}`,
                message: circular.message.substring(0, 100) + (circular.message.length > 100 ? '...' : ''),
                recipients: [userId],
                sender: 'admin',
                refId: docRef.id,
                createdAt: new Date().toISOString(),
                readBy: []
            });
        });
        
        await Promise.all(notificationPromises);
        
        return docRef.id;
    } catch (error) {
        console.error("Error adding circular:", error);
        throw error;
    }
}

// Enrollment Data functions
export async function getEnrollmentData(): Promise<any[]> {
    try {
        // Fetch both enrollment data and colleges in parallel
        const [enrollmentSnapshot, collegesSnapshot] = await Promise.all([
            getDocs(collection(db, 'enrollmentData')),
            getDocs(collection(db, 'colleges'))
        ]);
        
        // Create a map of college ID to college name
        const collegeIdToName: Record<string, string> = {};
        collegesSnapshot.docs.forEach(doc => {
            const collegeData = doc.data();
            collegeIdToName[doc.id] = collegeData.name || 'Unknown College';
        });
        
        if (enrollmentSnapshot.empty) {
            return [];
        }
        
        const enrollmentList = enrollmentSnapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore Timestamp to Date
            let submittedAt: Date;
            if (data.submittedAt) {
                if (data.submittedAt.toDate) {
                    submittedAt = data.submittedAt.toDate();
                } else if (data.submittedAt.seconds) {
                    submittedAt = new Date(data.submittedAt.seconds * 1000);
                } else {
                    submittedAt = new Date(data.submittedAt);
                }
            } else {
                submittedAt = new Date();
            }
            
            // Get college ID from various possible fields
            // Check if collegeName is actually an ID (long alphanumeric string, typically 20+ chars)
            const storedCollegeName = data.collegeName || '';
            const isCollegeNameAnId = storedCollegeName && storedCollegeName.length > 15 && /^[a-zA-Z0-9]+$/.test(storedCollegeName);
            
            // Determine the actual college ID
            // If collegeName is an ID, use it; otherwise use collegeId or college fields
            const actualCollegeId = isCollegeNameAnId 
                ? storedCollegeName 
                : (data.collegeId || data.college || data.college?.id || '');
            
            // Get college name: 
            // 1. If stored name exists and is NOT an ID, use it
            // 2. Otherwise, lookup by actualCollegeId
            // 3. Try college object name (if it's not an ID)
            // 4. Fallback to Unknown College
            let collegeName = 'Unknown College';
            if (storedCollegeName && !isCollegeNameAnId) {
                collegeName = storedCollegeName;
            } else if (actualCollegeId && collegeIdToName[actualCollegeId]) {
                collegeName = collegeIdToName[actualCollegeId];
            } else if (data.college?.name) {
                const collegeObjName = data.college.name;
                const isCollegeObjNameAnId = collegeObjName && collegeObjName.length > 15 && /^[a-zA-Z0-9]+$/.test(collegeObjName);
                if (!isCollegeObjNameAnId) {
                    collegeName = collegeObjName;
                } else if (collegeIdToName[collegeObjName]) {
                    collegeName = collegeIdToName[collegeObjName];
                }
            }
            
            return {
                id: doc.id,
                collegeName,
                collegeId: actualCollegeId,
                course: data.course || '',
                stream: data.stream || '',
                semester: data.semester || '',
                role: data.role || '',
                status: data.status || 'pending',
                categoryTotals: data.categoryTotals || {
                    general: 0,
                    obc: 0,
                    pwd: 0,
                    sc: 0,
                    st: 0
                },
                totals: data.totals || {
                    totalFemale: 0,
                    totalMale: 0,
                    totalStudents: 0
                },
                submittedAt,
                submittedBy: data.submittedBy || '',
                submittedByName: data.submittedByName || 'Unknown',
                studentData: data.studentData || {}
            };
        });
        
        // Sort by submittedAt descending (most recent first)
        enrollmentList.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
        
        return enrollmentList;
    } catch (error) {
        console.error("Error fetching enrollment data:", error);
        throw error;
    }
}

export async function updateEnrollmentStatus(enrollmentId: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    try {
        const enrollmentDoc = doc(db, 'enrollmentData', enrollmentId);
        await updateDoc(enrollmentDoc, { status });
    } catch (error) {
        console.error("Error updating enrollment status:", error);
        throw error;
    }
}

// Admin Users functions
export async function getAdminUserById(adminUserId: string): Promise<any | null> {
    try {
        const adminUserDoc = doc(db, 'adminusers', adminUserId);
        const adminUserSnap = await getDoc(adminUserDoc);
        if (adminUserSnap.exists()) {
            return { id: adminUserSnap.id, ...adminUserSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching admin user:", error);
        throw error;
    }
}

export async function updateAdminUserProfile(adminUserId: string, data: Partial<any>): Promise<void> {
    try {
        const adminUserDoc = doc(db, 'adminusers', adminUserId);
        await updateDoc(adminUserDoc, {
            ...data,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error("Error updating admin user profile:", error);
        throw error;
    }
}
