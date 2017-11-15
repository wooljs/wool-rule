/*
 * Copyright 2017 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

module.exports = (function() {
  'use strict'
  var Store = require('wool-store')

  function Rule(r, s) {
    if (! (this instanceof Rule)) return new Rule(r, s)
    this.rules = r.reduce(function(p, c) {
      var x = p[c.n] = {}
      x.n = c.n
      x.p = c.p
      if ('c' in c) { x.c = c.c.bind(this) }
      x.o = c.o.bind(this)
      return p
    }.bind(this), {})
    this.store = s || Store()
  }
  Rule.prototype.push = function(cmd, cb) {
    var rule = this.rules[cmd.n]
    if ('c' in rule) {
      return rule.c(cmd.d, function(err) {
        if (err) return cb(err)
        else try {
          return this.execute(rule, cmd, cb)
        } catch (e) {
          return cb(e)
        }
      }.bind(this))
    } else {
      return this.execute(rule, cmd, cb)
    }
  }
  Rule.prototype.execute = function(rule, cmd, cb) {
    return rule.o(cmd.d, function(err, data) {
      if (err) return cb(err)
      else try {
        return cb(err, data)
      } catch (e) {
        return cb(e)
      }
    }.bind(this))
  }
  Rule.prototype.get = function(id) {
    return this.store.get(id)
  }
  Rule.prototype.create = function(f, data, cb) {
    try {
      var newId = Store.newId()
        , id = ((typeof f === 'function') ? f(newId) : ((typeof f === 'string') ? f+newId : newId))
      this.store.set(id, data)
      cb()
    } catch(e) {
      cb(e)
    }
  }
  Rule.prototype.update = function(id, data, cb) {
    try {
      this.store.set(id, data)
      cb()
    } catch(e) {
      cb(e)
    }
  }
  Rule.prototype.remove = function(id, cb) {
    try {
      this.store.del(id)
      cb()
    } catch(e) {
      cb(e)
    }
  }
  return Rule
}())
