(() => {
    "use strict";
    var o = {};
    var t = {};

    function r(e) {
        var n = t[e];
        if (n !== undefined) {
            return n.exports
        }
        var a = t[e] = {
            exports: {}
        };
        o[e](a, a.exports, r);
        return a.exports
    }(() => {
        r.rv = () => "1.6.5"
    })();
    (() => {
        r.ruid = "bundler=rspack@1.6.5"
    })();
    var e = (o, t) => {
        var {
            __
        } = wp.i18n;
        var {
            data: r = {}
        } = o || {};
        var {
            message: e = t || __("Something Went Wrong!", "tutor-pro")
        } = r;
        return e
    };
    window.jQuery(document).ready(function(o) {
        var {
            __
        } = wp.i18n;
        o(".tutor-zoom-accordion-panel").on("click", function(t) {
            t.preventDefault();
            o(this).find("i").toggleClass("tutor-icon-angle-down tutor-icon-angle-up");
            o(this).parent().find(".tutor-zoom-accordion-body").slideToggle()
        });
        o("#tutor-zoom-settings").on("change", 'input[type="checkbox"], input[type="radio"]', function(t) {
            o(this).closest("form").submit()
        });
        o("#tutor-zoom-settings").submit(function(t) {
            t.preventDefault();
            var r = o(this);
            var n = r.serializeObject();
            o.ajax({
                url: window._tutorobject.ajaxurl,
                type: "POST",
                data: n,
                beforeSend: function o() {
                    r.find("#save-changes").attr("disabled", "disabled").addClass("is-loading")
                },
                success: function o(o) {
                    var t;
                    var r = o.success ? __("Success", "tutor-pro") : __("Error", "tutor-pro");
                    tutor_toast(r, e(o), o.success ? "success" : "error");
                    if (o.success && ((t = o.data) === null || t === void 0 ? void 0 : t.reload_page)) {
                        window.location.reload()
                    }
                },
                complete: function o() {
                    r.find("#save-changes").removeAttr("disabled").removeClass("is-loading")
                }
            })
        });

        function t(o, t) {
            var r = new URL(window.location.href);
            var e = r.searchParams;
            e.set(o, t);
            r.search = e.toString();
            e.set("paged", 1);
            r.search = e.toString();
            return r.toString()
        }
        o("#tutor-zoom-search-filter-form").on("keypress", '[name="search"]', function(r) {
            console.log(r, "on submit");
            if ((r.keyCode || r.which) == "13") {
                var e = o(this).val();
                window.location = t("search", e)
            }
        }).find(".tutor-zoom-course, .tutor-zoom-date").on("change", function(r) {
            window.location = t(o(this).attr("name"), o(this).val())
        })
    })
})();