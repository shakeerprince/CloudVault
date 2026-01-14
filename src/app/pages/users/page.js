'use client';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { SelectButton } from 'primereact/selectbutton';

import { useState } from 'react';

const UsersPage = () => {
    const [visible, setVisible] = useState(false);
    const [status, setStatus] = useState('Active');
    const [userData, setUserData] = useState({ name: '', username: '', password: '' });
    const users = [
        { id: 1, name: 'John Doe', username: 'johndoe', status: 'Active' },
        { id: 2, name: 'Jane Smith', username: 'janesmith', status: 'Inactive' },
        { id: 3, name: 'Alice Johnson', username: 'alicejohnson', status: 'Active' },
    ];

    const onAddUser = () => {
        setVisible(true);
        setUserData({ name: '', username: '', password: '' });
    }

    const onEditUser = (rowData) => {
        setVisible(true);
        setUserData({ name: rowData.name, username: rowData.username, password: '' });
        setStatus(rowData.status);
    }

    const startContent = <h2 className="text-2xl font-bold">Users</h2>;
    const endContent = (
        <Button label="Add User" onClick={onAddUser} icon="pi pi-plus" className="p-button-success" />
    );

    return (
        <div className="p-8">
            <Toolbar start={startContent} end={endContent} />

            <DataTable value={users} tableStyle={{ minWidth: '50rem' }}>
                <Column field="id" header="ID"></Column>
                <Column field="name" header="Name"></Column>
                <Column field="username" header="Username"></Column>
                <Column field="status" header="Status"></Column>
                <Column header="Actions" body={(rowData) => (
                    <Button onClick={() => onEditUser(rowData)} icon="pi pi-pencil" className="p-button-rounded p-button-info" />
                )}></Column>
            </DataTable>
            <Sidebar visible={visible} style={{ width: '30%' }} position='right' onHide={() => setVisible(false)}>
                <h2>{userData.name ? `Edit User: ${userData.name}` : 'Add User'}</h2>
                {/* Add User Form Elements Here */}
                <div>
                    <label className="block mb-2">Name</label>
                    <InputText className="w-full mb-4" value={userData.name} onChange={(e) => setUserData({ ...userData, name: e.target.value })} />
                </div>
                <div>
                    <label className="block mb-2">Username</label>
                    <InputText className="w-full mb-4" value={userData.username} onChange={(e) => setUserData({ ...userData, username: e.target.value })} />
                </div>
                <div>
                    <label className="block mb-2">Password</label>
                    <Password className="w-full mb-4" value={userData.password} onChange={(e) => setUserData({ ...userData, password: e.target.value })} />
                </div>
                <div>
                    <label className="block mb-2">Status</label>
                    <SelectButton value={status} onChange={(e) => setStatus(e.value)} className="w-full mb-4" options={['Active', 'Inactive']} />
                </div>

                <Button label="Save" icon="pi pi-check" className="p-button-primary" onClick={() => setVisible(false)} />

            </Sidebar>
        </div>

    );
};

export default UsersPage;