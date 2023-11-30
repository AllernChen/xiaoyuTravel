import axios from 'axios';

const BAIDU_MAP_AK = import.meta.env.VITE_BAIDU_MAP_AK;
const POI_TYPES = import.meta.env.VITE_POI_TYPES;
//百度全球逆地理编码
export const reverse_geocoding = (location: number[]) => {
    const URL = `/baidu/reverse_geocoding/v3`
    return new Promise((resolve, reject) => {
        axios.request({
            url: URL,
            method: 'get',
            headers: {
                'Content-Type': 'application/json'
            },
            params: {
                ak: BAIDU_MAP_AK,
                output: 'json',
                coordtype: 'wgs84ll',
                extensions_poi: 1,
                radius: 1000,
                // poi_types: '生活服务|餐饮服务|商务住宅|风景名胜|科教文化服务|公司企业|政府机构及社会团体|道路附属设施|地名地址信息|公共设施',
                poi_types: POI_TYPES,
                location: `${location[1]},${location[0]}`
            }
        }).then(response => {
            resolve(response.data);
        }).catch(error => {
            reject(error);
        });
    });
};