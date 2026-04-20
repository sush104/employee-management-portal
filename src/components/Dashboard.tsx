import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface DashboardProps {
  manager: string
  onLogout: () => void
}

const STATS = [
  { label: 'Total Employees', value: '124', icon: '👥', change: '+4 this month', variant: 'success' as const },
  { label: 'Departments', value: '8', icon: '🏢', change: 'No change', variant: 'secondary' as const },
  { label: 'Open Positions', value: '6', icon: '📋', change: '+2 this week', variant: 'success' as const },
  { label: 'On Leave Today', value: '3', icon: '🗓️', change: '', variant: 'warning' as const },
]

const RECENT_ACTIVITY = [
  { name: 'Sarah Johnson', action: 'Joined Engineering', time: '2 hours ago' },
  { name: 'Mark Williams', action: 'Promoted to Senior Designer', time: '1 day ago' },
  { name: 'Lisa Chen', action: 'Started leave', time: '1 day ago' },
  { name: 'Tom Garcia', action: 'Completed onboarding', time: '2 days ago' },
  { name: 'Amy Brown', action: 'Transfer to Marketing', time: '3 days ago' },
]

export function Dashboard({ manager, onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar manager={manager} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome banner */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            Welcome back, {manager.split('@')[0]} 👋
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1 text-sm">
            Here's what's happening in your organization today.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                    {stat.label}
                  </CardTitle>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{stat.value}</p>
                {stat.change && (
                  <Badge variant={stat.variant} className="mt-2">
                    {stat.change}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ul>
              {RECENT_ACTIVITY.map((item, index) => (
                <>
                  <li key={item.name} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{item.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{item.name}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.action}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-4 whitespace-nowrap">
                      {item.time}
                    </Badge>
                  </li>
                  {index < RECENT_ACTIVITY.length - 1 && <Separator key={`sep-${item.name}`} />}
                </>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
