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

const RuleParam = require('./RuleParam')

module.exports = class Rule {
  constructor(init) {
    if (typeof init.namespace !== 'string') throw new Error('field "namespace" must be a string in constructor parameter.')
    this.namespace = init.namespace

    if (typeof init.name !== 'string') throw new Error('field "name" must be a string in constructor parameter.')
    this.name = init.name

    if (typeof init.param !== 'object') throw new Error('field "name" must be an object in constructor parameter.')
    this.param = new RuleParam(init.param)

    if ('cond' in init) {
      if (typeof init.cond !== 'function') throw new Error('field "cond" must be an function in constructor parameter.')
      this.cond = init.cond
    } else {
      this.cond = async () => await true
    }

    if (typeof init.run !== 'function') throw new Error('field "run" must be an function in constructor parameter.')
    this.run = init.run
  }

  get fullname() {
    return this.namespace + ':' + this.name
  }

  async validate(store, t, param) {
    return await this.param.validate(store, t, param) && await this.cond(store, t, param)
  }

  async apply(store, t, param) {
    await this.run(store, t, param)
  }

}