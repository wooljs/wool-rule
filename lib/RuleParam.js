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
  , InvalidRuleError = require('./InvalidRuleError')

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
  toDTO() {
    return {}
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
  constructor(k, opt) {
    super(k)
    opt = opt || {}
    this.prefix = 'prefix' in opt ? opt.prefix : ''
    this.prefixMatch = this.prefix.length === 0 ? (()=>true) : RegExp.prototype.test.bind(new RegExp('^'+this.prefix))
    this.algo = 'algo' in opt ? opt.algo : Store.newId
  }
  static build(k, opt) {
    return new ValidId(k, opt)
  }
  async validate(store, param) {
    let id = this.extractParam(param)
    if (! (await store.has(this.as(id)))) throw new InvalidRuleError('invalid ID '+this.k+' '+id)
    return true
  }
  asNew() {
    return new NotExistsId(this.k, this)
  }
  as(id) {
    return this.prefix + id
  }
  isOne(id) {
    this.prefixMatch(id)
  }
}

class NotExistsId extends ValidId {
  async validate(store, param) {
    if (this.containParam(param)) throw new InvalidRuleError('invalid param '+this.k)
    let id = await this.algo()
    this.saveToParam(param, id)
    if (await store.has(this.as(id))) {
      throw new InvalidRuleError('should not be in store '+this.k+' '+id)
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
  regex(rx) {
    return new RegexDecorator(this.k, this, rx)
  }
  crypto(algo) {
    if (typeof algo === 'function') return new CryptoDecorator(this.k, this, algo, async(hash, value)=>(hash === await algo(value)))
    let { hash, match } = algo
    return new CryptoDecorator(this.k, this, hash, match)
  }
}

class RegexDecorator extends StrCheck {
  constructor(k, d, rx) {
    super(k)
    this.d = d
    this.rx = rx
  }
  async validate(store, param) {
    if(await this.d.validate(store, param)) {
      let str = this.extractParam(param)
      return this.rx.test(str)
    }
  }
}

class CryptoDecorator extends StrCheck {
  constructor(k, d, hash, match) {
    super(k)
    this.d = d
    this.hash = hash
    this.match = match
  }
  async validate(store, param) {
    if(await this.d.validate(store, param)) {
      let str = this.extractParam(param)
      this.saveToParam(param, await this.hash(str))
      return true
    }
  }
  async match(hash, value) {
    return await this.match(hash, value)
  }
}


RuleParam.ParamCheck = ParamCheck
RuleParam.NoCheck = NoCheck.build
RuleParam.ID = ValidId.build
RuleParam.STR = StrCheck.build

module.exports = RuleParam
