var Backbone = require("backbone")
  , methods = ["get", "post", "put", "delete", "patch"]
  , callbacks
  , _ = require("underscore")

var request = module.exports = { never: {}, routes: [] }

function init() {
  routes = {}
  _(methods).each(function(method) {
    routes[method] = []
  })
}
init()

_(methods).each(function(method) {
  function pushRoute(route, cb, fixture, times) {
    if(typeof cb === "object") {
      fixture = cb
      cb = function() {}
    }

    routes[method].push(
      _.extend(setupRoute(route), {
        callback: cb,
        times: times,
        route: route,
        fixture: fixture,
      })
    )
  }

  request[method] = function(route, cb, fixture) {
    pushRoute(route, cb, fixture)
  }

  request[method].once = function(route, cb, fixture) {
    pushRoute(route, cb, fixture, 1)
  }

  request.never[method] = function(route, cb, fixture) {
    pushRoute(route, cb, fixture, 0)
  }

  request[method].times = function(times) {
    return function(route, cb, fixture) {
      pushRoute(route, cb, fixture, times)
    }
  }

})

function setupRoute(path) {
  var route = { keys: [] }
  var buildRegex = function(x, slash, format, key, capture, optional) {
    //remember the keys (e.g. /:id) so we can build a hash
    //of parameters when we match
    route.keys.push(key)
    if (slash == null) slash = ''
    return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || '([^/]+?)') + ')' + (optional || '')
  }
  path = path.concat('/?').replace(/\/\(/g, '(?:/').replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, buildRegex).replace(/([\/.])/g, '\\$1').replace(/\*/g, '(.+)')
  route.regExp = new RegExp('^' + path + '$', 'i')

  return route
}

function matchRoute(opts) {
  var method = opts.type.toLowerCase()
    , url = opts.url
    , data = opts.data
    , found = false

  request.routes.push(
    method.toUpperCase() + "ing " + url + " with params: " + JSON.stringify(data)
  )
  _(routes[method]).each(function(route) {
    var values
    found = true

    if(values = url.match(route.regExp)) {
      if(typeof route.times === "number" && route.times-- === 0) {
        throw new Error("Route: " + route.route + " called too many times")
      }
      var params = _.extend(
        _.object(route.keys, values.slice(1)),
        { body: data }
      )
      if(route.callback) {
        route.callback(params, opts)
      }
      if(route.fixture) {
        opts.success(route.fixture)
      } else {
        opts.error()
      }
    }
  })
  if(!found) {
    opts.error
  }
}

Backbone.ajax = function(opts) {
  process.nextTick(function() {
    matchRoute(opts)
  })
}

beforeEach(function() {
  init()
})
