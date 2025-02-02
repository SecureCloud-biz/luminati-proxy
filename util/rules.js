// LICENSE_CODE ZON
'use strict'; /*jslint node:true es9:true*/
require('./config.js');
const crypto = require('crypto');
const _ = require('lodash');
const zurl = require('./url.js');
const string = require('./string.js');
const E = exports;
const MD5_RAND_MAX = parseInt('f'.repeat(32), 16);

E.find_matches = (all_rules, selector)=>
    (all_rules||[]).filter(x=>E.matches_rule(x.match, selector, x.opts));

E.merge_matches = (matches, overrides=[], opts)=>{
    if (opts && opts.matches_preprocessor)
        matches = opts.matches_preprocessor(matches);
    return _.merge({}, ...matches.map(x=>x.rules), ...overrides,
        E.rule_merge_customizer);
};

E.select_rules = (all_rules, selector, overrides=[], opts)=>{
    const matches = E.find_matches(all_rules, selector);
    return E.merge_matches(matches, overrides, opts);
};

E.make_rules_object = (rules, selector)=>{
    return {
        selector,
        // this function is the high-loaded place: must be as quick as possible
        // ONLY dots must be used as props separator
        get(k, _default){
            let ret = rules && rules[k];
            if (ret!=null)
                return ret;
            const k_str = typeof k=='string';
            if (k_str && !k.includes('.'))
                return _default;
            // better provide [] since lodash does too common str->[]
            ret = _.get(rules, k_str ? k.split('.') : k);
            return ret!=null ? ret : _default;
        },
        all: ()=>Object.assign({}, rules),
        merge: new_rules=>_.merge(rules, new_rules, E.rule_merge_customizer),
        clone_and_merge: new_rules=>{
            const r = E.make_rules_object(_.merge({}, rules, new_rules,
                E.rule_merge_customizer), selector);
            if (this.info)
                r.info = {...this.info};
            return r;
        },
    };
};

const str_to_rand = str=>parseInt(crypto.createHash('md5').update(str)
    .digest('hex'), 16) / MD5_RAND_MAX;

E.matches_rule = (match, selector, opts)=>{
    opts = opts||{};
    for (let k in match)
    {
        let preprocessor, comparator;
        if (k=='hostname')
        {
            if (opts.use_host_lookup)
                comparator = hostname_lookup;
            else
                preprocessor = unify_hostnames;
        }
        if (k=='version_min')
        {
            if ((match[k]||0)>(selector.version||0))
                return false;
        }
        else if (k=='per')
        {
            let rand = opts.seed ? str_to_rand(opts.seed) : Math.random();
            if (match[k]/100<rand)
                return false;
        }
        else if (!E.rule_value_match(match[k], selector[k],
            {preprocessor, comparator}))
        {
            return false;
        }
    }
    return true;
};

E.rule_value_match = (rule_v, v, opts)=>{
    if (rule_v && rule_v.$not)
        return !E.rule_value_match(rule_v.$not, v, opts);
    if (rule_v && rule_v.$and)
        return rule_v.$and.every(_rule=>E.rule_value_match(_rule, v, opts));
    if (opts && opts.comparator)
        return !!opts.comparator(rule_v, v);
    if (Array.isArray(rule_v))
        return rule_v.some(_rule_v=>E.rule_value_match(_rule_v, v, opts));
    if (!_.isObject(rule_v))
    {
        if (typeof v!='string')
            return rule_v==v;
        if (opts && opts.preprocessor)
            [rule_v, v] = opts.preprocessor(rule_v, v);
        if (!rule_v || rule_v.length!=v.length)
            return false;
        for (let i=0; i<v.length; i++)
        {
            if (rule_v[i].toLowerCase() !== v[i].toLowerCase())
                return false;
        }
        return true;
    }
    if (rule_v.test)
        return rule_v.test(v||'');
    return _.every(rule_v,
        (_rule_v, k)=>E.rule_value_match(_rule_v, v && v[k], opts));
};

E.rule_value_match_debug = (rule_v, v, opts)=>{
    if (Array.isArray(rule_v))
    {
        for (let _rule_v of rule_v)
        {
            let match = E.rule_value_match_debug(_rule_v, v, opts);
            if (match.context)
                return match;
        }
        return {};
    }
    if (!_.isObject(rule_v))
    {
        // XXX denis: remove this conversion
        // rules need to be case *sensitive* if not stated otherwise
        rule_v = typeof rule_v=='string' ? rule_v.toLowerCase() : rule_v;
        v = typeof v=='string' ? v.toLowerCase() : v;
        return rule_v==v ? {pattern: rule_v, context: v} : {};
    }
    // object is not supported: 2 patterns will be found - which one to return?
    if (!rule_v.test)
        return {};
    // XXX denis: remove this conversion
    // rules need to be case *sensitive* if not stated otherwise
    rule_v = new RegExp(rule_v, rule_v.flags.replace('i', '')+'i');
    let match = rule_v.exec(v);
    if (!match)
        return {};
    let before = _.get(opts, 'before', 10);
    let after = _.get(opts, 'after', 10);
    let context = typeof v!='string' ? v :
        v.substring(match.index-before, match.index+match[0].length+after);
    return {pattern: rule_v.toString(), context};
};

E.rule_merge_customizer = (dest, src)=>{
    if (Array.isArray(src))
        return src;
};

function unify_hostnames(hostname, selector){
    const hostname_level = hostname ? string.count(hostname, '.') : 0;
    const selector_level = selector ? string.count(selector, '.') : 0;
    return [
        hostname_level<selector_level ? 'www.'+hostname : hostname,
        hostname_level>selector_level ? 'www.'+selector : selector,
    ];
}

function hostname_lookup(haystack, v){
    return v && typeof haystack=='object' && zurl.host_lookup(haystack, v);
}

E.t = {unify_hostnames};
