/*! For license information please see amped.snippet.LICENSE.txt */
"use strict";
(self.webpackChunk_mailchimp_forms_mcf_snippet = self.webpackChunk_mailchimp_forms_mcf_snippet || []).push([
    [3493], {
        3493: (e, t, n) => {
            n.r(t), n.d(t, {
                DataLayerIntegrationService: () => s
            });
            var a = n(419);
            var r = n(2229),
                i = function() {
                    return i = Object.assign || function(e) {
                        for (var t, n = 1, a = arguments.length; n < a; n++)
                            for (var r in t = arguments[n]) Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
                        return e
                    }, i.apply(this, arguments)
                },
                c = function(e, t, n, a) {
                    return new(n || (n = Promise))((function(r, i) {
                        function c(e) {
                            try {
                                s(a.next(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function o(e) {
                            try {
                                s(a.throw(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function s(e) {
                            var t;
                            e.done ? r(e.value) : (t = e.value, t instanceof n ? t : new n((function(e) {
                                e(t)
                            }))).then(c, o)
                        }
                        s((a = a.apply(e, t || [])).next())
                    }))
                },
                o = function(e, t) {
                    var n, a, r, i, c = {
                        label: 0,
                        sent: function() {
                            if (1 & r[0]) throw r[1];
                            return r[1]
                        },
                        trys: [],
                        ops: []
                    };
                    return i = {
                        next: o(0),
                        throw: o(1),
                        return: o(2)
                    }, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                        return this
                    }), i;

                    function o(o) {
                        return function(s) {
                            return function(o) {
                                if (n) throw new TypeError("Generator is already executing.");
                                for (; i && (i = 0, o[0] && (c = 0)), c;) try {
                                    if (n = 1, a && (r = 2 & o[0] ? a.return : o[0] ? a.throw || ((r = a.return) && r.call(a), 0) : a.next) && !(r = r.call(a, o[1])).done) return r;
                                    switch (a = 0, r && (o = [2 & o[0], r.value]), o[0]) {
                                        case 0:
                                        case 1:
                                            r = o;
                                            break;
                                        case 4:
                                            return c.label++, {
                                                value: o[1],
                                                done: !1
                                            };
                                        case 5:
                                            c.label++, a = o[1], o = [0];
                                            continue;
                                        case 7:
                                            o = c.ops.pop(), c.trys.pop();
                                            continue;
                                        default:
                                            if (!(r = c.trys, (r = r.length > 0 && r[r.length - 1]) || 6 !== o[0] && 2 !== o[0])) {
                                                c = 0;
                                                continue
                                            }
                                            if (3 === o[0] && (!r || o[1] > r[0] && o[1] < r[3])) {
                                                c.label = o[1];
                                                break
                                            }
                                            if (6 === o[0] && c.label < r[1]) {
                                                c.label = r[1], r = o;
                                                break
                                            }
                                            if (r && c.label < r[2]) {
                                                c.label = r[2], c.ops.push(o);
                                                break
                                            }
                                            r[2] && c.ops.pop(), c.trys.pop();
                                            continue
                                    }
                                    o = t.call(e, c)
                                } catch (e) {
                                    o = [6, e], a = 0
                                } finally {
                                    n = r = 0
                                }
                                if (5 & o[0]) throw o[1];
                                return {
                                    value: o[0] ? o[1] : void 0,
                                    done: !0
                                }
                            }([o, s])
                        }
                    }
                },
                s = function() {
                    function e(e) {
                        this.experienceConfigService = e.experienceConfigService, this.analyticsService = e.analyticsService, this.sendToGTAG = e.sendToGTAG, this.analyticsService.registerListener(this.pushAnalyticsEvent.bind(this)), this.isLegacyAmpedCustomer = (0, r.Jp)(a.FeatureFlagKey.IS_LEGACY_AMPED_CUSTOMER)
                    }
                    return e.prototype.pushAnalyticsEvent = function(e) {
                        var t;
                        return c(this, void 0, void 0, (function() {
                            var n, r, c, s, u, p, l;
                            return o(this, (function(o) {
                                switch (o.label) {
                                    case 0:
                                        switch (e.type) {
                                            case a.AnalyticEventType.DATA_CAPTURED:
                                                return [3, 1];
                                            case a.AnalyticEventType.TAP_TO_TEXT_CLICKED:
                                                return [3, 3];
                                            case a.AnalyticEventType.BUTTON_CLICKED:
                                                return [3, 5];
                                            case a.AnalyticEventType.CUSTOM:
                                                return [3, 7];
                                            case a.AnalyticEventType.EXPERIENCE_OPEN:
                                                return [3, 8];
                                            case a.AnalyticEventType.EXPERIENCE_IMPRESSION:
                                            case a.AnalyticEventType.EXPERIENCE_STEP_CHANGE:
                                            case a.AnalyticEventType.ECOMMERCE_CART_ASSOCIATED:
                                            case a.AnalyticEventType.ECOMMERCE_ORDER:
                                            case a.AnalyticEventType.VISITOR:
                                            case a.AnalyticEventType.PAGEVIEW:
                                            case a.AnalyticEventType.SESSION:
                                            case a.AnalyticEventType.GOAL_REACHED:
                                                return [3, 10]
                                        }
                                        return [3, 11];
                                    case 1:
                                        return r = [{
                                            accountId: e.account_id,
                                            campaignId: e.experience_id.toString(),
                                            variationId: e.variation_id.toString()
                                        }], [4, this.getMetaData(e)];
                                    case 2:
                                        return p = i.apply(void 0, r.concat([o.sent()])), n = e.collected_data_type === a.CollectedDataTypes.EMAIL ? this.isLegacyAmpedCustomer ? {
                                            event: a.DataLayerEventType.AMPED_EMAIL_CAPTURED,
                                            amped: p
                                        } : {
                                            event: a.MCFormsDataLayerEventType.MC_FORMS_EMAIL_CAPTURED,
                                            mcforms: p
                                        } : e.collected_data_type === a.CollectedDataTypes.PHONE_NUMBER ? this.isLegacyAmpedCustomer ? {
                                            event: a.DataLayerEventType.AMPED_PHONE_NUMBER_CAPTURED,
                                            amped: p
                                        } : {
                                            event: a.MCFormsDataLayerEventType.MC_FORMS_PHONE_NUMBER_CAPTURED,
                                            mcforms: p
                                        } : this.isLegacyAmpedCustomer ? {
                                            event: "Amped - ".concat(e.collected_data_name, " captured"),
                                            amped: p
                                        } : {
                                            event: "mcforms_".concat(e.collected_data_name, "_captured"),
                                            mcforms: p
                                        }, [3, 12];
                                    case 3:
                                        return c = [{
                                            accountId: e.account_id,
                                            campaignId: e.experience_id.toString(),
                                            variationId: e.variation_id.toString()
                                        }], [4, this.getMetaData(e)];
                                    case 4:
                                        return p = i.apply(void 0, c.concat([o.sent()])), n = this.isLegacyAmpedCustomer ? {
                                            event: a.DataLayerEventType.AMPED_TAP_TO_TEXT_CLICKED,
                                            amped: p
                                        } : {
                                            event: a.MCFormsDataLayerEventType.MC_FORMS_TAP_TO_TEXT_CLICKED,
                                            mcforms: p
                                        }, [3, 12];
                                    case 5:
                                        return s = [{
                                            accountId: e.account_id,
                                            campaignId: e.experience_id.toString(),
                                            variationId: e.variation_id.toString()
                                        }], [4, this.getMetaData(e)];
                                    case 6:
                                        return p = i.apply(void 0, s.concat([o.sent()])), n = this.isLegacyAmpedCustomer ? {
                                            event: a.DataLayerEventType.AMPED_BUTTON_CLICKED,
                                            amped: p
                                        } : {
                                            event: a.MCFormsDataLayerEventType.MC_FORMS_BUTTON_CLICKED,
                                            mcforms: p
                                        }, [3, 12];
                                    case 7:
                                        return u = {
                                            eventCategory: e.event_category,
                                            eventAction: e.event_action,
                                            eventLabel: e.event_label,
                                            eventValue: null === (t = e.event_value) || void 0 === t ? void 0 : t.toString()
                                        }, n = this.isLegacyAmpedCustomer ? {
                                            event: a.DataLayerEventType.AMPED_CUSTOM_EVENT,
                                            amped: u
                                        } : {
                                            event: a.MCFormsDataLayerEventType.MC_FORMS_CUSTOM_EVENT,
                                            mcforms: u
                                        }, [3, 12];
                                    case 8:
                                        return l = [{
                                            accountId: e.account_id,
                                            campaignId: e.experience_id.toString(),
                                            variationId: e.variation_id.toString()
                                        }], [4, this.getMetaData(e)];
                                    case 9:
                                        return p = i.apply(void 0, l.concat([o.sent()])), n = this.isLegacyAmpedCustomer ? {
                                            event: a.DataLayerEventType.AMPED_IMPRESSION,
                                            amped: p
                                        } : {
                                            event: a.MCFormsDataLayerEventType.MC_FORMS_IMPRESSION,
                                            mcforms: p
                                        }, [3, 12];
                                    case 10:
                                        return [3, 12];
                                    case 11:
                                        (0, a.assertUnreachable)(e), o.label = 12;
                                    case 12:
                                        return n && this.pushEvent(n), [2]
                                }
                            }))
                        }))
                    }, e.prototype.pushEvent = function(e) {
                        var t = window;
                        if (this.sendToGTAG) {
                            if ("function" == typeof t.gtag) {
                                var n = t.gtag;
                                this.isLegacyAmpedCustomer ? n("event", e.event, e.amped) : n("event", e.event, e.mcforms)
                            }
                        } else t.dataLayer = t.dataLayer || [], t.dataLayer && t.dataLayer.push(e)
                    }, e.prototype.getMetaData = function(e) {
                        return c(this, void 0, void 0, (function() {
                            var t, n, r, i, c, s, u, p, l;
                            return o(this, (function(o) {
                                switch (o.label) {
                                    case 0:
                                        return t = this.experienceConfigService.getExperience(e.experience_id), [4, this.experienceConfigService.getFullVariation(e.variation_id)];
                                    case 1:
                                        return n = o.sent(), r = null == n ? void 0 : n.steps.find((function(t) {
                                            return t.front_id === e.step_id
                                        })), i = {
                                            campaignName: null == t ? void 0 : t.title,
                                            variationName: null == n ? void 0 : n.name,
                                            stepNumber: null == r ? void 0 : r.order.toString()
                                        }, r && (c = (0, a.getStepDescription)(r, n.steps), i.stepName = c, "button_element_id" in e && (v = [r], y = e.button_element_id, E = null, v.some((function e(t) {
                                            return t.id === y ? (E = t, !0) : Array.isArray(t.elements) && t.elements.some(e)
                                        })), (s = E || null) && (u = (0, a.getButtonLabelAndContents)(s), p = u.buttonLabel, l = u.buttonContents, i.label = l || p))), [2, i]
                                }
                                var v, y, E
                            }))
                        }))
                    }, e
                }()
        }
    }
]);