const alertTemplates = {
  temperature: { type: 'temperature', icon: '♨', title: 'Temperatura fuera de rango', description: 'Temperatura fuera del rango habitual. Se recomienda revisar las condiciones de la colmena.', level: 'attention' },
  humidity: { type: 'humidity', icon: '◌', title: 'Humedad elevada detectada', description: 'Se detectó un aumento de humedad dentro de la colmena. Verifique las condiciones de ventilación.', level: 'attention' },
  weight: { type: 'weight', icon: '⌁', title: 'Variación de peso importante', description: 'Se detectó una variación importante en el peso de la colmena. El cambio podría estar relacionado con actividad de producción, alimentación o condiciones externas.', level: 'info' },
  colony: { type: 'colony', icon: '🐝', title: 'Cambio en el estado de la colonia', description: 'BeeBox detectó un cambio que requiere atención del apicultor.', level: 'attention' },
  critical: { type: 'colony', icon: '!', title: 'Actividad crítica en la colmena', description: 'Se detectó un patrón fuera de los parámetros simulados. Revisa el estado general de la colmena.', level: 'critical' },
  normal: { type: 'colony', icon: '✓', title: 'Colmena en estado normal', description: 'Los indicadores simulados se encuentran dentro de los rangos habituales.', level: 'info' }
};
let alerts = [
  { ...alertTemplates.humidity, id: 1, time: '09:42', read: false },
  { ...alertTemplates.weight, id: 2, time: '08:30', read: false },
  { ...alertTemplates.temperature, id: 3, time: '07:15', read: false },
  { ...alertTemplates.normal, id: 4, time: 'Ayer, 22:10', read: true }
];
let metricState = { temperature: 34.8, humidity: 61, weight: 42.6 };
let currentFilter = 'all';
const $ = (id) => document.getElementById(id);
const levelLabels = { info: 'Información', attention: 'Atención', critical: 'Crítica' };
const levelClasses = { info: 'badge-info', attention: 'badge-attention', critical: 'badge-critical' };
const nowTime = () => new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

function renderAlerts() {
  const visible = alerts.filter((alert) => currentFilter === 'all' || alert.type === currentFilter);
  $('alertsList').innerHTML = visible.length ? visible.map((alert) => `
    <article class="alert-row ${alert.type} ${alert.read ? 'read' : 'unread'}">
      <div class="alert-type-icon">${alert.icon}</div>
      <div class="alert-row-content"><h3>${alert.title}</h3><p>${alert.description}</p></div>
      <time class="alert-time">${alert.time}</time>
      <span class="alert-badge ${levelClasses[alert.level]}">${levelLabels[alert.level]}</span>
      <div class="alert-actions"><button class="row-action" type="button" title="${alert.read ? 'Marcar como no leída' : 'Marcar como leída'}" onclick="toggleRead(${alert.id})">${alert.read ? '◉' : '○'}</button><button class="row-action" type="button" title="Eliminar alerta" onclick="removeAlert(${alert.id})">×</button></div>
    </article>`).join('') : '<div class="empty-state">No hay alertas de este tipo.</div>';
  const active = alerts.filter((alert) => !alert.read).length;
  $('activeAlerts').textContent = active;
  $('navAlertCount').textContent = active;
}
function renderActivity() {
  const recent = alerts.slice(0, 3);
  $('activityList').innerHTML = recent.map((alert) => `<div class="activity-item"><i class="activity-dot ${alert.type === 'temperature' ? 'yellow' : alert.type === 'humidity' ? 'blue' : 'green'}"></i><div><strong>${alert.title}</strong><p>${alert.description.slice(0, 54)}...</p></div><time>${alert.time}</time></div>`).join('');
}
function updateMetrics() {
  metricState.temperature = +(metricState.temperature + (Math.random() - .47) * .35).toFixed(1);
  metricState.humidity = Math.max(48, Math.min(76, Math.round(metricState.humidity + (Math.random() - .5) * 3)));
  metricState.weight = +(metricState.weight + (Math.random() - .42) * .12).toFixed(1);
  $('temperatureValue').textContent = metricState.temperature.toFixed(1);
  $('humidityValue').textContent = metricState.humidity;
  $('weightValue').textContent = metricState.weight.toFixed(1);
  $('lastUpdate').textContent = new Date().toLocaleTimeString('es-ES');
}
function showToast(title, message) {
  $('toastTitle').textContent = title;
  $('toastMessage').textContent = message;
  $('toast').classList.add('show');
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => $('toast').classList.remove('show'), 4200);
}
function simulate(kind) {
  const template = alertTemplates[kind];
  const id = Date.now();
  alerts.unshift({ ...template, id, time: nowTime(), read: false });
  if (kind === 'temperature' || kind === 'critical') metricState.temperature = +(metricState.temperature + 1.1).toFixed(1);
  if (kind === 'humidity') metricState.humidity = Math.min(82, metricState.humidity + 7);
  if (kind === 'weight') metricState.weight = +(metricState.weight + 1.4).toFixed(1);
  if (kind === 'normal') { $('colonyState').textContent = 'Normal'; $('colonyMessage').textContent = 'La colmena se encuentra estable y activa.'; $('confidence').textContent = '96%'; $('confidenceBar').style.width = '96%'; }
  else if (kind === 'critical') { $('colonyState').textContent = 'Alerta'; $('colonyMessage').textContent = 'Se requiere atención del apicultor.'; $('confidence').textContent = '62%'; $('confidenceBar').style.width = '62%'; }
  else { $('colonyState').textContent = 'Atención'; $('colonyMessage').textContent = 'Se detectó una variación en los indicadores.'; $('confidence').textContent = '84%'; $('confidenceBar').style.width = '84%'; }
  updateMetrics(); renderAlerts(); renderActivity(); showToast(template.title, 'La alerta fue agregada al centro de notificaciones.');
}
function toggleRead(id) { const alert = alerts.find((item) => item.id === id); if (alert) alert.read = !alert.read; renderAlerts(); }
function removeAlert(id) { alerts = alerts.filter((item) => item.id !== id); renderAlerts(); renderActivity(); }

$('alertFilter').addEventListener('change', (event) => { currentFilter = event.target.value; renderAlerts(); });
$('readAll').addEventListener('click', () => { alerts.forEach((alert) => { alert.read = true; }); renderAlerts(); showToast('Alertas actualizadas', 'Todas las alertas fueron marcadas como leídas.'); });
$('closeToast').addEventListener('click', () => $('toast').classList.remove('show'));
renderAlerts(); renderActivity(); updateMetrics();
setInterval(updateMetrics, 7000);
setInterval(() => { $('lastUpdate').textContent = new Date().toLocaleTimeString('es-ES'); }, 1000);
