import {defaultRiderState,validateRiderState} from './store.mjs';

const radians=Math.PI/180;
function distance(a,b) {
  const lat=(b.latitude-a.latitude)*radians,lon=(b.longitude-a.longitude)*radians;
  const h=Math.sin(lat/2)**2+Math.cos(a.latitude*radians)*Math.cos(b.latitude*radians)*Math.sin(lon/2)**2;
  return 6371008.8*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,h))));
}
function validTime(time) {return Number.isSafeInteger(time) && time>=0 && time<=8640000000000000;}
function validFix(fix) {
  return fix && typeof fix==='object' && Number.isFinite(fix.longitude) && Math.abs(fix.longitude)<=180 &&
    Number.isFinite(fix.latitude) && Math.abs(fix.latitude)<=90 && Number.isFinite(fix.accuracy) && fix.accuracy>=0 && fix.accuracy<=45 && validTime(fix.timestamp) &&
    (fix.speed===undefined || fix.speed===null || (Number.isFinite(fix.speed) && fix.speed>=0));
}

export function createRideRecorder({now=Date.now}={}) {
  if(typeof now!=='function')throw new TypeError('A clock function is required');
  let ride=null,activeSince=null,elapsed=0,lastCommand=0,lastFixTime=-Infinity,previous=null,anchor=null,broken=true;
  function checkTime(time) {
    if(!ride)throw new Error('No ride has started');
    if(!validTime(time) || time<lastCommand)throw new TypeError('Invalid or backwards ride time');
    return time;
  }
  function snapshot(time=now()) {
    checkTime(time);
    const durationMs=elapsed+(activeSince===null?0:time-activeSince);
    return {...ride,durationMs,segments:ride.segments.map(segment=>segment.map(point=>({...point})))};
  }
  function breakSegment() {broken=true;previous=null;anchor=null;}
  return {
    start({id,parkId,bikeId=null}={},time=now()) {
      if(ride)throw new Error('A ride has already started');
      if(!validTime(time))throw new TypeError('Invalid start time');
      const state=defaultRiderState();
      state.activities=[{id,parkId,bikeId,startedAt:time,endedAt:null,durationMs:0,distanceM:0,maxSpeedMps:null,status:'recording',segments:[]}];
      ride=validateRiderState(state).activities[0];activeSince=time;lastCommand=time;
      return snapshot(time);
    },
    ingest(fix) {
      if(!ride || ride.status!=='recording')return false;
      const clock=now();
      if(!validTime(clock) || !validFix(fix) || fix.timestamp<ride.startedAt || fix.timestamp<lastCommand || clock-fix.timestamp>10000 || fix.timestamp-clock>5000 || fix.timestamp<=lastFixTime) {breakSegment();return false;}
      const gap=previous && fix.timestamp-previous.timestamp>30000;
      if(previous && !gap && distance(previous,fix)/((fix.timestamp-previous.timestamp)/1000)>25) {breakSegment();return false;}
      const point={longitude:fix.longitude,latitude:fix.latitude,accuracy:fix.accuracy,timestamp:fix.timestamp,speed:fix.speed??null};
      if(broken || gap) {ride.segments.push([]);anchor=point;}
      else {
        const step=distance(anchor,point),threshold=Math.max(3,Math.min(previous.accuracy,point.accuracy)*.5);
        if(step>=threshold) {
          ride.distanceM+=step;
          const speed=step/((point.timestamp-anchor.timestamp)/1000);
          ride.maxSpeedMps=Math.max(ride.maxSpeedMps??0,speed);
          anchor=point;
        }
      }
      ride.segments.at(-1).push(point);previous=point;lastFixTime=point.timestamp;broken=false;
      return true;
    },
    pause(time=now()) {
      checkTime(time);
      if(ride.status!=='recording')throw new Error('Only a recording ride can be paused');
      elapsed+=time-activeSince;activeSince=null;ride.status='paused';lastCommand=time;breakSegment();return snapshot(time);
    },
    resume(time=now()) {
      checkTime(time);
      if(ride.status!=='paused')throw new Error('Only a paused ride can be resumed');
      activeSince=time;ride.status='recording';lastCommand=time;breakSegment();return snapshot(time);
    },
    snapshot,
    finish(time=now(),status='finished') {
      checkTime(time);
      if(!['finished','interrupted'].includes(status))throw new TypeError('Invalid final ride status');
      if(!['recording','paused'].includes(ride.status))throw new Error('The ride has already ended');
      if(lastFixTime>time+5000)throw new TypeError('Final ride time precedes the accepted trace');
      if(activeSince!==null)elapsed+=time-activeSince;
      activeSince=null;ride.status=status;ride.endedAt=time;lastCommand=time;breakSegment();return snapshot(time);
    }
  };
}
