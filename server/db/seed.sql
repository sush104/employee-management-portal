INSERT INTO employees (name, role, skills, experience, team, status, email, phone, location, department, joined_date, bio) VALUES
(
  'Sarah Johnson', 'Frontend Engineer',
  ARRAY['React', 'TypeScript', 'Tailwind'],
  '4 years', 'Product Team', 'available',
  'sarah.johnson@company.com', '+1 555-0101', 'New York, USA',
  'Engineering', 'Mar 2021',
  'Passionate frontend engineer with a strong eye for design. Leads the component library initiative and mentors junior developers.'
),
(
  'Mark Williams', 'Senior Designer',
  ARRAY['Figma', 'UI/UX', 'Prototyping'],
  '6 years', 'Design Team', 'available',
  'mark.williams@company.com', '+1 555-0102', 'San Francisco, USA',
  'Design', 'Jan 2019',
  'Senior designer focused on user-centred design. Has led redesigns for 3 major product areas and drives the design system.'
),
(
  'Lisa Chen', 'Backend Engineer',
  ARRAY['Node.js', 'PostgreSQL', 'Docker'],
  '5 years', 'Infrastructure', 'blocked',
  'lisa.chen@company.com', '+1 555-0103', 'Austin, USA',
  'Engineering', 'Jun 2020',
  'Backend specialist with deep expertise in distributed systems and database optimisation. Currently on restricted access.'
),
(
  'Tom Garcia', 'DevOps Engineer',
  ARRAY['AWS', 'Kubernetes', 'CI/CD'],
  '3 years', 'Platform Team', 'available',
  'tom.garcia@company.com', '+1 555-0104', 'Chicago, USA',
  'Platform', 'Sep 2022',
  'DevOps engineer responsible for cloud infrastructure and deployment pipelines. Reduced deployment time by 60%.'
),
(
  'Amy Brown', 'Product Manager',
  ARRAY['Roadmapping', 'Agile', 'Jira'],
  '7 years', 'Marketing Project', 'available',
  'amy.brown@company.com', '+1 555-0105', 'Boston, USA',
  'Product', 'Apr 2018',
  'Seasoned PM with a track record of shipping user-loved features. Bridges business goals and technical delivery seamlessly.'
),
(
  'Jordan Lee', 'Data Analyst',
  ARRAY['Python', 'SQL', 'Tableau'],
  '2 years', 'Analytics', 'frozen',
  'jordan.lee@company.com', '+1 555-0106', 'Seattle, USA',
  'Analytics', 'Feb 2023',
  'Data analyst building dashboards and insights for leadership. Account temporarily frozen pending access review.'
),
(
  'Chris Davis', 'QA Engineer',
  ARRAY['Selenium', 'Jest', 'Cypress'],
  '4 years', 'Quality Team', 'available',
  'chris.davis@company.com', '+1 555-0107', 'Denver, USA',
  'Engineering', 'Nov 2021',
  'QA engineer ensuring product quality through automated and manual testing. Owns the end-to-end test suite.'
),
(
  'Emily Turner', 'Mobile Developer',
  ARRAY['React Native', 'Swift', 'Kotlin'],
  '5 years', 'Mobile Team', 'blocked',
  'emily.turner@company.com', '+1 555-0108', 'Miami, USA',
  'Engineering', 'Jul 2020',
  'Mobile developer shipping cross-platform apps for iOS and Android. Access blocked pending security review.'
)
ON CONFLICT (email) DO NOTHING;
