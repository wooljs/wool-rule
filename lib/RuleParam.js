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

const { Store } = require('wool-store')

class RuleParam {
  constructor(p) {
    this.p = p
  }
  async validate(store, param) {
    let res = true
    for (let p of this.p) {
      res = await p.validate(store, param) && res
      if (!res) break
    }
    return res
  }
  toDTO() {
    return this.p.reduce((p, c) => {
      let k = c.getKey()
      p[k] = c.isMandatory()
      return p
    },{})
  }
}

class ParamCheck {
  constructor(k) {
    this.k = k
  }
  getKey() {
    return this.k
  }
  containParam(param) {
    return this.k in param
  }
  extractParam(param) {
    return param[this.k]
  }
  saveToParam(param, v) {
    param[this.k] = v
  }
  isMandatory() {
    return true
  }
}

class NoCheck extends ParamCheck {
  static build() {
    return new NoCheck()
  }
  async validate() {
    return await true
  }
}

class ValidId extends ParamCheck {
  static build(k) {
    return new ValidId(k)
  }
  async validate(store, param) {
    let id = this.extractParam(param)
    if (! (await store.has(id))) throw new Error('invalid ID '+this.k+' '+id)
    return true
  }
  asNew() {
    return new NotExistsId(this.k)
  }
}

class NotExistsId extends ParamCheck {
  async validate(store, param) {
    if (this.containParam(param)) throw new Error('invalid param '+this.k)
    let id = Store.newId()
    this.saveToParam(param, id)
    if (await store.has(id)) {
      throw new Error('should not be in store '+this.k+' '+id)
    }
    return true
  }
  isMandatory() {
    return false
  }
}

class StrCheck extends ParamCheck {
  static build(k) {
    return new StrCheck(k)
  }
  async validate(store, param) {
    let str = this.extractParam(param)
    return typeof str === 'string'
  }
}

RuleParam.ParamCheck = ParamCheck
RuleParam.NoCheck = NoCheck.build
RuleParam.ID = ValidId.build
RuleParam.STR = StrCheck.build

module.exports = RuleParam
