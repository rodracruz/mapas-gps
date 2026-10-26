import test from 'node:test';
import assert from 'node:assert/strict';
const api=await import('../rider/exports.mjs').catch(()=>({}));
const gpx=options=>{assert.equal(typeof api.buildGpx,'function');return api.buildGpx(options);};
const meetup=()=>({id:'ride-1',title:'Ride, friends; join\\us\nToday',parkId:'park',meetingPoint:'Gate, A',startAt:'2026-10-26T10:00:00-03:00',notes:'Bring water\nSee you',timezone:'America/Santiago'});
test('GPX escapes text, preserves point order and exports disconnected ways as separate segments',()=>{
 const text=gpx({name:'A < B & "C"',description:'a > b & c',segments:[[{longitude:-70,latitude:-33,timestamp:0},{longitude:-70.1,latitude:-33.1}], [{longitude:-71,latitude:-34}]]});
 assert.match(text,/xmlns="http:\/\/www.topografix.com\/GPX\/1\/1"/);assert.match(text,/version="1.1"/);assert.match(text,/A &lt; B &amp; &quot;C&quot;/);assert.match(text,/a &gt; b &amp; c/);
 assert.equal((text.match(/<trkseg>/g)||[]).length,2);assert.equal((text.match(/<trkpt /g)||[]).length,3);assert.match(text,/<time>1970-01-01T00:00:00.000Z<\/time>/);
 assert.ok(text.indexOf('lon="-70"')<text.indexOf('lon="-70.1"'));assert.doesNotMatch(text,/<ele>|<rte|<wpt/);
});
test('GPX rejects invalid coordinates, timestamps, text controls and oversized names',()=>{
 assert.equal(typeof api.buildGpx,'function');
 for(const options of [{name:'n',segments:[[{longitude:181,latitude:0}]]},{name:'n',segments:[[{longitude:0,latitude:NaN}]]},{name:'n',segments:[[{longitude:0,latitude:0,timestamp:NaN}]]},{name:'bad\u0000',segments:[]},{name:'x'.repeat(161),segments:[]}])assert.throws(()=>gpx(options),Error);
});
test('calendar exports UTC time, stable safe identity, escaped content and CRLF lines',()=>{
 assert.equal(typeof api.meetupCalendar,'function');const text=api.meetupCalendar(meetup()),lines=text.split('\r\n');
 assert.match(text,/BEGIN:VCALENDAR\r\n/);assert.match(text,/DTSTART:20261026T130000Z/);assert.match(text,/SUMMARY:Ride\\, friends\\; join\\\\us\\nToday/);assert.match(text,/LOCATION:Gate\\, A/);assert.match(text,/DESCRIPTION:Bring water\\nSee you/);assert.match(text,/UID:ride-1@bikeride.local/);
 assert.ok(lines.every(line=>Buffer.byteLength(line)<=75));assert.doesNotMatch(text,/ATTENDEE|ORGANIZER|METHOD:REQUEST/);assert.equal(text.replace(/\r\n/g,'').includes('\n'),false);
});
test('calendar folds unicode by UTF-8 octets and resists line injection',()=>{
 const m={...meetup(),title:'🚲'.repeat(40)+'\r\nATTENDEE:bad',status:'cancelled'};const text=api.meetupCalendar(m);
 assert.ok(text.split('\r\n').every(line=>Buffer.byteLength(line)<=75));assert.match(text,/STATUS:CANCELLED/);assert.doesNotMatch(text,/\r\nATTENDEE:/);assert.ok(text.replace(/\r\n /g,'').includes('🚲'.repeat(40)));
 assert.throws(()=>api.meetupCalendar({...meetup(),startAt:'2026-02-30T10:00:00Z'}));
});
