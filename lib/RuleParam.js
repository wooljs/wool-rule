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

class RuleParam {
  constructor(p) {
    this.p = p
  }
  async validate(store, param) {
    let res = true
    // TODO parallelize check
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

[
  'ParamCheck',
  'NoCheck',
  'StrCheck',
  'EnumCheck',
  'ValidId'
].forEach((k)=> {
  RuleParam[k] = require('./param-check/'+k)
})

Object.entries({
  NoCheck: 'NoCheck', // rewrite entry
  ID: 'ValidId',
  STR: 'StrCheck',
  ENUM: 'EnumCheck'
}).forEach(([k,v])=>{
  RuleParam[k] = RuleParam[v].build
})

module.exports = RuleParam

