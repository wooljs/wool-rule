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

const Store = require('wool-store').Store
  , Command = require('wool-model').Command

module.exports = class RuleEngine {
  constructor(store) {
    this.store = store || new Store()
    this.rules = new Map()
  }
  async execute(command) {
    if (command instanceof Command) {
      let rule = this.rules.get(command.name)
        , t = command.t
        , p = command.param
      if (rule && await rule.validate(this.store, t, p)) {
        await rule.apply(this.store, t, p)
      }
    }
  }
  addRules(rules) {
    rules.forEach(r => this.rules.set(r.fullname(), r))
  }
}
