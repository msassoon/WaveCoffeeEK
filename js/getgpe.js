  
var purl = sessionStorage.getItem('vurl');
var porgid = sessionStorage.getItem('vorgid');
var pregion = sessionStorage.getItem('vregion');
console.log('Value of purl is ' + purl + ' porgid is ' + porgid + ' pregion is ' + pregion);

(function(a,t,c,l,o,u,d){a['_genesysJourneySdk']=o;a[o]=a[o]||function(){
  (a[o].q=a[o].q||[]).push(arguments)},a[o].l=1*new Date();u=t.createElement(c),
  d=t.getElementsByTagName(c)[0];u.async=1;u.src=l;u.charset='utf-8';d.parentNode.insertBefore(u,d)
  })(window, document, 'script', 'https://apps.mypurecloud.' + purl + '/journey/sdk/js/web/v1/ac.js', 'ac');
  ac('init', porgid, { region: pregion });
  ac('pageview');
  ac('load', 'autotrackIdle', {
  idleEvents: [ { eventName: 'idle_for_30_sec', idleAfter: 30 } ] });
