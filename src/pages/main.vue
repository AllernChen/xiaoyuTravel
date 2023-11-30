<template>
    <div class="relative h-full w-full">
        <Map ref="map"></Map>
        <Button class="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10" @click="start">开始</Button>
        <!-- 创建信息窗口，位于页面右上角，分为地点基本信息和附近POI信息两部分 -->
        <div class="absolute top-0 right-0 z-10" :hidden="target_point == null">
            <!-- close button -->
            <div class="absolute top-0 right-0 m-2">
                <Button type="primary" shape="circle" icon="x" @click="target_point = null"></Button>
            </div>
            <div class="bg-white rounded-lg shadow-lg p-4">
                <div class="text-lg font-bold mb-2">地点基本信息</div>
                <div class="text-sm">
                    <!-- 卡片方式展示 -->
                    <div class="bg-gray-100 rounded-lg p-2 mb-2 text-left" @click="flyTo(target_point?.location.lng,target_point?.location.lat)">
                        <div>地点名称：{{ target_point?.sematic_description || "" }}</div>
                        <div>地点地址：{{ target_point?.formatted_address_poi || target_point?.formatted_address || "" }}</div>
                        <div>地点经纬度：{{ target_point?.location.lng + "," + target_point?.location.lat }}</div>
                    </div>
                </div>
                <div class="text-lg font-bold mb-2 mt-4">附近POI信息</div>
                <!-- 卡片方式展示，内容左对齐 -->
                <div class="text-sm">
                    <div v-for="poi in target_point_near_poi" :key="poi.uid" class="bg-gray-100 rounded-lg p-2 mb-2 text-left" @click="flyTo(poi.point.x,poi.point.y)">
                        <div>POI名称：{{ poi.name }}</div>
                        <div>POI地址：{{ poi.addr }}</div>
                        <div>POI经纬度：{{ poi.point.x + "," + poi.point.y }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import Map from '@/components/Map.vue';
import { Button } from 'ant-design-vue';
import { ref } from 'vue';
import * as Map_Utils from '@/components/Map.ts';
import { reverse_geocoding } from '@/components/BaiduMap';
const map = ref()
const target_point = ref<any>(null)
const target_point_near_poi = ref<any[]>([])
var time = 0 // interval time
var myInterval: any = null
const start = () => {
    console.log('start');
    myInterval = setInterval(addPoint, 100);
};
const addPoint = () => {
    let boundaryLayer = map.value.getBoundaryLayer()
    let coordinates = boundaryLayer.getSource().getFeatures()[0].getGeometry().getCoordinates()[0]
    let randomPoint = Map_Utils.getRandomPointByPolygon(coordinates);
    map.value.drawPoint(randomPoint)
    time += 1
    if (time > 20) {
        time = 0
        clearInterval(myInterval)
        reverse_geocoding(randomPoint).then((res:any) => {
            console.info("POI::", res)
            target_point.value = res.result
            target_point_near_poi.value = res.result.pois.slice(0, 5)
        })
    }
}
const flyTo = (longitude:number,latitude:number) => {
    map.value.flyTo(longitude,latitude)
}
</script>