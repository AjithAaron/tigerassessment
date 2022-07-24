import React, { useEffect, useReducer } from 'react';
import { connect } from 'react-redux';

import { v4 as uuidv4 } from 'uuid';
import { Input, message, Tooltip } from 'antd';
import { InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';

import './UploadComponent.css';
import FormComponent from './HOC/FormComponent';
import { DATA_INSERT } from '../Redux/action';
import DataTable from './DataTable';


const itemsSearchHandler = (state, action) => {
    switch (action.type) {
        case 'SEARCH_RECORD':
            return { value: action.searchValue };
        default:
            return { value: '' };
    }
}

const UploadComponent = (props) => {

    const [searchState, dispatchSearchValue] = useReducer(itemsSearchHandler, { value: '' });

    useEffect(() => {
        if (props.uploadedDataList && props.uploadedDataList.length > 0) {
            dispatchUploadedContent({ type: 'ADD_DATA', value: props.uploadedDataList });
        } else {
            dispatchUploadedContent({ type: 'ADD_DATA', value: [] });
        }
    }, [props.uploadedDataList])

    useEffect(() => {
        const debounceSearch = setTimeout(() => {
            loadTableHandler(searchState);
        }, 200);
        return () => clearTimeout(debounceSearch);
        // eslint-disable-next-line
    }, [searchState]);

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
                    jsonData.forEach((element, index) => {
                        if (index && element.length > 7) {
                            const splitElement = element.split(',');
                            let elementRow = [];
                            splitElement.forEach(el => {
                                elementRow.push((el.replace(/[^A-Za-z0-9-_. ]/, '')).replace("\"", ''));
                            })
                            if (element) {
                                if (elementRow.length === 5) {
                                    let param = {
                                        'key': uuidv4(),
                                        'store_id': elementRow[0],
                                        'product_name': elementRow[1],
                                        'unit': elementRow[2],
                                        'price': elementRow[3],
                                        'date': new Date(elementRow[4]),
                                        'isEdit': false
                                    }
                                    data.push(param);
                                }
                            }
                        }
                    });
                    props.dispatch({ type: DATA_INSERT, payload: data });
                    message.success('Data added successfully');
                });
                reader.onloadend = readSuccess;
                reader.readAsText(event.target.files[0]);
            } else {
                message.warning('Please upload csv file only')
            }
        } else {
            props.dispatch({ type: DATA_INSERT, payload: [] });
            // setSelectedKeys();
            // setSingleEdit(false);
            // setPageNumber(1);
        }
    }

    const searchRecordsHandler = (event) => {
        dispatchSearchValue({ type: 'SEARCH_RECORD', searchValue: event.target.value });
        // setPageNumber(1);
    }

    const updateDataHandler = (row) => {
        dispatchUploadedContent({ type: 'UPDATE_DATA', value: [false, row] });
        message.success('Data updated successfully');
    }

    const deleteDataHandler = (row) => {
        // const oldData = JSON.parse(JSON.stringify(uplodedDataContent.uploadedItemList));
        // oldData.splice(oldData.findIndex(data => data.key === row.key), 1);
        // props.dispatch({ type: DATA_DELETE, payload: oldData });
        message.success('Data deleted successfully');
    }

    const updateUploadedItemsHandler = (value, previousDataList, type) => {
        let previousData = [...previousDataList];
        if (type === 'remove') {

        } else {
            previousData.forEach((data) => {
                if (data.key === value[1].key) {
                    if (type === 'isEdit') {
                        data.isEdit = value[0];
                    } else {
                        data = type === 'product_name' ? data.product_name = value[0] : type === 'sku' ? data.unit = value[0]
                            : type === 'price' ? data.price = value[0] : type === 'date' ? data.date = value[0] : data;
                    }
                }
            });
        }
        return previousData;
    }

    const uploadedItemHandler = (state, action) => {
        switch (action.type) {
            case 'ADD_DATA':
                return { ...state, uploadedItemList: action.value };
            case 'SEARCH_FILTER':
                return { ...state, uploadedItemList: action.value };
            case 'PRODUCT_NAME_UPDATE':
                return { ...state, uploadedItemList: updateUploadedItemsHandler(action.value, state.uploadedItemList, 'product_name') };
            case 'SKU_UPDATE':
                return { ...state, uploadedItemList: updateUploadedItemsHandler(action.value, state.uploadedItemList, 'sku') };
            case 'PRICE_UPDATE':
                return { ...state, uploadedItemList: updateUploadedItemsHandler(action.value, state.uploadedItemList, 'price') };
            case 'DATE_UPDATE':
                return { ...state, uploadedItemList: updateUploadedItemsHandler(action.value, state.uploadedItemList, 'date') };
            case 'UPDATE_DATA':
                return { ...state, uploadedItemList: updateUploadedItemsHandler(action.value, state.uploadedItemList, 'isEdit') };
            default:
                return { uploadedItemList: [], enableTable: false };
        }
    }

    const [uplodedDataContent, dispatchUploadedContent] = useReducer(uploadedItemHandler, { uploadedItemList: [] });

    return (<React.Fragment>
        <h1 style={{ textAlign:'center' }}>Tiger Analytics Assessment</h1>
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
                <label style={{ marginLeft: '16px', marginBottom: '8px' }}><strong>File Upload</strong></label>
                <Input type='file' accept='.csv' allowClear={true} style={{ width: '300px', marginLeft: '8px', marginTop: '10px', borderRadius: '4px' }}
                    onChange={fileUploadHandler} />
            </div>
        </FormComponent>
        <DataTable uplodedDataContent={uplodedDataContent} dispatchUploadedContent={dispatchUploadedContent}
            updateDataHandler={updateDataHandler} deleteDataHandler={deleteDataHandler} />
    </React.Fragment>);
}

const mapStateToProps = (state) => {
    return {
        uploadedDataList: state.uploadedDataList
    };
}

export default connect(mapStateToProps)(UploadComponent);