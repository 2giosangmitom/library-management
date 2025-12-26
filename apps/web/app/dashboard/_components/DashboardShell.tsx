'use client';

import {
  BookOutlined,
  CopyOutlined,
  DashboardOutlined,
  LogoutOutlined,
  ShopOutlined,
  SolutionOutlined,
  TagsOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, Space, Tag, Typography, notification } from 'antd';
import type { MenuProps } from 'antd';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/constants';
import { openNotificationWithIcon } from '@/utils/notification';
import type { CurrentUser } from '@/lib/server-auth';

const { Header, Content, Sider } = Layout;
const { Title, Paragraph, Text } = Typography;

type NavItem = {
  key: string;
  label: string;
  href?: string;
  icon: ReactNode;
  roles?: ('ADMIN' | 'LIBRARIAN' | 'MEMBER')[];
};

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: <DashboardOutlined /> },
  { key: 'books', label: 'Books', href: '/dashboard/books', icon: <BookOutlined />, roles: ['ADMIN', 'LIBRARIAN'] },
  {
    key: 'book-copies',
    label: 'Book Copies',
    href: '/dashboard/book-copies',
    icon: <CopyOutlined />,
    roles: ['ADMIN', 'LIBRARIAN']
  },
  {
    key: 'authors',
    label: 'Authors',
    href: '/dashboard/authors',
    icon: <TeamOutlined />,
    roles: ['ADMIN', 'LIBRARIAN']
  },
  {
    key: 'publishers',
    label: 'Publishers',
    href: '/dashboard/publishers',
    icon: <ShopOutlined />,
    roles: ['ADMIN', 'LIBRARIAN']
  },
  { key: 'loan', label: 'Loan', href: '/dashboard/loan', icon: <SolutionOutlined />, roles: ['ADMIN', 'LIBRARIAN'] },
  {
    key: 'categories',
    label: 'Categories',
    href: '/dashboard/categories',
    icon: <TagsOutlined />,
    roles: ['ADMIN', 'LIBRARIAN']
  },
  { key: 'users', label: 'Users', href: '/dashboard/users', icon: <TeamOutlined />, roles: ['ADMIN'] }
];

function getRoleMeta(role: CurrentUser['role']) {
  if (role === 'ADMIN') {
    return { label: 'Admin', color: 'geekblue' as const };
  }

  if (role === 'LIBRARIAN') {
    return { label: 'Staff', color: 'green' as const };
  }

  return { label: 'Member', color: 'default' as const };
}

export default function DashboardShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const selectedKey = useMemo(() => {
    // Sort navItems by href length (longest first) for more specific matching
    const sortedByHref = [...navItems].sort((a, b) => {
      const aLen = a.href?.length ?? 0;
      const bLen = b.href?.length ?? 0;
      return bLen - aLen;
    });

    const active = sortedByHref.find((item) => item.href && pathname.startsWith(item.href));
    return active?.key ?? 'dashboard';
  }, [pathname]);

  const handleMenuClick: MenuProps['onClick'] = (event) => {
    const target = navItems.find((item) => item.key === event.key);

    if (target?.href) {
      router.push(target.href);
    }
  };

  const handleLogout = async () => {
    if (!API_BASE_URL) {
      openNotificationWithIcon(api, 'error', 'Configuration error', 'API base URL is not configured.');
      return;
    }

    try {
      setSigningOut(true);
      const response = await fetch(`${API_BASE_URL}/auth/signout`, {
        method: 'POST',
        credentials: 'include'
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        openNotificationWithIcon(api, 'error', 'Sign out failed', payload?.message ?? 'Unable to sign out.');
        return;
      }

      openNotificationWithIcon(api, 'success', 'Signed out', payload?.message ?? 'You have been signed out.');
      router.replace('/signin');
      router.refresh();
    } catch (error) {
      openNotificationWithIcon(
        api,
        'error',
        'Sign out failed',
        error instanceof Error ? error.message : 'Unable to sign out.'
      );
    } finally {
      setSigningOut(false);
    }
  };

  const roleMeta = getRoleMeta(user.role);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {contextHolder}
      <Sider
        width={240}
        style={{ background: '#fff', display: 'flex', flexDirection: 'column' }}
        className="shadow-sm"
        breakpoint="lg"
        collapsedWidth={0}>
        <div className="px-4 py-5 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-lg font-semibold">
            BW
          </div>
          <div className="leading-tight">
            <Text strong>BookWise</Text>
            <div className="text-xs text-gray-500">Admin &amp; Staff</div>
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={navItems
            .filter((item) => !item.roles || item.roles.includes(user.role))
            .map((item) => ({
              key: item.key,
              icon: item.icon,
              label: item.label
            }))}
          onClick={handleMenuClick}
          className="border-r-0 flex-1"
        />

        <div className="px-4 py-4 border-t border-gray-100">
          <Button type="default" block icon={<LogoutOutlined />} onClick={handleLogout} loading={signingOut}>
            Logout
          </Button>
        </div>
      </Sider>

      <Layout>
        <Header className="bg-white px-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex flex-col gap-1">
            <Title level={4} className="m-0">
              Dashboard
            </Title>
            <Paragraph type="secondary" className="m-0">
              Welcome back, {user.name}
            </Paragraph>
          </div>
          <Space size="middle" align="center">
            <Tag color={roleMeta.color}>{roleMeta.label}</Tag>
            <Text type="secondary">{user.email}</Text>
          </Space>
        </Header>

        <Content className="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">{children}</Content>
      </Layout>
    </Layout>
  );
}
