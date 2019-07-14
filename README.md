# cssomtools

The 'jQuery-for-the-CSSOM', a library for working with CSS stylesheets and rules in the browser

## About

This library contains functions to abstract working with [`document.styleSheets`](https://developer.mozilla.org/en-US/docs/Web/API/DocumentOrShadowRoot/styleSheets) and the [`CSSStyleSheet`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet) and [`CSSRule`](https://developer.mozilla.org/en-US/docs/Web/API/CSSRule) objects in [CSSOM](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model), the CSS Object Model, which is the in-memory representation of all of the parsed CSS that the browser knows about.

Similar to how jQuery abstracts DOM operations for working with HTML, this library aims to provide a common set of functions that can provide high-level abstraction for working with CSS as stylesheets, rules, and strings to find, filter, manipulate, and work with CSS in the browser with JavaScript more easily.

## Usage

This library is made available in the following 3 formats:

- [index.js](./index.js) is an ES module that exports the functions individually, as well as a default object containing each function
- [index.es5.js](./index.es5.js) is an ES5 version of the library that exposes the library as `cssomtools` and `ç`
- [index.es5.min.js](./index.es5.min.js) is a minified version of `index.es5.js`

To use the ES5 versions you need to either include the JavaScript inline in your own code, or by linking to the script in HTML:

```html
<script src=./index.es5.min.js></script>
```

To use the ES6 version you can `import` either individual functions like the following example:

```js
import {parse, process, stringify} from './index.js'

console.log(
  stringify(
    process(
      parse('a {} b {} c {}'),
      rule => rule.selectorText = `.demo ${rule.selectorText}`
    )
  )
)
```

Or by importing the default export, which is an object containing all of the library functions:

```js
import cssomtools from './index.js'

console.log(
  cssomtools.stringify(
    cssomtools.process(
      cssomtools.parse('a {} b {} c {}'),
      rule => rule.selectorText = `.demo ${rule.selectorText}`
    )
  )
)
```

This library is also published on npm as `cssomtools`: https://www.npmjs.com/package/cssomtools

## Library Functions

### Parse

```js
parse(string)
```

The `parse()` function takes a string and returns a `CSSStyleSheet` object containing all successfully parsed CSS from the input string.

Use this function when you want to parse CSS from a string. By default, running `parse()` with no argument will return an empty `CSSStyleSheet` object.

### Process

```js
process(object, callback)
```

The `process()` function takes either a `CSSStyleSheet` or `CSSRule` object, or an array `[]` containing them, and processes each `CSSRule` found inside with the supplied `callback` function.

Use this function when you want to run JS code on every rule inside a stylesheet, no matter how deeply they are nested (rules like `@media` rules can contain CSS rules of their own, etc).

### Add

```js
add(object, stylesheet*, index*)
```

The `add()` function takes either a `CSSStyleSheet` or `CSSRule` object, or an array `[]` containing them, or a string containing one or more CSS rules, and optionally also accepts a `stylesheet` parameter which can be used to supply the CSSStyleSheet the rules should be added to. Otherwise the function will attempt to append them into the last stylesheet in CSSOM. You can also optionally supply an index of the location of where in the stylesheet's `cssRules` you would like these rules inserted. This function builds on top of the built in [CSSStyleSheet.insertRule()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule) for more information about how the index works.

Use this function when you want to add CSS rules to the CSSOM.

### Remove

```js
remove(object)
```

The `remove()` function takes either a `CSSStyleSheet` or `CSSRule` object, or an array `[]` containing them and will attempt to remove any rule found inside from either its `parentRule` if it's the child of another `CSSRule`, or remove it from its `parentStyleSheet` if it's the child of a `CSSStyleSheet`.

Use this function when you want to remove CSS rules from the CSSOM.

### Stringify

```js
stringify(object)
```

The `stringify()` function takes either a `CSSStyleSheet` or `CSSRule` object, or an array `[]` containing them, and will return a string containing all of the CSS contained within the objects passed into it.

Use this function when you want to convert any part of CSSOM into a string. By default running `srtingify()` with no argument will stringify the output of `all()`.

### All

```js
all()
```

The `all()` function returns all `CSSRule` objects you're allowed (by CORS) to access.

Use this function when you want to get all `CSSRule` objects you're allowed to read and access.

### Filter

```js
filter(stylesheet, test)
```

The `filter()` function takes a `CSSStyleSheet` object or an object that looks like one (i.e. has a `cssRules` property that can be treated as an array and contains `CSSRule` objects) and a test function written in JavaScript, and will return an object that looks like a stylesheet `{cssRules: []}` containing every `CSSRule` object that passed the test function.

Use this when you want to filter out and find rules matching a certain criteria from CSSOM.

> Note: Should this take lists of stylesheet objects?

> Note: Should the default parameter be `all()`?

### Selector

```js
selector(string, option*, list*)
```

The `selector()` function takes a `string` and finds rules with matching `selectorText`. The `option` parameter can be used to toggle whether the match is strict or not. Setting the option to `true` will require the `selectorText` to match the string exactly, if it's not declared or `false` it will match any `selectorText` simply containing the supplied `string` anywhere. The last parameter is also optional, a `CSSStyleSheet` object or array containing stylesheets inside which you want to search. If no `list` is supplied it will search through all `CSSRules` found by the `all()` function.

Use this function when you want to find `CSSRule` objects with `selectorText` matching a string.

### Property

```js
property(string, option*, list*)
```

The `property()` function takes a `string` and finds rules containing matching properties. The `option` parameter can be used to toggle whether the match is strict or not. Setting the option to `true` will require the property name to match the string exactly, if it's not declared or `false` it will match any property name simply containing the supplied `string` anywhere. The last parameter is also optional, a `CSSStyleSheet` object or array containing stylesheets inside which you want to search. If no `list` is supplied it will search through all `CSSRules` found by the `all()` function.

Use this function when you want to find `CSSRule` objects with properties matching a string.

### Value

```js
value(string, option*, list*)
```

The `selector()` function takes a `string` and finds rules with matching values declared. The `option` parameter can be used to toggle whether the match is strict or not. Setting the option to `true` will require the value to match the string exactly, if it's not declared or `false` it will match any value simply containing the supplied `string` anywhere. The last parameter is also optional, a `CSSStyleSheet` object or array containing stylesheets inside which you want to search. If no `list` is supplied it will search through all `CSSRules` found by the `all()` function.

Use this function when you want to find `CSSRule` objects with values matching a string.

### Query

```js
query(string, option*, list*)
```

The `selector()` function takes a `string` and finds media rules with matching `mediaText`. The `option` parameter can be used to toggle whether the match is strict or not. Setting the option to `true` will require the `mediaText` to match the string exactly, if it's not declared or `false` it will match any `mediaText` simply containing the supplied `string` anywhere. The last parameter is also optional, a `CSSStyleSheet` object or array containing stylesheets inside which you want to search. If no `list` is supplied it will search through all `CSSRules` found by the `all()` function.

Use this function when you want to find `CSSMediaRule` objects with `mediaText` matching a string.

## Demos

Demos and helper functions for CSSOMTools can be found in this collection on CodePen: https://codepen.io/collection/AEEJrb/