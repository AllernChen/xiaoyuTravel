import * as turf from '@turf/turf';


//根据面polygon coordinates 获取随机点
export const getRandomPointByPolygon = (coordinates: any[][]) => {
    var polygon = turf.polygon(coordinates);
    var bbox = turf.bbox(polygon);
    var randomPoint = turf.randomPosition(bbox);
    while (!turf.inside(randomPoint, polygon)) {
        randomPoint = turf.randomPosition(bbox);
    }
    return randomPoint;
}