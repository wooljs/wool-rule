/*
 * Copyright 2018 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

const { Command, Event } = require('wool-model')
  , InvalidRuleError = require('./InvalidRuleError')

module.exports = class RuleEngine {
  constructor(store) {
    this.store = store
    this.rules = new Map()
  }
  async execute(command) {
    if (!(command instanceof Command)) throw new Error('Shoud be of type Command: '+JSON.stringify(command))
    let n = command.name
      , rule = this.rules.get(n)
      , t = command.t
      , p = command.param
      , valid = false
    if (typeof rule === 'undefined') throw new Error('no rule found for: '+ n)
    try {
      valid = await rule.validate(this.store, p, t)
    } catch(e) {
      if (e instanceof InvalidRuleError) return command.toEvent('I', e.message ) //+ '\n'+ e.stack)
      return command.toEvent('E', e.message+ '\n'+ e.stack)
    }
    if (!valid) {
      return command.toEvent('I', 'params are not valid')
    } else {
      try {
        await rule.apply(this.store, p, t)
        command.param = rule.filterParam(p)
        return command.toEvent('S')
      } catch(e) {
        return command.toEvent('E', e.message+ '\n'+ e.stack)
      }
    }
  }
  async replay(event) {
    if (!(event instanceof Event)) throw new Error('Shoud be of type Event: '+JSON.stringify(event))
    if (event.isSuccess()) {
      let n = event.name
        , rule = this.rules.get(n)
        , t = event.t
        , p = event.data
      if (typeof rule === 'undefined') throw new Error('no rule found for: '+ n)
      await rule.apply(this.store, p, t)
    }
    return event
  }
  addRules(rules) {
    rules.forEach(r => this.rules.set(r.fullname(), r))
  }
}
