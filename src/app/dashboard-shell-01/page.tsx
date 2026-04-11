import {
  ArrowRightLeft,
  CalendarClock,
  CalendarX2,
  BarChart3,
  PieChart,
  LineChart,
  ClipboardList,
  Clock,
  Crown,
  Facebook,
  Hash,
  Instagram,
  Globe,
  Linkedin,
  Settings,
  Activity,
  AlertTriangle,
  Truck,
  Twitter,
  Undo2,
  Users,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import LanguageDropdown from '@/components/shadcn-studio/blocks/dropdown-language';
import ProductInsightsCard from '@/components/shadcn-studio/blocks/widget-product-insights';
import ProfileDropdown from '@/components/shadcn-studio/blocks/dropdown-profile';
import SalesMetricsCard from '@/components/shadcn-studio/blocks/chart-sales-metrics';
import StatisticsCard from '@/components/shadcn-studio/blocks/statistics-card-01';
import TotalEarningCard from '@/components/shadcn-studio/blocks/widget-total-earning';
import TransactionDatatable, { type Item } from '@/components/shadcn-studio/blocks/datatable-transaction';

const StatisticsCardData = [
  {
    icon: <Truck className="size-4" />,
    value: '42',
    title: 'Shipped Orders',
    changePercentage: '+18.2%',
  },
  {
    icon: <AlertTriangle className="size-4" />,
    value: '8',
    title: 'Damaged Returns',
    changePercentage: '-8.7%',
  },
  {
    icon: <CalendarX2 className="size-4" />,
    value: '27',
    title: 'Missed Delivery Slots',
    changePercentage: '+4.3%',
  },
];

const earningData = [
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/widgets/zipcar.png',
    platform: 'Zipcar',
    technologies: 'Vuejs & HTML',
    earnings: '-$23,569.26',
    progressPercentage: 75,
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/widgets/bitbank.png',
    platform: 'Bitbank',
    technologies: 'Figma & React',
    earnings: '-$12,650.31',
    progressPercentage: 25,
  },
];

const transactionData: Item[] = [
  {
    id: '1',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png',
    avatarFallback: 'JA',
    name: 'Jack Alfredo',
    amount: 316.0,
    status: 'paid',
    email: 'jack@shadcnstudio.com',
    paidBy: 'mastercard',
  },
  {
    id: '2',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png',
    avatarFallback: 'MG',
    name: 'Maria Gonzalez',
    amount: 253.4,
    status: 'pending',
    email: 'maria.g@shadcnstudio.com',
    paidBy: 'visa',
  },
  {
    id: '3',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png',
    avatarFallback: 'JD',
    name: 'John Doe',
    amount: 852.0,
    status: 'paid',
    email: 'john.doe@shadcnstudio.com',
    paidBy: 'mastercard',
  },
  {
    id: '4',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-4.png',
    avatarFallback: 'EC',
    name: 'Emily Carter',
    amount: 889.0,
    status: 'pending',
    email: 'emily.carter@shadcnstudio.com',
    paidBy: 'visa',
  },
  {
    id: '5',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png',
    avatarFallback: 'DL',
    name: 'David Lee',
    amount: 723.16,
    status: 'paid',
    email: 'david.lee@shadcnstudio.com',
    paidBy: 'mastercard',
  },
];

export default function DashboardShell01Page() {
  return (
    <div className="dark min-h-dvh bg-background text-foreground">
      <div className="flex min-h-dvh w-full">
        <SidebarProvider>
          <Sidebar collapsible="none" className="border-sidebar-border min-h-svh shrink-0 border-r">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton render={<a href="#" />}>
                        <BarChart3 />
                        <span>Dashboard</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge className="bg-primary/10 rounded-full">5</SidebarMenuBadge>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel>Pages</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton render={<a href="#" />}>
                        <LineChart />
                        <span>Content Performance</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton render={<a href="#" />}>
                        <Users />
                        <span>Audience Insight</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton render={<a href="#" />}>
                        <PieChart />
                        <span>Engagement Metrics</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton render={<a href="#" />}>
                        <Hash />
                        <span>Hashtag Performance</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge className="bg-primary/10 rounded-full">3</SidebarMenuBadge>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton render={<a href="#" />}>
                        <ArrowRightLeft />
                        <span>Competitor Analysis</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton render={<a href="#" />}>
                        <Clock />
                        <span>Campaign Tracking</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton render={<a href="#" />}>
                        <ClipboardList />
                        <span>Sentiment Tracking</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton render={<a href="#" />}>
                        <Crown />
                        <span>Influencer</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel>Supporting Features</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton render={<a href="#" />}>
                        <Activity />
                        <span>Real Time Monitoring</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton render={<a href="#" />}>
                        <CalendarClock />
                        <span>Schedule Post & Calendar</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton render={<a href="#" />}>
                        <Undo2 />
                        <span>Report & Export</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton render={<a href="#" />}>
                        <Settings />
                        <span>Settings & Integrations</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton render={<a href="#" />}>
                        <Users />
                        <span>User Management</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <div className="bg-background flex min-h-svh min-w-0 flex-1 flex-col">
            <header className="bg-card sticky top-0 z-50 border-b">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="[&_svg]:!size-5" />
                  <Separator orientation="vertical" className="hidden !h-4 sm:block" />
                  <Breadcrumb className="hidden sm:block">
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#">Home</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Free</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <div className="flex items-center gap-1.5">
                  <LanguageDropdown
                    trigger={
                      <Button variant="ghost" size="icon">
                        <Globe />
                      </Button>
                    }
                  />
                  <ProfileDropdown
                    trigger={
                      <Button variant="ghost" size="icon" className="size-9.5">
                        <Avatar className="size-9.5 rounded-md">
                          <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                      </Button>
                    }
                  />
                </div>
              </div>
            </header>
            <main className="mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
                <div className="col-span-full grid gap-6 sm:grid-cols-3 md:max-lg:grid-cols-1">
                  {StatisticsCardData.map((card, index) => (
                    <StatisticsCard
                      key={index}
                      icon={card.icon}
                      title={card.title}
                      value={card.value}
                      changePercentage={card.changePercentage}
                    />
                  ))}
                </div>

                <div className="grid max-xl:col-span-full gap-6 lg:max-xl:grid-cols-2">
                  <ProductInsightsCard className="justify-between gap-3 [&>[data-slot=card-content]]:space-y-5" />

                  <TotalEarningCard
                    title="Total Earning"
                    earning={24650}
                    trend="up"
                    percentage={10}
                    comparisonText="Compare to last year ($84,325)"
                    earningData={earningData}
                    className="justify-between gap-5 sm:min-w-0 [&>[data-slot=card-content]]:space-y-7"
                  />
                </div>

                <SalesMetricsCard className="col-span-full xl:col-span-2 [&>[data-slot=card-content]]:space-y-6" />

                <Card className="col-span-full w-full py-0">
                  <TransactionDatatable data={transactionData} />
                </Card>
              </div>
            </main>
            <footer>
              <div className="text-muted-foreground mx-auto flex size-full max-w-7xl items-center justify-between gap-3 px-4 py-3 max-sm:flex-col sm:gap-6 sm:px-6">
                <p className="max-sm:text-center text-sm text-balance">
                  {`©${new Date().getFullYear()}`}{' '}
                  <a href="#" className="text-primary">
                    shadcn/studio
                  </a>
                  , Made for better web design
                </p>
                <div className="flex items-center gap-5">
                  <a href="#">
                    <Facebook className="size-4" />
                  </a>
                  <a href="#">
                    <Instagram className="size-4" />
                  </a>
                  <a href="#">
                    <Linkedin className="size-4" />
                  </a>
                  <a href="#">
                    <Twitter className="size-4" />
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
