(function () {

    //wrapper for GA and Webengage
    var Analytics = function () {
        this.googleAnalyticsToken = new GA();
        this.webEngageToken = new WebEngage();
    }
    Analytics.prototype.pageView = function (pageName) {
        this.googleAnalyticsToken.triggerEvent({
            hitType: "pageview",
        }, pageName);
        this.webEngageToken.triggerEvent({
            hitType: "pageview",
        }, pageName);
    }
    Analytics.prototype.login = function (userId, email, contactName, contactNumber, businessName) {
        this.googleAnalyticsToken.login(userId, email, contactName, contactNumber, businessName);
        this.webEngageToken.login(userId, email, contactName, contactNumber, businessName);
    }
    Analytics.prototype.emitEvent = function (eventData, pageName) {
        this.googleAnalyticsToken.triggerEvent(eventData, pageName);
        this.webEngageToken.triggerEvent(eventData, pageName);
    }
    Analytics.prototype.logOut = function (userId) {
        this.googleAnalyticsToken.logOut(userId);
        this.webEngageToken.logOut(userId);
    }

    //function containing all required functions needed for triggering google analytics event
    var GA = function () {

        //this method checks if the tracker is initialized in the page or not
        getTrackerId = function () { return (window.gaData ? true : false) }

        //method for triggering login event
        login = function (userId, email, contactName, contactNumber, businessName) {
            if (getTrackerId()) {
                triggerEvent({
                    hitType: "event",
                    eventCategory: "LOGIN PAGE",
                    eventAction: "Login",
                    eventLabel: userId
                });
                return;
            }
            console.warn("Please add Google analytics init!");
        }
        //method to emit tracker event
        triggerEvent = function (eventData, pageName) {
            // hitType, eventCategory, eventAction, eventLabel = null, eventValue = null, fieldsObject = null

            // mandatory: eventCategory, eventAction
            // not mandatory: eventLabel, eventValue
            if (getTrackerId()) {
                if (eventData.hitType) {
                    switch (eventData.hitType.toLowerCase()) {
                        case "pageview":

                            ga("send", eventData.hitType.toLowerCase(), (window.location.pathName + window.location.search));
                            break;
                        case "event":

                            if (eventData.eventCategory && eventData.eventAction && eventData.eventLabel && eventData.eventValue)
                                ga("send", eventData.hitType.toLowerCase(), eventData.eventCategory, eventData.eventAction, eventData.eventLabel, eventData.eventValue);

                            else if (eventData.eventCategory && eventData.eventAction && eventData.eventLabel)
                                ga("send", eventData.hitType.toLowerCase(), eventData.eventCategory, eventData.eventAction, eventData.eventLabel);
                            break;
                    }
                }
                return;
            }
            console.warn("Please add Initialization startment for Webengage");
        }

        logOut = function (userId) {
            if (getTrackerId()) {
                ga('send', 'event', 'LOGOUT BUTTON', 'Logout', userId)
            }
        }
        return {
            login: login,
            triggerEvent: triggerEvent,
            logOut, logOut
        };
    }

    //function containing functions to trigger webengage events
    var WebEngage = function () {
        getTrackerId = function () { return (window.webengage ? true : false) }

        login = function (userId, email, contactName, contactNumber, businessName) {
            webengage.user.login(userId);
            webengage.user.setAttribute("userId", userId);
            webengage.user.setAttribute("email", email);
            webengage.user.setAttribute("name", contactName);
            webengage.user.setAttribute("phone", contactNumber);
        }
        logOut = function () {
            webengage.user.logout();
        }
        triggerEvent = function (eventData, pageName) {
            // hitType, eventCategory, eventAction, eventLabel = null, eventValue = null, fieldsObject = null

            // mandatory: eventCategory, eventAction
            // not mandatory: eventLabel, eventValue
            switch (eventData.hitType.toLowerCase()) {
                case "pageview":
                    webengage.track("PageView", { "PageVisited": pageName });
                    break;
                case "event":
                    let pushData = {};
                    if (eventData.eventCategory && eventData.eventAction && eventData.eventLabel && eventData.eventValue)
                        pushData = { "Category": eventData.eventCategory, "Action": eventData.eventAction, "Label": eventData.eventLabel, "Value": eventData.eventValue }

                    else if (eventData.eventCategory && eventData.eventAction)
                        pushData = { "Category": eventData.eventCategory, "Action": eventData.eventAction }

                    webengage.track(eventData.eventCategory, pushData);
                    break;
            }
        }

        return {
            login: login,
            triggerEvent: triggerEvent,
            logOut: logOut
        };
    }

    //initilizations
    window.analytics = new Analytics();


    //bind trackevent function to all the elements having data-emit-tracker attribute
    var bindTracker = function () {
        var allTrackerElements = document.querySelectorAll("[data-emit-tracker]");
        addEventListenerList(allTrackerElements, 'click', function (e) {
            e.preventDefault();
            //e.stopPropogation();
            trackEvent(this);
        });
    }
    //adding eventlistener
    function addEventListenerList(list, event, func) {
        for (var i of list) {
            i.addEventListener(event, func);
        }
    }

    //if all required data is added to data attributes then trigger event
    function trackEvent(element) {
        if (element) {

            let pushData = {
                hitType: "event",
                eventCategory: element.getAttribute("data-event-category") || null,
                eventAction: element.getAttribute("data-event-action") || null,
                eventLabel: element.getAttribute("data-event-label") || null,
                eventValue: element.getAttribute("data-event-value") || null
            };
            let redirectUrl = element.getAttribute("data-event-redirecturl") || null;
            if (pushData.eventCategory && pushData.eventAction && pushData.eventLabel && pushData.eventValue) {
                analytics.emitEvent(pushData);
            }
            else if (pushData.eventCategory && pushData.eventAction && pushData.eventLabel) {
                analytics.emitEvent(pushData);
            }
            redirectUrl ? window.location.href = redirectUrl : false;
        }
    }

    window.onload = bindTracker();
})();

