import React, { useEffect, useRef, useState } from 'react';

import moment from 'moment';
import { Button, DatePicker, Input, message, Table, Tooltip, Modal } from 'antd';
import { CheckOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import './UploadComponent.css';
import FormComponent from './HOC/FormComponent';

const { confirm } = Modal;

message.config({
    // top: 10,
    left:100,
    maxCount: 1,
    rtl: true
});

const DataTable = ({ uplodedDataContent, dispatchUploadedContent, updateDataHandler, deleteDataHandler }) => {
    const [singleEdit, setSingleEdit] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState();
    const [currentPageNumber, setPageNumber] = useState(1);
    const selectedRowKeyForEdit = useRef();
    const pageSize = 7;

    const editHandler = (row) => {
        if (singleEdit === false) {
            selectedRowKeyForEdit.current = row.key;
            dispatchUploadedContent({ type: 'UPDATE_DATA', value: [true, row] });
            setSingleEdit(true);
        } else {
            let index = uplodedDataContent.uploadedItemList.findIndex((data) => data.key === selectedRowKeyForEdit.current) + 1;
            let lastPageNumber = (index % pageSize !== 0) ? Math.floor(index / pageSize) + 1 : Math.floor(index / pageSize);
            setPageNumber(lastPageNumber);
            setSelectedKeys(selectedRowKeyForEdit.current);
            message.warning('Please update one row at a time');
        }
    }

    const updateHandler = (row) => {
        setSelectedKeys();
        setSingleEdit(false);
        updateDataHandler(row);
    }

    const deleteHandler = (row) => {
        confirm({
            title: 'Do you Want to delete this item?',
            icon: <ExclamationCircleOutlined />,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                deleteDataHandler(row);
            }
        });
    }

    const gridColumns = [
        {
            title: 'Store Id', dataIndex: 'store_id', key: 'store_id', align: 'center', width: '100px',
            render: (text, row) => (
                <Input type="text" value={text} style={{ border: 'none', textAlign: 'center' }} disabled />
            )
        },
        {
            title: 'Product Name', dataIndex: 'product_name', key: 'product_name', align: 'center', width: '200px',
            render: (text, row, i) => (
                <Input type="text" value={text} style={{ textAlign: 'center' }} disabled={!row.isEdit}
                    onChange={(event) => dispatchUploadedContent({ type: 'PRODUCT_NAME_UPDATE', value: [event.target.value, row] })} />
            )
        },
        {
            title: 'SKU', dataIndex: 'unit', key: 'unit', align: 'center', width: '150px',
            render: (text, row, i) => (
                <Input type="number" value={text} style={{ textAlign: 'center' }} disabled={!row.isEdit}
                    onChange={(event) => dispatchUploadedContent({ type: 'SKU_UPDATE', value: [event.target.value, row] })} />
            )
        },
        {
            title: 'Price', dataIndex: 'price', key: 'price', align: 'center', width: '150px',
            render: (text, row, i) => (
                <Input type="number" value={text} style={{ textAlign: 'center' }} disabled={!row.isEdit}
                    onChange={(event) => dispatchUploadedContent({ type: 'PRICE_UPDATE', value: [event.target.value, row] })} />
            )
        },
        {
            title: 'Date', dataIndex: 'date', key: 'date', align: 'center', width: '150px',
            render: (text, row, i) => (
                <DatePicker key={i} value={moment(text)} disabled={!row.isEdit} allowClear={false}
                    onChange={(date) => dispatchUploadedContent({ type: 'DATE_UPDATE', value: [date, row] })} />
            )
        },
        {
            title: 'Edit', align: 'center', width: '80px',
            render: (text, row, i) => (

                row.isEdit ? <>
                    <Tooltip title={
                        <span>{'Update'}</span>
                    } placement='top' key={'update'}> <Button type="primary" shape="circle" icon={<CheckOutlined />}
                        disabled={row.isNameValid}
                        style={{ pointerEvents: row.isNameValid ? 'none' : 'initial' }}
                        onClick={() => updateHandler(row)}
                        />
                    </Tooltip>
                </> : <>
                    <Tooltip title={
                        <span>{'Edit'}</span>
                    } placement='top' key={'EDIT'}> <Button type="primary" shape="circle" icon={<EditOutlined />}
                        onClick={() => editHandler(row)}
                        />
                    </Tooltip>
                </>
            )
        },
        {
            title: 'Delete', align: 'center', width: '80px', key: 'key',
            render: (text, row, i) => (
                <Tooltip title={
                    <span>{'Delete'}</span>
                } placement='top' key={'REMOVE'}> <Button type="primary" shape="circle" icon={<DeleteOutlined />}
                    onClick={() => deleteHandler(row)}
                    />
                </Tooltip>
            )
        }
    ];

    return (
        <FormComponent className='result-data'>
            <Table className='ant-table-holidays' scroll={{ x: 'max-content' }} pagination={{
                pageSize: 7, style: { marginRight: '10px' }, size: 'defult', current: currentPageNumber,
                showSizeChanger: false, total: uplodedDataContent.uploadedItemList.length, onChange: (page) => setPageNumber(page)
            }} rowClassName={(record) => record.key === selectedKeys ? 'ant-table-row-se;ected' : ''} size='small' dataSource={uplodedDataContent.uploadedItemList} columns={gridColumns} bordered={true} />
        </FormComponent>
    );
}

export default React.memo(DataTable);