'use client';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';
import statesData from '../../data/states.json';
import { Sidebar } from 'primereact/sidebar';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { Card } from 'primereact/card';

const StatesPage = () => {
    const toast = useRef(null);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [states, setStates] = useState(statesData);
    const [stateDialogVisible, setStateDialogVisible] = useState(false);
    const [lazyState, setLazyState] = useState({
        first: 0,
        rows: 10,
        page: 1,
        sortField: null,
        sortOrder: null,
        filters: {
            name: { value: '', matchMode: 'contains' }
        }
    });

    let networkTimeout = null;

    useEffect(() => {
        loadLazyData();
    }, [lazyState]);

    const loadLazyData = () => {
        setLoading(true);

        if (networkTimeout) {
            clearTimeout(networkTimeout);
        }

        //imitate delay of a backend call
        networkTimeout = setTimeout(() => {
            setTotalRecords(statesData.length);
            setStates(statesData);
            setLoading(false);
        }, 2000);
    };

    const onPage = (event) => {
        setLazyState(event);
    };

    const onSort = (event) => {
        setLazyState(event);
    };

    const onFilter = (event) => {
        event['first'] = 0;
        setLazyState(event);
    };

    const onAddState = () => {
        setStateDialogVisible(true);
        setCode('');
        setName('');
    }

    const onEditState = (rowData) => {
        setStateDialogVisible(true);
        setCode(rowData.code);
        setName(rowData.name);
    }

    const saveState = () => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'State saved successfully' });
        setStateDialogVisible(false);
    }


    return (
        <div className="card">
            <Toast ref={toast} />

            <Toolbar className="mb-4" start={<div className="text-2xl font-bold"><h1>States</h1></div>} end={<Button label='Add State' onClick={onAddState} icon="pi pi-plus" />} />
            <Card className="p-fluid m-4">

                <DataTable value={states} lazy dataKey="id" paginator
                    first={lazyState.first} rows={10} totalRecords={totalRecords} onPage={onPage}
                    onSort={onSort} sortField={lazyState.sortField} sortOrder={lazyState.sortOrder}
                    loading={loading} tableStyle={{ minWidth: '75rem' }}
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="{first} to {last} of {totalRecords}">
                    <Column field="code" header="Code" />
                    <Column field="name" header="Name" sortable />
                    <Column header="Actions" body={(rowData) => (
                        <Button icon="pi pi-pencil" onClick={() => onEditState(rowData)} className="p-button-rounded p-button-info" />
                    )}></Column>

                </DataTable>

            </Card>
            <Sidebar visible={stateDialogVisible} style={{ width: '30%' }} position='right' onHide={() => setStateDialogVisible(false)}>
                <h2>{name ? `Edit State: ${name}` : 'Add State'}</h2>
                {/* Add State Form Elements Here */}
                <div>
                    <label className="block mb-2">Code</label>
                    <InputText value={code} onChange={(e) => setCode(e.target.value)} />
                </div>
                <div>
                    <label className="block mb-2">Name</label>
                    <InputText value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <Button label="Save" icon="pi pi-check" className="p-button-primary" onClick={saveState} />
            </Sidebar>
        </div>
    );
}

export default StatesPage;