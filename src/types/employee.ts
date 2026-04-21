export type Status = 'available' | 'blocked' | 'frozen'

export interface Employee {
  id: number
  name: string
  role: string
  skills: string[]
  experience: string
  team: string
  status: Status
  // Detail fields
  email: string
  phone: string
  location: string
  department: string
  joinedDate: string
  bio: string
}

export const STATUS_CONFIG: Record<Status, { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
  available: { label: 'Available', variant: 'success'   },
  blocked:   { label: 'Blocked',   variant: 'warning'   },
  frozen:    { label: 'Frozen',    variant: 'secondary' },
}

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 1, name: 'Sarah Johnson', role: 'Frontend Engineer', skills: ['React', 'TypeScript', 'Tailwind'],
    experience: '4 years', team: 'Product Team', status: 'available',
    email: 'sarah.johnson@company.com', phone: '+1 555-0101', location: 'New York, USA',
    department: 'Engineering', joinedDate: 'Mar 2021',
    bio: 'Passionate frontend engineer with a strong eye for design. Leads the component library initiative and mentors junior developers.',
  },
  {
    id: 2, name: 'Mark Williams', role: 'Senior Designer', skills: ['Figma', 'UI/UX', 'Prototyping'],
    experience: '6 years', team: 'Design Team', status: 'available',
    email: 'mark.williams@company.com', phone: '+1 555-0102', location: 'San Francisco, USA',
    department: 'Design', joinedDate: 'Jan 2019',
    bio: 'Senior designer focused on user-centred design. Has led redesigns for 3 major product areas and drives the design system.',
  },
  {
    id: 3, name: 'Lisa Chen', role: 'Backend Engineer', skills: ['Node.js', 'PostgreSQL', 'Docker'],
    experience: '5 years', team: 'Infrastructure', status: 'blocked',
    email: 'lisa.chen@company.com', phone: '+1 555-0103', location: 'Austin, USA',
    department: 'Engineering', joinedDate: 'Jun 2020',
    bio: 'Backend specialist with deep expertise in distributed systems and database optimisation. Currently on restricted access.',
  },
  {
    id: 4, name: 'Tom Garcia', role: 'DevOps Engineer', skills: ['AWS', 'Kubernetes', 'CI/CD'],
    experience: '3 years', team: 'Platform Team', status: 'available',
    email: 'tom.garcia@company.com', phone: '+1 555-0104', location: 'Chicago, USA',
    department: 'Platform', joinedDate: 'Sep 2022',
    bio: 'DevOps engineer responsible for cloud infrastructure and deployment pipelines. Reduced deployment time by 60%.',
  },
  {
    id: 5, name: 'Amy Brown', role: 'Product Manager', skills: ['Roadmapping', 'Agile', 'Jira'],
    experience: '7 years', team: 'Marketing Project', status: 'available',
    email: 'amy.brown@company.com', phone: '+1 555-0105', location: 'Boston, USA',
    department: 'Product', joinedDate: 'Apr 2018',
    bio: 'Seasoned PM with a track record of shipping user-loved features. Bridges business goals and technical delivery seamlessly.',
  },
  {
    id: 6, name: 'Jordan Lee', role: 'Data Analyst', skills: ['Python', 'SQL', 'Tableau'],
    experience: '2 years', team: 'Analytics', status: 'frozen',
    email: 'jordan.lee@company.com', phone: '+1 555-0106', location: 'Seattle, USA',
    department: 'Analytics', joinedDate: 'Feb 2023',
    bio: 'Data analyst building dashboards and insights for leadership. Account temporarily frozen pending access review.',
  },
  {
    id: 7, name: 'Chris Davis', role: 'QA Engineer', skills: ['Selenium', 'Jest', 'Cypress'],
    experience: '4 years', team: 'Quality Team', status: 'available',
    email: 'chris.davis@company.com', phone: '+1 555-0107', location: 'Denver, USA',
    department: 'Engineering', joinedDate: 'Nov 2021',
    bio: 'QA engineer ensuring product quality through automated and manual testing. Owns the end-to-end test suite.',
  },
  {
    id: 8, name: 'Emily Turner', role: 'Mobile Developer', skills: ['React Native', 'Swift', 'Kotlin'],
    experience: '5 years', team: 'Mobile Team', status: 'blocked',
    email: 'emily.turner@company.com', phone: '+1 555-0108', location: 'Miami, USA',
    department: 'Engineering', joinedDate: 'Jul 2020',
    bio: 'Mobile developer shipping cross-platform apps for iOS and Android. Access blocked pending security review.',
  },
]

