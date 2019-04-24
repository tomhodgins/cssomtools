const hasRules = object => object && object.cssRules && object.cssRules.length

// Takes a string
// Returns a CSSStyleSheet object
export function parse(
  string = ''
) {
  const iframe = document.createElement('iframe')
  document.head.appendChild(iframe)
  const style = iframe.contentDocument.createElement('style')
  style.textContent = string
  iframe.contentDocument.head.appendChild(style)
  const stylesheet = iframe.contentDocument.styleSheets[0]
  document.head.removeChild(iframe)
  return stylesheet
}

// Takes a CSSStyleSheet or CSSRule object, or an array containing them
// Returns the objects passed in after processing with callback function
export function process(
  object = all(),
  callback = rule => rule
) {
  const readRules = list => {
    if (hasRules(list)) {
      [...list.cssRules].forEach(rule => {
        callback(rule)
        if (hasRules(rule)) {
          readRules(rule)
        }
      })
    }
  }
  if (Array.isArray(object)) {
    object.map(child => process(child, callback))
  } else {
    readRules(object)
  }
  return object
}

// Takes a CSSStyleSheet, CSSRule object, an array containing them, or a string
// Returns a stylesheet
export function add(
  object = parse(),
  stylesheet = all().length && all()[all().length - 1] || parse(),
  index = stylesheet.cssRules.length
) {
  if (Array.isArray(object)) {
    object.forEach(child => add(child, stylesheet, index))
  } else if (hasRules(object)) {
    [...object.cssRules].forEach(child => add(child, stylesheet, index))
  } else if (object.cssText) {
    stylesheet.insertRule(object.cssText, index)
  } else if (typeof object === 'string'){
    add(parse(object), stylesheet, index)
  }
  return stylesheet
}

// Takes a CSSStyleSheet or CSSRule object, or an array containing them
// Returns the original object, minus all CSSRule objects
export function remove(
  object = parse()
) {
  if (Array.isArray(object)) {
    object.map(remove)
  } else if (hasRules(object)) {
    [...object.cssRules].map(remove)
  } else if (object.parentRule) {
    object.parentRule.deleteRule(
      [...object.parentRule.cssRules].indexOf(object)
    )
  } else if (object.parentStyleSheet) {
    object.parentStyleSheet.deleteRule(
      [...object.parentStyleSheet.cssRules].indexOf(object)
    )
  }
  return object
}

// Takes a CSSStyleSheet or CSSRule object, or an array containing them
// Returns a string
export function stringify(
  object = all()
) {
  const stringifyRule = rule => rule.cssText || ''
  if (Array.isArray(object)) {
    return object.map(stringify).join('\n')
  } else if (hasRules(object)) {
    return [...object.cssRules].map(stringifyRule).join('\n')
  } else {
    return stringifyRule(rule)
  }
}

// Returns an array of all CSS stylesheets whose cssRules you're allowed to access from document.styleSheets
export function all() {
  return [...document.styleSheets].map(stylesheet => {
    try { stylesheet.cssRules }
    catch(error) { return null }
    return stylesheet
  }).filter(hasRules)
}

// Takes a CSSStyleSheet and a test function
// Returns an object with a cssRules property containing all matching CSSRule objects
export function filter(
  stylesheet = parse(),
  test = rule => rule
) {
  const output = {cssRules: []}
  process(
    stylesheet,
    rule => {
      if (test(rule)) {
        output.cssRules.push(rule)
      }
    }
  )
  return output
}

// Takes a string, and optionally an array of stylesheet objects
// Returns an object containing all rules with selectors containing the string
export function selector(
  string = '',
  option = false,
  list = all()
) {
  if (list.cssRules) {
    list = [list]
  }
  console.log(
    list.map(stylesheet =>
      filter(
        stylesheet,
        rule => {
          if (option) {
            return rule.selectorText && rule.selectorText.trim() === string
          } else {
            return rule.selectorText && rule.selectorText.includes(string)
          }
        }
      )
    ).filter(hasRules)
  )
  return list.map(stylesheet =>
    filter(
      stylesheet,
      rule => {
        if (option) {
          return rule.selectorText && rule.selectorText.trim() === string
        } else {
          return rule.selectorText && rule.selectorText.includes(string)
        }
      }
    )
  ).filter(hasRules)
}

// Takes a string, and optionally an array of stylesheet objects
// Returns an object containing all rules with properties containing the string
export function property(
  string = '',
  option = false,
  list = all()
) {
  if (list.cssRules) {
    list = [list]
  }
  return list.map(stylesheet =>
    filter(
      stylesheet,
      rule => {
        return rule.style && [...rule.style].some(property => {
          if (option) {
            return property.trim() === string
          } else {
            return property.includes(string)
          }
        })
      }
    )
  ).filter(hasRules)
}

// Takes a string, and optionally an array of stylesheet objects
// Returns an object containing all rules with values containing the string
export function value(
  string = '',
  option = false,
  list = all()
) {
  if (list.cssRules) {
    list = [list]
  }
  return list.map(stylesheet =>
    filter(
      stylesheet,
      rule => {
        return rule.style && [...rule.style].some(prop => {
          if (option) {
            return rule.style.getPropertyValue(prop).trim() === string
          } else {
            return rule.style.getPropertyValue(prop).includes(string)
          }
        })
      }
    )
  ).filter(hasRules)
}

// Takes a string, and optionally an array of stylesheet objects
// Returns an object containing all media queries with condition text containing the string
export function query(
  string = '',
  option = false,
  list = all()
) {
  if (list.cssRules) {
    list = [list]
  }
  return list.map(stylesheet =>
    filter(
      stylesheet,
      rule => {
        if (option) {
          return rule.media && rule.media.mediaText.trim() === string
        } else {
          return rule.media && rule.media.mediaText.includes(string)
        }
      }
    )
  ).filter(hasRules)
}

export default {
  parse,
  process,
  add,
  remove,
  stringify,
  all,
  filter,
  selector,
  property,
  value,
  query
}