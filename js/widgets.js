  var porgid = sessionStorage.getItem('vorgid');
  var pdepid = sessionStorage.getItem('vdepid');
  var purl = sessionStorage.getItem('vurl');
  var pdataurl = 'https://api.mypurecloud.' + purl;
	console.log('For chat Org ID is ' + porgid + ' and dep key is ' + pdepid + ' and url is ' + pdataurl);
 window._genesys = {
    "widgets": {
      "webchat": {
        "transport": {
          "type": "purecloud-v2-sockets",
          "dataURL": pdataurl,
          "deploymentKey": pdepid,
          "orgGuid": porgid,
	  "markdown": true,
          "interactionData": {
            "routing": {
              "targetType": "QUEUE",
              "targetAddress": "Chat Queue",
              "priority": 2
            }
          }
        },
      }
    }
  };

  const customPlugin = CXBus.registerPlugin('Custom');
