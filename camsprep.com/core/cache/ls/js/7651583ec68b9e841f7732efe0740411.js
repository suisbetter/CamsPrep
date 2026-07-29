(() => {
    "use strict";
    var t = {};
    var r = {};

    function e(o) {
        var n = r[o];
        if (n !== undefined) {
            return n.exports
        }
        var a = r[o] = {
            exports: {}
        };
        t[o](a, a.exports, e);
        return a.exports
    }(() => {
        e.rv = () => "1.6.5"
    })();
    (() => {
        e.ruid = "bundler=rspack@1.6.5"
    })();

    function o(t, r, e, o, n, a, u) {
        try {
            var i = t[a](u);
            var c = i.value
        } catch (t) {
            e(t);
            return
        }
        if (i.done) r(c);
        else Promise.resolve(c).then(o, n)
    }

    function n(t) {
        return function() {
            var r = this,
                e = arguments;
            return new Promise(function(n, a) {
                var u = t.apply(r, e);

                function i(t) {
                    o(u, n, a, i, c, "next", t)
                }

                function c(t) {
                    o(u, n, a, i, c, "throw", t)
                }
                i(undefined)
            })
        }
    };

    function a() {
        var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
        var r = new FormData;
        t.forEach(t => {
            for (var [e, o] of Object.entries(t)) {
                r.set(e, o)
            }
        });
        r.set(window.tutor_get_nonce_data(!0).key, window.tutor_get_nonce_data(!0).value);
        return r
    }
    const u = a;

    function i(t) {
        return n(function*() {
            try {
                var r = yield fetch(window._tutorobject.ajaxurl, {
                    method: "POST",
                    body: t
                });
                return r
            } catch (t) {
                tutor_toast(__("Operation failed", "tutor-pro"), t, "error")
            }
        })()
    };
    document.addEventListener("DOMContentLoaded", () => {
        var {
            __
        } = wp.i18n;
        document.addEventListener("click", t => n(function*() {
            var r = t.target.closest(".tutor-add-to-guest-cart");
            if (r) {
                var e = r.dataset.courseId;
                if (e) {
                    var o = u([{
                        action: "tutor_guest_add_course_to_cart",
                        course_id: e
                    }]);
                    var n = document.body.classList.contains("single-courses") || document.body.classList.contains("single-course-bundle");
                    try {
                        r.setAttribute("disabled", "disabled");
                        r.classList.add("is-loading");
                        var a = yield i(o);
                        var {
                            status_code: c,
                            data: s,
                            message: d = defaultErrorMessage
                        } = yield a.json();
                        if (c === 201) {
                            tutor_toast(__("Success", "tutor-pro"), d, "success");
                            var l;
                            var v = '<a href="'.concat((l = s === null || s === void 0 ? void 0 : s.cart_page_url) !== null && l !== void 0 ? l : "#", '" class="tutor-btn tutor-btn-outline-primary ').concat(n ? "tutor-btn-lg tutor-btn-block" : "tutor-btn-md", " ").concat(!(s === null || s === void 0 ? void 0 : s.cart_page_url) ? "tutor-cart-page-not-configured" : "", '">').concat(__("View Cart", "tutor-pro"), "</a>");
                            r.parentElement.innerHTML = v;
                            var _ = new CustomEvent("tutorAddToCartEvent", {
                                detail: {
                                    cart_count: s === null || s === void 0 ? void 0 : s.cart_count
                                }
                            });
                            document.dispatchEvent(_)
                        } else {
                            tutor_toast(__("Failed", "tutor-pro"), d, "error")
                        }
                    } catch (t) {
                        tutor_toast(__("Failed", "tutor-pro"), defaultErrorMessage, "error")
                    } finally {
                        r.removeAttribute("disabled");
                        r.classList.remove("is-loading")
                    }
                }
            }
        })());
        var t = document.querySelector("select[name=billing_country]");
        var r = document.querySelector("div[data-tax-amount]");
        if (r && t && !t.value) {
            r.style.display = "none"
        }
    })
})();