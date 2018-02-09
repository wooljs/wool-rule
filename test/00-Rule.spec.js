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

'use strict'

var test = require('tape')
  , Rule = require(__dirname + '/../lib/Rule.js')
  , RuleSet = require(__dirname + '/../lib/RuleSet.js')

test('create one rule', async function(t) {
  let s = {}
    , n = Date.now()
    , p = {}
    , rule = new Rule({
      namespace: 'test',
      name: 'rule',
      param: {},
      cond(store, tmstp, param) {
        return new Promise(resolve => {
          setTimeout(() => {
            t.deepEqual(s, store)
            t.deepEqual(n, tmstp)
            t.deepEqual(p, param)
            resolve(true)
          }, 100)
        })
      },
      run() {}
    })

  let actual = await rule.validate(s, n, p)

  t.ok(actual)
  t.plan(4)
  t.end()
})

test('create one ruleSet', function(t) {
  let s = {}
    , n = Date.now()
    , p = {}
    , fun_test = function() {}
    , rules = new RuleSet('test', { name: 'rule01', param: {}, run() {} }, { name: 'rule02', param: {}, run: fun_test }, { name: 'rule03', param: {}, run() {} })

  t.ok(rules.getAsList().length === 3)
  t.ok(rules.getAsMap()['test:rule02'].run === fun_test)

  t.plan(2)
  t.end()
})
