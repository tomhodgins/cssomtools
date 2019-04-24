var csstools = \u00e7 = (function() {

  function hasRules(object) { return object && object.cssRules && object.cssRules.length; }

  // Takes a string
  // Returns a CSSStyleSheet object
  function parse(string) {
    string = string || '';
    var iframe = document.createElement('iframe');
    document.head.appendChild(iframe);
    var style = iframe.contentDocument.createElement('style');
    style.textContent = string;
    iframe.contentDocument.head.appendChild(style);
    var stylesheet = iframe.contentDocument.styleSheets[0];
    document.head.removeChild(iframe);
    return stylesheet;
  }

  // Takes a CSSStyleSheet or CSSRule object, or an array containing them
  // Returns the objects passed in after processing with callback function
  function process(object, callback) {
    object = object || all();
    callback = callback || function(rule) { return rule; };
    function readRules(list) {
      if (hasRules(list)) {
        Array.prototype.slice.call(list.cssRules).forEach(function(rule) {
          callback(rule);
          if (hasRules(rule)) {
            readRules(rule);
          }
        });
      }
    }
    if (Array.isArray(object)) {
      object.map(function(child) { return process(child, callback); });
    } else {
      readRules(object);
    }
    return object;
  }

  // Takes a CSSStyleSheet, CSSRule object, an array containing them, or a string
  // Returns a stylesheet
  function add(object, stylesheet, index) {
    stylesheet = stylesheet || (all().length && all()[all().length - 1]) || parse();
    index = index || stylesheet.cssRules.length;
    if (Array.isArray(object)) {
      object.forEach(function(child){ return add(child, stylesheet, index) });
    } else if (hasRules(object)) {
      Array.prototype.slice.call(object.cssRules).forEach(function(child){
        return add(child, stylesheet, index)
      });
    } else if (object.cssText) {
      stylesheet.insertRule(object.cssText, index);
    } else if (typeof object === 'string') {
      add(parse(object), stylesheet, index)
    }
    return stylesheet;
  }

  // Takes a CSSStyleSheet or CSSRule object, or an array containing them
  // Returns the original object, minus all CSSRule objects
  function remove(object) {
    object = object || parse();
    if (Array.isArray(object)) {
      object.map(remove);
    } else if (hasRules(object)) {
      Array.prototype.slice.call(object.cssRules).map(remove);
    } else if (object.parentRule) {
      object.parentRule.deleteRule(
        Array.prototype.slice.call(object.parentRule.cssRules).indexOf(object)
      );
    } else if (object.parentStyleSheet) {
      object.parentStyleSheet.deleteRule(
        Array.prototype.slice.call(object.parentStyleSheet.cssRules).indexOf(object)
      );
    }
    return object;
  }

  // Takes a CSSStyleSheet or CSSRule object, or an array containing them
  // Returns a string
  function stringify(object) {
    object = object || all();
    function stringifyRule(rule) {
      return rule.cssText || '';
    }
    if (Array.isArray(object)) {
      return object.map(stringify).join('\n');
    } else if (hasRules(object)) {
      return Array.prototype.slice.call(object.cssRules).map(stringifyRule).join('\n');
    } else {
      return stringifyRule(object);
    }
  }

  // Returns an array of all CSS stylesheets whose cssRules you're allowed to access from document.styleSheets
  function all() {
    return Array.prototype.slice.call(document.styleSheets).map(function(stylesheet) {
      try { stylesheet.cssRules; }
      catch(error) { return null; }
      return stylesheet;
    }).filter(hasRules);
  }

  // Takes a CSSStyleSheet and a test function
  // Returns an object with a cssRules property containing all matching CSSRule objects
  function filter(stylesheet, test) {
    stylesheet = stylesheet || parse();
    test = test || function(rule) { return rule; };
    var output = {cssRules: []};
    process(
      stylesheet,
      function(rule) {
        if (test(rule)) {
          output.cssRules.push(rule);
        }
      }
    );
    return output;
  }

  // Takes a string, and optionally an array of stylesheet objects
  // Returns an object containing all rules with selectors containing the string
  function selector(string, option, list) {
    string = string || '';
    option = option || false;
    list = list || all();
    if (list.cssRules) {
      list = [list];
    }
    return list.map(function(stylesheet) {
      return filter(
        stylesheet,
        function(rule) {
          if (option) {
            return rule.selectorText && rule.selectorText.trim() === string;
          } else {
            return rule.selectorText && rule.selectorText.indexOf(string) !== -1;
          }
        }
      );
    }).filter(hasRules);
  }

  // Takes a string, and optionally an array of stylesheet objects
  // Returns an object containing all rules with properties containing the string
  function property(string, option, list) {
    string = string || '';
    option = option || false;
    list = list || all();
    if (list.cssRules) {
      list = [list];
    }
    return list.map(function(stylesheet) {
      return filter(
        stylesheet,
        function(rule) {
          return rule.style && Array.prototype.slice.call(rule.style).some(function(prop) {
            if (option) {
              return prop.trim() === string;
            } else {
              return prop.indexOf(string) !== -1;
            }
          });
        }
      );
    }).filter(hasRules);
  }

  // Takes a string, and optionally an array of stylesheet objects
  // Returns an object containing all rules with values containing the string
  function value(string, option, list) {
    string = string || '';
    option = option || false;
    list = list || all();
    if (list.cssRules) {
      list = [list];
    }
    return list.map(function(stylesheet) {
      return filter(
        stylesheet,
        function(rule) {
          return rule.style && Array.prototype.slice.call(rule.style).some(function(prop) {
            if (option) {
              return rule.style.getPropertyValue(prop).trim() === string;
            } else {
              return rule.style.getPropertyValue(prop).indexOf(string) !== -1;
            }
          });
        }
      );
    }).filter(hasRules);
  }

  // Takes a string, and optionally an array of stylesheet objects
  // Returns an object containing all media queries with condition text containing the string
  function query(string, option, list) {
    string = string || '';
    option = option || false;
    list = list || all();
    if (list.cssRules) {
      list = [list];
    }
    return list.map(function(stylesheet) {
      return filter(
        stylesheet,
        function(rule) {
          if (option) {
            return rule.media && rule.media.mediaText.trim() === string;
          } else {
            return rule.media && rule.media.mediaText.indexOf(string) !== -1;
          }
        }
      );
    }).filter(hasRules);
  }

  return {
    parse: parse,
    process: process,
    add: add,
    remove: remove,
    stringify: stringify,
    all: all,
    filter: filter,
    selector: selector,
    property: property,
    value: value,
    query: query
  };

})();