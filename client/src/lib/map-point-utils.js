import { createParkingDetailPath } from '@/lib/parking-detail-data';

export function pointTooltipHtml(label, sublabel) {
  return `<div style="font-family:sans-serif;min-width:120px">
    <strong style="font-size:13px">${label}</strong>
    ${sublabel ? `<br/><span style="font-size:11px;color:#666">${sublabel}</span>` : ''}
  </div>`;
}

export function isParkingPoint(label, sublabel) {
  return /parking/i.test(`${label || ''} ${sublabel || ''}`);
}

export function attachPointInteractions(marker, { label, sublabel, setLocation }) {
  marker.bindTooltip(pointTooltipHtml(label, sublabel), { direction: 'top', sticky: true });

  if (isParkingPoint(label, sublabel)) {
    marker.on('click', () => setLocation(createParkingDetailPath(label)));
  }

  return marker;
}
