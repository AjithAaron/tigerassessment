import { DATA_INSERT, DATA_UPDATE, DATA_DELETE } from './action';

const reducer = (state = { uploadedDataList: [] }, action) => {
    const dataList = action.payload !== undefined && action.payload.length > 0 ? action.payload : [];
    switch (action.type) {
        case DATA_INSERT:
            return { ...state, uploadedDataList: dataList };
        case DATA_UPDATE:
            return { ...state, uploadedDataList: dataList };
        case DATA_DELETE:
            return { ...state, uploadedDataList: dataList };
        default:
            return { ...state };
    }
}

export default reducer;