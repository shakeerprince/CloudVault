'use client';
import { Menubar } from 'primereact/menubar';
import { usePathname } from 'next/navigation';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from 'primereact/avatar';
import { Toast } from 'primereact/toast';
import { verifyToken } from '@/lib/jwt';

const MechanicLayout = ({ children }) => {
    const pathname = usePathname();
    const menuRight = useRef(null);
    const toast = useRef(null);
    const router = useRouter();

    // Hide menu for auth pages
    const hideMenuPaths = [
        '/mechanic/login',
        '/mechanic/sign-up',
        '/mechanic/verify-otp',
        '/mechanic/forgot-password',
        '/mechanic/reset-password'
    ];
    const shouldHideMenu = hideMenuPaths.includes(pathname);

    const [providerStatus, setProviderStatus] = useState('PENDING'); // Will be fetched from API

    // Fetch provider status
    useEffect(() => {
        // TODO: Replace with actual API call to get provider status
        // For now using mock data
        const fetchProviderStatus = async () => {
            try {
                const authToken = sessionStorage.getItem('authToken');
                const email = await verifyToken(authToken);
                const response = await fetch(`/api/v1/providers/me?email=${email.username}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        }
                    }
                );
                const data = await response.json();
                if (data.statusCode === "200") {
                    console.log('Provider status fetched:', data.data.status);
                    setProviderStatus(data.data.status);
                } else {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch provider status' });
                }
            } catch (error) {
                console.error('Failed to fetch provider status:', error);
            }
        };

        if (!shouldHideMenu) {
            fetchProviderStatus();
        }
    }, [pathname, shouldHideMenu]);

    const [stats, setStats] = useState({
        pendingJobs: 5,
        completedJobs: 40,
        totalEarnings: 12500,
        activeJobs: 3
    });

    const handleLogout = () => {
        toast.current?.show({
            severity: 'info',
            summary: 'Logged Out',
            detail: 'You have been logged out successfully',
            life: 3000
        });
        setTimeout(() => {
            router.push('/mechanic/login');
        }, 1500);
    };

    // Menubar items
    const menubarStart = (
        <div className="flex items-center gap-3">
            <Avatar icon="pi pi-wrench" size="large" shape="circle" style={{ backgroundColor: '#4F46E5', color: '#ffffff' }} />
            <span className="text-xl font-bold text-gray-900">YMechanics</span>
        </div>
    );

    const menubarItems = [
        {
            label: 'Dashboard',
            icon: 'pi pi-home',
            command: () => router.push('/mechanic/dashboard')
        },
        {
            label: 'Jobs',
            icon: 'pi pi-briefcase',
            items: [
                {
                    label: 'Active Jobs',
                    icon: 'pi pi-clock',
                    badge: stats.activeJobs
                },
                {
                    label: 'Pending Requests',
                    icon: 'pi pi-inbox',
                    badge: stats.pendingJobs
                },
                {
                    label: 'Completed',
                    icon: 'pi pi-check-circle',
                },
                {
                    separator: true
                },
                {
                    label: 'History',
                    icon: 'pi pi-history'
                }
            ]
        },
        {
            label: 'Services',
            icon: 'pi pi-cog'
        },
        {
            label: 'Earnings',
            icon: 'pi pi-dollar'
        }
    ];

    const profileMenuItems = [
        {
            label: 'Profile',
            icon: 'pi pi-user',
            command: () => router.push('/mechanic/profile')
        },
        {
            label: 'Settings',
            icon: 'pi pi-cog',
            command: () => router.push('/mechanic/settings')
        },
        {
            separator: true
        },
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: handleLogout
        }
    ];

    const menubarEnd = (
        <div className="flex items-center gap-3">
            <Button icon="pi pi-bell" rounded text severity="secondary" aria-label="Notifications" badge="3" badgeClassName="p-badge-danger" />
            <Button
                icon="pi pi-user"
                rounded
                text
                severity="secondary"
                aria-label="User"
                onClick={(e) => menuRight.current?.toggle(e)}
            />
            <Menu model={profileMenuItems} popup ref={menuRight} />
        </div>
    );
    return (
        <>
            <Toast ref={toast} />
            <div className="page-layout">
                {!shouldHideMenu && providerStatus === 'APPROVED' && (
                    <Menubar model={menubarItems} start={menubarStart} end={menubarEnd} className="mb-6 shadow-md" />
                )}
                {children}
            </div>
        </>
    );
}

export default MechanicLayout;