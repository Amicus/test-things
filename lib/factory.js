var Backbone = require("backbone")
  , _ = require("underscore")
  , resources = {}

//TODO set model registry
//TODO set model
//TODO set pass in backbone model instead of string name

function strip(str) {
  return str.replace(/^\s*|\s*$/g, '')
}

//run me
function Factory(modelClass, fields) {
  this.sequences = {}
  this.modelClass = modelClass
  this.fields = fields
}

Factory.prototype.generate = function(overrides) {
  var model = new this.modelClass()
    , result = this._generateFields(_.extend({}, this.fields, overrides))
  model.set(result, { silent: true })
  return model
}

Factory.prototype._generateFields = function(fields) {
  _(fields).each(function(value, name) {
    this.sequences[name] = this.sequences[name] || []
    var i = 0
    
    if(typeof value === "string") {
      value = this._parseFieldString(value, name)
    } else if(typeof value === "function") {
      value = value()
    }
    fields[name] = value
  }, this)
  return fields
}

var fieldRegex = /{{(sequence|random)(?:\((.*)\))?}}/g
 
Factory.prototype._parseFieldString = function(value, name) {
  var that = this
  return value.replace(fieldRegex, function(x, type, params) {
    var args = params.split(",")
      , startIndex = parseInt(strip(args[0] || "")) || 0
      , characterCount = parseInt(strip(args[0] || "")) || 1
      , characterClass = strip(args[1] || "") || "a-z"
      , value = ""
      , characters

    if(type === "sequence") {
      if(typeof that.sequences[name][i] === "undefined") {
        that.sequences[name][i] = startIndex
      }
      value = that.sequences[name][i]++
    } else if(type === "random") {
      characters = parseCharacterClass(characterClass)
      for(var i = 0 ; i < characterCount ; i++) {
        var rand = Math.floor(Math.random() * characters.length)
        value += String.fromCharCode(rand)
      }
    }
    i++
    return value
  })
}

Factory.prototype.parseCharacterClass = function(characterClass) {
  characters = []
  var singleChars = characterClass.replace(/(.)-(.)/g, function(x, start, end) {
    var startCode = start.charCodeAt(0)
      , endCode = end.charCodeAt(0)

    for(var i = start ; i <= end ; i++) {
      characters.push(i)
    }
    return ""
  })
  characters = characters.concat(
    _(singleChars).map(function(character) {
      return character.charCodeAt(0)
    })
  )
}
 
 
//factory.create = function() {
//  var oldAjax = Backbone.ajax
//
//  Backbone.ajax = function(opts) {
//    var url = opts.url
//      , method = opts.type
//      , data = opts.data
//      , resourceName
//      , id
//
//    parts = url.replace(/(^\/|\/$)/g, "").split()
//
//    for(var i = 0 ; i < parts.length ; i+=2) {
//      resourceName = parts[i]
//      id = parts[i + 1]
//      resources[resourceName] = resources[resourceName] || []
//    }
//    if(method === "POST") {
//      if(id) {
//        resources[resourceName].push(_.extend({ id: id }, data)) 
//      } else {
//        resources[resourceName] = _.extend({}, data)
//      }
//    }
//    Backbone.ajax = oldAjax
//  }
//
//  var instance = factory()
//  instance.save()
//}


module.exports = Factory