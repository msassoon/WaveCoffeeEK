
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

    var isCommetD = false && getURLParameter("pull") == "null";   

    // to show chat form blank or bypass it
    var isFormBlank = getURLParameter("form") == "blank";   
    var isFormBypass = getURLParameter("form") == "bypass";   

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

            enabled: isCommetD,
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
        gaapBaseUrl = 'https:' + _demoHost.substr(0,_demoHost.indexOf('.'))+'-gaap'+_demoHost.substr(_demoHost.indexOf('.')) + ':8054'; // "https://POD-gaap.live.genesys.com";
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
                        displayTitle: '@i18n:channelselector.TitleDescription',
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
                    _target: (genWeb.customer["CfgType"] == 'gdemo')? '"' + genWeb.phoneNumber + '">0': 'Customer_Service >=1',
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
                host: gksBaseUrl + (webDemo.getPodVersion() >= "18-09-02.1"? "/gks-server/api": "/gks-server/v1"),
                knowledgebases: [webDemo.getGkcDB()],
                lang: 'en',
                media: '',
                maxTrendingResults: 5,
                maxSearchResults: 3,
                apiClientId: 'webWizard',
                apiClientMediaType: 'selfserviceWizard',
                apiVersion: webDemo.getPodVersion() >= "18-09-02.1"? "v2": "v1",

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


                oWCC.command('WebChatService.addPrefilter', {filters: /Customized.Notifications/}).done(function(e){
                    console.log('[CXW] Widget PreFiller is registered');
                }).fail(function(e){
                    console.log('[CXW] Widget PreFiller registatin failed!', e);
                });

                // chat messages preprocessor
                oWCC.command("WebChatService.registerPreProcessor", {preprocessor: function(oMessage){

                    // Receive each chat message JSON as "oMessage"
                    // Modify oMessage https://genesys.api.vidyocloud.com/flex.html?roomdirect.html&key=P1TvDysakk

                    if (oMessage.type == "ParticipantJoined" && oMessage.from.nickname == "Customized Notifications") {
                        oMessage.type = ""; 
                        return oMessage;
                    }

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

                window._genesys.cxwidget = window._genesys.widgets;  // for backward compatibility to 8.5
            }  // end of onReady()
        };

        if (isPlugSearch) {
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
                    clickCommand: 'Callback.open',
                    readyEvent: 'Callback.ready',
                    displayName: 'Receive a Call',
                    i18n: 'CallbackTitle',
                    icon: 'call-incoming',
                    html: '',
                    ewt: {
                        display: true,
                        queue: 'Inbound_Mobile',
                        availabilityThresholdMin: 6000,
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
                        queue: 'Omnichannel0',
                        availabilityThresholdMin: 3000,
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
                    clickCommand: 'SendMessage.open',
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
                    clickCommand: 'CallUs.open',
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
                        queue: 'Omnichannel0',
                        availabilityThresholdMin: 3000,
                        availabilityThresholdMax: 99999,
                        hideChannelWhenThresholdMax: false
                    }
                }
            );
        }

        if (isShowCobrowse) {
            window._genesys.widgets.channelselector.channels.push({
                enable: true,
                clickCommand: 'CoBrowse.open',
                readyEvent: 'CoBrowse.ready',
                displayName: 'Co-browse',
                i18n: 'CobrowseTitle',
                icon: 'cobrowse'
            });
        }

        // vidyo extension
        if(!window._genesys.widgets.extensions){
            window._genesys.widgets.extensions = {};
        }

        window._genesys.widgets.extensions["Vidyo"] = function($, CXBus, Common){

            var oVidyo = CXBus.registerPlugin("Vidyo");

            oVidyo.subscribe("Vidyo.opened", function(e){});

            oVidyo.republish("ready");

            oVidyo.registerCommand("open", function(e){
                initGV();
            });

            if (typeof oVidyo.ready == 'function') {  // available and required since 9.0.004.03
                oVidyo.ready();
            }
        };

        window._genesys.widgets.extensions["Wizard"] = function($, CXBus, Common){

            var oWizard = CXBus.registerPlugin("Wizard");

            oWizard.registerCommand("openChat", function(e){
                webDemo.setStopTimer(true);
                oWCC.command("WebChat.open");
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

                if(ctrlData["_$_async_chat"] == 'true') {
                    oChatConfig.userData.GCTI_Chat_AsyncMode = "true";
                    oChatConfig.userData.Chat_Async_RoutingTimeout = "1";      // decrease routing time to 5 secs (from 120 secs)
                    oChatConfig.userData.Chat_Async_WorkflowDebug = "false";   // debug messages to chat                            
                    oChatConfig.userData.async_chat = "bot";  // for SL customization
                    oChatConfig.userData.mobile_token = genWeb.deviceToken;   
                    oChatConfig.userData.mobile_os = 'fcm';   
                    oChatConfig.userData.cxw_url = location.href;   
                }
                else {
                    oChatConfig.userData.GCTI_Chat_AsyncMode = "false";
                }

                if (cxwSubj["chat"] || cxwSubj["any"]) {
                    oChatConfig.userData.subject = cxwSubj["chat"] || cxwSubj["any"];
                }

                oChatConfig.endpoint = agentLess? 'Environment:chatbot': 'Environment:default';
                oChatConfig.dataURL = url;

                if (cxwPostAct["chat"]) {
                    oChatConfig.userData["wiz_story_post_actions"] = cxwPostAct["chat"];
                }
                console.log("[CXW] Chat URL: " + url);

                webDemo.openChat(false, true, function(data) {
                    // merge gwe & chat data
                    var cfg = $.extend(data, oChatConfig.userData);
                    oWCC.command("WebChatService.updateUserData", cfg);
                });

                // adding GWE IDs
                _gt.push(['getIDs', function(IDs) {
                    console.log('[CXW] GWE IDs: ', JSON.stringify(IDs)); // getting GWE IDs
                    oWCC.command("WebChatService.updateUserData", IDs);
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

	        if (typeof oWizard.ready == 'function') {  // available and required since 9.0.004.03
	            oWizard.ready();
	        }

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

        if (isFormBlank) {
            genMobile.helper.log('[CXW] prefilling the form is disabled by URL form=blank parameter');
            return;
        }
        
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
            //oChatConfig.userData.gks_session = gkcModule.kcGetSessionId();
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

    // public interface
    oPublished = {
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

function initGV(videoUserData) {

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
    window._genesys.widgets.bus.command("Toaster.open", oLookingView);

    _gv.api.clickToVidyo(
        videoUserData? videoUserData: widgetCX.getVideoData(),  // TODO
        // on success
        function(resp) {
            var lnk = '';
            try{
                var obj2 = eval('('+resp.guestLink+')')
                lnk = obj2.url+'&key='+obj2.key;
            }catch(e){
                //alert('Sorry, the video chat cannot be opened at the moment!');
                console.log("Vidyo Failed: " + JSON.stringify(e, null, 4));
                window._genesys.widgets.bus.command("Toaster.close");
                window._genesys.widgets.bus.command("Toaster.open", oErrorView);

            }
            if(lnk != ''){
                //alert('Now you can join the video chat!');
                window._genesys.widgets.bus.command("Toaster.open", oConnectingView).done(function(e2){
                    $(e2.html).find(".cx-btn.cx-btn-default").hide();
                    $(e2.html).find(".cx-btn.cx-btn-primary").click(function(){
                        widgetCX.startVidyo(lnk.substr(35));
                        //window.open(lnk, '_blank');
                        window._genesys.widgets.bus.command("Toaster.close");
                    });
                });

            }else{
                //alert('Sorry, we could not find an available agent!');
                window._genesys.widgets.bus.command("Toaster.close");
                window._genesys.widgets.bus.command("Toaster.open", oErrorView);
                console.log("Vidyo: Unable to set up a video conference at this time. Please try again later.");
            }
        },
        // on error
        function(resp) {
            if(resp.message != undefined) {
                console.log("Vidyo: Failed: " + resp.message);
                //alert("Vidyo: Failed: " + resp.message);
                window._genesys.widgets.bus.command("Toaster.close");
                window._genesys.widgets.bus.command("Toaster.open", oErrorView);
            }
            else {
                console.log("Vidyo: Service response: " + resp.statusText + " (" + resp.status + ")");
                //alert("Vidyo: Service response: " + resp.statusText + " (" + resp.status + ")");
                window._genesys.widgets.bus.command("Toaster.close");
                window._genesys.widgets.bus.command("Toaster.open", oErrorView);
            }
        });

}

// <!-- VIDYO part ends -->




