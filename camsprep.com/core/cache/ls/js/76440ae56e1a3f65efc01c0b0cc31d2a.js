(() => {
    "use strict";
    var t = {};
    var r = {};

    function e(n) {
        var o = r[n];
        if (o !== undefined) {
            return o.exports
        }
        var a = r[n] = {
            exports: {}
        };
        t[n](a, a.exports, e);
        return a.exports
    }(() => {
        e.rv = () => "1.6.5"
    })();
    (() => {
        e.ruid = "bundler=rspack@1.6.5"
    })();

    function n(t, r, e, n, o, a, i) {
        try {
            var u = t[a](i);
            var d = u.value
        } catch (t) {
            e(t);
            return
        }
        if (u.done) r(d);
        else Promise.resolve(d).then(n, o)
    }

    function o(t) {
        return function() {
            var r = this,
                e = arguments;
            return new Promise(function(o, a) {
                var i = t.apply(r, e);

                function u(t) {
                    n(i, o, a, u, d, "next", t)
                }

                function d(t) {
                    n(i, o, a, u, d, "throw", t)
                }
                u(undefined)
            })
        }
    };

    function a() {
        var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
        var r = new FormData;
        t.forEach(t => {
            for (var [e, n] of Object.entries(t)) {
                r.set(e, n)
            }
        });
        r.set(window.tutor_get_nonce_data(!0).key, window.tutor_get_nonce_data(!0).value);
        return r
    }
    const i = a;

    function u(t) {
        return o(function*() {
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
    document.addEventListener("DOMContentLoaded", function() {
        return o(function*() {
            var {
                __
            } = wp.i18n;
            var t = __("Something went wrong, please try again after refreshing page", "tutor-pro");
            var r = document.querySelectorAll("a.tutor-add-new-course-bundle,li.tutor-add-new-course-bundle a");
            if (r) {
                r.forEach(r => {
                    r.addEventListener("click", function(e) {
                        return o(function*() {
                            e.preventDefault();
                            var n = document.querySelector("body.tutor-frontend");
                            var o = [{
                                action: "tutor_create_course_bundle",
                                source: n ? "frontend" : "backend"
                            }];
                            var a = i(o);
                            try {
                                if (e.target.classList.contains("ab-item")) {
                                    e.target.innerHTML = "Creating..."
                                }
                                r.classList.add("is-loading");
                                r.setAttribute("disabled", "disabled");
                                var d = yield u(a);
                                var c = yield d.json();
                                if (c.status_code === 200) {
                                    window.location.href = c.data
                                } else {
                                    tutor_toast(__("Failed", "tutor-pro"), c.message || __("Bundle creation failed", "tutor-pro"), "error")
                                }
                            } catch (r) {
                                tutor_toast(__("Failed", "tutor-pro"), t, "error")
                            } finally {
                                r.classList.remove("is-loading");
                                r.removeAttribute("disabled")
                            }
                        })()
                    })
                })
            }
        })()
    })
})();