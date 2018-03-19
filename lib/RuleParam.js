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
  constructor(o) {
    this.o = o
  }
  async validate(){
    return await true
  }

  toDTO() {
    return Object.entries(this.o).reduce((p, c) => { let [k, v] = c; p[k] = (v === 'new_id' ? 0 : 1); return  p }, {})
  }
}


RuleParam.ID = 'id'
RuleParam.NEW_ID = 'new_id'

module.exports = RuleParam
