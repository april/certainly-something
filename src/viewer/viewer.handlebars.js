(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['certificate'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "        <div class=\"panel-list-item\">\n          <div class=\"text\">Key Exchange Group</div>\n          <div class=\"text\">"
    + container.escapeExpression(((helper = (helper = helpers.keaGroupName || (depth0 != null ? depth0.keaGroupName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"keaGroupName","hash":{},"data":data}) : helper)))
    + "</div>\n        </div>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var helper;

  return "        <div class=\"panel-list-item\">\n          <div class=\"text\">Signature Scheme</div>\n          <div class=\"text\">"
    + container.escapeExpression(((helper = (helper = helpers.signatureSchemeName || (depth0 != null ? depth0.signatureSchemeName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"signatureSchemeName","hash":{},"data":data}) : helper)))
    + "</div>\n        </div>\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, alias3=container.lambda;

  return "    <div class=\"row\">\n      <div class=\"certificate panel\">\n        <div class=\"panel-section panel-section-header\">\n          <div class=\"icon-section-header certificate-icon\"></div>\n          <div class=\"text-section-header\"><h2>Certificate #"
    + alias2((helpers.onebasedindex || (depth0 && depth0.onebasedindex) || helpers.helperMissing).call(alias1,(data && data.index),{"name":"onebasedindex","hash":{},"data":data}))
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isBuiltInRoot : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</h2></div>\n        </div>\n        <div class=\"panel-list-item\">\n          <div class=\"text\">Subject</div>\n          <div class=\"text\">"
    + alias2(alias3((depth0 != null ? depth0.subject : depth0), depth0))
    + "</div>\n        </div>\n        <div class=\"panel-list-item\">\n          <div class=\"text\">Serial Number</div>\n          <div class=\"text\">"
    + alias2(alias3((depth0 != null ? depth0.serialNumber : depth0), depth0))
    + "</div>\n        </div>\n        <div class=\"panel-list-item\">\n          <div class=\"text\">Issuer</div>\n          <div class=\"text\">"
    + alias2(alias3((depth0 != null ? depth0.issuer : depth0), depth0))
    + "</div>\n        </div>\n        <div class=\"panel-list-item\">\n          <div class=\"text\">Valid From</div>\n          <div class=\"text\">"
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.validity : depth0)) != null ? stack1.startGMT : stack1), depth0))
    + "</div>\n        </div>\n        <div class=\"panel-list-item\">\n          <div class=\"text\">Valid To</div>\n          <div class=\"text\">"
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.validity : depth0)) != null ? stack1.endGMT : stack1), depth0))
    + "</div>\n        </div>\n      </div>\n    </div>\n";
},"6":function(container,depth0,helpers,partials,data) {
    return "(built-in root)";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3=container.escapeExpression;

  return "<div id=\"template\">\n  <!-- handshake -->\n  <div class=\"row section\" id=\"handshake\">\n    <div class=\"panel\">\n      <div class=\"panel-section panel-section-header\">\n        <div class=\"text-section-header\"><h1>Handshake</h1></div>\n      </div>\n      <div class=\"panel-list-container\">\n        <div class=\"panel-list-item\">\n          <div class=\"text\">Protocol</div>\n          <div class=\"text\">"
    + alias3((helpers.replace || (depth0 && depth0.replace) || alias2).call(alias1,(depth0 != null ? depth0.protocolVersion : depth0),"v"," ",{"name":"replace","hash":{},"data":data}))
    + "</div>\n        </div>\n        <div class=\"panel-list-item\">\n          <div class=\"text\">Cipher Suite</div>\n          <div class=\"text\">"
    + alias3(((helper = (helper = helpers.cipherSuite || (depth0 != null ? depth0.cipherSuite : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"cipherSuite","hash":{},"data":data}) : helper)))
    + "</div>\n        </div>\n"
    + ((stack1 = helpers["if"].call(alias1,(helpers.isntnull || (depth0 && depth0.isntnull) || alias2).call(alias1,(depth0 != null ? depth0.keaGroupName : depth0),{"name":"isntnull","hash":{},"data":data}),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(helpers.isntnull || (depth0 && depth0.isntnull) || alias2).call(alias1,(depth0 != null ? depth0.signatureSchemeName : depth0),{"name":"isntnull","hash":{},"data":data}),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      </div>\n    </div>\n  </div>\n\n  <!-- certificates -->\n  <div class=\"row section\" id=\"certificates\">\n    <div class=\"panel\">\n      <div class=\"panel-section panel-section-header\">\n        <div class=\"text-section-header\"><h1>Certificates</h1></div>\n      </div>\n    </div>\n\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.certificates : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  </div>\n\n</div>";
},"useData":true});
})();