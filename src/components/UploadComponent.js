import React, { useEffect, useReducer, useState } from 'react';
import { connect } from 'react-redux';

import { v4 as uuidv4 } from 'uuid';
import { Input, notification, Tooltip, Button } from 'antd';
import { DownloadOutlined, InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { CSVLink } from 'react-csv';

import './UploadComponent.css';
import FormComponent from './HOC/FormComponent';
import { DATA_INSERT } from '../Redux/action';
import DataTable from './DataTable';
import moment from 'moment';

notification.config({ placement: 'bottomLeft', duration: 3 });

const downloadTemplateHeaders = [['Store Id', 'Product Name', 'SKU', 'Price', 'Date']]

/**
* itemsSearchHandler used to handle search operations
* @param state
* @param action
*/
const itemsSearchHandler = (state, action) => {
    switch (action.type) {
        case 'SEARCH_RECORD':
            return { value: action.searchValue };
        default:
            return { value: '' };
    }
}

/**
* UploadComponent components are used for acheive component upload and load operations.
* @param props
*/
const UploadComponent = (props) => {

    const [previousItemList, setPreviousItemList] = useState([]);

    /**
    * searchState reducer used to handle search operations
    */
    const [searchState, dispatchSearchValue] = useReducer(itemsSearchHandler, { value: '' });

    /**
    * This useEffect used to handle data insertion operations
    */
    useEffect(() => {
        if (props.uploadedDataList && props.uploadedDataList.length > 0) {
            dispatchUploadedContent({ type: 'ADD_DATA', value: props.uploadedDataList });
            setPreviousItemList(JSON.parse(JSON.stringify(props.uploadedDataList)));
        } else {
            dispatchUploadedContent({ type: 'ADD_DATA', value: [] });
            setPreviousItemList([]);
        }
    }, [props.uploadedDataList])

    /**
    * This useEffect used to handle debounce concept for search operations
    */
    useEffect(() => {
        const debounceSearch = setTimeout(() => {
            loadTableHandler(searchState);
        }, 200);
        return () => clearTimeout(debounceSearch);
        // eslint-disable-next-line
    }, [searchState]);

    /**
    * loadTableHandler used to filter a data based on search input
    * @param searchStateValue
    */
    const loadTableHandler = (searchStateValue) => {
        if (searchStateValue && searchStateValue.value && searchStateValue.value !== '') {
            const searchedItems = props.uploadedDataList.filter((data) => {
                let dateValue = new Date(data.date);
                data.date = dateValue.toISOString().slice(0, 10);
                return Object.values(data).join(' ').toLowerCase().includes(searchStateValue.value.toLowerCase());
            });
            dispatchUploadedContent({ type: 'SEARCH_FILTER', value: searchedItems });
        } else {
            dispatchUploadedContent({ type: 'SEARCH_FILTER', value: props.uploadedDataList });
        }
    }

    /**
    * fileUploadHandler used to load a data from uploded document
    * @param event
    */
    const fileUploadHandler = (event) => {
        if (event.target.value.length > 0) {
            let reader = new FileReader();
            let file = event.target.value.split('\\');
            let type = file[2].split('.');
            let typeLength = type.length;
            if (type[typeLength - 1] === 'csv') {
                const readSuccess = ((e) => {
                    let jsonData = reader.result.split(/\r\n|\n/);
                    let data = [];
                    let validationCheck = false;
                    if (jsonData.length > 1) {
                        jsonData.every((element, index) => {
                            if (index && element.length > 7) {
                                const splitElement = element.split(',');
                                let elementRow = [];
                                splitElement.forEach(el => {
                                    elementRow.push((el.replace(/[^A-Za-z0-9-_. ]/, '')).replace("\"", ''));
                                })
                                let formattedDate = moment(elementRow[4], 'YYYY-MM-DD');
                                validationCheck = isNaN(elementRow[0]) || elementRow[1].trim() === '' || isNaN(elementRow[2]) || isNaN(elementRow[3]) || !formattedDate.isValid();
                                if (validationCheck) {
                                    notification.error({ message: `Invalid data presented in row no ${index + 1}` });
                                    return false;
                                } else {
                                    if (element) {
                                        if (elementRow.length === 5) {
                                            let param = {
                                                'key': uuidv4(),
                                                'store_id': elementRow[0],
                                                'product_name': elementRow[1],
                                                'unit': elementRow[2],
                                                'price': elementRow[3],
                                                'date': new Date(formattedDate),
                                                'isEdit': false
                                            }
                                            data.push(param);
                                        }
                                    }
                                }
                            }
                            return true;
                        });
                        if (!validationCheck) {
                            notification.success({ message: 'Data added successfully' });
                            props.dispatch({ type: DATA_INSERT, payload: data });
                        }
                    } else {
                        props.dispatch({ type: DATA_INSERT, payload: [] });
                        notification.warning({ message: 'Uploaded csv file has empty' });
                    }
                });
                reader.onloadend = readSuccess;
                reader.readAsText(event.target.files[0]);
            } else {
                notification.warning({ message: 'Please upload csv file only' });
            }
        } else {
            props.dispatch({ type: DATA_INSERT, payload: [] });
        }
    }

    /**
    * searchRecordsHandler used to dispatch event for search operation
    * @param event
    */
    const searchRecordsHandler = (event) => {
        dispatchSearchValue({ type: 'SEARCH_RECORD', searchValue: event.target.value });
    }

    /**
    * updateDataHandler used to dispatch event for update operation
    * @param row
    */
    const updateDataHandler = (row) => {
        dispatchUploadedContent({ type: 'UPDATE_DATA', value: [false, row] });
    }

    /**
    * deleteDataHandler used to dispatch event for delete operation
    * @param row
    */
    const deleteDataHandler = (row) => {
        dispatchUploadedContent({ type: 'DELETE_DATA', value: row });
    }

    /**
    * updateUploadedItemsHandler used to perform grid data edit and delete operations
    * @param value
    * @param state
    * @param type
    */
    const updateUploadedItemsHandler = (value, state, type) => {
        let currentData = [...state.uploadedItemList];
        if (type === 'remove_data') {
            currentData = currentData.filter((data) => data.key !== value.key);
            notification.success({ message: 'Data deleted successfully' });
        } else {
            currentData.forEach((data) => {
                if (data.key === value[1].key) {
                    if (type === 'isEdit') {
                        data.isEdit = value[0];
                    } else if (type === 'update_data') {
                        data.isEdit = value[0];
                        let previousFoundItem = previousItemList.find((prevData) => prevData.key === value[1].key);
                        previousFoundItem.date = new Date(previousFoundItem.date);
                        if (JSON.stringify(data) === JSON.stringify(previousFoundItem)) {
                            notification.warning({ message: 'No changes to save' });
                        } else {
                            setPreviousItemList(JSON.parse(JSON.stringify(currentData)));
                            notification.success({ message: 'Data updated successfully' });
                        }
                    } else {
                        data = type === 'product_name' ? data.product_name = value[0] : type === 'sku' ? data.unit = value[0]
                            : type === 'price' ? data.price = value[0] : type === 'date' ? data.date = value[0] : data;
                    }
                }
            });
        }
        return currentData;
    }

    /**
    * uploadedItemHandler used to handle grid data edit and delete dispatch events
    * @param state
    * @param action
    */
    const uploadedItemHandler = (state, action) => {
        switch (action.type) {
            case 'ADD_DATA':
                return { ...state, uploadedItemList: action.value };
            case 'SEARCH_FILTER':
                return { ...state, uploadedItemList: action.value };
            case 'PRODUCT_NAME_UPDATE':
                return { ...state, uploadedItemList: updateUploadedItemsHandler(action.value, state, 'product_name') };
            case 'SKU_UPDATE':
                return { ...state, uploadedItemList: updateUploadedItemsHandler(action.value, state, 'sku') };
            case 'PRICE_UPDATE':
                return { ...state, uploadedItemList: updateUploadedItemsHandler(action.value, state, 'price') };
            case 'DATE_UPDATE':
                return { ...state, uploadedItemList: updateUploadedItemsHandler(action.value, state, 'date') };
            case 'EDIT_DATA':
                return { ...state, uploadedItemList: updateUploadedItemsHandler(action.value, state, 'isEdit') };
            case 'UPDATE_DATA':
                return { ...state, uploadedItemList: updateUploadedItemsHandler(action.value, state, 'update_data') };
            case 'DELETE_DATA':
                return { ...state, uploadedItemList: updateUploadedItemsHandler(action.value, state, 'remove_data') };
            default:
                return { uploadedItemList: [] };
        }
    }

    /**
    * uplodedDataContent reducer used to handle grid data operations
    */
    const [uplodedDataContent, dispatchUploadedContent] = useReducer(uploadedItemHandler, { uploadedItemList: [] });

    return (<React.Fragment>
        <h1 style={{ textAlign: 'center', color: 'whitesmoke' }}>Tiger Analytics Assessment</h1>
        <FormComponent className='upload-style'>
            <div className='search-fields'>
                <SearchOutlined style={{ fontSize: 'x-large', paddingTop: '4px', cursor: 'not-allowed', paddingRight: '8px', paddingBottom: '2px' }} />
                <Input style={{ width: '180px', borderRadius: '4px' }} allowClear={true} placeholder='Item Search'
                    prefix={<Tooltip placement="top" name='Item Search' title={<span >{'Store Id/Product Name/SKU/Price/Date'}</span>}>
                        <InfoCircleOutlined style={{ color: '#1890ff' }} /> </Tooltip>}
                    value={searchState.value} onChange={searchRecordsHandler} onPressEnter={searchRecordsHandler} />
                <div style={{ marginLeft: '4px', marginBottom: '2px', fontWeight: 'bold' }}>{uplodedDataContent.uploadedItemList.length > 1 ? `${uplodedDataContent.uploadedItemList.length} RECORDS` : `${uplodedDataContent.uploadedItemList.length} RECORD`}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '12px' }}>
                <CSVLink filename={'Tiger Assessment Template.csv'} tabIndex={-1} data={downloadTemplateHeaders}><Button type='primary'
                    icon={<DownloadOutlined />} onClick={() => <CSVLink data={downloadTemplateHeaders} ></CSVLink>} style={{ width: '175px', borderRadius: '5px', border: 'none', outline: 'none', marginBottom: '2px' }}>Download Template</Button></CSVLink>
                <label style={{ marginLeft: '16px', marginBottom: '8px' }}><strong>File Upload</strong></label>
                <Input type='file' accept='.csv' allowClear={true} style={{ width: '300px', marginLeft: '8px', marginTop: '10px', borderRadius: '4px' }}
                    onChange={fileUploadHandler} />
            </div>
        </FormComponent>
        <DataTable uplodedDataContent={uplodedDataContent} dispatchUploadedContent={dispatchUploadedContent}
            updateDataHandler={updateDataHandler} deleteDataHandler={deleteDataHandler} />
    </React.Fragment>);
}

/**
* mapStateToProps used to convert data from state to props
* @param state
*/
const mapStateToProps = (state) => {
    return {
        uploadedDataList: state.uploadedDataList
    };
}

export default connect(mapStateToProps)(UploadComponent);