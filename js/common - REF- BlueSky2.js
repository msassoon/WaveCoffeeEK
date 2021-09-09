
// AltoCloud code
try {
    // clear ac cookies
    document.cookie = '_acsbc=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=genesyslab.com';
    document.cookie = '_acspc=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=genesyslab.com';
    document.cookie = '_actms=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=genesyslab.com';
    document.cookie = '_actmu=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=genesyslab.com';
    document.cookie = '_actvc=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=genesyslab.com';
    document.cookie = '_actmh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=genesyslab.com';
    document.cookie = '_actmi=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=genesyslab.com';
    // call ac code
    (function(a,t,c,l,o,u,d){a['altocloud-sdk.js']=o;a[o]=a[o]||function(){
    (a[o].q=a[o].q||[]).push(arguments)},a[o].l=1*new Date();u=t.createElement(c),
    d=t.getElementsByTagName(c)[0];u.async=1;u.src=l;d.parentNode.insertBefore(u,d)
    })(window, document, 'script', 'https://altocloudcdn.com/sdk/js/web/v1/ac.js', 'ac');
    ac('init', 'cjf8nle2i4xpt0gpwvr2bybhc', {datacenter: 'us1'});
    ac('debug');
    ac('pageview');
}
catch(e){
    console.log('AltoCloud script failed!');
}  
var _ac = function(p1, p2, p3, p4){
    if (typeof ac != 'undefined' && ac) {
        ac(p1, p2, p3, p4);
    }    
}
//

var GHOST = false; // if not to call back end updates

var DEMO_HOST = "";
var TEMPLATE = "generic-web";
//var RTC_REMOTE_ID = '8259';
var WIDGET_URL = "//demo.genesyslab.com/gdemo_mobile/web/v2/cxw/widgets.min.js";
var RTC_PAGE_URL = "//demo.genesyslab.com/gdemo_mobile/web/libs/webrtc/webrtc.html";
var PROACTIVE_TIMEOUT = 10000;
var DEFAULT_MENU = {"_default_":
    { "items":
        [
            /*            {"title": STR_MAKE_A_CALL, "action": "in-call"}, */
            //   {"title": "Browser call", "action": "webrtccall"},
            //   {"title": "Browser video", "action": "webrtcvideo"},
            {"title": STR_KNOWLEDGE_DB, "action": "gkc"},
            {"title": STR_CALL_ME_NOW, "action": "call"},
            {"title": STR_SCHEDULE_CALLBACK, "action": "callback"},
            {"title": STR_SUBMIT_REQUEST, "action": "task"},
            {"title": STR_CHAT_WITH_AN_AGENT, "action": "chat"},
            {"title": STR_SEND_AN_EMAIL, "action": "email"},
            {"title": STR_SHOW_HISTORY, "action": "history"}
        ]
    }
};
var _data_id, _ac_data;

// -----------------------------------------

var webDemo = (function ($) {
    'use strict';

    var cxwData = {};
    var cxwPostActions = {};
    var cxwControlData = {};
    var cxwSubjects = {};
    var stopTimer = false;
    var cxwIsDeflection = true;
    var customParams = {};
    var customUserData = {};
    var parent_id = ""; // ixn parent id for survey
    var rating = 0; // survey overall rating value
    var menuSubject = "";
    var contactMenu = DEFAULT_MENU;
    var menuToShow = [];
    var local_number = "";
    var hist = {}; // history list
    //var isIPad = (navigator.userAgent.toLowerCase().match(/ipad/));
    var proTimer;
    var journeyPath = "";
    var popoverElement = {};
    var ixnHistList = []; // for ark
    var appCfg;
    var pageCfg;
    var controlData = {};

    // getting menu cfg
    genWeb.getMenu();


    var _setAcData = function(data){
        console.log("WebDemo: Altocloud data: "+JSON.stringify(data));
        _ac_data = data;
    };

    // setup handlers
    var _initPage = function(){


        var pageId = $(".wiz-page")[$(".wiz-page").length-1].id; // the selector search rtuens two elements - old page[0] and new page[1]. For the starting page - we have one element only
        var title = $(".wiz-page")[$(".wiz-page").length-1].title;

        if (pageId != 'initial-search' && pageId != 'deals' && pageId != 'search-flight' ) {  // skip google pages

            document.title = title;
            ac('pageview');
/*
            _ac('pageview', {
              "location": '/' + pageId,
              "title": title
            });
            */
        }

        // GWE page config
        if (typeof _gt != 'undefined' && _gt) {
 // the selector search rtuens two elements - old page[0] and new page[1]. For the starting page - we have one element only
            _gt.push(['config', {
                page: {
                    "url": location.href,
                    "title": title || pageId
                }
            }]);
            _gt.push(['event', 'PageEntered']);
        }

        // if to show original pictures size
        if (location.search.indexOf("noscale=") >= 0) {
            $('[data-role="page"]').addClass("no-scaled");
        } else { // automatic
            // check how to show the image
            window.addEventListener('resize', function (event) {
                ifImageScale(event);
            });
            // initial image check
            ifImageScale();
        }

        // add personalization
        webDemo.setFieldValues();

        var cfg = webDemo.getAppCfg();
        pageCfg = null;

        // getting the page cfg
        for(var i=0;i<cfg.pages.length;i++) {
            if (cfg.pages[i].page_id == pageId) {
                pageCfg = cfg.pages[i]; // found the page cfg
                break;
            }
        }

        // proactive
        webDemo.stopProcativeTimer();
        // check if proactive
        if (pageCfg && pageCfg.is_proactive) {
            webDemo.startProcativeTimer();
        }

        // if to show hot ares
        if (location.search.indexOf("debug=") >= 0) {
            $('[data-active]').addClass("hotspot-show");
        }

        // if to show hot ares
        if (location.search.indexOf("ghost=") >= 0) {
            GHOST = true;
        }

        // pre-process external links
            $('[data-active]').each(function(){
                if (! $(this).attr("href")) {
                    return;
                }
                // resetting for working with onClick
                var hr = $(this).attr("href").replace(/&lt;/g, '<').replace(/&gt;/g, '>') ;
                if (hr.indexOf("<") == 0) {
                    var parameters = hr.substr(1, hr.indexOf(">") - 1),
                        link = hr.substr(hr.indexOf(">") + 1);
                    $(this).removeAttr("href");
                    $(this).on("click", function(){
                        window.open(link, "_blank", parameters); //"width=" + sizeX + ", height=" + sizeY + ", top=200, left=200");
                    });
                }
            });

        // adding post processing 
        $('[data-active]').one('click', function(event){   //  hot area pp actoins - works one time

            if (true || GHOST) return; // timeline updates & post actions are disabled for this demo

            var hotArea = this;
            $.each(appCfg.areas, function(i, item){  // looking for that item post actions
                if (hotArea.getAttribute(item["area_id"]) === "" && item["post-actions"] && item["post-actions"].length > 0) { // and hot area has post actions
                    webDemo.postProcessing(item["post-actions"]);
                }
            });
        });

        // process Back button
        $('[data-back]').click(function () {
            history.go(-1);
        });

        // process identify AC
        $('[to-confirmation]').click(function () {

            if (GHOST) return;  // AC Identification is disabled for ghost visitors

            ac('identify', genWeb.pfs_id, {
              givenName: genWeb.customer["c_first_name"],
              familyName: genWeb.customer["c_last_name"],
              email: genWeb.customer["c_email"],
              phone: genWeb.pfs_id
            });
        });

        // process Back button
        $('[on-hold]').click(function () {

            if (GHOST) return;

            widgetCX.openOverlay();

            // save altocloud data to GSG
            genWeb.requestSaveData(_ac_data, null, function(res){

                console.log("WebDemo: Altocloud data saved with ID = " + res._data_id);
                _data_id = res._data_id;

                var viewUrl = 'https://bcrw.apple.com/urn:biz:5392c233-5723-4548-9cea-7fa9b9185cff?biz-intent-id='+_data_id+'&biz-group-id='+genWeb.phoneNumber;
                console.log('webDemo: AltoCloud view URL:' + viewUrl);

                // get short ABC URL and send email/SMS
                var offerParams = 
                    {
                        "PFS_id": genWeb.phoneNumber,
                        "action": "email",
                        "delay":1,
                        "subject":"Business class upgrade special offer!",
                        "text":"Dear "+genWeb.customer["c_first_name"]+ ", " + genWeb.customer["c_last_name"] +
                            ", \n\nCheck out our lower fare for Business Class! Please open the provided link to get more information:\n\n" +
                            viewUrl +
                            "\n\nWith best regards,\nBlueSky Airlines",
                        "media_type": "workitem",
                        "queue": "Customer_Story.default.StoryPostQueue"
                    }
                ;
                genWeb.submitInteraction(offerParams);

                offerParams.action = "sms";
                offerParams.subject = "";
                offerParams.text = "Dear "+genWeb.customer["c_first_name"]+", Check out our lower fare for Business Class! " + viewUrl;
                genWeb.submitInteraction(offerParams);
                offerParams = 
                    {

                        "PFS_id": genWeb.phoneNumber,
                        "action": "cms",
                        "cs-media-type": "cobrowse",
                        "media_type": "workitem",
                        "queue": "Customer_Story.default.StoryPostQueue",
                        "sw_cs_action": JSON.stringify({
                            "action": "cms",
                            "delay": 10,
                            "cs-service": "Ticket purchase",
                            "cs-state": "Upgrade offer sent",
                            "details": "Email, SMS",
                            "service": "Ticket purchase",
                            "state": "Upgrade offer sent"
                        })
                    };                    
            // {"instance":"playground","customerId":"5ac6878801709e6814336fb4","visitId":"5ac6971901709e6814336fb4"}
                webDemo.urlShortener(viewUrl, function (msg, textStatus, reques) {
                    //.loading( 'hide' );  // hide spinner
                    console.log("webDemo: URL shortener Success: " + JSON.stringify(msg));
                   // genWeb.submitInteraction(offerParams); // no cms updates for that demo
                });
            }, function(){
                console.log("WebDemo: Altocloud data saving fails!");
            });

/*            
            $.ajax({
                type: "POST",
                url:  "https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyAYBxkbJjugT-mFMWRvNDcfaEEnuqLn8uU",
                data: JSON.stringify({"longUrl": viewUrl}),
                contentType: "application/json; charset=UTF-8",
                processData: false,
                dataType: "json",

                success: function (msg, textStatus, reques) {
                    //.loading( 'hide' );  // hide spinner
                    console.log("webDemo: URL shortener Success: " + JSON.stringify(msg));
                    var offerParams = 
                        {
                            "PFS_id": genWeb.phoneNumber,
                            "action": "email",
                            "delay":1,
                            "subject":"Business class upgrade special offer!",
                            "text":"Dear "+genWeb.customer["c_first_name"]+ " "+genWeb.customer["c_first_name"],
                                +", \n\nYou have a special offer to upgrade your flight to the Business class. Please open te below link to get more information:\n\n"+
                                msg.id+
                                "\n\n With best regards,\nBlueSky Airlines",
                            "media_type": "workitem",
                            "queue": "Customer_Story.default.StoryPostQueue"
                        }
                    ;
                    genWeb.submitInteraction(offerParams);
                    offerParams.action = "sms";
                    genWeb.submitInteraction(offerParams);
                },

                error: function (XMLHttpRequest, textStatus, a) {
                    console.log("webDemo: URL shortener fails! " + XMLHttpRequest.responseText + "\n\tError: " + textStatus);
                }
            });
*/
        });

        // Contact Us buttons action
        $('[data-contact]').click(function (event) {
            // if custom menu is defined
            var menuName = $(this).attr('data-menu');
            if (typeof menuName === "undefined" || menuName === false) {
                menuName = "_default_";
            }

            // check subject, assign page title if empty
            var subj = $(this).attr('data-subject');
            // For some browsers, `attr` is undefined; for others,
            // `attr` is false.  Check for both.
            if (typeof subj !== "undefined" && subj !== false && subj.length !== 0) {
                menuSubject = subj;  // take subject from attr
            }
            else {
               // menuSubject = $.mobile.activePage[0].title; // ot from the page title
            }
            contactUsMenu(menuName, event);
        });

        $('[data-gkc]').typeahead({
            items: 4,
            source: function (query, process) {
                gkcModule.kcFindDocs(
                    query,
                    function(result){
                        var response =
                            $.map(result.response.suggestions,
                                function (item) {
                                    return item.trim();
                                });
                        process(response);
                    }
                );
            },
            afterSelect: function(selected){
                gkcModule.kcSetSearchText(selected);
                $('[data-gkc]').val('');
                gkcModule.kcOpenDoc(selected);
                $(document).trigger("wiz-menu-selected", "gkc");
            }
        });

        _windgetDataSetup();
    };

    var _urlShortener = function(longUrl, allright){
            $.ajax({
                type: "POST",
                url:  "https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyAYBxkbJjugT-mFMWRvNDcfaEEnuqLn8uU",
                data: JSON.stringify({"longUrl": longUrl}),
                contentType: "application/json; charset=UTF-8",
                processData: false,
                dataType: "json",

                success: allright,

                error: function (XMLHttpRequest, textStatus, a) {
                    console.log("webDemo: URL shortener fails! " + XMLHttpRequest.responseText + "\n\tError: " + textStatus);
                }
            });
    };

    var _windgetDataSetup = function(){

        cxwData = {};
        cxwControlData = {};
        cxwPostActions = {};
        cxwSubjects = {};

        // widget data
        if (genWeb.customMenu) {
            
            // common _widget_ data
            var cxwMenu = genWeb.customMenu["_widget_"] || {};
            cxwMenu["custom-data"] = cxwMenu["custom-data"] || {};
            cxwMenu["items"] = cxwMenu["items"] || {};

            if (cxwMenu["custom-data"]["subject"]) {
                cxwSubjects["any"] = cxwMenu["custom-data"]["subject"]; // common subject for the menu
            }

            $.each(cxwMenu["custom-data"], function (key, val) {
                if (key.indexOf("_$_") === 0) {  // if that is a control data - skip
                    cxwControlData[key] = val.trim();                   
                }
                else {
                    cxwData[key] = val;
                }
            });
            // common post actions
            _postActoins(cxwMenu);

            // page-specific widget data (overwrites common widget data)
            cxwMenu = genWeb.customMenu["_widget_" + pageCfg.page_id] || {};
            cxwMenu["custom-data"] = cxwMenu["custom-data"] || {};
            cxwMenu["items"] = cxwMenu["items"] || {};

            if (cxwMenu["custom-data"]["subject"]) {
                cxwSubjects["any"] = cxwMenu["custom-data"]["subject"]; // common subject for the menu
            }

            $.each(cxwMenu["custom-data"], function (key, val) {
                if (key.indexOf("_$_") === 0) {  // if that is a control data - skip
                    cxwControlData[key] = val.trim();                   
                }
                else {
                    cxwData[key] = val;
                }
            });
            // page specific post actions
            _postActoins(cxwMenu);
        }

        // adding common data
        cxwData._template = TEMPLATE;
        cxwData._app_name = genWeb.appName; 
        cxwData.PFS_id = genWeb.phoneNumber;

        // Widget setup
        var isWidget = (typeof widgetCX === 'object') && (typeof window._genesys.widgets.bus === 'object');
        if (isWidget && pageCfg.is_cx_widget) {
            setTimeout(function(){widgetCX.sidebarShow();}, 500);
            // Update Widget userdata
            widgetCX.cfgWidget();
        }
        else if (isWidget) {
            widgetCX.sidebarHide();
            // clear Widget data
            webDemo.cxwData = {};
        }
/*
        ac('identify', genWeb.pfs_id, {
          givenName: genWeb.customer["c_first_name"],
          familyName: genWeb.customer["c_last_name"],
          email: genWeb.customer["c_email"],
          phone: genWeb.pfs_id
        });
*/
    };

    var _postActoins = function(cxwMenu){

        $.each(cxwMenu["items"], function (key, val) {
            if (cxwMenu["items"][key]["post-actions"] && cxwMenu["items"][key]["post-actions"].length > 0) {

                cxwMenu["items"][key]["post-actions"].forEach(function(objAction){

                    if (objAction.action == "cms" && objAction["cs-service"]) {
                        var csAction = {};
                        csAction.comment = objAction["cs-title"];
                        csAction.service = objAction["cs-service"];
                        csAction.state = objAction["cs-state"];
                        csAction["cs-media-type"] = "cobrowse";
                        csAction["delay"] = objAction.delay;
                        csAction["details"] = objAction.details;
                        // for V2 cms
                        objAction["sw_cs_action"] = JSON.stringify(csAction);     
                    }
                });

                cxwPostActions[cxwMenu["items"][key]["action"]] = JSON.stringify(cxwMenu["items"][key]["post-actions"]);
            }
            if (cxwMenu["items"][key]["subject"]) {
                cxwSubjects[cxwMenu["items"][key]["action"]] = cxwMenu["items"][key]["subject"];
            }
        });
    };

    // initialization
    var _initDemo = function () {

        genWeb.helper.log("Web Demo Initialization started...");

        // set default values
        genWeb.phoneNumber = "";
        local_number = genWeb.phoneNumber;

        $.get( "//demo.genesyslab.com/gdemo/getenv.jsp?key=GDemoHost&pfsid=" + getURLParameter("phone"))

            .done(function( host, textStatus ) {
                genWeb.helper.log("Done - Request to get pfsproxy host! " + textStatus);
                // setEnvHost("//" + host); // host - removed to use hardcoded gsummit18.live.genesys.com
            })
            .fail(function(data, textStatus) {
                genWeb.helper.log("Failed - Request to get pfsproxy host! " + textStatus);
            })
            .always(function(data, textStatus) {
                genWeb.helper.log("Always - Request to get pfsproxy host! " + textStatus);

                setEnvHost("//gsummit18.live.genesys.com"); // host - removed to use hardcoded gsummit18.live.genesys.com

                if (typeof customCode !== "undefined" && typeof customCode.execute !== "undefined") {
                    customCode.execute(); // add the customization (may be redefine pfs host)
                }
                else if (textStatus != 'success') {
                    webDemo.popToast("The demo host could not be defined! Please contact Technical Marketing!", "error");
                    return;
                }

                setTimeout(function () {
                    genWeb.getCustomer(
                        getURLParameter("phone"),
                        "",
                        function () {

                            webDemo.setFieldValues();  // add personalization

                            local_number = genWeb.phoneNumber;
                            $("#customerphone").val(genWeb.phoneNumber);
                            gkcModule.kcOpenSession(genWeb.customer.contact_email);
                            setTimeout(
                                function () {
                                    genWeb.getHistory(function (msg) {
                                            refreshHistoryList(msg);
                                        },
                                        function () {
                                            genWeb.helper.log("Failed - Request to Browse history!");
                                        }
                                    );
                                }, 100);

                            // Widget init and load
                            widgetCX.initCfg();
                            if (CXW_ENABLED) {
                                (function(d, s, id, o){var f = function(){var fs = d.getElementsByTagName(s)[0], e;
                                    if (d.getElementById(id)) return;e = d.createElement(s);
                                    e.id = id;e.src = o.src;fs.parentNode.insertBefore(e, fs);},ol = window.onload;

                                if(o.onload){typeof window.onload != "function"?window.onload=f:window.onload=function(){ol();f();widgetCX.activation();}}else {f();widgetCX.activation();};})

                                            //      typeof window.onload !="function"?window.onload=f:window.onload=function(){ol();f();widgetCX.activation();}})
                                (document,'script','genesys-cx-widget', {src: WIDGET_URL});
                            }   
                        }
                    );
                }, 100); // set the customer info

        });

        // set template name and app name
        var temp = $('body').attr('data-template');
        if (typeof temp !== 'undefined' && temp.length > 0) {
            TEMPLATE = temp + "-web";
        }

        temp = $('body').attr('data-name');
        if (typeof temp !== 'undefined' && temp.length > 0) {
            genWeb.appName = temp;
            document.title = temp;
        }

        // GKC DB Vertical
        temp = $('body').attr('data-gkc-db');
        if (typeof temp !== 'undefined' && temp.length > 0) {
            gkcModule.kcSetCategory(temp);
        }

        // Journey check
        if ($('body').attr('data-journey') === "true") {
            temp = location.href;
            journeyPath = temp.substr(0, temp.indexOf("/index.html"));
            // journeyPath += "journey.cfg";
        }

        // get custom menus
        if (typeof genWeb.customMenu === "undefined" || genWeb.customMenu === null) {  // if it was not loaded dymanically
            genWeb.getMenu(function (menu) {
                    for (var key in menu) {
                        if (menu.hasOwnProperty(key)) {
                            contactMenu[key] = menu[key];
                        }
                    }
                }, function () {
                }
            );
        }
        else if (!$.isEmptyObject(genWeb.customMenu)) { // if it is not empty
            contactMenu = genWeb.customMenu;
            contactMenu._default_ = DEFAULT_MENU._default_; // add the default menu
        }

        // proactive processing
        $('#nsb-pro-voice').click(function () {
            $("#proactive-popup").popup("close");
            openCallNowPopup(true);
        });
        $('#nsb-pro-chat').click(function () {
            $("#proactive-popup").popup("close");
            openChatPopup(true);
        });

        // Survey submit button
        $('#nsb-survey').click(function () {
            history.go(-1);
            webDemo.popToast(STR_THE_SURVEY_HAS_BEEN_SUBMITTED);
            genWeb.submitSurvey({"parent_id": parent_id, "overall": "" + rating, "comment": $("#srvtext").val()});
            rate(0);  // refresh survey
            $('#srvtext').val('');
        });

        // RTC Cancel button
        $('#nsb-rtc-cancel').click(function () {
            $("#rtc-popup-page").popup("close");
            testHangUp();
        });
        $('#nsb-voice-stop').click(function () {
            $("#nsb-voice-stop").hide();
            testHangUp();
        });

        // refresh survey stars
        rate(0);

        // check proactive and widget
/*        setTimeout(function () {
            var attr = $.mobile.activePage.attr('data-proactive');
            attr = $.mobile.activePage.attr('data-widget');
            if (typeof attr !== typeof undefined && attr !== false) {
                $('.sidebar-wrapper').show(300);
            }
        }, 2000);
*/
        genWeb.helper.log("Web Demo Initialization finished!");

    };

// set env host
    var setEnvHost = function(demo_host){

        DEMO_HOST = demo_host;
        PFS_PROXY = demo_host + "/pfsproxy/pfsmobileproxy";
        genWeb.pfsServer = PFS_PROXY;
//        genWeb.gmsServer = demo_host + (demo_host.indexOf('.genesyslab.') > 0?"/host147port88/genesys": "/gms_port_8010/genesys");
        genWeb.gmsServer = DEMO_HOST.substr(0,DEMO_HOST.indexOf('.'))+'-gme'+DEMO_HOST.substr(DEMO_HOST.indexOf('.')) + '/genesys'; // "https://POD-gwe.live.genesys.com";

        GKC_HOST = demo_host; 
        if (demo_host.indexOf('.demo.genesys.com') > 0)
            GKC_HOST = GKC_HOST.replace('.demo.genesys.com', '-gkcsrv.demo.genesys.com');
        else if (demo_host.indexOf('.live.genesys.com') > 0)
            GKC_HOST = GKC_HOST.replace('.live.genesys.com', '-gkcsrv.live.genesys.com');

        gkcModule.kcSetHost(GKC_HOST, demo_host);
    };

// set customer-based personalised data
    var _setFieldValues = function(){
        $("[data-text]").each(function(idx){
            var key = $(this).attr("data-key");
            if (key && key.indexOf("_$_") >= 0 ) {

                $(this).val(key.replace(/_\$_\S\w*/g, function(match, p1, offset, string){  // replace all dynamic placeholders with values
                    var res = match;    
                    var fldKey = match.substr(3);
                    if(genWeb.customer.hasOwnProperty(fldKey)) {
                        res = genWeb.customer[fldKey];
                        $(this).removeAttr("data-key"); // to prevent attaching of that data
                    }
                    return res;
                }));

                $(this).attr("readonly", true); 
            }
        });
    };
    var contactUsMenu = function (menuName, event) {

        customParams = {};
        customParams._template = TEMPLATE;
        customParams._app_name = genWeb.appName; // clear custom data if not product/order
        customParams.subject = menuSubject;  // take subject from attr

        if (genWeb.customer.hasOwnProperty("IwsPageUrl")) {
            customParams._iws_page_url = genWeb.customer.IwsPageUrl;  // update the app name from the proxy settings
        }

        // attaching story data
        if (genWeb.story != null && typeof genWeb.story.data == 'object') {
            customParams = $.extend(customParams, genWeb.story.data);
        }

        // read the available channels
        var channels = "";
        if (genWeb.customer.hasOwnProperty("MobileChannels")) {
            channels = genWeb.customer.MobileChannels;
        }

        // menu object
        var tmpMenu = [];
        menuToShow = [];

        try {
            tmpMenu = contactMenu[menuName].items;
            tmpMenu = (tmpMenu === undefined) ? {} : tmpMenu;

            $.each(tmpMenu, function (i, item) {
                if (!item.hasOwnProperty("segment") || item.segment.toLowerCase() === genWeb.customer.c_level.toLowerCase()) {
                    if (channels.length === 0 || channels.indexOf(item.action) >= 0) { // if that channel is available
                        menuToShow.push(tmpMenu[i]);
                    }
                }
            });

            // add custom data
            customUserData = {};

            if (journeyPath.length > 0) { // path to journey json
                //customUserData["_journeyPath"] = journeyPath;
                customUserData.wiz_url2 = journeyPath + "/journey.html";
                customUserData.wiz_viewname2 = "JOURNEY";
            }

            if (typeof contactMenu[menuName]["custom-data"] !== "undefined") { // if we have some custom data
                $.each(contactMenu[menuName]["custom-data"], function (key, val) {
                    if (key.indexOf("_$_") === 0) {  // if that is a control data - affects the demo client side behaviour
                        controlData[key] = val.trim();
                    }
                    else {
                        customUserData[key] = val;
                    }
                });
            }
            // add the data from Input hot areas
            $('[data-text]').each(function () {
                var attr = $(this).attr('data-key');
                if (typeof attr !== typeof undefined && attr !== false) {
                    customUserData[$(this).attr('data-key')] = $(this).val();
                }
            });

            // adding story data for Agent view
            //if (genWeb.story != null && typeof genWeb.story.data == 'object') {
            //    $.extend(customUserData, genWeb.story.data);
            //}

            customParams.customData = JSON.stringify(customUserData);
        }
        catch (err) {
            genWeb.helper.log("Error extraction custom menu title!");
            // set the default menu
            if (menuToShow.length === 0) {
                tmpMenu = contactMenu._default_.items;
                $.each(tmpMenu, function (i, item) {
                    if (channels.length === 0 || channels.indexOf(item.action) >= 0) { // if that channel is available
                        menuToShow.push(item);
                    }
                });
            }
        }

        if (menuToShow.length === 1) {     // just call an actio if only one menu item in he list
            try {
                contactUsAction(0);
            }
            catch (e) {
                genWeb.toast("Called: " + menuToShow[0].title, 5000, null, true);
            }
            return;
        }
        else if (menuToShow.length === 0) {
            genWeb.helper.log("Empty menuToShow is called!");
            return;
        }

        localMenuDialog(
            STR_WHAT_WOULD_YOU_LIKE,
            customParams,  // custom params addde for Wizard preview
            event
        );
    };

    var contactUsAction = function (res, event) {

        genWeb.helper.log("Menu selected: " + (res + 1));

        if (typeof ac != 'undefined' && ac) {
            ac('record', 'menu.action', menuToShow[res].title);
        }

        if (menuToShow[res].hasOwnProperty("subject") && menuToShow[res].subject.length > 0) {
            customParams.subject = menuToShow[res].subject;
            genWeb.helper.log("Menu subject: '" + menuToShow[res].subject + "'");
        }  // take subject from menu

        if (menuToShow[res].hasOwnProperty("post-actions")) {
            customUserData.wiz_story_post_actions = JSON.stringify(menuToShow[res]["post-actions"]);
        }

        var action = menuToShow[res].action;

        if (action === "chat") {  // chat session
            genWeb.helper.log("Request to have a Chat!");
            openChatPopup();
        }
        else if (action === "webrtccall") {   // webrtccall
            genWeb.helper.log("Request to webrtccall!");
            startRtcCall();
        }
        else if (action === "webrtcvideo") {   // webrtc video
            genWeb.helper.log("Request to webrtcvideo!");
            openVideoPopup();
        }
        else if (action === "call") {   // call now
            genWeb.helper.log("Request to call now!");
            $(document).trigger('wiz-menu-selected', action);
            //openCallNowPopup();
        }
        else if (action === "callback") {   // schedule a call
            genWeb.helper.log("Request for a callback!");
            $(document).trigger('wiz-menu-selected', action);
            //openCallbackPopup();
        }
        else if (action === "vidyo") {   // schedule a call
            genWeb.helper.log("Request for a vidyo!");
            initGV();
        }
        else if (action === "task") {   // task
            genWeb.helper.log("Request to submit a task!");
            if (controlData["_$_silent_submit"] === "true") {  // if to submit w/o a dialog
                _submitTask(customUserData);
            }
            else {
                $(document).trigger('wiz-menu-selected', action);
            }
            //openTaskPopup();
        }
        else if (action === "email") {   // email
            genWeb.helper.log("Request to send an Email!");
            $(document).trigger('wiz-menu-selected', action);
            //openEmailPopup();
        }
        else if (action === "history") {   // history
            genWeb.helper.log("Request to show the History!");
            $(document).trigger('wiz-menu-selected', action);
            //openHistoryPopup();
        }
        else if (action === "submenu") {   // submenu
            genWeb.helper.log("Request a submenu: " + menuToShow[res].submenu);
            setTimeout(function () {
                contactUsMenu(menuToShow[res].submenu, event);
            }, 200); // call the sub-menu
        }
        else if (action === "gkc") {   // call now
            genWeb.helper.log("Request for GKC page!");
            gkcModule.kcSetSearchText("");
            $(document).trigger('wiz-menu-selected', action);
            //openGkcPopup();
        }
        else if (action === "system") {   // system actions params in subject, format - service:action:param1:param2
            genWeb.helper.log("Request a system action: " + customParams.subject);
            var sysParams = customParams.subject? customParams.subject.split(":"): [];
            var isSilent = controlData["_$_silent_submit"] === "true";
            var sysAction = "";
            var sysMsg = "";

            switch (sysParams[0]) {

                case "story":
                    if (sysParams[1] === "start" && sysParams[2]) {
                        sysAction = "/Start/" + genWeb.pfs_id + "/" + sysParams[2];
                        sysMsg = "Story " + sysParams[2] + " is active";
                    }
                    else if (sysParams[1] === "stop") {
                        sysAction = "/Stop/" + genWeb.pfs_id;
                        sysMsg = "Active story is stopped";
                    }
                    else {
                        break;
                    }

                    var reqSettings = {
                        "async": true,
                        "crossDomain": true,
                        "url": GDEMO_STORY_URL + sysAction,
                        "method": "POST"
                    };

                    $.ajax(reqSettings)
                        .done(function () {
                            if (sysParams[1] === "start") {  // getting new active customer story
                                $.get(GDEMO_STORY_URL + '/Active/' + genWeb.pfs_id)
                                    .done(function (result, textStatus) {
                                        genWeb.helper.log("Done - Request to get Story! " + textStatus);
                                        genWeb.story = result;
                                        isSilent || _popToast(sysMsg);
                                    })
                                    .fail(function (data, textStatus) {
                                        genWeb.helper.log("Failed to get active Story! " + textStatus);
                                        _popToast("Story is not activated", "error");
                                    });
                            }
                            else if (sysParams[1] === "stop"){
                                genWeb.story = null;
                                isSilent || _popToast(sysMsg);
                            }
                        })
                        .fail(function (jqXHR, textStatus) {
                            _popToast(sysMsg, 'error');
                            genWeb.helper.log("Request failed: " + textStatus);
                        })
                    ;

                    break;

                    case "env":
                        if (sysParams[1] === "select") {

                            var GDEMO_POD_URL = GDEMO_PORTAL  + '/gdemo/api/PODService/DemoEnvironment/' + genWeb.pfs_id + '/' + (sysParams[2] || "");

                            $.post(GDEMO_POD_URL)
                                .done(function (result, textStatus) {
                                    genWeb.helper.log("Done - Request to get Story! " + textStatus);
                                    isSilent ||_popToast("Demo environment '" + (sysParams[2] || "Gdemo Hosted") + "' is selected!");
                                })
                                .fail(function(jqXHR, textStatus){
                                    _popToast("Failed to select a demo environment!", 'error');
                                    genWeb.helper.log("Request failed: " + textStatus + '\n');
                                    genWeb.helper.log(JSON.stringify(jqXHR, null, 4));
                                }
                            );
                        }

                    break;

                default:
            }
        }
    };

// preparation the custom request parameters
    var setCustomParameters = function (params) {
        customParams.customData = JSON.stringify(params);
    };

// survey stars score
    var rate = function (score) {
        $("#stars").children("img").attr("src", "images/star.png");
        $("#stars").children("img").slice(0, score).attr("src", "images/star_highlighted.png");
        rating = score;
    };

    var localMenuDialog = function (title, customParams, event) {

        //$(document).trigger('wiz-cus-selected', title, menuToShow, event);

        //return;

        var ul_html = "";
        for (var i = 0; i < menuToShow.length; i++) {
            ul_html += '<button style="text-align:left!important; margin-bottom: 5px; width:100%;" type="button"'+
            'onclick=\'webDemo.processMenuSelection("'+i+'", event);\' class="btn btn-default" data-role="none">'+
                menuToShow[i].title + '</button>';

        }

        var position = "bottom";

        if (window.innerHeight - event.clientY < 300) position = "top";
        if (event.clientY < 300 ) position = "bottom";
        if (window.innerWidth - event.clientX < 300) position = "left";
        if (event.clientX < 300 ) position = "right";

        // destroy popover if it exists
        if (!!popoverElement) {
            try {
                popoverElement.popover("destroy");
            }
            catch (e) {
            }
        }

        popoverElement = $(event.delegateTarget);
        popoverElement.popover({
            trigger: 'manual',
            placement: position,
            //title: "Make a choice",
            delay: 200,
            html: true,
            content: function() {
                return  ul_html;
            }
        });

        popoverElement.popover("show");
    };

// Contact Us actions processing
    var _processMenuSelection = function (res, event) {

        try {
            popoverElement.popover("destroy");
            popoverElement = null;
        }
        catch(e){}

        setTimeout(function () {
           contactUsAction(res, event);
        }, 100);

    };

// Chat Widge processing -----
    var openChatPopup = function (isProactive, isWidget, callback) {

        var _cxwData = webDemo.getCxwData();

        if (!!isProactive) {
            customParams = {};
            customParams._template = TEMPLATE;
            customParams._app_name = genWeb.appName; // clear custom data if not product/order
            customParams.subject = $.mobile.activePage[0].title; // ot from the page title
        }

        var data = {
            "subject": isWidget? (_cxwData["subject"] || "Web Chat"): customParams.subject, 
            "customData": JSON.stringify(isWidget? _cxwData: customUserData)
        };

        genWeb.requestSaveData(data, null,
            function (msg) {
                _openChatPopup(msg._data_id, isWidget, callback);
            },
            function (msg) {
                _openChatPopup("", isWidget, callback);
            }
        );
    };

    var _openChatPopup = function (gmsDataId, isWidget, callback) {

        var customData = isWidget? webDemo.getCxwData(): customUserData;
        var userData = {};

        if (typeof customData === "object") {

            userData = customData;
            var pageParams = "";

            $.each(customData, function (key, value) {
                if (key.indexOf("_") !== 0 && key.indexOf("wiz_") !== 0) {  // dont' add keys that starts with '_' to the desktop popup view
                    pageParams += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
                }
            });

            if (pageParams.length > 0) {
                userData.dynamicCaseData = "<a href=\"" + genWeb.customer.IwsPageUrl + TEMPLATE + ".html?" + pageParams +
                    "\" title=\"Show Details\" />";
            }
        }

        // post processing actions
        if (customData.hasOwnProperty("wiz_story_post_actions") && customData.wiz_story_post_actions.length > 0){
            userData.wiz_story_post_actions = customData.wiz_story_post_actions;
        }

        userData._template = TEMPLATE;
        userData.demoID = TEMPLATE;
        userData.companyTitle = genWeb.appName;

        if (journeyPath.length > 0 && !userData.hasOwnProperty("wiz_url2")) { // path to journey json
            userData.wiz_url2 = journeyPath + "/journey.html";
            userData.wiz_viewname2 = "JOURNEY";
        }

        if (!!gmsDataId) {
            userData._data_id_wiz = gmsDataId; // assign gms data id
            userData._data_id = gmsDataId; // assign gms data id
        }

        if (isWidget) {
            callback(userData);
        }
        else {    
            //widgetCX.setCustomData(userData);
            widgetCX.startChat(userData);
            stopTimer = true; // stop proactive timer
        }
    };

// --------------------------------------------

// History popup opening
    var openHistoryPopup = function () {

        if (hist.length === 0) {
            genWeb.helper.log("The Contact History is empty");
            return;
        }

        hist_details(0);
        setTimeout(function () {
            $("#history-popup-page").popup("open");
        }, 200);
    };

// ============================================================================================

// ---------------------------------- History processing --------------------------------------
    var refreshHistoryList = function (msg) {

        // fill the list of the products
        var curDate = "";
        var ixnDate = "";
        var RightNow = new Date();
        var dateFormat = "MMM d, y"; // "EE, MMM d, y";
        var subject = "";
        var mediaType = "";
        var ixn = {}; // for ark
        var icons = {
            "voice": "icon-iw-active-circle-voice",
            "email": "icon-iw-active-circle-email",
            "chat": " icon-iw-active-circle-chat-square",
            "webform": "icon-iw-active-circle-doc",
            "webcallback": "icon-iw-active-circle-callback",
            "survey": "icon-iw-active-circle-question"
        };

        hist = (msg === null) ? [] : msg; // save history

        if (! msg || msg.length === 0) {
            genWeb.helper.log("The Contact History is empty");
            return;
        }

        var ixnId = 0;
        var ixnListForDate = [];
        for (var i = 0; i < msg.length; i++) {

            ixn.id = ixnId;
            ixn.time = "";
            ixn.subject = "";
            ixn.icon = "";
            ixn.ixnHtml = "";

            // get date converted to the local time
            ixnDate = dateFromISO8601(msg[i].StartDate);

            ixnDate = new Date(ixnDate.getTime() - 60000 * RightNow.getTimezoneOffset());

            if (curDate !== formatDate(ixnDate, dateFormat)) {  // new date - add delimiter
                if (ixnListForDate.length  > 0) {
                    var dateObj = {date: curDate, isOpen: true, listOfInteractions: ixnListForDate.slice()};
                    ixnHistList.push(dateObj);
                    ixnListForDate = [];
                }
                curDate = formatDate(ixnDate, dateFormat);
            }

            msg[i].ixnDate = curDate; // save the formatted date
            msg[i].ixnTime = ixnDate.toLocaleTimeString(); // save the formatted time
            ixn.time = msg[i].ixnTime;

            if (msg[i].hasOwnProperty("EndDate")) {
                var ixnDateEnd = dateFromISO8601(msg[i].EndDate);
                ixnDateEnd = new Date(ixnDateEnd.getTime() - 60000 * RightNow.getTimezoneOffset());
                msg[i].ixnTimeEnd = ixnDateEnd.toLocaleTimeString(); // save the formatted time
            }

            // looking for Subject
            if (msg[i].Subject === undefined) {
                if (msg[i].UserData !== undefined && msg[i].UserData.Subject !== undefined) {
                    subject = msg[i].UserData.Subject;
                } else {
                    subject = STR_NO_SUBJECT;
                }
            }
            else {
                subject = msg[i].Subject;
            }
            ixn.subject = subject;

            if (icons.hasOwnProperty(msg[i].MediaTypeId)) {
                ixn.icon = icons[msg[i].MediaTypeId];
            }
            else {
                ixn.icon = "icon-iw-active-circle-doc";
            }

            ixn.time = msg[i].ixnTime;
            hist[i] = msg[i]; //save history

            ixn.ixnHtml = hist_details(i);
            ixnListForDate.push($.extend({}, ixn));
            ixnId++;
        }

        // finalization
        if (ixnListForDate.length  > 0) {
            var dateObj = {date: curDate, isOpen: true, listOfInteractions: ixnListForDate.slice()};
            ixnHistList.push(dateObj);
        }

    };

    var hist_details = function (i) {

        var htmlContent = "";

        // date/time
        htmlContent += "<strong>" + STR_DATE + "</strong>" + hist[i].ixnDate;
        htmlContent += "<br><strong>" + STR_TIME + "</strong>" + hist[i].ixnTime;

        var uData = hist[i].hasOwnProperty("UserData") ? hist[i].UserData : {};

        // media type
        var media = hist[i].MediaTypeId;
        media = media === "voice" ? "call" : media;
        htmlContent += "<br><strong>" + STR_TYPE + "</strong>" + media;

        var subj = "";
        if (hist[i].hasOwnProperty("Subject")) {
            subj = hist[i].Subject;
        } else if (uData.hasOwnProperty("Subject")) {
            subj = uData.Subject;
        }

        // subject
        htmlContent += "<br><strong>" + STR_SUBJECT + "</strong>" + subj;

        // note for customer
        if (uData.hasOwnProperty("note2customer") && uData.note2customer.length > 0) {
            htmlContent += "<br><br><font color='blue'><strong>" + STR_NOTE + "</strong>" + uData.note2customer + "</font>";
        }

        htmlContent += "<br><hr>";

        // adding the details - text, etc

        if (media === "call") {

            htmlContent += "<br><strong>" + STR_CALL_START_TIME + "</strong>" + hist[i].ixnTime;
            htmlContent += "<br><strong>" + STR_CALL_END_TIME + "</strong>" + (hist[i].hasOwnProperty("ixnTimeEnd") ?
                    hist[i].ixnTimeEnd : "") + "<br>";

            // Disposition code
            if (uData.hasOwnProperty("DispositionCode")) {
                htmlContent += "<br><strong>" + STR_DISPOSITION_CODE + "</strong>" + uData.DispositionCode + "<br>";
            }
            // device info
            if (uData.hasOwnProperty("currentaddress")) {
                htmlContent += "<br><strong>" + STR_LOCATION + "</strong>" + uData.currentaddress;
            }
            if (uData.hasOwnProperty("Demo-PFS_Mobile-Common-DeviceId")) {
                htmlContent += "<br><strong>" + STR_DEVICE_MODEL + "</strong>" + uData["Demo-PFS_Mobile-Common-DeviceId"];
            }
            if (uData.hasOwnProperty("Demo-PFS_Mobile-Common-DeviceName")) {
                htmlContent += "<br><strong>" + STR_DEVICE_NAME + "</strong>" + uData["Demo-PFS_Mobile-Common-DeviceName"];
            }
            if (uData.hasOwnProperty("Demo-PFS_Mobile-Common-DeviceOsVersion")) {
                htmlContent += "<br><strong>" + STR_DEVICE_OS_VERSION + "</strong>" + uData["Demo-PFS_Mobile-Common-DeviceOsVersion"];
            }

        }
        else if (media === "survey") {
            if (uData.hasOwnProperty("survey_answer_Overall")) {
                htmlContent += "<br><strong>" + STR_OVERALL_RATING + "</strong>" + uData.survey_answer_Overall;
            }
            if (uData.hasOwnProperty("survey_answer_Text")) {
                htmlContent += "<br><strong>" + STR_COMMENT + "</strong>" + uData.survey_answer_Text;
            }
        }
        else if (media === "email") {

            // processing the breaks
            var result = "<p>" + hist[i].Text + "</p>";
            result = result.replace(/\r\n\r\n/g, "</p><p>").replace(/\n\n/g, "</p><p>");
            result = result.replace(/\r\n/g, "<br />").replace(/\n/g, "<br />");

            // htmlContent += "<br><strong>Text: </strong><br>";
            if (hist[i].hasOwnProperty("Text")) {
                htmlContent += result;
            } else if (hist[i].hasOwnProperty("StructuredText")) {
                htmlContent += hist[i].StructuredText;
            }

        }
        else if (media === "chat") {
            var id2nick = {};
            var id2type = {};

            if (hist[i].hasOwnProperty("StructuredText")) {  // do we have the transcript?

                var xmlDoc = $.parseXML(hist[i].StructuredText); // parse it

                // build relations userId to userType and userNick
                $(xmlDoc).find("newParty").each(function () {

                    var id = $(this).attr("userId");

                    $(this).find("userInfo").each(function () {
                        id2nick[id] = $(this).attr("userNick");
                        id2type[id] = $(this).attr("userType");
                    });
                });

                // fill the transcript
                $(xmlDoc).find("message").each(function () {
                    htmlContent += (id2type[$(this).attr("userId")] === "CLIENT" ? "<font color='blue'>" : ""); // higlight own messages
                    htmlContent += "<strong>" + id2nick[$(this).attr("userId")] + ": </strong><br>" + $(this).text() + "<br><br>";
                    htmlContent += (id2type[$(this).attr("userId")] === "CLIENT" ? "</font>" : ""); // higlight own messages
                });
            }
        }
        else {
            htmlContent += "<br><strong>Text: </strong><br>";

            if (media === "twitter") {
                htmlContent += hist[i].UserData._twitterMsgPlainText;
            }
            else if (media === "facebook") {
                htmlContent += hist[i].UserData._facebookMessageText;
            }
            else if (media === "sms") {
                htmlContent += hist[i].UserData._smsText;
            }
            else if (hist[i].hasOwnProperty("Text")) {
                htmlContent += hist[i].Text;
            }
            else if (hist[i].hasOwnProperty("StructuredText")) {
                htmlContent += hist[i].StructuredText;
            }
        }


        // <br><strong>Text: </strong>" + (hist[i].hasOwnProperty("Text")? hist[i]["Text"]: "");

        return htmlContent;
    };

// ---------------------------------- End of History processing --------------------------------------

// ------------- Some Date functions -------------------

// ------------------------------------------------------------------
// formatDate (date_object, format)
// Returns a date in the output format specified.
// The format string uses the same abbreviations as in getDateFromFormat()
//
// from //www.mattkruse.com/javascript/date/source.html
// ------------------------------------------------------------------

    var LZ = function (x) {
        return (x < 0 || x > 9 ? "" : "0") + x;
    };

    var formatDate = function (date, format) {
        format = format + "";
        var result = "";
        var i_format = 0;
        var c = "";
        var token = "";
        var y = date.getYear() + "";
        var M = date.getMonth() + 1;
        var d = date.getDate();
        var E = date.getDay();
        var H = date.getHours();
        var m = date.getMinutes();
        var s = date.getSeconds();
        var yyyy, yy, MMM, MM, dd, hh, h, mm, ss, ampm, HH, KK, K, kk, k;
        // Convert real date parts into formatted versions
        var value = {};
        if (y.length < 4) {
            y = "" + (y - 0 + 1900);
        }
        value.y = "" + y;
        value.yyyy = y;
        value.yy = y.substring(2, 4);
        value.M = M;
        value.MM = LZ(M);
        value.MMM = MONTH_NAMES[M - 1];
        value.NNN = MONTH_NAMES[M + 11];
        value.d = d;
        value.dd = LZ(d);
        value.E = DAY_NAMES[E + 7];
        value.EE = DAY_NAMES[E];
        value.H = H;
        value.HH = LZ(H);
        if (H === 0) {
            value.h = 12;
        }
        else if (H > 12) {
            value.h = H - 12;
        }
        else {
            value.h = H;
        }
        value.hh = LZ(value.h);
        if (H > 11) {
            value.K = H - 12;
        } else {
            value.K = H;
        }
        value.k = H + 1;
        value.KK = LZ(value.K);
        value.kk = LZ(value.k);
        if (H > 11) {
            value.a = "PM";
        }
        else {
            value.a = "AM";
        }
        value.m = m;
        value.mm = LZ(m);
        value.s = s;
        value.ss = LZ(s);
        while (i_format < format.length) {
            c = format.charAt(i_format);
            token = "";
            while ((format.charAt(i_format) === c) && (i_format < format.length)) {
                token += format.charAt(i_format++);
            }
            if (value[token]) {
                result = result + value[token];
            }
            else {
                result = result + token;
            }
        }
        return result;
    };

// converts ISO date format string to a date
    var dateFromISO8601 = function (isostr) {
        var parts = isostr.match(/\d+/g);
        return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
    };

// check if to show th eoriginal image size
    var ifImageScale = function (event) {

        return;  // TODO
        var img = new Image();

        img.src = $('[data-role="page"]').first().css('background-image').replace(/url\(|\)$/ig, "");
        var imgWidth = img.width;
        var imgHeight = img.height;

        if (Math.abs((window.innerWidth - imgWidth) / window.innerWidth) < 0.01 &&
            Math.abs((window.innerHeight - imgHeight) / window.innerHeight) < 0.01) {
            $('[data-role="page"]').addClass("no-scaled");
        }
        else {
            $('[data-role="page"]').removeClass("no-scaled");
        }

    };


    var openVideoPopup = function () {
        openWebRtcWindow("video", dataForRtc());
    };

    var startRtcCall = function () {
        openWebRtcWindow("voice", dataForRtc());
    };

    var openWebRtcWindow = function(type, udata){
        var url = RTC_PAGE_URL + "?phone=" + local_number;
        var win;

        if (type === "voice") {
            url += "&type=voice&udata=" + encodeURIComponent(JSON.stringify(udata));
            win = window.open(url, "_blank", "height=180,width=280,status=0,menubar=0");
            win.moveTo(100, 100);
        }
        else {
            url += "&type=video&udata=" + encodeURIComponent(JSON.stringify(udata));
            win = window.open(url, "_blank", "height=640,width=740,status=0,menubar=0");
            win.moveTo(300, 200);
        }
    };


    var dataForRtc = function () {
        var params = [];
        if (typeof customUserData === "object") {
            // build the form input fields
            $.each(customUserData, function (key, val) {
                if (key === 'reason') {
                    params.push({key: 'BS_CallReason', value: val});
                } else if (key === 'comment') {
                    params.push({key: 'Comments', value: val});
                } else {
                    var obj = {};
                    obj.key = key;
                    obj.value = val;
                    params.push(obj);
                }
            });
        }

        params.push({key: "demoID", value: TEMPLATE});
        params.push({key: "companyTitle", value: genWeb.appName});
        params.push({key: "PFS_id", value: local_number});

        if (typeof customUserData === "object") {
            var pageParams = "";

            $.each(customUserData, function (key, value) { // skip task sysm data and data that starts with '_'
                if (! (key.toLowerCase() === "reason" || key.toLowerCase() === "comment" ||
                       key.toLowerCase() === "wiz_story_post_actions" ) ) {
                    pageParams += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
                }
            });

            if (pageParams.length > 0) {
                params.push({
                    key: "dynamicCaseData",
                    value: "<a href=\"" + genWeb.customer.IwsPageUrl + TEMPLATE + ".html?" + pageParams + "title=Show+Details\" />"
                });
            }
        }

        console.log(JSON.stringify(params));
        return params;
    };

// ----------------- Open GKC Page ---------------

    var getAgentStat = function () {
        proTimer = setTimeout(
            function () {
                genWeb.agentCheck(
                    function (msg) {
                        if (msg.agents > 0 && !stopTimer) {
                            // proactive popup
                            setTimeout(function () {
                                var snd = document.getElementById('prosound');
                                snd.currentTime = 0;
                                snd.play();
                                widgetCX.invitePopup();
                                stopTimer = true;
                            }, 200);
                        }
                        else if (!stopTimer) {
                            getAgentStat();
                        }
                        else {
                            console.log("Proctive timer is stopped");
                            stopTimer = false;
                        }
                    },
                    function (XMLHttpRequest, textStatus, a) {
                    }
                );
            },
            2000);
    };

    var _submitTask = function(param){

        customUserData = param;
        genWeb.requestSaveData({"subject": customParams.subject, "customData": JSON.stringify(param)}, null,
            function (msg) {
                submitIwd(msg._data_id);
            },
            function (msg) {
                submitIwd("");
            }
        );
    };

    var submitIwd = function(gmsDataId){

        // data for iWD

        var comment = "The request was submitted from " + genWeb.appName + " application";
        var now = new Date();

        var params = {};

        params._template = TEMPLATE;
        params.mobile = "no";
        params.Subject = customParams.subject;
        params.subject = customParams.subject;
        params.pfs_id = genWeb.pfs_id;
        params.date = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
        params.amount = (customUserData.hasOwnProperty("amount") ? customUserData.amount :
            (customUserData.hasOwnProperty("Amount") ? customUserData.Amount : ""));
        params.product = "Order";
        params.details = (customUserData.hasOwnProperty("description") ? customUserData.description :
            customUserData.hasOwnProperty("Description") ? customUserData.Description : comment);
        params.comment = "";
        params.reason = customUserData.hasOwnProperty("reason") ? customUserData.reason :
            (customUserData.hasOwnProperty("Reason") ? customUserData.Reason : "");

        if (typeof customUserData === "object") {
            var pageParams = "";

            $.each(customUserData, function (key, value) { // skip task sysm data and data that starts with '_'
                if (!(key.toLowerCase() === "reason" || key.toLowerCase() === "description" ||
                    key.toLowerCase() === "amount" || key.indexOf("wiz_") === 0)) {
                    //if (key.indexOf("_") != 0) {
                    pageParams += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
                    //}
                    params['--kvp--' + key] = value; // attach the custom user data with prefix --kvp-- (it will be removed in proxy)
                    //--kvp--
                }

                // adding post-processing actions
                if (key === "wiz_story_post_actions") {
                    params["--kvp--wiz_story_post_actions"] = value;
                }

            });

            if (!!gmsDataId) {
                params["--kvp--" + "_data_id"] = gmsDataId; // assign gms data id
            }

            if (pageParams.length > 0) {
                // <a href="URL" title="TITLE" />
                params.dynamicCaseData = "<a href=\"" + genWeb.customer.IwsPageUrl + TEMPLATE + ".html?" + pageParams +
                    "\" title=\"Show Details\" />";
            }

        }

        genWeb.sendIwd(params,
            function(){
                webDemo.popToast(STR_TASK_SUBMITTED);
        },
            function(){
                webDemo.popToast("Submittion Failed!", "error");
            }
        );


    };

    var _postProcessing = function(ppArray){

        $.each(ppArray, function(idx, action){

            var requestParams = {
                "queue": genWeb.customer["story.PostActionQueue"], 
                "media_type": "workitem",
                "PFS_id": genWeb.phoneNumber
            };

            switch(action.action) {
                case "email":
                    requestParams["action"] = "email";
                    requestParams["delay"] = action.delay;
                    requestParams["subject"] = action.subject;
                    requestParams["text"] = action.text;
                    requestParams["survey"] = (action.survey === true);
                    break;
                case "sms":
                    requestParams["action"] = "sms";
                    requestParams["delay"] = action.delay;
                    requestParams["text"] = action.text;
                    requestParams["survey"] = (action.survey === true);
                    break;
                case "cms":
                    requestParams["action"] = "cms";
                    requestParams["cs-media-type"] = "cobrowse";
                    if (action["cs-service"]) {  // preparation for V2 
                        action.comment = action["cs-title"];
                        action.service = action["cs-service"];
                        action.state = action["cs-state"];
                        requestParams["cs-media-type"] = "cobrowse";
                        requestParams["sw_cs_action"] = JSON.stringify(action);     
                    }
                    else {
                        requestParams["delay"] = action.delay;
                        requestParams["details"] = action.details;
                        requestParams["cs-state"] = action["cs-state"];
                        requestParams["cs-title"] = action["cs-title"];
                    }
                    break;
                case "iwd":
                    requestParams["action"] = "iwd";
                    requestParams["delay"] = action.delay;
                    requestParams["details"] = action.details;
                    requestParams["subject"] = action["subject"];
                    break;
                case "call":
                    requestParams["action"] = "call";
                    requestParams["delay"] = action.delay;
                    requestParams["phone"] = action.phone;
                    requestParams["target"] = action["target"];
                    requestParams["connect-to"] = action["connect-to"];
                    if (action["text"])
                        requestParams["text"] = action.text;
                    requestParams["survey"] = (action.survey === true);
                    break;
                case "twitter":
                    requestParams["action"] = "twitter";
                    requestParams["delay"] = action.delay;
                    requestParams["text"] = action.text;
                    requestParams["survey"] = (action.survey === true);
                    break;
                case "end":
                    requestParams["action"] = "end";
                    requestParams["delay"] = action.delay;
                    break;
                case "push":
                    requestParams["action"] = "push";
                    requestParams["delay"] = action.delay;
                    requestParams["text"] = action.text;
                    requestParams["survey"] = (action.survey === true);
                    break;
                default:
                    requestParams = false;
            }

            if (requestParams) {
                genWeb.submitInteraction(requestParams);
            }
        });
    };

    var _getParams = function(){

        // post processing actions adding
        if (customUserData.hasOwnProperty("wiz_story_post_actions") && customUserData.wiz_story_post_actions.length > 0){
            customParams.wiz_story_post_actions = customUserData.wiz_story_post_actions;
        }

        return $.extend(true, {}, customParams);
    };
    var _getLocalPhone = function(){return local_number;};
    var _setLocalPhone = function(phone){local_number = phone;};

    var _popToast = function(text, type){
        if (!!!type) {
            type = "success";
        }
        // toast triggered by button click - w/a for ARK toast problem (was failed to be shown
        //  if called not from a ng-controller)
        $("#wiz-toast").attr("data-msg", text).attr("data-type", type);
        setTimeout(function(){$("#wiz-toast").trigger("click");}, 200);
    };
    var _getHistIxn = function(){return ixnHistList;};

    var _stopProcativeTimer = function(){
        window.clearTimeout(proTimer);
    };

    var _startProcativeTimer = function(){
        stopTimer = false;
        proTimer = setTimeout(function () {
            getAgentStat();
        }, PROACTIVE_TIMEOUT);
    };

    var _getAppCfg = function(){
        return $.extend(true, {}, appCfg);
    };

    var _setAppCfg = function(value){
        appCfg = $.extend(true, {}, value);
    };

    var _getControlData = function(){
        return $.extend(true, {}, controlData);
    };
    var _getCxwData = function(){
        return $.extend(true, {}, cxwData);
    };
    var _setStopTimer = function(flag){
        return stopTimer = flag;
    };
    var _getCxwPostActions = function(){
        return $.extend(true, {}, cxwPostActions);
    };
    var _getCxwControlData = function(){
        return $.extend(true, {}, cxwControlData);
    };
    var _getCxwSubjects = function(){
        return $.extend(true, {}, cxwSubjects);
    };
    
    var _stateSpecificCheck = function() {

        genWeb.getRecentCmsState(function(result){

            var service = result.service,
                state = result.state,
                story = genWeb.story,
                prompt = '',
                page_id = '';

            try {
                prompt =  story["resources"]["cs-services"][service][state]["web"]["prompt"];
                page_id = story["resources"]["cs-services"][service][state]["web"]["page_id"];
            }
            catch (e) {
            }

            if (!! prompt && !! page_id) {
                
                var oToastView = {
                    type: "generic",
                    body: prompt,
                    icon: "info",
                    controls: "close",
                    buttons: {
                        type: "binary",
                        secondary: cxw_i18n[STR_WIDGET_LOCALE].sendmessage.SendMsgFormClose  || "Cancel",
                        primary: cxw_i18n[STR_WIDGET_LOCALE].sendmessage.EmailOk  || "OK"
                    }
                };

                // opening a state specific popup
                window._genesys.cxwidget.bus.command("Toaster.open", oToastView).done(function(e2){
                    $(e2.html).find(".cx-btn.cx-btn-default").click(function(){
                        window._genesys.cxwidget.bus.command("Toaster.close");
                    });
                    $(e2.html).find(".cx-btn.cx-btn-primary").click(function(){
                        window._genesys.cxwidget.bus.command("Toaster.close");
                        location.href = "#" + page_id;
                    });
                });
            }
        });
    };

    // public methods
    return {
        setAcData: _setAcData,
        getCxwSubjects: _getCxwSubjects,
        getCxwControlData: _getCxwControlData,
        getCxwPostActions: _getCxwPostActions,
        setStopTimer: _setStopTimer,
        processMenuSelection: _processMenuSelection,
        rtcVoiceCall: makeVoiceCall,
        rtcVideoCall: makeVideoCall,
        initDemo: _initDemo,
        initPage: _initPage,
        getParams: _getParams,
        getLocalPhone: _getLocalPhone,
        setLocalPhone: _setLocalPhone,
        getHistIxn: _getHistIxn,
        popToast: _popToast,
        stopProcativeTimer: _stopProcativeTimer,
        startProcativeTimer: _startProcativeTimer,
        getAppCfg: _getAppCfg,
        setAppCfg: _setAppCfg,
        getControlData: _getControlData,
        submitTask: _submitTask,
        setFieldValues: _setFieldValues,
        openChat: openChatPopup,
        getCxwData: _getCxwData,
        windgetDataSetup: _windgetDataSetup,
        postProcessing: _postProcessing,
        stateSpecificCheck: _stateSpecificCheck,
        urlShortener: _urlShortener

    };

})(jQuery); // webDemo module


// external free functions
function setSegment(status) {
    'use strict';
    genWeb.customer.c_level = status;
}


// -----------------------------------------------
(function($) {
    'use strict';

    genWeb.appName = "Web Demo";

// document loaded
    $(document).ready(function (){
        webDemo.initDemo();

        // popover dismissl
        $('html').on('click', function(e) {
            if (typeof $(e.target).data('original-title') == 'undefined' &&
                !$(e.target).parents().is('.popover.in')) {
                $('[data-original-title]').popover('hide');
            }
        });
    });

})(jQuery);

