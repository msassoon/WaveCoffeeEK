
// Theme demo - window._genesys.widgets.bus.command("App.themeDemo");

console.log('[CXW] init');

var CXW_ENABLED = true;
var _demoHost = DEMO_HOST; // '//core.demo.genesys.com';  //POD.live.genesys.com";
var gweBaseUrl = _demoHost.substr(0,_demoHost.indexOf('.'))+'-gwe'+_demoHost.substr(_demoHost.indexOf('.')); // "https://POD-gwe.live.genesys.com";
var gaapBaseUrl = _demoHost.substr(0,_demoHost.indexOf('.'))+'-gaap'+_demoHost.substr(_demoHost.indexOf('.')) + ':8054'; // "https://POD-gaap.live.genesys.com";
var gksBaseUrl = _demoHost.substr(0,_demoHost.indexOf('.'))+'-gkcsrv'+_demoHost.substr(_demoHost.indexOf('.')); // "https://POD-gkcsrv.live.genesys.com";
var vidyoBaseUrl = _demoHost.substr(0,_demoHost.indexOf('.'))+'-vidyo'+_demoHost.substr(_demoHost.indexOf('.'));  // "https://POD-vidyo.live.genesys.com";
var cobrowseBaseUrl = _demoHost.substr(0,_demoHost.indexOf('.'))+'-cobrowse'+_demoHost.substr(_demoHost.indexOf('.')); // "https://POD-cobrowse.live.genesys.com";
var VIDYO_FILES = "//core.demo.genesys.com/vidyo";
var STR_WIDGET_LOCALE = (typeof STR_LOCALE === 'string')? STR_LOCALE: "en-US";  // if taken from *_lan.js file
var oWizard;

var disableWebSockets=false;

var widgetCX = (function(){

    var CXW_THEME = "light";
    var CXW_MESSAGE_BTN = false;
    var CXW_CHAT_BTN = false;
    var CXW_GKC_ENABLED = false;
    var CXW_IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    var cx_converter = new showdown.Converter();

    var DEFAULT_SERVICE = "customer-support";
    var CHATBOT_SERVICE = "bot";
    var CHAT_URL = genWeb.gmsServer + "/2/chat/";

    var isPlugCallback = true;
    var isPlugCallUs = true;
    var isPlugChat = true;
    var isPlugEmail = true;
    var isPlugVideo = true;
    var isPlugSearch = true;
    var isChatDeflection = true;
    var isShowCobrowse = true;

    var emailSubj, cbSubj;

    var oWCC = null;
    var oPublished = {};
    var gweCfg = {};
    var videoData = {};
    var oChatConfig = {
        //transport:  "gms",
        dataURL:    CHAT_URL + DEFAULT_SERVICE,
        userData: {},
        emojis: true,
        actionsMenu: true,
        proactive: {
            enabled: false, // enable or disable
            idleTimer: 10,   // number of seconds of idle time before showing invite
            cancelTimer: 30 // number of seconds before invite auto-closes
        },
        cometD: {

            enabled: false,
            //cometURL: '/cometd',
            channel: '/service/chatV2/customer-support',
            //apiURL: genMobile.gmsServer + '/2/chat-ntf',
            websocketEnabled: true,
            logLevel: 'debug'
        },
        chatButton: {

            enabled: CXW_ENABLED && CXW_CHAT_BTN,
            template: false,
            template: '<div>CHAT NOW</div>',
            openDelay: 100,
            effectDuration: 200,
            hideDuringInvite: true
        },
        uploadsEnabled: DEMO_HOST !== '//core.demo.genesys.com'
    };

    if(!window._genesys){
        window._genesys = {widgets: {}};
    }

    var _initCfg = function(){
        _demoHost = DEMO_HOST; // '//core.demo.genesys.com';  //POD.live.genesys.com";
        gweBaseUrl = _demoHost.substr(0,_demoHost.indexOf('.'))+'-gwe'+_demoHost.substr(_demoHost.indexOf('.')); // "https://POD-gwe.live.genesys.com";
        gaapBaseUrl = _demoHost.substr(0,_demoHost.indexOf('.'))+'-gaap'+_demoHost.substr(_demoHost.indexOf('.')) + ':8054'; // "https://POD-gaap.live.genesys.com";
        gksBaseUrl = _demoHost.substr(0,_demoHost.indexOf('.'))+'-gkcsrv'+_demoHost.substr(_demoHost.indexOf('.')); // "https://POD-gkcsrv.live.genesys.com";
        vidyoBaseUrl = _demoHost.substr(0,_demoHost.indexOf('.'))+'-vidyo'+_demoHost.substr(_demoHost.indexOf('.'));  // "https://POD-vidyo.live.genesys.com";
        cobrowseBaseUrl = _demoHost.substr(0,_demoHost.indexOf('.'))+'-cobrowse'+_demoHost.substr(_demoHost.indexOf('.')); // "https://POD-cobrowse.live.genesys.com";

        // chat url
        CHAT_URL = genWeb.gmsServer + "/2/chat/";
        oChatConfig.dataURL =  CHAT_URL + DEFAULT_SERVICE;
        oChatConfig.cometD.cometURL = genWeb.gmsServer + '/cometd';
        oChatConfig.cometD.apiURL = genWeb.gmsServer + '/2/chat-ntf';

        // cfg vidyo host
        _gv.config = {
            serverUrl : vidyoBaseUrl + "/VidyoServer",
            debug:true
        };

        // Theming
        if (genWeb.customMenu && genWeb.customMenu["_widget_"] && genWeb.customMenu["_widget_"]["custom-data"]) {
            var cData = genWeb.customMenu["_widget_"]["custom-data"];
            CXW_THEME = cData["_$_theme"] || CXW_THEME;
            if (CXW_THEME == "custom" && cData["_$_color"]) {
                var sheet = document.createElement('style')
                sheet.innerHTML = ".cx-widget.cx-theme-custom .cx-svg-icon-tone1, .cx-widget.cx-theme-custom .cx-svg-icon-tone2 {fill:"+cData["_$_color"]+"} ";
                sheet.innerHTML += ".cx-widget.cx-theme-custom .cx-btn-primary {background:"+cData["_$_color"]+"} ";
                sheet.innerHTML += ".cx-widget.cx-theme-custom *, .cx-widget.cx-theme-custom *:focus, .cx-widget.cx-theme-custom *:hover {border-color:"+cData["_$_color"]+"} ";
                document.body.appendChild(sheet);
            }

            // Channels selection
            isPlugCallback = cData["_$_show_callback"] !== 'false';
            isPlugCallUs = cData["_$_show_callus"] !== 'false';
            isPlugChat = cData["_$_show_chat"] !== 'false';
            isPlugEmail = cData["_$_show_email"] !== 'false';
            isPlugVideo = cData["_$_show_video"] !== 'false';
            isPlugSearch = cData["_$_show_search"] !== 'false';
            isChatDeflection = cData["_$_deflection"] !== 'false';
            isShowCobrowse = cData["_$_show_cobrowse"] !== 'false';
        }

        // cfg widgets
        window._genesys.widgets = {
            main: {
                plugins: [
                    "cx-sidebar",
                    "cx-channel-selector",
                    "cx-webchat",
                    "cx-webchat-service",
                    "cx-send-message",
                    "cx-send-message-service",
                    "cx-gwe",
                    "cx-cobrowse",
                    "cx-calendar",
                    // isPlugSearch? "cx-search": "cx-skip",
                    "cx-knowledge-center-service",
                    "cx-chat-deflection",
                    "cx-callback-service",
                    "cx-stats-service",
                    "cx-callback",
                    "cx-overlay",
                    //"cx-offers",
                    //"cx-preferences",
                    //"cx-console",
                    "cx-call-us"
                ],
                mobileMode: "auto",
                mobileModeBreakpoint: 600,
                theme: CXW_THEME,
                themes: {
                    genesys: 'cx-theme-genesys',
                    green: 'cx-theme-green',
                    brown: 'cx-theme-brown',
                    gold: 'cx-theme-gold',
                    red: 'cx-theme-red',
                    blue: 'cx-theme-blue',
                    cyan: 'cx-theme-cyan',
                    purple: 'cx-theme-purple',
                    black: 'cx-theme-black',
                    custom: 'cx-theme-custom'
                },
                lang: STR_WIDGET_LOCALE,
                i18n: cxw_i18n, // GDEMO_PORTAL + '/gdemo_mobile/web/v2/cxw/i18n/' + STR_WIDGET_LOCALE + '.json',  //cxw_i18n,
                debug: true
            },
            sidebar: {
                showOnStartup: false,
                position: 'right',
                expandOnHover: true,
                channels: [{

                        name: 'ChannelSelector', 
                        clickCommand: 'ChannelSelector.open', 
                        readyEvent: 'ChannelSelector.ready', 
                        clickOptions: {}, 

                         //use your own static string or i18n query string for the below two display properties
                        displayName: '@i18n:channelselector.Title', 
                        displayTitle: '@i18n:channelselector.SubTitle',
                        icon: 'agent'
                    }
                ]
            },
            gwe: {
                debug : true,
                httpEndpoint: gweBaseUrl,
                httpsEndpoint: gweBaseUrl,
                dslResource: gweBaseUrl + "/frontend/resources/dsl/domain-model.xml",
                disableWebSockets: disableWebSockets
            },
            cobrowse: {
                src: cobrowseBaseUrl + "/cobrowse/js/gcb.min.js",
                url: cobrowseBaseUrl + "/cobrowse"
            },

            callback: {
                dataURL: genWeb.gmsServer + '/1/service/callback/CallbackV2_VQ', // + ((genWeb.customer["CfgType"] == 'gdemo')? 'gbank-callback-gms': 'CallbackV2_VQ'),
                //dataURL: _demoHost + '/podproxy/GmeCallbackProxy'+'?http://localhost:8010/genesys/1/service/callback/CallbackV2_VQ',
                callDirection: 'USERTERMINATED',
                //formValidation: false,
                userData: {
                    FirstName: genWeb.customer["c_first_name"],
                    LastName: genWeb.customer["c_last_name"],
                    first_name: genWeb.customer["c_first_name"],
                    last_name: genWeb.customer["c_last_name"],
                    email: genWeb.customer["c_email"],
                    _customer_number: genWeb.phoneNumber,
                    _phone_number: genWeb.phoneNumber,
                    PFS_id: genWeb.phoneNumber,
                    //_callback_phone_number: genWeb.phoneNumber,
                    _customername: genWeb.customer["c_first_name"] + ' ' + genWeb.customer["c_last_name"],
                    //_callback: 'true',
                    _xtemplate: 'gbank',
                    _app_name: 'Genesys',
                    Config_Type: genWeb.customer["CfgType"],
                    subject: "GBank Callback",
                    //waitForAgent: 'true',
                    //waitForUserConfirm: 'false',
                    _target: (genWeb.customer["CfgType"] == 'gdemo')? '"' + genWeb.phoneNumber + '">0': '?:Customer_Service >=1',
                    Base_Url: _demoHost,
                    //call_direction: 'USERTERMINATED',
                    //_wait_for_agent: true,
                    //_wait_for_user_confirm: false,
                    mediaType: 'voice'
                },
                countryCodes: false
                //apikey : "m6gLKXREBMOK8VAlygOHHLLn3eNkgYjG"
            },
            calendar: {
                showAvailability: true,
                numberOfDays: 5,
                calenderHours: {
                    interval: 10, //min
                    morning: {
                        openTime: '09:00',
                        closeTime: '11:59'
                    },
                    afternoon: {
                        openTime: '12:00',
                        closeTime: '16:59'
                    },
                    evening: {
                        openTime: '17:00',
                        closeTime: '23:59'
                    }
                }
            },
            callus: {
                contacts: [
                    {
                        displayName: "Contact info",
                        i18n: "Number001",
                        number: ""
                    },
                    {
                        displayName: "USA",
                        i18n: "Number001",
                        number: genWeb.customer["InboundPhoneNumber"]
                    }
                ],
                hours: [
                    (typeof STR_hours_1 == "undefined")? "8am - 8pm Mon - Fri": STR_hours_1,
                    (typeof STR_hours_2 == "undefined")? "8am - 8pm Mon - Fri": STR_hours_2
                ]
            },
            knowledgecenter: {
                host: gksBaseUrl+'/gks-server/v1',
                knowledgebases: [gkcModule.kcGetDb()],
                lang: 'en',
                media: '',
                maxTrendingResults: 5,
                maxSearchResults: 3,
                apiClientId: 'webWizard',
                apiClientMediaType: 'selfserviceWizard',

                deflection: {
                    enabled: isChatDeflection,
                    maxRephrased: -1,
                    agentTranscript: 'readable',
                    customerIdToken: 'email' // firstname | lastname | email
                }
            },
            webchat: oChatConfig,
            sendmessage: {
                dataURL: genWeb.gmsServer + "/2/email",
                apikey: "",
                SendMessageButton: {
                    enabled: CXW_ENABLED && CXW_MESSAGE_BTN
                }
            },
            speechstorm: {
                baseURL: gaapBaseUrl
            },
            onReady: function(oCXBus){

                console.log('[CXW] Widget bus has been initialized!');

                widgetCX.setoWCC(oCXBus);

                webDemo.stateSpecificCheck();   // check if to popup state specific prompt
                webDemo.windgetDataSetup();     // to init the first page data

                // chat messages preprocessor
                oWCC.command("WebChatService.registerPreProcessor", {preprocessor: function(oMessage){

                    // Receive each chat message JSON as "oMessage"
                    // Modify oMessage https://genesys.api.vidyocloud.com/flex.html?roomdirect.html&key=P1TvDysakk

                    if (oMessage.text && (oMessage.text.indexOf("Message:https://genesys.api.vidyocloud.com") == 0 ||
                        oMessage.text.indexOf("Message:http://Genesys.sandboxga.vidyo.com") == 0)) {
                        oMessage.html = true;
                        var ref = oMessage.text.substr(43);
                        if (! CXW_IS_MOBILE && oMessage.text.indexOf("Message:https://genesys.api.vidyocloud.com") == 0) {
                            oMessage.text = 'Please press button to start video:<br><br><button type="button" class="cx-btn cx-btn-primary i18n" onclick="widgetCX.startVidyo(&quot;' + ref + '&quot;);">Start video</button>';
                        }
                        else if(! CXW_IS_MOBILE) { // sandbox portal
                            oMessage.text = 'Please press button to start video:<br><br><button type="button" class="cx-btn cx-btn-primary i18n" onclick="widgetCX.startVidyoSandbox(&quot;' + ref + '&quot;);">Start video</button>';
                        }
                        else if(CXW_IS_MOBILE) {
                            oMessage.text = '***Video is not supported in mobile device browsers***';
                            oMessage.html = true;
                            oMessage.text = cx_converter.makeHtml(oMessage.text);
                        }
                    }
                    else if(oMessage.type == "PushUrl" && oMessage.from.type == "Agent" && oMessage.text) {
                        window.open(oMessage.text, "_blank");
                    }
                    else if(oMessage.text == "Message:EndVidyoRequest") {
                        oMessage.text = 'Video session is closed';
                    }
                    else if(oMessage.from.type == 'Agent' && oMessage.text) {
                        oMessage.html = true;
                        oMessage.text = cx_converter.makeHtml(oMessage.text);
                    }

                    //console.log(JSON.stringify(oMessage, null, 4));

                    // Return it back to webchat
                    return oMessage;
                }
                });

                // Sidebar localization (officially not supported)
                /*oWCC.subscribe("SideBar.opened", function(){
                    try{
                        $("div.cx-sidebar-button.ChannelSelector > div.name").text(cxw_i18n[STR_WIDGET_LOCALE].channelselector.Title);
                        $("div.cx-sidebar-button.Search > div.name").text(cxw_i18n[STR_WIDGET_LOCALE].search.SidebarButton);
                    }
                    catch(e){}
                });
                */

                // prefilling
                oWCC.subscribe("Callback.opened", function(){
                    _setFooter();
                    _prefillForm();
                    //_sidebarHide();
                });

                oWCC.subscribe("WebChat.opened", function(){
                    _setFooter();
                    _prefillForm();
                    //_sidebarHide();
                    //if (location.href.indexOf('carLoanResult') > 0) oWCC.command("ChatDeflection.disable");
                    //else oWCC.command("ChatDeflection.enable");
                });

                oWCC.subscribe("SendMessage.opened", function(){
                    _setFooter();
                    _prefillForm();
                    //_sidebarHide();
                });

                console.log('[CXW] The plugin is registered');

            }  // end of onReady()
        };

        if (isPlugSearch) {
            window._genesys.widgets.main.plugins.push("cx-search"); 
            window._genesys.widgets.sidebar.channels.push(
                {
                    name: 'Search', 
                    clickCommand: 'Search.open', 
                    clickOptions: {}, 
                    readyEvent: 'Search.ready', 

                     // Example of i18n query string: '@i18n:search.SearchName' where 'search' refers to the plugin namepsace and 'SearchName' refers to the property key containing the actual text.

                    displayName: '@i18n:search.SidebarButton', 
                    displayTitle: '@i18n:search.Title', 

                    icon: 'knowledge-center', 
                    onClick: function ($, CXBus, Common) {
                         _genesys.widgets.bus.command('Search.open');
                    } 
                }
            );
        }

        // Stats
        window._genesys.widgets.stats = {
            ajaxTimeout: 3000,
            ewt: {
                dataURL: genWeb.gmsServer + "/1/service/ewt-for-vq"
                //apikey: 'n3eNkgLLgLKXREBMYjGm6lygOHHOK8VA'
            }
        };

        /*window._genesys.cxwidget.sidebar =  {
         autoOpen: false
         };*/

        // Live person
        window._genesys.widgets.channelselector = {
            ewtRefreshInterval: 10,
            channels: []
        };

        if (isPlugCallback) {  // Callback
            window._genesys.widgets.channelselector.channels.push(
                {
                    enable: true,
                    clickCommand: 'Wizard.openCallback',
                    readyEvent: 'Callback.ready',
                    displayName: 'Receive a Call',
                    i18n: 'CallbackTitle',
                    icon: 'call-incoming',
                    html: '',
                    ewt: {
                        display: true,
                        queue: 'Inbound_Mobile',
                        availabilityThresholdMin: 60,
                        availabilityThresholdMax: 99999,
                        hideChannelWhenThresholdMax: false
                    }
                }
            );
        }
        if (isPlugChat) {  // Chat
            window._genesys.widgets.channelselector.channels.push(
                {
                    enable: true,
                    clickCommand: 'Wizard.openChat',
                    readyEvent: 'WebChat.ready',
                    displayName: 'Web Chat',
                    i18n: 'ChatTitle',
                    icon: 'chat',
                    ewt: {
                        display: true,
                        queue: 'Omnichannel',
                        availabilityThresholdMin: 90,
                        availabilityThresholdMax: 99999,
                        hideChannelWhenThresholdMax: false
                    }
                }
            );
        }
        if (isPlugEmail) {  // Email
            window._genesys.widgets.channelselector.channels.push(
                {
                    enable: true,
                    clickCommand: 'Wizard.openEmail',
                    readyEvent: 'SendMessage.ready',
                    displayName: 'Send Message',
                    i18n: 'EmailTitle',
                    icon: 'email',
                    ewt: {
                        display: false,
                        queue: 'Omnichannel0',
                        availabilityThresholdMin: 3000,
                        availabilityThresholdMax: 99999,
                        hideChannelWhenThresholdMax: false
                    }
                }
            );
        }
        if (isPlugCallUs) {  // Call Us
            window._genesys.widgets.channelselector.channels.push(
                {
                    enable: true,
                    clickCommand: 'Wizard.openCallUs',
                    readyEvent: 'CallUs.ready',
                    displayName: 'Call Us',
                    i18n: 'CallusTitle',
                    icon: 'call-outgoing',
                    ewt: {
                        display: true,
                        queue: 'Inbound_Mobile',
                        availabilityThresholdMin: 90,
                        availabilityThresholdMax: 99999,
                        hideChannelWhenThresholdMax: false
                    }
                }
            );
        }
        if (isPlugVideo && !CXW_IS_MOBILE) {  // vidyo only for desktops
            window._genesys.widgets.channelselector.channels.push(
                {
                    enable: true,
                    clickCommand: 'Vidyo.open',
                    readyEvent: 'Vidyo.ready',
                    displayName: 'Video Chat',
                    i18n: 'VideoTitle',
                    icon: 'videochat',
                    ewt: {
                        display: true,
                        queue: 'Omnichannel',
                        availabilityThresholdMin: 300,
                        availabilityThresholdMax: 99999,
                        hideChannelWhenThresholdMax: false
                    }
                }
            );
        }

        if (isShowCobrowse) {
            window._genesys.widgets.channelselector.channels.push({
                enable: true,
                clickCommand: 'Wizard.openCoBrowse',
                readyEvent: 'CoBrowse.ready',
                displayName: 'Co-browse',
                i18n: 'CobrowseTitle',
                icon: 'cobrowse'
            });
            window._genesys.widgets.main.plugins.push("cx-cobrowse");
        }

        // vidyo extension
        if(!window._genesys.widgets.extensions){
            window._genesys.widgets.extensions = {};
        }

        window._genesys.widgets.extensions["CXSpeechStorm"] = function($, CXBus, Common) {

            'use strict';

            var speechStormPlugin = CXBus.registerPlugin("CXSpeechStorm"),
                isOpen = false,
                isMobileMode = false,
                isReserved = false,
                sTheme = "",
                speechStormOptions = {
                    baseURL : "",
                    domain: window.location.protocol + '//' + window.location.host
                },
                methods = {

                    open: function(e) {

                        var sAppToken = e.data.appToken,
                            sChatMessage = e.data.chatMessage,
                            sChatInteractionID = e.data.chatInteractionID,
                            sChatUserID = e.data.chatUserID,
                            sChatSecureKey = e.data.chatSecureKey;

                        // As we are not going to URL encode this app token
                        // we are adding extra checks for security.
                        var sAppTokenCharWhiteList = /[A-Za-z0-9-_+]/;
                        var bIsAllCharValid = sAppTokenCharWhiteList.test(sAppToken);

                        if (! sAppToken || ! bIsAllCharValid)
                        {
                            e.deferred.reject("The 'appToken' parameter must be passed to calls to the 'open' command.  speechStormPlugin has ignored your command.");
                            return;
                        }
                        
                        
                        //
                        //  Backup in case the configure URL didn't fire
                        //
                        if (window._genesys.widgets.speechstorm)
                        {
                            if (window._genesys.widgets.speechstorm.baseURL)
                            {
                                speechStormOptions.baseURL = window._genesys.widgets.speechstorm.baseURL;
                            }
                            if (window._genesys.widgets.speechstorm.domain)
                            {
                                speechStormOptions.domain = window._genesys.widgets.speechstorm.domain;
                            }
                        }
                        
                        if (! speechStormOptions.baseURL)
                        {
                            speechStormOptions.baseURL = speechStormOptions.domain;
                        }
                         
                        
                        //
                        // note we are not escaping sAppToken here as there is an issue with 
                        // tokens like lwm+p_8- ending up in WebIVRTokenStartServlet in a URL
                        // encoded state, lwm%2Bp_8- as requests can come in from browsers and
                        // the widget framework we just validate this token above with a RegEx.
                        //
                        var sURL = speechStormOptions.baseURL +
                                   '/fish-messaging/go/' +
                                   sAppToken +
                                   '?domain=' + encodeURIComponent(speechStormOptions.domain);
                        
                        if (sChatMessage)
                        {
                            sURL += '&chatMessage=' + encodeURIComponent(sChatMessage) +
                                    '&chatInteractionID=' + encodeURIComponent(sChatInteractionID) +
                                    '&chatSecureKey=' + encodeURIComponent(sChatSecureKey) +
                                    '&chatUserID=' + encodeURIComponent(sChatUserID);
                        }    

                        speechStormPlugin.command("Toaster.open", {
                            type:        "generic",
                            title:        '',
                            body:         '<iframe id="speechstorm_webivr_iframe" style="border:none" width="100%" height="418px" src="' + sURL + '"></iframe>',
                            controls:     'close', 
                            buttons:     {},
                            immutable: false
                        
                        }).done(function(e2) {
                            if (e2.html)
                            {
                                //
                                //  Add our styles to the HTML inside of the toaster
                                //
                                e2.html.addClass('cx-speechstorm');

                                if (isMobileMode) 
                                {
                                    e2.html.addClass("cx-mobile");
                                }
                                
                                //
                                //  When Overlay's X (close) button is clicked we want to close
                                //  down the WebIVR session too.
                                //
                                e2.html.find(".cx-button-close").click(function(){
                                   
                                    speechStormPlugin.command("close");
                                });
                                
                                //
                                //  Tell other components on the bus that we've opened successfully
                                //
                                e.deferred.resolve(); // MO changed this from resolved() to resolve()
                                isOpen = true;
                                speechStormPlugin.publish("opened");
                            }
                        });
                    },
                    
                    
                    

                    close: function(deferred) {

                        var webIVRFrame = document.getElementById('speechstorm_webivr_iframe');

                        if (webIVRFrame)
                        {
                            console.log("Notifying WebIVR that the session has ended.");
                            webIVRFrame.contentWindow.postMessage('speechstorm:hangup', speechStormOptions.baseURL);
                            isOpen = false;
                            speechStormPlugin.command("Toaster.close");                    
                            speechStormPlugin.publish("closed");
                        }
                    },


        //
                    handleWebIVRStatusUpdate: function(msg_p) {

                        console.log("Received message [" + msg_p.data + "] from domain [" + msg_p.origin + "]");

                        var sExpectedOrigin = (speechStormOptions.baseURL ? speechStormOptions.baseURL : speechStormOptions.domain);
                        
                        if (msg_p.origin !== sExpectedOrigin)
                        {
                            console.log("Ignoring message because its origin does not match the expected origin (" + sExpectedOrigin + ").  Message will be ignored.");
                            return;
                        }
                        
                        var MESSAGE_PREFIX = 'microapp:progress:';

                        if (/^microapp:progress:block:/.test(msg_p.data))
                        {
                            var sProgressDetailsDescription = msg_p.data.substring(MESSAGE_PREFIX.length);

                            console.log("Got output progress: " + msg_p.data);
                            speechStormPlugin.publish("progress", { milestone: sProgressDetailsDescription });
        //                    speechStormPlugin.command("sendSecretMessageToAgent", { message: msg_p.data, regex: /.*/ });

                        }
                        else if (/^microapp:progress:ended$/.test(msg_p.data))
                        {
                            console.log("Got output progress: " + msg_p.data);
                            speechStormPlugin.publish("ended")
        //                    speechStormPlugin.command("sendSecretMessageToAgent", { message: msg_p.data, regex: /.*/ });
                        }
                        else if ("speechstorm:closed" === msg_p.data)
                        {
                            // We can ignore this
                        }
                        else
                        {
                            console.log("Received unknown postMessage: " + msg_p.data);
                        }
                    },
                    
                    
                    

                    getCookieValue : function (sKey_p)
                    {
                        sKey_p += '=';
                        
                        var cookieArray = document.cookie.split(';');
                        
                        for (var i=0; i < cookieArray.length; i++)
                        {
                            var sCookie = cookieArray[i];
                            sCookie = sCookie.replace(/^ +/, '');        

                            if (sCookie.substring(0, sKey_p.length) == sKey_p)
                            {
                                return sCookie.substring(sKey_p.length);
                            }
                        }
                        
                        return undefined;
                    }
                }; // end of methods




            if (speechStormPlugin) 
            {
                speechStormPlugin.registerEvents(["opened", "ready", "closed", "progress", "ended"]);

                speechStormPlugin.registerCommand("open", function(e) {

                    if (!isReserved || e.commander === isReserved || e.commander === "cx.plugin.App") 
                    {
                        if (isOpen) 
                        {
                            speechStormPlugin.command("close").done(function() {
                                methods.open(e);
                            });
                        }
                        else
                        {
                            methods.open(e);
                        }
                    }
                    else
                    {
                        e.deferred.reject("speechStorm view is currently reserved");
                    }
                });

                
                speechStormPlugin.registerCommand("close", function(e) {

                    if (isOpen) 
                    {
                        if (!isReserved || e.commander === isReserved || e.commander === "cx.plugin.App") 
                        {
                            isReserved = false;

                            if (e.data && e.data.immediately) 
                            {
                                methods.close();
                                e.deferred.resolve();
                            }
                            else
                            {
                                methods.close(e.deferred);
                            }
                        }
                        else
                        {
                            e.deferred.reject("SpeechStorm view is currently reserved");
                        }
                    }
                    else
                    {
                        e.deferred.reject("SpeechStorm view is already closed");
                    }
                });
                

                speechStormPlugin.registerCommand("configure", function(e) {

                    if (e.data) 
                    {
                        if (typeof e.data.baseURL == "string")
                        {
                            speechStormOptions.baseURL = e.data.baseURL;
                        }
                        if (typeof e.data.domain == "string")
                        {
                            speechStormOptions.domain = e.data.domain;
                        }
                        e.deferred.resolve();
                    }
                    else
                    {
                        e.deferred.reject("Invalid configuration");
                    }
                });


                speechStormPlugin.subscribe("App.ready", function(e) {

                    speechStormPlugin.command("App.getTheme").done(function(sNewTheme) {

                        sTheme = sNewTheme;
                    });
                });
                

                speechStormPlugin.subscribe("App.closeAll", function(e) {

                    speechStormPlugin.command("close");
                });

                
                speechStormPlugin.subscribe("App.mobileMode", function() {

                    isMobileMode = true;
                });

                
                speechStormPlugin.subscribe("WebChatService.started", function(e) {

                    window._genesys.widgets.bus.command("WebChatService.addPrefilter", { filters: [/^microapp:/] })
                            .done(function(e) {
                                console.log('Successfully registered prefilter:');
                                console.log(e);
                            }).fail(function (e) {
                                console.log("FAILED to register prefilter for CXSpeechStorm: " + e);
                            });
                });
                
                
                speechStormPlugin.subscribe("cx.plugin.WebChatService.messageReceived", function(details) {
                    console.log("CXSpeechStorm received a message from WebChatService");

                    var isAlreadyOpened = false;

                    for (var i=0; i < details.data.originalMessages.length; i++)
                    {
                        var msg = details.data.originalMessages[i];

                        if (msg.type == 'Message')
                        {
                            console.log("       " + msg.text);

                            var PROTOCOL_PREFIX = 'microapp://app/';

                            if (msg.text.indexOf(PROTOCOL_PREFIX) >= 0)
                               {
                                if (isAlreadyOpened)
                                   {
                                       console.log("ALREADY OPENED");
                                   }
                                else
                                {
                                    isAlreadyOpened = true;

                                    //
                                    // 'URL' in the message will be in form
                                    //     "microapp://app/<apptoken>\nParam1=Value1\nParam2=Value2"
                                    // or
                                    //     "microapp://app/<apptoken>/<appdescription>\nParam1=Value1\nParam2=Value2"
                                    //
                                    var sUrlDetails = msg.text.substring(PROTOCOL_PREFIX.length);
                                    var sAppToken = sUrlDetails.split(/\//)[0];
                                    
                                    //
                                    //  Extract some chat-server-specific settings from the cookie so that
                                    //  we can tie together the two sessions
                                    //
                                    var sChatInteractionID = methods.getCookieValue('_genesys.widgets.webchat.state.session'),
                                        sKeysCookieJson = methods.getCookieValue('_genesys.widgets.webchat.state.keys');
                                
                                    if (! (sChatInteractionID  &&  sKeysCookieJson))
                                    {
                                        console.log("Both 'session' and 'keys' cookies must be present if microapp is to be invoked from a chat message.  Session was '" + sChatInteractionID + "' and keys were '" + sKeysCookieJson + "'.  CXSpeechStorm has ignored your command.");
                                        return;
                                    }
                 
                                    var keysCookie = JSON.parse(decodeURIComponent(sKeysCookieJson)),
                                        params = {
                                            appToken: sAppToken,
                                            chatMessage: msg.text,
                                            chatInteractionID : sChatInteractionID,
                                            chatUserID : keysCookie.userId,
                                            chatSecureKey : keysCookie.secureKey
                                        };
                                    
                                    window._genesys.widgets.bus.command("CXSpeechStorm.open", params).done(function(e) {
                                        console.log('CXSpeechStorm successfully sent the WebIVR open request for app with token: ' + sAppToken);
                                    }).fail(function(e) {
                                        alert('Error!  ' + e);
                                    });
                                }
                               }
                        }
                    }
                });

                
            

                //
                //  Listen for events from the iframe; these will generally be related to caller's
                //  progress through the WebIVR callflow.
                //
                if (window.addEventListener)
                {
                      addEventListener("message", methods.handleWebIVRStatusUpdate, false)
                }
                else
                {
                      attachEvent("onmessage", methods.handleWebIVRStatusUpdate)
                }

                if (window._genesys && window._genesys && window._genesys.widgets && window._genesys.widgets.speechStormPlugin) {

                    speechStormPlugin.command("configure", window._genesys.widgets.speechStormPlugin);
                }

                speechStormPlugin.republish("ready");
            
            }  // End of 'if (speechStormPlugin)'
        }

        window._genesys.widgets.extensions["Vidyo"] = function($, CXBus, Common){

            var oVidyo = CXBus.registerPlugin("Vidyo");

            oVidyo.subscribe("Vidyo.opened", function(e){});

            oVidyo.republish("ready");

            oVidyo.registerCommand("open", function(e){
                if (typeof ac != 'undefined' && ac) {
                    ac('record', 'widget.action', 'Video chat');
                }
                initGV();
            });
        };

        window._genesys.widgets.extensions["Wizard"] = function($, CXBus, Common){

            oWizard = CXBus.registerPlugin("Wizard");

            oWizard.registerCommand("openEmail", function(e){
                _ac('record', 'widget.action', 'Message form');
                oWCC.command("SendMessage.open");
            });

            oWizard.subscribe("SendMessageService.messageSent", function(e){
                _ac('record', 'widget.action', 'Message sent');
            });

            oWizard.registerCommand("openCallUs", function(e){
                _ac('record', 'widget.action', 'CallUs info');
                oWCC.command("CallUs.open");
            });

            oWizard.registerCommand("openCoBrowse", function(e){
                _ac('record', 'widget.action', 'CoBrowse session');
                oWCC.command("CoBrowse.open");
            });

            oWizard.registerCommand("openCallback", function(e){
                _ac('record', 'widget.action', 'Callback form');
                oWCC.command("Callback.open");
            });

            oWizard.subscribe("CallbackService.scheduled", function(e){
                _ac('record', 'widget.action', 'Callback scheduled');
            });

            oWizard.registerCommand("openChat", function(e){
                _ac('record', 'widget.action', 'Chat form');
                webDemo.setStopTimer(true);
                oWCC.command("WebChat.open");
            });

            oWizard.subscribe("WebChatService.started", function(e){
                _ac('record', 'widget.action', 'Chat started');
            });

            oWizard.registerCommand("configure", function(e){

                var ctrlData = webDemo.getCxwControlData();
                var cxwData = webDemo.getCxwData();
                var cxwPostAct = webDemo.getCxwPostActions();
                var cxwSubj = webDemo.getCxwSubjects();
                var udata = {};

                // Chat Configuration ---------------------
                var agentLess = !!(ctrlData["_$_agent_less"] === 'true' || ctrlData["_$_agent_less.chat"] === 'true');
                var url = CHAT_URL + (agentLess? CHATBOT_SERVICE: DEFAULT_SERVICE);

                if (agentLess) {
                    oChatConfig.userData._agent_less = "true";
                }
                else {
                    oChatConfig.userData._agent_less = "false";
                }

                // deflection
                if(ctrlData["_$_deflection"] !== 'false' && ! agentLess) oWCC.command("ChatDeflection.enable");
                else oWCC.command("ChatDeflection.disable");

                // adding GWE IDs
                _gt.push(['getIDs', function(IDs) {
                    console.log('[CXW] GWE IDs: ', JSON.stringify(IDs)); // getting GWE IDs
                    $.extend(gweCfg, IDs);
                    // to submit data to GSG and add system data
                    webDemo.openChat(false, true, function(data) {
                        // merge gwe & chat data
                        var cfg = $.extend(data, gweCfg);
                        if (cxwPostAct["chat"]) {
                            cfg["wiz_story_post_actions"] = cxwPostAct["chat"];
                        }
                        console.log("[CXW] Chat URL: " + url);
                        oChatConfig.userData = cfg;

                        if (cxwSubj["chat"] || cxwSubj["any"]) {
                            oChatConfig.userData.subject = cxwSubj["chat"] || cxwSubj["any"];
                        }

                        if(ctrlData["_$_async_chat"] == 'true') {
                            oChatConfig.userData.GCTI_Chat_AsyncMode = "true";
                            oChatConfig.userData.Chat_Async_RoutingTimeout = "1";      // decrease routing time to 5 secs (from 120 secs)
                            oChatConfig.userData.Chat_Async_WorkflowDebug = "false";   // debug messages to chat                            
                        }
                        else {
                            oChatConfig.userData.GCTI_Chat_AsyncMode = "false";
                        }

                        oChatConfig.endpoint = agentLess? 'Environment:chatbot': 'Environment:default';
                        oChatConfig.dataURL = url;
                        oWCC.command("WebChatService.updateUserData", oChatConfig.userData);
                    });
                }]);




                // Voice callback Configuration ---------------
                udata = {};
                agentLess = !!(ctrlData["_$_agent_less"] === 'true' || ctrlData["_$_agent_less.voice"] === 'true');
                if (agentLess) {
                    udata._agent_less = "true";
                }
                if (cxwPostAct["callback"]) {
                    udata["wiz_story_post_actions"] = cxwPostAct["callback"];
                }
                if (cxwSubj["callback"] || cxwSubj["any"]) {
                    udata.subject = cxwSubj["callback"] || cxwSubj["any"];
                    cbSubj = udata.subject;
                }

                udata =  $.extend(udata, cxwData);
                oWCC.command("CallbackService.configure", {"userData": udata});

                // Email Configuration ----------------
                udata = {};
                udata =  $.extend(udata, cxwData);
                if (cxwPostAct["email"]) {
                    udata["wiz_story_post_actions"] = cxwPostAct["email"];
                }
                if (cxwSubj["email"] || cxwSubj["any"]) {
                    udata.subject = cxwSubj["email"] || cxwSubj["any"];
                    emailSubj = udata.subject;
                }
                oWCC.command("SendMessageService.configure", {"userData": udata});

                // Video configuration ------------------
                videoData = {};
                if (cxwPostAct["vidyo"]) {
                    videoData["wiz_story_post_actions"] = cxwPostAct["vidyo"];
                }
                if (cxwSubj["vidyo"]) {
                    videoData.subject = cxwSubj["vidyo"];
                }
                videoData =  $.extend(videoData, cxwData);

                // remove '"' tp w/a vidyo server 500 error on dbl quotes
                $.each(videoData, function (key, val) {
                    videoData[key] = videoData[key].replace(/\'/g, " ").replace(/\"/g, "'");
                });

            });
        };


    };  // end of initCfg()

    var _activation = function(){
        console.log('[CXW] widgets loaded');
    };

    var _sidebarShow = function () {
        oWCC.command("SideBar.open");
        //$(".cx-sidebar").css("display", "block").show(200);
        //$(".cx-sidebar").show();
        console.log("[CXW] The sidebar is shown");
    };

    var _sidebarHide = function () {
        oWCC.command("SideBar.close");
        //$(".cx-sidebar").hide();
        console.log("[CXW] The sidebar is hidden");
    };

    var _prefillForm = function () {
        console.log('[CXW] prefilling the form');
        // custom form prefill
        $("#cx_webchat_form_firstname, #cx_firstname, #cx_sendmessage_form_firstname, #cx_form_callback_firstname").val(genWeb.customer["c_first_name"]);
        $("#cx_webchat_form_lastname, #cx_lastname, #cx_sendmessage_form_lastname, #cx_form_callback_lastname").val(genWeb.customer["c_last_name"]);
        $("#cx_webchat_form_email, #cx_sendmessage_from, #cx_sendmessage_form_email, #cx_form_callback_email").val(genWeb.customer["c_email"]);
        $("#cx_form_callback_phone_number").val(genWeb.customer["c_phone"]);
        $("#cx_form_callback_subject").val(cbSubj || "Web Callback");  // TODO - Subject
        $("#cx_webchat_form_subject").val(window._genesys.widgets.webchat.userData.subject || "Web Chat");
        $("#cx_sendmessage_subject, #cx_sendmessage_form_subject").val(emailSubj || "Web Message");
    };

    var _startChat = function (customData) { // start from OLD menu

        var ctrlData = webDemo.getControlData();
        if (! window._genesys.widgets.bus) {
            return; // not inited yet
        }

        oChatConfig.userData = $.extend(true, {}, customData, gweCfg);

        // check if route to chatbot
        if (ctrlData["_$_agent_less"] === 'true' ||
            ctrlData["_$_agent_less.chat"] === 'true'
        ) {
            oChatConfig.dataURL = CHAT_URL + CHATBOT_SERVICE;
        }
        else {
            oChatConfig.dataURL = CHAT_URL + DEFAULT_SERVICE;
        }

        // deflection
        if(ctrlData["_$_deflection"] !== 'false') {
            oChatConfig.userData.gks_lang = "en";
            oChatConfig.userData.gks_session = gkcModule.kcGetSessionId();
            oWCC.command("ChatDeflection.enable");
        }
        else oWCC.command("ChatDeflection.disable");

        console.log("[CXW] Menu Chat Config - " + JSON.stringify(oChatConfig, null, 4));

        //oWCC.command("WebChatService.configure", oChatConfig);
        oWCC.command("WebChat.open", {userData: oChatConfig.userData});

    };

    var _invitePopup = function () {
        oWCC.command("ChatDeflection.disable"); // disable deflection for Invites
        oWCC.command("WebChat.invite");
    };

    var _generateVidyoFrameSrc = function(guestLink){
        var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        var vidyoSrc = "";
        var webRtcUrl = "https://apps.vidyocloud.com/ve4genesys/simple/index.html";
        var vidyoWebUrl = "https://apps.vidyocloud.com/ve4genesys/dual/index.html";
        var vidUrl = isChrome? webRtcUrl: vidyoWebUrl;
        var firstName = genWeb.customer["c_first_name"];

        vidyoSrc =
            webRtcUrl + "?portalUri=" +
            guestLink + "&guestName=" + firstName;  // .replace('?', '&')

        return vidyoSrc;
    }

    var _addChatButton = function () {
        oWCC.command("CXSideBar.addButton", {
            button: {
                name: cxw_i18n[STR_WIDGET_LOCALE].webchat.ChatTitle,
                //title: "Chat with a representative",
                icon: "cx-img-map chat",
                class: "cx-webchat"
            }
        })
            .done(function (e) {
                oWCC.subscribe(e.event, function (e) {
                    _sidebarHide();
                    // _showCustomForm();
                });
            })
            .fail(function (e) {
                console.log("[CXW] CXSideBar.addButton:fail : " + (e.error || "Unknown Error"));
                _sidebarShow();

            });

        // oWCC.command("CXSideBar.open");
    };

    var _setFooter = function () {
        // $(".cx-powered-by").html("<img src='http://epic-tm.live.genesys.com/iisEpic/cxw/logo.png'></img>");
    };

    var _setChatUrl = function (url) {
        CHAT_URL = url;
        oChatConfig.dataURL = CHAT_URL + DEFAULT_SERVICE; // if CHAT_URL was redefined in custom.js
    };

    var _setoWCC = function (bus) {
        oWCC = bus;
    };

    var _getVideoData = function(){
        return $.extend(true, {}, videoData);
    };

    var _setCustomData = function (udata) {
        oChatConfig.userData = $.extend(true, {}, udata);
    };

    var _cfgWidget = function(){
        oWCC.command("Wizard.configure");
    };

    var _startVidyo = function(url){
        setTimeout(function(){
            window.open(widgetCX.generateVidyoFrameSrc("https://genesys.api.vidyocloud.com/" + url), '_blank', "height=600, width=800, top=300, left=300, scrollbars=0")
        }, 200);
        /*                  window._genesys.widgets.bus.command("Overlay.open", {html: '<strong>YAHOO!!!</strong>', immutable: true})
         .fail(function(text){console.log('FAIL - ' +text);})
         .done(function(text){console.log('DONE - ' +text);});
         */
    };

    var _startVidyoSandbox = function(url){
        window.open("http://Genesys.sandboxga.vidyo.com" + url, '_blank')
    };

    var _closeOverlay = function(){
        oWizard.command("Overlay.close");
    };

    var _openOverlay = function(){
        oWizard.command("Overlay.open", {
            html: '<div class="cx-widget cx-common-container cx-overlay cx-call-us cx-close cx-theme-red cx-desktop">'+
                    '<div class="cx-button-group cx-buttons-window-control"> ' +
                        '<button onclick="widgetCX.closeOverlay()" class="cx-icon cx-button-close" tabindex="0" data-icon="close"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" viewBox="0 0 100 100"><path class="cx-svg-icon-tone1" d="M100,14.29,64.28,50,100,85.7,85.7,100,50,64.28,14.3,100,0,85.7,35.72,50,0,14.29,14.3,0,50,35.71,85.7,0Z" transform="translate(-0.02 -0.01)"></path></svg></button> '+
                    '</div> '+
                    '<div class="cx-titlebar"> '+
                        '<div class="cx-phone-title" style="font-size: 36px;">Confirmation</div> '+
                    '</div> '+
                    '<div class="cx-body"><div> '+
                    '<div class="cx-content" tabindex="0"> '+
                        '<div class="cx-wrapper wrapper"> '+
                            '<div class="cx-main-phone"><div> '+
                    '<div><span style="font-size: 22px;">Your flight selection is reserved for 72 hours</span></div> '+
                    '</div></div> '+
                                '<div class="cx-availability"> '+
                                    '<div class="cx-hours"><div class="i18n">SFO to DBX on 19 Nov 2018</div><div class="i18n">DBX to SFO on 23 Nov 2018</div></div> '+
                                '</div> '+
                            '</div> '+
                        '</div> '+
                    '</div></div> '+                    
                    '<div class="cx-footer"> '+
                            '<div class="cx-powered-by">Powered by <span class="cx-icon" data-icon="logo"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" viewBox="0 0 318 65"><g class="cx-svg-icon-tone1"><path d="M309.6,17H308v-0.6h3.8V17h-1.6v4.2h-0.7V17z"></path><path d="M314.6,21.2l-1.3-4.2v4.2h-0.7v-4.8h1.1l1.2,4l1.2-4h1.1v4.8h-0.7V17l-1.3,4.2L314.6,21.2L314.6,21.2z"></path><path d="M32.4,4.2c1.6,0,2.8,1.3,2.8,2.8c0,1.6-1.3,2.8-2.8,2.8c0,0,0,0,0,0c0,0-0.1,0-0.1,0c-1.5-0.1-2.6-1.2-2.7-2.7c-0.1-1.6,1.1-2.9,2.7-3C32.3,4.2,32.4,4.2,32.4,4.2 M32.4,0.5c-3.6,0-6.6,2.9-6.6,6.6c0,3.5,2.8,6.4,6.2,6.6c0.1,0,0.2,0,0.3,0c3.6,0,6.5-3,6.5-6.6C38.9,3.4,36,0.5,32.4,0.5L32.4,0.5z"></path><path d="M28,46.2c3.6,0,6.6,3,6.6,6.6c0,3.6-3,6.6-6.6,6.6h-7.2c-3.6,0-6.6-3-6.6-6.6c0-3.6,3-6.6,6.6-6.6L28,46.2 M28,41.9h-7.2c-6,0-10.9,4.8-11,10.9c0,6,4.8,10.9,10.9,11c0,0,0.1,0,0.1,0H28c6,0,10.9-4.8,11-10.9C39,46.9,34.1,41.9,28,41.9C28.1,41.9,28.1,41.9,28,41.9L28,41.9z"></path><path d="M28,20.7c3.6,0,6.6,3,6.6,6.6c0,3.6-3,6.6-6.6,6.6H11.2c-3.6,0-6.6-3-6.6-6.6c0-3.6,3-6.6,6.6-6.6l0,0H28 M28,16.4H11.2c-6,0-10.9,4.9-10.9,10.9s4.9,10.9,10.9,10.9H28c6,0,10.9-4.9,10.9-10.9S34.1,16.4,28,16.4C28,16.4,28,16.4,28,16.4z"></path><polygon points="97.4,63.8 97.4,16.4 124.1,16.4 124.1,21 102.2,21 102.2,37.5 121.9,37.5 121.9,42.1 102.2,42.1 102.2,59.1 124.1,59.1 124.1,63.8 "></polygon><polygon points="176,63.8 176,16.4 202.7,16.4 202.7,21 180.8,21 180.8,37.5 200.5,37.5 200.5,42.1 180.8,42.1 180.8,59.1 202.7,59.1 202.7,63.8 "></polygon><polygon points="255.9,63.8 255.9,44.1 239.9,16.4 245.2,16.4 258.3,39.1 271.3,16.4 276.6,16.4 260.6,44.1 260.6,63.8 "></polygon><polygon points="166.3,63.8 166.3,16.4 161.6,16.4 161.6,55.1 138.1,16.4 133.3,16.4 133.3,16.4 133.3,63.8 138.1,63.8 138.1,25 161.6,63.8 "></polygon><path d="M72.4,43.4h11.4v3.8c0,9.3-5.9,12.6-11.4,12.6S61,56.4,61,47.2V33c0-9.3,5.9-12.6,11.4-12.6c5.7-0.2,10.6,4,11.2,9.7h4.8c-1.1-8.8-7.3-14.4-15.9-14.4c-9.6,0-16.1,6.9-16.1,17.2v14.3c0,10.3,6.5,17.2,16.1,17.2s16.1-6.9,16.1-17.2v-8.4H72.4L72.4,43.4L72.4,43.4z"></path><path d="M213.3,49.4c0.4,6.4,4.6,10.3,10.6,10.3c6,0,9.3-3,9.3-8.3c0.1-3.9-2.7-7.2-6.5-7.9l-8-2.2c-5.9-1.6-9.4-6.4-9.4-12.8c0-7.7,5.5-12.9,13.6-12.9c9.3,0,13.5,6.5,14.3,13h-4.7c-1.1-5.4-4.5-8.3-9.6-8.3c-5.4,0-8.9,3.2-8.9,8.2c-0.2,3.8,2.4,7.3,6.1,8.1l8.3,2.2c5.7,1.4,9.7,6.6,9.5,12.5c0,8-5.4,13-14,13c-10.8,0-15.2-8.2-15.3-15L213.3,49.4L213.3,49.4z"></path><path d="M283.4,49.4c0.4,6.4,4.6,10.3,10.6,10.3c6,0,9.3-3,9.3-8.3c0.1-3.9-2.7-7.2-6.5-7.9l-8-2.2c-5.9-1.6-9.4-6.4-9.4-12.8c0-7.7,5.5-12.9,13.6-12.9c9.3,0,13.5,6.5,14.3,13h-4.7c-1.1-5.4-4.5-8.3-9.6-8.3c-5.4,0-8.9,3.2-8.9,8.2c-0.2,3.8,2.4,7.3,6.1,8.1l8.3,2.2c5.7,1.4,9.7,6.6,9.5,12.5c0,8-5.4,13-14,13c-10.8,0-15.2-8.2-15.3-15H283.4L283.4,49.4z"></path></g></svg></span></div> '+
                        '</div>             '+
                '</div>',
            immutable: false,
            group: "false" 
        }).done(function(e){
        }).fail(function(e){
        }); 
    };

    // public interface
    oPublished = {
        openOverlay: _openOverlay,
        closeOverlay: _closeOverlay,
        getVideoData: _getVideoData,
        setoWCC: _setoWCC,
        initCfg: _initCfg,
        sidebarShow: _sidebarShow,
        sidebarHide: _sidebarHide,
        startChat: _startChat,
        invitePopup: _invitePopup,
        setChatUrl: _setChatUrl,
        setCustomData: _setCustomData,
        generateVidyoFrameSrc: _generateVidyoFrameSrc,
        activation: _activation,
        cfgWidget: _cfgWidget,
        startVidyo: _startVidyo,
        startVidyoSandbox: _startVidyoSandbox
    };

    return oPublished;

})();

$.getScript( "//demo.genesyslab.com/gdemo_mobile/web/v2/js/cx-speechstorm.js" );

console.log('[CXW] init done');

// load widgets
/*
 if (CXW_ENABLED) {
 (function(d, s, id, o){var f = function(){var fs = d.getElementsByTagName(s)[0], e;
 if (d.getElementById(id)) return;e = d.createElement(s);
 e.id = id;e.src = o.src;fs.parentNode.insertBefore(e, fs);},ol = window.onload;

 if(o.onload){typeof window.onload != "function"?window.onload=f:window.onload=function(){ol();f();widgetCX.activation();}}else {f();widgetCX.activation();};})

 //      typeof window.onload !="function"?window.onload=f:window.onload=function(){ol();f();widgetCX.activation();}})
 (document,'script','genesys-cx-widget', {src: "//demo.genesyslab.com/gdemo_mobile/web/v2/cxw/widgets.min.719.js"});
 }
 */
//<!-- CXW script END --------------  -->

//<!-- VIDYO part starts -->

var _gv = _gv || {};

_gv.api = (function (window) {
    var jQ;
    var stompClient;
    var kvp;
    var cbOnSuccess;
    var cbOnError;
    var isReady = false;
    function init() {
        log("init()");
        initJQueryAsync(function ($) {
            jQ = $;
            log("init() jQuery has been loaded");
            loadJSResource(VIDYO_FILES + "/scripts/sockjs-0.3.4.min.js", function () {
                log("init() sockjs has been loaded");
                loadJSResource(VIDYO_FILES + "/scripts/stomp.min.js", function () {
                    log("init() stomp has been loaded");
                    isReady = true;
                });
            });
        });
    }
    function initJQueryAsync(initJQueryCallback) {
        if (window.jQuery) {
            initJQueryCallback(window.jQuery);
        } else {
            if (window.$) {
                initJQueryCallback(window.$);
            } else {
                loadJSResource(VIDYO_FILES + "/scripts/jquery.min.js", function () {
                    if (window.jQuery) {
                        initJQueryCallback(window.jQuery);
                    } else {
                        if (window.$) {
                            initJQueryCallback(window.$);
                        } else {
                            error("Failed to load jQuery");
                        }
                    }
                });
            }
        }
    }
    function loadJSResource(url, callback) {
        var script = window.document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState === "loaded" || script.readyState === "complete") {
                    script.onreadystatechange = null;
                    if (callback) {
                        callback();
                        callback = undefined;
                    }
                }
            };
        } else {
            script.onload = function () {
                if (callback) {
                    callback();
                    callback = undefined;
                }
            };
        }
        script.src = url;
        window.document.getElementsByTagName("head")[0].appendChild(script);
    }
    function callCbOnError(err) {
        if (cbOnError) {
            if (err && err.responseJSON) {
                cbOnError(err.responseJSON);
            } else {
                if (err && err.body) {
                    try {
                        cbOnError(jQ.parseJSON(err.body));
                    } catch (e) {
                        cbOnError(err.body);
                    }
                } else {
                    cbOnError(err);
                }
            }
        }
        disconnect();
    }
    function callCbOnSuccess(obj) {
        if (cbOnSuccess) {
            if (obj && obj.responseJSON) {
                cbOnSuccess(obj.responseJSON);
            } else {
                if (obj && obj.body) {
                    try {
                        cbOnSuccess(jQ.parseJSON(obj.body));
                    } catch (e) {
                        cbOnSuccess(obj.body);
                    }
                } else {
                    cbOnSuccess(obj);
                }
            }
        }
        disconnect();
    }
    function getServiceId() {
        jQ.ajax({
            contentType : "application/json",
            type : "POST",
            url : window._gv.config.serverUrl + "/service/click-to-vidyo",
            data : JSON.stringify(kvp),
            timeout : 600000,
            async : true,
            success : function (resp) {
                try {
                    log(resp);
                    if (resp && resp.id) {
                        connect(resp.id);
                    } else {
                        callCbOnError(resp);
                    }
                } catch (e) {
                    error(e);
                }
            },
            error : function (err) {
                error(err);
                callCbOnError(err);
            }
        });
    }
    function connect(id) {
        try {
            disconnect();
        } catch (e) {
            error(e);
        }
        var socket = new SockJS(window._gv.config.serverUrl + "/ws/service");
        console.log(JSON.stringify(socket));
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            log("Connected: " + frame);
            stompClient.subscribe("/user/queues/errors", function (obj) {
                error(obj);
                callCbOnError(obj);
            });
            stompClient.subscribe("/user/queue/service/" + id + "/guestLink", function (obj) {
                log(obj);
                callCbOnSuccess(obj);
            });
            sendGuestLinkReq(id);
        }, function (frame) {
            error("Websocket connection error. Fallback to polling...");
            try {
                disconnect();
            } catch (e) {
                error(e);
            }
            poll(id);
        });
    }
    function disconnect() {
        if (stompClient != null) {
            try {
                stompClient.disconnect();
            } catch (e) {
                error(e);
            }
        }
        log("Disconnected");
    }
    function sendGuestLinkReq(id) {
        stompClient.send("/vidyo/service/" + id + "/guestLink", {}, {});
    }
    function poll(id) {
        jQ.ajax({
            type : "GET",
            url : window._gv.config.serverUrl + "/service/" + id + "/guestLink",
            async : true,
            timeout : 600000,
            success : function (resp) {
                callCbOnSuccess(resp);
            },
            error : function (err) {
                callCbOnError(err);
            }
        });
    }
    function log(message) {
        console.log(message);
    }
    function error(msgObj) {
        try {
            if (msgObj && msgObj.responseJSON && msgObj.responseJSON.message) {
                log("ERROR: " + msgObj.responseJSON.message);
            } else {
                log("ERROR: " + msgObj);
            }
        } catch (e) {
            log("ERROR: " + msgObj);
        }
    }
    init();
    return {
        clickToVidyo : function (data, onSuccess, onError) {
            kvp = data;
            cbOnSuccess = onSuccess;
            cbOnError = onError;
            if (isReady) {
                getServiceId();
            } else {
                var s = "Not ready - required libraries not loaded yet";
                error(s);
                if (onError) {
                    onError({
                        message : s
                    });
                }
            }
        }
    };
})(window);

function initGV() {

    var oLookingView = {
        type: "generic",
        title: (cxw_i18n[STR_WIDGET_LOCALE].channelselector && cxw_i18n[STR_WIDGET_LOCALE].channelselector.VideoTitle) || "Video Chat",
        body: (cxw_i18n[STR_WIDGET_LOCALE].vidyo && cxw_i18n[STR_WIDGET_LOCALE].vidyo.ConnectingToAgent) || "Connecting to an agent...",
        icon: "videochat",
        controls: "close",
        buttons: {}
    };
    var oErrorView = {
        type: "generic",
        title: (cxw_i18n[STR_WIDGET_LOCALE].channelselector && cxw_i18n[STR_WIDGET_LOCALE].channelselector.VideoTitle) || "Video Chat",
        body: (cxw_i18n[STR_WIDGET_LOCALE].vidyo && cxw_i18n[STR_WIDGET_LOCALE].vidyo.CouldNotFindAgent) || "We are sorry, <br>we could not find an available agent",
        icon: "videochat",
        controls: "close",
        buttons: {}
    };
    var oConnectingView = {
        type: "generic",
        title: (cxw_i18n[STR_WIDGET_LOCALE].channelselector && cxw_i18n[STR_WIDGET_LOCALE].channelselector.VideoTitle) || "Video Chat",
        body: (cxw_i18n[STR_WIDGET_LOCALE].vidyo && cxw_i18n[STR_WIDGET_LOCALE].vidyo.AgentIsReady) || "Agent is Ready! <br>Please press Connect button to start video chat!",
        icon: "videochat",
        controls: "close",
        buttons: {
            type: "binary",
            primary: (cxw_i18n[STR_WIDGET_LOCALE].vidyo && cxw_i18n[STR_WIDGET_LOCALE].vidyo.ButtonConnect) || "Connect"
        }
    };
    window._genesys.cxwidget.bus.command("Toaster.open", oLookingView);

    _gv.api.clickToVidyo(
        widgetCX.getVideoData(),  // TODO
        // on success
        function(resp) {
            var lnk = '';
            try{
                var obj2 = eval('('+resp.guestLink+')')
                lnk = obj2.url+'&key='+obj2.key;
            }catch(e){
                //alert('Sorry, the video chat cannot be opened at the moment!');
                console.log("Vidyo Failed: " + JSON.stringify(e, null, 4));
                window._genesys.cxwidget.bus.command("Toaster.close");
                window._genesys.cxwidget.bus.command("Toaster.open", oErrorView);

            }
            if(lnk != ''){
                //alert('Now you can join the video chat!');
                window._genesys.cxwidget.bus.command("Toaster.open", oConnectingView).done(function(e2){
                    $(e2.html).find(".cx-btn.cx-btn-default").hide();
                    $(e2.html).find(".cx-btn.cx-btn-primary").click(function(){
                        widgetCX.startVidyo(lnk.substr(35));
                        //window.open(lnk, '_blank');
                        window._genesys.cxwidget.bus.command("Toaster.close");
                    });
                });

            }else{
                //alert('Sorry, we could not find an available agent!');
                window._genesys.cxwidget.bus.command("Toaster.close");
                window._genesys.cxwidget.bus.command("Toaster.open", oErrorView);
                console.log("Vidyo: Unable to set up a video conference at this time. Please try again later.");
            }
        },
        // on error
        function(resp) {
            if(resp.message != undefined) {
                console.log("Vidyo: Failed: " + resp.message);
                //alert("Vidyo: Failed: " + resp.message);
                window._genesys.cxwidget.bus.command("Toaster.close");
                window._genesys.cxwidget.bus.command("Toaster.open", oErrorView);
            }
            else {
                console.log("Vidyo: Service response: " + resp.statusText + " (" + resp.status + ")");
                //alert("Vidyo: Service response: " + resp.statusText + " (" + resp.status + ")");
                window._genesys.cxwidget.bus.command("Toaster.close");
                window._genesys.cxwidget.bus.command("Toaster.open", oErrorView);
            }
        });

}

// <!-- VIDYO part ends -->




