// Runs template.tpl's own ___TESTS___ scenarios against its sandboxed code,
// with the subset of GTM's test API they use (mock, runCode, assertThat,
// assertApi). GTM's sandbox restrictions are not reproduced: import the
// template into a GTM container and run its tests there before publishing.
import { readFileSync } from 'node:fs';
import { deepStrictEqual } from 'node:assert/strict';

const template = readFileSync(new URL('../template.tpl', import.meta.url), 'utf8');
const section = name => {
  const start = template.indexOf(`___${name}___`);
  if (start < 0) throw new Error(`template.tpl has no ${name} section`);
  const rest = template.slice(start + name.length + 6);
  const end = rest.search(/\n___[A-Z_]+___/);
  return (end < 0 ? rest : rest.slice(0, end)).trim();
};

const code = section('SANDBOXED_JS_FOR_WEB_TEMPLATE');
const scenarios = [...section('TESTS').matchAll(/- name: (.+)\n  code: \|-\n((?: {4}.*\n?| *\n)+)/g)]
  .map(([, name, body]) => ({ name, body: body.replace(/^ {4}/gm, '') }));
if (!scenarios.length) throw new Error('No test scenarios found');

const APIS = ['injectScript', 'encodeUriComponent', 'isConsentGranted', 'addConsentListener',
  'copyFromWindow', 'callInWindow', 'createQueue', 'setInWindow'];
const DEFAULTS = { encodeUriComponent: value => encodeURIComponent(value) };

let failed = 0;
for (const scenario of scenarios) {
  const calls = {};
  const impls = { ...DEFAULTS };
  const spy = name => (...args) => {
    (calls[name] ??= []).push(args);
    const impl = impls[name];
    return typeof impl === 'function' ? impl(...args) : impl;
  };
  const api = {
    mock: (name, impl) => { impls[name] = impl; },
    runCode: data => {
      const fullData = { ...data, gtmOnSuccess: spy('gtmOnSuccess'), gtmOnFailure: spy('gtmOnFailure') };
      const require = name => {
        if (!APIS.includes(name)) throw new Error(`require('${name}') is not permitted by this harness`);
        return spy(name);
      };
      new Function('require', 'data', code)(require, fullData);
    },
    assertThat: actual => ({ isEqualTo: expected => deepStrictEqual(actual, expected) }),
    assertApi: name => ({
      wasCalled: () => { if (!calls[name]?.length) throw new Error(`${name} was not called`); },
      wasNotCalled: () => { if (calls[name]?.length) throw new Error(`${name} was called ${calls[name].length} time(s)`); },
    }),
  };
  try {
    new Function(...Object.keys(api), scenario.body)(...Object.values(api));
    console.log(`✓ ${scenario.name}`);
  } catch (error) {
    failed += 1;
    console.log(`✗ ${scenario.name}\n  ${error.message.split('\n').join('\n  ')}`);
  }
}
console.log(`${scenarios.length - failed}/${scenarios.length} scenarios passed`);
process.exit(failed ? 1 : 0);
