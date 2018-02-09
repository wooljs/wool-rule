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

const Rule = require('./Rule')

module.exports = class RuleSet {
  constructor(namespace, ...rules) {
    if (typeof namespace !== 'string') throw new Error('constructor parameter "namespace" must be a string.')
    this.namespace = namespace
    this.rules = []
    rules.forEach(r => this.addRule(r))
  }

  addRule(r) {
    r.namespace = this.namespace
    this.rules.push(new Rule(r))
  }
  
  getAsList() {
    return this.rules.map(x => x)
  }

  getAsMap() {
    return this.rules.reduce((p, c) => {
      p[c.fullname] = c
      return p
    }, {})
  }
}
