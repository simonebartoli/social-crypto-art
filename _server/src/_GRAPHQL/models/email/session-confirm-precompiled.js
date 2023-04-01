var Handlebars = require("handlebars/runtime");  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['session-confirm.hbs'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<!DOCTYPE html>\n<html lang=\"en\" xmlns:v=\"urn:schemas-microsoft-com:vml\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"x-apple-disable-message-reformatting\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <meta name=\"format-detection\" content=\"telephone=no, date=no, address=no, email=no, url=no\">\n  <meta name=\"color-scheme\" content=\"light dark\">\n  <meta name=\"supported-color-schemes\" content=\"light dark\">\n  <!--[if mso]>\n  <noscript>\n    <xml>\n      <o:OfficeDocumentSettings xmlns:o=\"urn:schemas-microsoft-com:office:office\">\n        <o:PixelsPerInch>96</o:PixelsPerInch>\n      </o:OfficeDocumentSettings>\n    </xml>\n  </noscript>\n  <style>\n    td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family: \"Segoe UI\", sans-serif; mso-line-height-rule: exactly;}\n  </style>\n  <![endif]-->\n  \n    <title>Confirm your Session</title>\n  <style>\n    /* Your custom CSS resets for email */\n/*\n * Here is where you can add your global email CSS resets.\n *\n * We use a custom, email-specific CSS reset, instead\n * of Tailwind's web-optimized `base` layer.\n *\n * Styles defined here will be inlined.\n*/\nimg {\n  max-width: 100%;\n  vertical-align: middle;\n  line-height: 1;\n  border: 0\n}\n/* Tailwind CSS components */\n/**\n * @import here any custom CSS components - that is, CSS that\n * you'd want loaded before the Tailwind utilities, so the\n * utilities can still override them.\n*/\n/* Tailwind CSS utility classes */\n.absolute {\n  position: absolute\n}\n.m-0 {\n  margin: 0\n}\n.my-12 {\n  margin-top: 48px;\n  margin-bottom: 48px\n}\n.mb-4 {\n  margin-bottom: 16px\n}\n.mb-6 {\n  margin-bottom: 24px\n}\n.inline-block {\n  display: inline-block\n}\n.flex {\n  display: flex\n}\n.table {\n  display: table\n}\n.hidden {\n  display: none\n}\n.w-552px {\n  width: 552px\n}\n.w-600px {\n  width: 600px\n}\n.w-full {\n  width: 100%\n}\n.max-w-full {\n  max-width: 100%\n}\n.cursor-default {\n  cursor: default\n}\n.flex-col {\n  flex-direction: column\n}\n.items-center {\n  align-items: center\n}\n.justify-center {\n  justify-content: center\n}\n.gap-1 {\n  gap: 4px\n}\n.gap-4 {\n  gap: 16px\n}\n.rounded {\n  border-radius: 4px\n}\n.bg-black {\n  background-color: #000\n}\n.bg-gray-300 {\n  background-color: #d1d5db\n}\n.bg-indigo-700 {\n  background-color: #4338ca\n}\n.bg-slate-200 {\n  background-color: #e2e8f0\n}\n.bg-slate-300 {\n  background-color: #cbd5e1\n}\n.bg-slate-50 {\n  background-color: #f8fafc\n}\n.bg-white {\n  background-color: #fff\n}\n.p-0 {\n  padding: 0\n}\n.p-12 {\n  padding: 48px\n}\n.p-2 {\n  padding: 8px\n}\n.p-4 {\n  padding: 16px\n}\n.p-6 {\n  padding: 24px\n}\n.px-6 {\n  padding-left: 24px;\n  padding-right: 24px\n}\n.py-4 {\n  padding-top: 16px;\n  padding-bottom: 16px\n}\n.pb-8 {\n  padding-bottom: 32px\n}\n.text-left {\n  text-align: left\n}\n.text-center {\n  text-align: center\n}\n.text-right {\n  text-align: right\n}\n.font-sans {\n  font-family: ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", sans-serif\n}\n.text-2xl {\n  font-size: 24px\n}\n.text-base {\n  font-size: 16px\n}\n.text-sm {\n  font-size: 14px\n}\n.text-xl {\n  font-size: 20px\n}\n.text-xs {\n  font-size: 12px\n}\n.font-bold {\n  font-weight: 700\n}\n.font-semibold {\n  font-weight: 600\n}\n.uppercase {\n  text-transform: uppercase\n}\n.italic {\n  font-style: italic\n}\n.leading-12 {\n  line-height: 48px\n}\n.leading-6 {\n  line-height: 24px\n}\n.leading-8 {\n  line-height: 32px\n}\n.leading-none {\n  line-height: 1\n}\n.text-black {\n  color: #000\n}\n.text-indigo-700 {\n  color: #4338ca\n}\n.text-slate-50 {\n  color: #f8fafc\n}\n.text-slate-600 {\n  color: #475569\n}\n.text-slate-700 {\n  color: #334155\n}\n.text-white {\n  color: #fff\n}\n.no-underline {\n  text-decoration-line: none\n}\n.mso-font-width--100pc {\n  mso-font-width: -100%\n}\n.shadow-sm {\n  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)\n}\n.-webkit-font-smoothing-antialiased {\n  -webkit-font-smoothing: antialiased\n}\n.text-decoration-none {\n  text-decoration: none\n}\n.word-break-break-word {\n  word-break: break-word\n}\n/* Your custom utility classes */\n/*\n * Here is where you can define your custom utility classes.\n *\n * We wrap them in the `utilities` @layer directive, so\n * that Tailwind moves them to the correct location.\n *\n * More info:\n * https://tailwindcss.com/docs/functions-and-directives#layer\n*/\n.hover-important-text-decoration-underline:hover {\n  text-decoration: underline !important\n}\n@media (max-width: 600px) {\n  .sm-my-8 {\n    margin-top: 32px !important;\n    margin-bottom: 32px !important\n  }\n  .sm-px-0 {\n    padding-left: 0 !important;\n    padding-right: 0 !important\n  }\n  .sm-px-4 {\n    padding-left: 16px !important;\n    padding-right: 16px !important\n  }\n  .sm-px-6 {\n    padding-left: 24px !important;\n    padding-right: 24px !important\n  }\n  .sm-py-8 {\n    padding-top: 32px !important;\n    padding-bottom: 32px !important\n  }\n  .sm-leading-8 {\n    line-height: 32px !important\n  }\n}\n\n  </style>\n  \n</head>\n<body class=\"m-0 p-0 w-full word-break-break-word -webkit-font-smoothing-antialiased bg-slate-50\">\n  \n    <div class=\"hidden\">\n      Please confirm your session\n      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; \n    </div>\n  <div role=\"article\" aria-roledescription=\"email\" aria-label=\"Confirm your Session\" lang=\"en\">\n    \n    <div class=\"bg-slate-50 sm-px-4 font-sans\">\n        <table align=\"center\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\">\n            <tr>\n                <td class=\"w-600px max-w-full\">\n                    <table class=\"w-full\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\">\n                        <tr>\n                            <td class=\"p-12 sm-py-8 sm-px-6 text-center\">\n                                <a href=\"https://social-art.uk\">\n                                    <img src=\"cid:logo-transparent\" width=\"250\" alt=\"Social Crypto Art\">\n                                </a>\n                            </td>\n                        </tr>\n                        <tr role=\"separator\">\n                            <td class=\"leading-8\">&zwj;</td>\n                        </tr>\n                        <tr>\n                            <td class=\"w-full px-6 sm-px-0 text-left\">\n                                <table class=\"w-full\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\">\n                                    <tr>\n                                        <td class=\"pb-8\">\n                                            <table class=\"w-full\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\">\n                                                <tr>\n                                                    <td class=\"p-6 bg-white rounded shadow-sm\">\n                                                        <h2 class=\"m-0 mb-6 text-2xl leading-6\">\n                                                            Please Confirm your Session\n                                                        </h2>\n                                                        <p class=\"m-0 mb-6 text-base text-slate-700\">\n                                                            Hi "
    + alias4(((helper = (helper = lookupProperty(helpers,"nickname") || (depth0 != null ? lookupProperty(depth0,"nickname") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"nickname","hash":{},"data":data,"loc":{"start":{"line":319,"column":63},"end":{"line":319,"column":75}}}) : helper)))
    + ", we saw uou have tried to access from a\n                                                            device. Please\n                                                            confirm your identity clicking the link below.\n                                                        </p>\n                                                        <div class=\"p-6 bg-gray-300 flex flex-col gap-4\">\n                                                            <span class=\"font-bold\">Date: "
    + alias4(((helper = (helper = lookupProperty(helpers,"date") || (depth0 != null ? lookupProperty(depth0,"date") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"date","hash":{},"data":data,"loc":{"start":{"line":324,"column":90},"end":{"line":324,"column":98}}}) : helper)))
    + "</span>\n                                                            <span class=\"font-bold\">IP: "
    + alias4(((helper = (helper = lookupProperty(helpers,"ip") || (depth0 != null ? lookupProperty(depth0,"ip") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ip","hash":{},"data":data,"loc":{"start":{"line":325,"column":88},"end":{"line":325,"column":94}}}) : helper)))
    + "</span>\n                                                            <span class=\"font-bold\">Browser: "
    + alias4(((helper = (helper = lookupProperty(helpers,"ua") || (depth0 != null ? lookupProperty(depth0,"ua") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ua","hash":{},"data":data,"loc":{"start":{"line":326,"column":93},"end":{"line":326,"column":99}}}) : helper)))
    + "</span>\n                                                        </div>\n                                                    </td>\n                                                </tr>\n                                            </table>\n                                        </td>\n                                    </tr>\n                                </table>\n                            </td>\n                        </tr>\n                        <tr>\n                            <td class=\"w-full px-6 sm-px-0 text-left\">\n                                <table class=\"w-full\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\">\n                                    <tr>\n                                        <td class=\"pb-8\">\n                                            <table class=\"w-full\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\">\n                                                <tr>\n                                                    <td class=\"p-6 bg-white rounded shadow-sm flex flex-col items-center justify-center\">\n                                                        <p class=\"text-xl font-bold\">CLICK ONLY IF YOU RECOGNIZE THIS REQUEST</p>\n                                                        <a class=\"bg-black p-4 text-white no-underline\" href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"link") || (depth0 != null ? lookupProperty(depth0,"link") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"link","hash":{},"data":data,"loc":{"start":{"line":345,"column":110},"end":{"line":345,"column":118}}}) : helper)))
    + "\">CLICK HERE TO AUTHORIZE SESSION</a>\n                                                    </td>\n                                                </tr>\n                                            </table>\n                                        </td>\n                                    </tr>\n                                </table>\n                            </td>\n                        </tr>\n                        <tr>\n                            <td class=\"w-full px-6 sm-px-0 text-left\">\n                                <table class=\"w-full\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\">\n                                    <tr>\n                                        <td class=\"pb-8\">\n                                            <table class=\"w-full\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\">\n                                                <tr>\n                                                    <td class=\"p-2 bg-white text-sm rounded shadow-sm flex flex-col gap-1 items-center justify-center\">\n                                                        <span class=\"font-bold\">Social Crypto Art</span>\n                                                        <span>We will never ask for your private information as password or key</span>\n                                                    </td>\n                                                </tr>\n                                            </table>\n                                        </td>\n                                    </tr>\n                                </table>\n                            </td>\n                        </tr>\n                    </table>\n                </td>\n            </tr>\n        </table>\n    </div>\n\n  </div>\n</body>\n</html>\n\n";
},"useData":true});