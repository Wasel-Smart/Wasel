const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/js/leaflet-src-CdhymyQz.js","assets/js/vendor-react-7PqXWhc5.js"])))=>i.map(i=>d[i]);
import{c as v,_ as j,h as O,B as z,y as A}from"./index-C4myuZdd.js";import{r as l,j as r}from"./vendor-ui-S1-b02vM.js";import{t as J,c as K}from"./vendor-utils-Drrw94dm.js";import{S as Z}from"./serviceFactory-BhemUNoC.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"22",x2:"18",y1:"12",y2:"12",key:"l9bcsi"}],["line",{x1:"6",x2:"2",y1:"12",y2:"12",key:"13hhkx"}],["line",{x1:"12",x2:"12",y1:"6",y2:"2",key:"10w3f3"}],["line",{x1:"12",x2:"12",y1:"22",y2:"18",key:"15g9kq"}]],C=v("crosshair",Q);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X=[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]],Y=v("layers",X);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=[["polyline",{points:"15 3 21 3 21 9",key:"mznyad"}],["polyline",{points:"9 21 3 21 3 15",key:"1avn1i"}],["line",{x1:"21",x2:"14",y1:"3",y2:"10",key:"ota7mn"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]],te=v("maximize-2",ee);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const re=[["polyline",{points:"4 14 10 14 10 20",key:"11kfnr"}],["polyline",{points:"20 10 14 10 14 4",key:"rlmsce"}],["line",{x1:"14",x2:"21",y1:"10",y2:"3",key:"o5lafz"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]],se=v("minimize-2",re);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ae=[["polygon",{points:"3 11 22 2 13 21 11 13 3 11",key:"1ltx0t"}]],oe=v("navigation",ae);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ne=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"11",x2:"11",y1:"8",y2:"14",key:"1vmskp"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]],le=v("zoom-in",ne);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ie=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]],ce=v("zoom-out",ie);function de(...e){return J(K(e))}function xe({locations:e=[],center:u={lat:25.2048,lng:55.2708},zoom:n=12,height:h="400px",showRoute:p=!1,showTraffic:x=!1,show3D:y=!1,interactive:f=!0,className:m,onLocationClick:b,onMapClick:L,style:R="streets",realTimeTracking:s=!1,clustered:c=!1}){const g=l.useRef(null),[t,q]=l.useState(null),[N,V]=l.useState(null),[E,$]=l.useState(!1),[S,B]=l.useState(n),[_,P]=l.useState(R),k=l.useRef([]),I=l.useRef(null);l.useEffect(()=>{if(!(!g.current||t))return j(()=>import("./leaflet-src-CdhymyQz.js").then(a=>a.l),__vite__mapDeps([0,1])).then(a=>{delete a.Icon.Default.prototype._getIconUrl,a.Icon.Default.mergeOptions({iconRetinaUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",iconUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",shadowUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"});const o=a.map(g.current,{center:[u.lat,u.lng],zoom:S,zoomControl:!1,attributionControl:!1}),i={streets:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",satellite:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",dark:"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",light:"https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"};a.tileLayer(i[_],{maxZoom:19,attribution:"© OpenStreetMap contributors"}).addTo(o),L&&o.on("click",d=>{L(d.latlng.lat,d.latlng.lng)}),o.on("zoomend",()=>{B(o.getZoom())}),q(o)}),()=>{t&&t.remove()}},[]),l.useEffect(()=>{t&&j(()=>import("./leaflet-src-CdhymyQz.js").then(a=>a.l),__vite__mapDeps([0,1])).then(a=>{t.eachLayer(i=>{i._url&&t.removeLayer(i)});const o={streets:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",satellite:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",dark:"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",light:"https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"};a.tileLayer(o[_],{maxZoom:19,attribution:"© OpenStreetMap contributors"}).addTo(t)})},[_,t]),l.useEffect(()=>{t&&j(()=>import("./leaflet-src-CdhymyQz.js").then(a=>a.l),__vite__mapDeps([0,1])).then(a=>{if(k.current.forEach(o=>t.removeLayer(o)),k.current=[],e.forEach(o=>{const i=ue(o.type||"default",a),d=a.marker([o.lat,o.lng],{icon:i}).addTo(t);o.label&&d.bindPopup(`
            <div class="font-sans">
              <div class="font-semibold text-lg">${o.label}</div>
              ${o.data?`<div class="text-sm text-gray-600 mt-1">${JSON.stringify(o.data)}</div>`:""}
            </div>
          `),b&&d.on("click",()=>b(o)),k.current.push(d)}),e.length>1){const o=a.latLngBounds(e.map(i=>[i.lat,i.lng]));t.fitBounds(o,{padding:[50,50]})}else e.length===1&&t.setView([e[0].lat,e[0].lng],S)})},[e,t,b]),l.useEffect(()=>{!t||!p||e.length<2||j(()=>import("./leaflet-src-CdhymyQz.js").then(a=>a.l),__vite__mapDeps([0,1])).then(a=>{I.current&&t.removeLayer(I.current);const o=e.sort((d,M)=>{const w={start:0,stop:1,destination:2};return(w[d.type]||1)-(w[M.type]||1)}).map(d=>[d.lat,d.lng]);I.current=a.polyline(o,{color:"#3b82f6",weight:4,opacity:.7,smoothFactor:1,className:"route-line"}).addTo(t),a.polylineDecorator(I.current,{patterns:[{offset:25,repeat:100,symbol:a.Symbol.arrowHead({pixelSize:12,pathOptions:{fillOpacity:.7,weight:0,color:"#3b82f6"}})}]}).addTo(t)})},[p,e,t]),l.useEffect(()=>{if(!s||!t)return;let a;return"geolocation"in navigator&&(a=navigator.geolocation.watchPosition(o=>{const i={lat:o.coords.latitude,lng:o.coords.longitude};V(i),j(()=>import("./leaflet-src-CdhymyQz.js").then(d=>d.l),__vite__mapDeps([0,1])).then(d=>{const M=k.current.find(w=>w.options.id==="user-location");if(M)M.setLatLng([i.lat,i.lng]);else{const w=d.divIcon({html:`
                  <div class="relative">
                    <div class="absolute -inset-2 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                    <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
                  </div>
                `,className:"user-location-marker",iconSize:[20,20],iconAnchor:[10,10]}),H=d.marker([i.lat,i.lng],{icon:w,id:"user-location"}).addTo(t);k.current.push(H)}})},o=>{console.error("Geolocation error:",o)},{enableHighAccuracy:!0,maximumAge:0,timeout:5e3})),()=>{a&&navigator.geolocation.clearWatch(a)}},[s,t]);const F=()=>{t&&t.setZoom(t.getZoom()+1)},D=()=>{t&&t.setZoom(t.getZoom()-1)},U=()=>{t&&(N?t.setView([N.lat,N.lng],S):e.length>0?t.setView([e[0].lat,e[0].lng],S):t.setView([u.lat,u.lng],n))},G=()=>{$(!E)},W=()=>{const a=["streets","satellite","dark","light"],i=(a.indexOf(_)+1)%a.length;P(a[i])};return r.jsxs("div",{className:de("relative rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 dark:border-gray-700",E&&"fixed inset-0 z-50 rounded-none",m),style:{height:E?"100vh":h},children:[r.jsx("div",{ref:g,className:"absolute inset-0",children:r.jsx("link",{rel:"stylesheet",href:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css"})}),r.jsxs("div",{className:"absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none",children:[r.jsxs("div",{className:"flex gap-2 pointer-events-auto",children:[r.jsxs(O,{variant:"secondary",className:"bg-white/90 backdrop-blur-md shadow-lg",children:[r.jsx(oe,{className:"w-3 h-3 mr-1"}),e.length," location",e.length!==1?"s":""]}),N&&r.jsxs(O,{variant:"secondary",className:"bg-blue-500 text-white shadow-lg",children:[r.jsx(C,{className:"w-3 h-3 mr-1"}),"Live Tracking"]})]}),r.jsxs(z,{size:"sm",variant:"secondary",onClick:W,className:"pointer-events-auto bg-white/90 backdrop-blur-md shadow-lg hover:bg-white",children:[r.jsx(Y,{className:"w-4 h-4 mr-1"}),_]})]}),r.jsxs("div",{className:"absolute top-4 right-4 z-10 flex flex-col gap-2",children:[r.jsx(z,{size:"icon",variant:"secondary",onClick:G,className:"bg-white/90 backdrop-blur-md shadow-lg hover:bg-white",children:E?r.jsx(se,{className:"w-4 h-4"}):r.jsx(te,{className:"w-4 h-4"})}),r.jsxs("div",{className:"flex flex-col gap-1 bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-1",children:[r.jsx(z,{size:"icon",variant:"ghost",onClick:F,className:"h-8 w-8 hover:bg-gray-100",children:r.jsx(le,{className:"w-4 h-4"})}),r.jsx("div",{className:"h-px bg-gray-200"}),r.jsx(z,{size:"icon",variant:"ghost",onClick:D,className:"h-8 w-8 hover:bg-gray-100",children:r.jsx(ce,{className:"w-4 h-4"})})]}),r.jsx(z,{size:"icon",variant:"secondary",onClick:U,className:"bg-white/90 backdrop-blur-md shadow-lg hover:bg-white",children:r.jsx(C,{className:"w-4 h-4"})})]}),p&&e.length>1&&r.jsx("div",{className:"absolute bottom-4 left-4 right-4 z-10",children:r.jsx("div",{className:"bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-4",children:r.jsxs("div",{className:"flex items-center justify-between",children:[r.jsxs("div",{children:[r.jsx("div",{className:"text-sm font-medium text-gray-900",children:"Route Preview"}),r.jsxs("div",{className:"text-xs text-gray-600 mt-1",children:[e.length," stops • ",he(e).toFixed(1)," km"]})]}),r.jsx(O,{variant:"default",children:"Active Route"})]})})}),!t&&r.jsx("div",{className:"absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800",children:r.jsxs("div",{className:"text-center",children:[r.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"}),r.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:"Loading map..."})]})})]})}function ue(e,u){const n={start:{html:`
        <div class="relative">
          <div class="absolute -inset-1 bg-green-400 rounded-full animate-pulse opacity-75"></div>
          <div class="relative w-8 h-8 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"/>
            </svg>
          </div>
        </div>
      `,size:[32,32]},destination:{html:`
        <div class="relative">
          <div class="absolute -inset-1 bg-red-400 rounded-full animate-pulse opacity-75"></div>
          <div class="relative w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      `,size:[32,32]},scooter:{html:`
        <div class="relative">
          <div class="w-10 h-10 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
            <span class="text-white text-xl">🛴</span>
          </div>
          <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
      `,size:[40,40]},driver:{html:`
        <div class="w-10 h-10 bg-purple-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
          <span class="text-white text-xl">🚗</span>
        </div>
      `,size:[40,40]},stop:{html:`
        <div class="w-6 h-6 bg-yellow-500 rounded-full border-2 border-white shadow-md"></div>
      `,size:[24,24]},default:{html:`
        <div class="w-8 h-8 bg-gray-500 rounded-full border-2 border-white shadow-lg"></div>
      `,size:[32,32]}},h=n[e]||n.default;return u.divIcon({html:h.html,className:"custom-marker",iconSize:h.size,iconAnchor:[h.size[0]/2,h.size[1]/2]})}function he(e){if(e.length<2)return 0;let u=0;for(let n=0;n<e.length-1;n++)u+=me(e[n].lat,e[n].lng,e[n+1].lat,e[n+1].lng);return u}function me(e,u,n,h){const x=T(n-e),y=T(h-u),f=Math.sin(x/2)*Math.sin(x/2)+Math.cos(T(e))*Math.cos(T(n))*Math.sin(y/2)*Math.sin(y/2);return 6371*(2*Math.atan2(Math.sqrt(f),Math.sqrt(1-f)))}function T(e){return e*(Math.PI/180)}function ve(e){const[u,n]=l.useState([]),[h,p]=l.useState(!0),[x,y]=l.useState(null);l.useEffect(()=>{f()},[JSON.stringify(e)]);const f=async()=>{try{p(!0),y(null);let s=A.from("trips").select(`
          *,
          driver:driver_id(id, full_name, phone_number, rating)
        `);e?.driverId&&(s=s.eq("driver_id",e.driverId)),e?.status&&e.status.length>0&&(s=s.in("status",e.status)),e?.fromDate&&(s=s.gte("departure_date",e.fromDate));const{data:c,error:g}=await s.order("departure_date",{ascending:!0});if(g)throw g;n(c||[])}catch(s){console.error("Error fetching trips:",s),y(s.message),n([])}finally{p(!1)}},m=async s=>{try{const c=await Z.request({type:"carpool",from:s.from_coords,to:s.to_coords,date:s.departure_date,time:s.departure_time,details:{from_location:s.from,to_location:s.to,total_seats:s.total_seats,available_seats:s.available_seats||s.total_seats,price_per_seat:s.price_per_seat,trip_type:s.trip_type||"wasel",vehicle:s.vehicle,preferences:s.preferences,status:"active"}});if(!c.success)throw new Error(c.error||"Failed to create trip");return await f(),{data:c.data,error:null}}catch(c){return console.error("Error creating trip:",c),{data:null,error:c.message}}},b=async(s,c)=>{try{const{data:g,error:t}=await A.from("trips").update({...c,updated_at:new Date().toISOString()}).eq("id",s).select().single();if(t)throw t;return await f(),{data:g,error:null}}catch(g){return console.error("Error updating trip:",g),{data:null,error:g.message}}};return{trips:u,loading:h,error:x,refresh:f,createTrip:m,updateTrip:b,deleteTrip:async s=>{try{const{error:c}=await A.from("trips").delete().eq("id",s);if(c)throw c;return await f(),{error:null}}catch(c){return console.error("Error deleting trip:",c),{error:c.message}}},publishTrip:async s=>b(s,{status:"active"})}}function be(e){const[u,n]=l.useState([]),[h,p]=l.useState(!1),[x,y]=l.useState(null);return{trips:u,loading:h,error:x,searchTrips:async()=>{try{p(!0),y(null);const m=await Z.discover("carpool",{from:e.from,to:e.to,date:e.departureDate,seats:e.seats||1});if(!m.success)throw new Error(m.error||"Search failed");n(m.data||[])}catch(m){console.error("Error searching trips:",m),y(m.message),n([])}finally{p(!1)}}}}export{xe as M,oe as N,be as a,ve as u};
