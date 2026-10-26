import {defaultRiderState,validateRiderState} from './store.mjs';

function xmlText(value,limit) {
  if(typeof value!=='string' || value.length>limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/u.test(value) || /[\uD800-\uDFFF]/u.test(value))throw new TypeError('Invalid GPX text');
  return value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));
}
export function buildGpx({name,segments,description=''}={}) {
  const title=xmlText(name,160),desc=xmlText(description,4000);
  if(!Array.isArray(segments))throw new TypeError('GPX segments must be an array');
  const tracks=Array.from(segments,segment=>{
    if(!Array.isArray(segment))throw new TypeError('Invalid GPX segment');
    return '<trkseg>'+Array.from(segment,point=>{
      if(!point || !Number.isFinite(point.longitude) || Math.abs(point.longitude)>180 || !Number.isFinite(point.latitude) || Math.abs(point.latitude)>90)throw new TypeError('Invalid GPX coordinate');
      let time='';
      if(point.timestamp!==undefined) {
        if(!Number.isSafeInteger(point.timestamp) || point.timestamp<0 || point.timestamp>8640000000000000)throw new TypeError('Invalid GPX timestamp');
        time=`<time>${new Date(point.timestamp).toISOString()}</time>`;
      }
      return `<trkpt lat="${point.latitude}" lon="${point.longitude}">${time}</trkpt>`;
    }).join('')+'</trkseg>';
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="bikeride" xmlns="http://www.topografix.com/GPX/1/1"><metadata><name>${title}</name><desc>${desc}</desc></metadata><trk><name>${title}</name><desc>${desc}</desc>${tracks}</trk></gpx>\n`;
}
const calendarText=value=>value.replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
const calendarDate=value=>new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
function fold(line) {
  const encoder=new TextEncoder();let current='',bytes=0;const lines=[];
  for(const char of line) {
    const length=encoder.encode(char).length;
    if(bytes+length>75) {lines.push(current);current=' ';bytes=1;}
    current+=char;bytes+=length;
  }
  lines.push(current);return lines.join('\r\n');
}
export function meetupCalendar(meetup) {
  const state=defaultRiderState();state.meetups=[meetup];
  const item=validateRiderState(state).meetups[0],start=calendarDate(item.startAt);
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//bikeride//Local rides//ES','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${item.id}@bikeride.local`,`DTSTAMP:${start}`,`DTSTART:${start}`,`SUMMARY:${calendarText(item.title)}`,`LOCATION:${calendarText(item.meetingPoint)}`,`DESCRIPTION:${calendarText(item.notes)}`,`STATUS:${item.status==='cancelled'?'CANCELLED':'CONFIRMED'}`,'END:VEVENT','END:VCALENDAR'].map(fold).join('\r\n')+'\r\n';
}
