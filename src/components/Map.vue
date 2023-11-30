<template>
	<div id="map_container"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import WMTS from 'ol/source/WMTS.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import { get as getProjection, Projection } from 'ol/proj.js';
import { getTopLeft, getWidth } from 'ol/extent.js';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { Vector as VectorSource } from 'ol/source.js';
import { GeoJSON } from 'ol/format.js';
import { Point } from 'ol/geom.js';
import { Style,Icon } from 'ol/style.js';
//import openlayer css
import 'ol/ol.css';
import { Feature } from 'ol';
//天地图KEY
const TDT_KEY = import.meta.env.VITE_TDT_API_KEY

// define projection
const defineProj = () => {
	proj4.defs("EPSG:4490", "+proj=longlat +ellps=GRS80 +no_defs +type=crs");
	register(proj4);
	const projection = getProjection("EPSG:4490") || new Projection({
		code: "EPSG:4490"
	})
	projection.setExtent([-180, -90, 180, 90]);
	return projection
}
//init boundary layer
const initBoundaryLayer = () => {
	var url = 'https://geo.datav.aliyun.com/areas_v3/bound/441900.json';
	var vectorBoudarySource = new VectorSource({
		url: url,
		format: new GeoJSON(),
	});
	//添加矢量图层
	var vectorBoundaryLayer = new VectorLayer({
		source: vectorBoudarySource
	});
	return vectorBoundaryLayer
}

//init base layuer
const initBaseLayers = (projection: Projection) => {
	let h = Math.round(Math.random() * 6)
	let tdt_img_layer_url = `http://t${h}.tianditu.gov.cn/img_c/wmts?tk=${TDT_KEY}`
	let tdt_cia_layer_utl = `http://t${h}.tianditu.gov.cn/cia_c/wmts?tk=${TDT_KEY}`


	const projectionExtent = projection.getExtent();
	const size = getWidth(projectionExtent) / 256;
	const resolutions = [];
	const matrixIds: string[] = [];
	for (let z = 0; z < 20; ++z) {
		// generate resolutions and matrixIds arrays for this WMTS
		resolutions[z] = size / Math.pow(2, z);
		matrixIds[z] = z + "";
	}

	const origin = getTopLeft(projectionExtent);
	const tileGrid = new WMTSTileGrid({
		origin: origin,
		resolutions: resolutions,
		matrixIds: matrixIds,
	});
	const tdt_img_layer = new TileLayer({
		source: new WMTS({
			url: tdt_img_layer_url,
			layer: 'img',
			matrixSet: 'c',
			format: 'tiles',
			projection: projection,
			tileGrid: tileGrid,
			style: 'default',
			wrapX: true,
		}),
	});
	const tdt_cia_layer = new TileLayer({
		source: new WMTS({
			url: tdt_cia_layer_utl,
			layer: 'cia',
			matrixSet: 'c',
			format: 'tiles',
			projection: projection,
			tileGrid: tileGrid,
			style: 'default',
			wrapX: true,
		}),
	});
	return [tdt_img_layer, tdt_cia_layer]
}

// init map and layer
const initMap = (projection: Projection) => {
	var map = new Map({
		target: 'map_container',
		view: new View({
			center: [114.06505094277206, 23.032353043150845],
			zoom: 10,
			projection: projection,
		}),
	});
	return map;
}
var map: Map = new Map()
var baseLayers: TileLayer<WMTS>[] = []
var boundaryLayer: VectorLayer<VectorSource<Feature>> = new VectorLayer<VectorSource<Feature>>();
var pointLayer: VectorLayer<VectorSource<Feature>> = new VectorLayer<VectorSource<Feature>>();

const getMap = () => { return map } // get
const getBaseLayers = () => { return baseLayers }
const getBoundaryLayer = () => { return boundaryLayer }
//画点
const drawPoint = (coordinates: number[]) => {
	map.removeLayer(pointLayer)
	pointLayer.getSource()?.clear()
	let point = new Feature({
		geometry: new Point(coordinates),
	});
	let source = new VectorSource({
		features: [point],
	});
	pointLayer.setSource(source);
	pointLayer.setStyle(() => {
		return new Style({
			image: new Icon({
				src: "/fish.png",
				anchor: [0.5, 1], // 设置图标位置
				scale: 0.2
			})
		});
	});
	map.addLayer(pointLayer);
}
//飞到某个点
const flyTo = (longitude: number, latitude: number) => {
	map.getView().animate({
		center: [longitude, latitude],
		zoom: 15,
		duration: 2000,
	});
}
defineExpose({ getMap, getBaseLayers, getBoundaryLayer, drawPoint,flyTo }) // expose

onMounted(() => {
	const projection = defineProj()
	map = initMap(projection)
	baseLayers = initBaseLayers(projection)
	boundaryLayer = initBoundaryLayer()
	baseLayers.forEach(it => map.addLayer(it))
	map.addLayer(boundaryLayer)

	map.updateSize()

});



</script>
<style scoped>
#map_container {
	width: 100%;
	height: 100%;
}
</style>
