<script setup>
// Reference centres map: Leaflet + standard OpenStreetMap tiles, no API key needed.
import { onMounted, onBeforeUnmount, ref } from "vue";
import "leaflet/dist/leaflet.css";

const { data: laboratories } = await useAsyncData("laboratories-map", () =>
  queryCollection("laboratories").all()
);

const mapEl = ref(null);
const count = ref(0);
let map = null;

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

onMounted(async () => {
  const L = (await import("leaflet")).default;

  const centres = (laboratories.value || [])
    .map((x) => ({
      name: x.name || x.title || "",
      city: x.city || "",
      country: x.country || "",
      lat: parseFloat(x.lat),
      lng: parseFloat(x.lng),
    }))
    .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng));
  count.value = centres.length;

  map = L.map(mapEl.value, {
    scrollWheelZoom: false, // avoid hijacking page scroll; enabled after a click on the map
    worldCopyJump: true,
    zoomSnap: 0.25, // tighter fit around the centres
  });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const markers = centres.map((c) =>
    L.circleMarker([c.lat, c.lng], {
      radius: 8,
      color: "#ffffff",
      weight: 2,
      fillColor: "#2563eb",
      fillOpacity: 0.9,
    })
      .bindPopup(
        `<strong>${escapeHtml(c.name)}</strong><br><span style="color:#64748b">${escapeHtml(
          [c.city, c.country].filter(Boolean).join(", ")
        )}</span>`
      )
      .bindTooltip(escapeHtml(c.name), { direction: "top", offset: [0, -6] })
      .addTo(map)
  );

  // Most centres are in Europe (+ a few partners elsewhere): open on Europe, offer a world view
  const inEurope = (c) => c.lat > 30 && c.lat < 72 && c.lng > -25 && c.lng < 45;
  const euroMarkers = markers.filter((_, i) => inEurope(centres[i]));
  const fit = (list) => {
    if (list.length) map.fitBounds(L.featureGroup(list).getBounds().pad(0.1), { maxZoom: 6 });
    else map.setView([48.8, 10], 4);
  };
  fit(euroMarkers.length ? euroMarkers : markers);

  if (euroMarkers.length && euroMarkers.length < markers.length) {
    const ViewControl = L.Control.extend({
      options: { position: "topright" },
      onAdd() {
        const box = L.DomUtil.create("div", "leaflet-bar leishman-views");
        const add = (label, list) => {
          const a = L.DomUtil.create("a", "", box);
          a.href = "#";
          a.role = "button";
          a.textContent = label;
          L.DomEvent.on(a, "click", (e) => {
            L.DomEvent.preventDefault(e);
            fit(list);
          });
        };
        add("Europe", euroMarkers);
        add(`All ${markers.length} centres`, markers);
        L.DomEvent.disableClickPropagation(box);
        return box;
      },
    });
    map.addControl(new ViewControl());
  }

  map.once("click", () => map.scrollWheelZoom.enable());
});

onBeforeUnmount(() => {
  if (map) map.remove();
});
</script>

<template>
  <div class="overflow-hidden rounded-[22px] border border-white/70 bg-white/80 shadow-lg">
    <div ref="mapEl" class="relative z-0 h-[420px] w-full sm:h-[520px]" role="region" :aria-label="`Map of ${count} reference centres`" />
  </div>
</template>

<style scoped>
:deep(.leaflet-container) {
  font-family: inherit;
  background: #f1f5f9;
}
:deep(.leishman-views a) {
  width: auto;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}
</style>
