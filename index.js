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
  var Store = require('wool-state')

  function Rule(r, s) {
    if (! (this instanceof Rule)) return new Rule(r, s)
    this.rules = r.reduce(function(p, c) { p[c.n] = c ; c.o = c.o.bind(this) ; return p }.bind(this), {})
    this.store = s || Store()
  }
  Rule.prototype.push = function(cmd, cb) {
    this.rules[cmd.n].o(cmd.p, function(err, ids) {
      if (err) return cb(err)
      if (ids instanceof Array) return cb(err, ids)
      else return cb(err, [ ids ])
    })
  }
  Rule.prototype.get = function(id) {
    return this.store.get(id)
  }
  Rule.prototype.create = function(data, cb) {
    try {
      var id = Store.newId()
      this.store.set(id, data)
      cb(null, id)
    } catch(e) {
      cb(e)
    }
  }
  Rule.prototype.update = function(id, data, cb) {
    try {
      this.store.set(id, data)
      cb(null, id)
    } catch(e) {
      cb(e)
    }
  }
  return Rule
}())