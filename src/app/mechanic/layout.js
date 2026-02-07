'use client';
import { Menubar } from 'primereact/menubar';
import { usePathname } from 'next/navigation';

const MechanicLayout = ({ children }) => {
    const pathname = usePathname();

    // Hide menu for auth pages
    const hideMenuPaths = ['/mechanic/login', '/mechanic/signup', '/mechanic/verify-otp', '/mechanic/forgot-password'];
    const shouldHideMenu = hideMenuPaths.includes(pathname);

    const items = [
        {
            label: 'Home',
            icon: 'pi pi-home',
            url: '/pages/dashboard'
        },
        {
            label: 'Projects',
            icon: 'pi pi-search',
            items: [
                {
                    label: 'Components',
                    icon: 'pi pi-bolt'
                },
                {
                    label: 'Blocks',
                    icon: 'pi pi-server'
                },
                {
                    label: 'UI Kit',
                    icon: 'pi pi-pencil'
                },
                {
                    label: 'Templates',
                    icon: 'pi pi-palette',
                    items: [
                        {
                            label: 'Apollo',
                            icon: 'pi pi-palette'
                        },
                        {
                            label: 'Ultima',
                            icon: 'pi pi-palette'
                        }
                    ]
                }
            ]
        },
        {
            label: 'Contact',
            icon: 'pi pi-envelope'
        }
    ];
    return (
        <div className="page-layout">

            {!shouldHideMenu && <Menubar model={items} />}
            {children}
        </div>
    );
}

export default MechanicLayout;