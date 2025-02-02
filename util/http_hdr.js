// LICENSE_CODE ZON ISC
'use strict'; /*jslint node:true*/
require('./config.js');
const {select_rules} = require('./rules.js');
const string = require('./string.js'), {qw} = string;
const E = exports, assign = Object.assign;
const exists = /./;

const special_case_words = {
    te: 'TE',
    etag: 'ETag',
};

E.capitalize = function(headers){
    let res = {};
    for (let header in headers)
    {
        let new_header = header.toLowerCase().split('-').map(word=>{
            return special_case_words[word] ||
                (word.length ? word[0].toUpperCase()+word.substr(1) : '');
        }).join('-');
        res[new_header] = headers[header];
    }
    return res;
};

// original_raw should be the untransformed value of rawHeaders from the
// Node.js HTTP request or response
E.restore_case = function(headers, original_raw){
    if (!original_raw)
        return headers;
    const names = {};
    for (let i = 0; i<original_raw.length; i += 2)
    {
        const name = original_raw[i];
        names[name.toLowerCase()] = [name];
    }
    for (let orig_name in headers)
    {
        const name = orig_name.toLowerCase();
        if (names[name])
            names[name].push(orig_name);
        else
            names[name] = [orig_name];
    }
    const res = {};
    for (let name in names)
    {
        const value = names[name].map(n=>headers[n]).filter(v=>v)[0];
        if (value!==undefined)
            res[names[name][0]] = value;
    }
    return res;
};

const generate_sec_ch_rules_chromium = ({ver_from, ver_to, browser_name,
    browser_full_name})=>{
    const specific_vers = {
        91: {match: {browser: browser_name, https: true, version_min: 91},
            rules: {
                'sec-ch-ua': `" Not;A Brand";v="99", "${browser_full_name}"`
                    +`;v="91", "Chromium";v="91"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
        },
        94: {match: {browser: browser_name, https: true, version_min: 94},
            rules: {
                'sec-ch-ua': `"Chromium";v="94", "${browser_full_name}";v="94"`
                    +`, ";Not A Brand";v="99"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
        },
        95: {match: {browser: browser_name, https: true, version_min: 95},
            rules: {
                'sec-ch-ua': `"${browser_full_name}";v="95", "Chromium";`+
                    `v="95", ";Not A Brand";v="99"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
        },
        97: {match: {browser: browser_name, https: true, version_min: 97},
            rules: {
                'sec-ch-ua': `" Not;A Brand";v="99", "${browser_full_name}";`
                    +`v="97", "Chromium";v="97"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
        },
        103: {match: {browser: browser_name, https: true, version_min: 103},
            rules: {
                'sec-ch-ua': `".Not/A)Brand";v="99", "${browser_full_name}";`
                    +`v="103", "Chromium";v="103"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
        },
        104: {match: {browser: browser_name, https: true, version_min: 104},
            rules: {
                'sec-ch-ua': `"Chromium";v="104", " Not A;Brand";v="99", `
                    +`"${browser_full_name}";v="104"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
        },
        105: {match: {browser: browser_name, https: true, version_min: 105},
            rules: {
                'sec-ch-ua': `"${browser_full_name}";v="105", `
                    +`"Not)A;Brand";v="8", "Chromium";v="105"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
        },
        106: {match: {browser: browser_name, https: true, version_min: 106},
            rules: {
                'sec-ch-ua': `"Chromium";v="106", "${browser_full_name}";`
                    +`v="106", "Not;A=Brand";v="99"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
        },
        107: {match: {browser: browser_name, https: true, version_min: 107},
            rules: {
                'sec-ch-ua': `"${browser_full_name}";v="107", `
                    +`"Chromium";v="107", "Not=A?Brand";v="24"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
        },
        108: {match: {browser: browser_name, https: true, version_min: 108},
            rules: {
                'sec-ch-ua': `"Not?A_Brand";v="8", `
                    +`"Chromium";v="108", "${browser_full_name}";v="108"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
        },
        109: {match: {browser: browser_name, https: true, version_min: 109},
            rules: {
                'sec-ch-ua': `"Not_A Brand";v="99", `
                    +`"${browser_full_name}";v="109", "Chromium";v="109"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
        },
        110: {match: {browser: browser_name, https: true, version_min: 110},
            rules: {
                'sec-ch-ua': `"Chromium";v="110", `
                    +`"Not A(Brand";v="24", "${browser_full_name}";v="110"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
        },
        111: {match: {browser: browser_name, https: true, version_min: 111},
            rules: {
                'sec-ch-ua': `"${browser_full_name}";v="111", `
                    +`"Not(A:Brand";v="8", "Chromium";v="111"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
        },
        112: {match: {browser: browser_name, https: true, version_min: 112},
            rules: {
                'sec-ch-ua': `"Chromium";v="112", `+
                    `"${browser_full_name}";v="112", "Not:A-Brand";v="99"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
        },
        113: {match: {browser: browser_name, https: true, version_min: 113},
            rules: {
                'sec-ch-ua': `"${browser_full_name}";v="113", `
                    +`"Chromium";v="113", "Not-A.Brand";v="24"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
        },
        114: {match: {browser: browser_name, https: true, version_min: 114},
            rules: {
                'sec-ch-ua': `"Not.A/Brand";v="8", "Chromium";v="114", `+
                    `"${browser_full_name}";v="114"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
        },
    };
    const versions_array = Array.from({length: ver_to - ver_from + 1},
        (_, idx)=>idx+ver_from);
    return versions_array.map(v=>specific_vers[v]||{
        match: {browser: browser_name, https: true, version_min: v},
        rules: {
            'sec-ch-ua': `" Not A;Brand";v="99", `
                +`"Chromium";v="${v}", "${browser_full_name}";v="${v}"`,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
        },
    });
};

const sec_ch_rules_chrome = generate_sec_ch_rules_chromium({
    ver_from: 89, ver_to: 117, browser_name: 'chrome',
    browser_full_name: 'Google Chrome'});

const sec_ch_rules_edge = generate_sec_ch_rules_chromium({
    ver_from: 97, ver_to: 117, browser_name: 'edge',
    browser_full_name: 'Microsoft Edge'});

// default header values
const rules_headers = [
    {match: {browser: 'chrome'},
        rules: {
            connection: 'keep-alive',
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'upgrade-insecure-requests': '1',
            'accept-encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.9',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        }},
    {match: {browser: 'chrome', https: true},
        rules: {'accept-encoding': 'gzip, deflate, br'}},
    {match: {browser: 'chrome', https: true, version_min: 76},
        rules: {
            'sec-fetch-mode': 'navigate',
            'sec-fetch-user': '?1',
            'sec-fetch-site': 'none',
        }},
    ...sec_ch_rules_chrome,
    {match: {browser: 'chrome', https: true, version_min: 89, os: 'mac'},
        rules: {'sec-ch-ua-platform': '"macOS"'}},
    {match: {browser: 'chrome', version_min: 79},
        rules: {accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'}},
    {match: {browser: 'chrome', https: true, version_min: 80},
        rules: {'sec-fetch-dest': 'document'}},
    {match: {browser: 'chrome', version_min: 85},
        rules: {accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'}},
    {match: {browser: 'chrome', version_min: 110},
        rules: {accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'}},
    {match: {browser: 'chrome', type: 'image'},
        rules: {accept: 'image/webp,image/apng,image/*,*/*;q=0.8'}},
    {match: {browser: 'chrome', type: 'image', version_min: 85},
        rules: {accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'}},
    {match: {browser: 'chrome', type: 'image', version_min: 88},
        rules: {accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'}},
    {match: {browser: 'chrome', https: true, version_min: 76, type: 'image'},
        rules: {
            'sec-fetch-mode': 'no-cors',
            'sec-fetch-site': 'same-origin',
        }},
    {match: {browser: 'chrome', https: true, version_min: 80, type: 'image'},
        rules: {'sec-fetch-dest': 'image'}},
    {match: {browser: 'chrome', https: true, version_min: 76, type: 'script'},
        rules: {
            'sec-fetch-mode': 'no-cors',
            'sec-fetch-site': 'same-origin',
        }},
    {match: {browser: 'chrome', https: true, version_min: 80, type: 'script'},
        rules: {'sec-fetch-dest': 'script'}},
    {match: {browser: 'chrome', https: true, version_min: 76, type: 'ajax'},
        rules: {
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
        }},
    {match: {browser: 'chrome', https: true, version_min: 80, type: 'ajax'},
        rules: {'sec-fetch-dest': 'empty'}},
    {match: {browser: 'mobile_chrome'},
        rules: {
            'user-agent': 'Mozilla/5.0 (Linux; Android 9; MBOX) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'upgrade-insecure-requests': '1',
            'accept-encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.9',
        }},
    {match: {browser: 'mobile_chrome', https: true},
        rules: {'accept-encoding': 'gzip, deflate, br'}},
    {match: {browser: 'mobile_chrome', version_min: 88},
        rules: {accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3'}},
    {match: {browser: 'mobile_chrome', type: 'image', version_min: 88},
        rules: {accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'}},
    {match: {browser: 'mobile_chrome', https: true, version_min: 76},
        rules: {
            'sec-fetch-mode': 'navigate',
            'sec-fetch-user': '?1',
            'sec-fetch-site': 'none',
        }},
    {match: {browser: 'mobile_chrome', version_min: 79},
        rules: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        }},
    {match: {browser: 'mobile_chrome', https: true, version_min: 83},
        rules: {'sec-fetch-dest': 'document'}},
    {match: {browser: 'firefox'},
        rules: {
            connection: 'keep-alive',
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'upgrade-insecure-requests': '1',
            'accept-encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.5',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0',
        }},
    {match: {browser: 'firefox', version_min: 65},
        rules: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        }},
    {match: {browser: 'firefox', version_min: 66},
        rules: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }},
    {match: {browser: 'firefox', version_min: 72},
        rules: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        }},
    {match: {browser: 'firefox', version_min: 93},
        rules: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        }},
    {match: {browser: 'firefox', type: 'image'},
        rules: {accept: '*/*'}},
    {match: {browser: 'firefox', type: 'image', version_min: 65},
        rules: {accept: 'image/webp,*/*'}},
    {match: {browser: 'firefox', type: 'image', version_min: 93},
        rules: {accept: 'image/avif,image/webp,*/*'}},
    {match: {browser: 'firefox', https: true},
        rules: {
            'accept-encoding': 'gzip, deflate, br',
            te: 'trailers',
        }},
    {match: {browser: 'edge'},
        rules: {
            connection: 'keep-alive',
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'upgrade-insecure-requests': '1',
            'accept-encoding': 'gzip, deflate',
            'accept-language': 'en-US',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763',
        }},
    {match: {browser: 'edge', version_min: 80},
        rules: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-user': '?1',
            'sec-fetch-dest': 'document',
            'sec-fetch-site': 'none',
        }},
    {match: {browser: 'edge', https: true},
        rules: {
            'accept-encoding': 'gzip, deflate, br',
        }},
    {match: {browser: 'edge', version_min: 110},
        rules: {accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'}},
    {match: {browser: 'edge', type: 'image', version_min: 97},
        rules: {
            accept: 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }},
    {match: {browser: 'edge', https: true, version_min: 97, type: 'image'},
        rules: {
            'sec-fetch-mode': 'no-cors',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-dest': 'image',
        }},
    {match: {browser: 'edge', https: true, version_min: 97, type: 'script'},
        rules: {
            'sec-fetch-mode': 'no-cors',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-dest': 'script',
        }},
    {match: {browser: 'edge', https: true, version_min: 97, type: 'ajax'},
        rules: {
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-dest': 'empty',
        }},
    ...sec_ch_rules_edge,
    {match: {browser: 'safari'},
        rules: {
            connection: 'keep-alive',
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'upgrade-insecure-requests': '1',
            'accept-encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.9',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15',
        }},
    {match: {browser: 'safari', version_min: 15},
        rules: {'accept-language': 'en-us'}},
    {match: {browser: 'safari', type: 'image'},
        rules: {accept: 'image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5'}},
    {match: {browser: 'safari', version_min: 11, type: 'image'},
        rules: {accept: 'image/png,image/svg+xml,image/*;q=0.8,video/*;q=0.8,*/*;q=0.5'}},
    {match: {browser: 'safari', version_min: 14, type: 'image'},
        rules: {accept: 'image/webp,image/png,image/svg+xml,image/*;q=0.8,video/*;q=0.8,*/*;q=0.5'}},
    {match: {browser: 'safari', version_min: 16, type: 'image'},
        rules: {accept: 'image/webp,image/avif,video/*;q=0.8,image/png,image/s'
            +'vg+xml,image/*;q=0.8,*/*;q=0.5'}},
    {match: {browser: 'safari', https: true, version_min: 11},
        rules: {'accept-encoding': 'br, gzip, deflate'}},
    {match: {browser: 'safari', https: true, version_min: 13},
        rules: {'accept-encoding': 'gzip, deflate, br'}},
    {match: {browser: 'mobile_safari'},
        rules: {
            'connection': 'keep-alive',
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'accept-encoding': 'gzip, deflate',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Mobile/15E148 Safari/604.1',
            'accept-language': 'en-US,en;q=0.9',
            'upgrade-insecure-requests': '1',
            referer: '',
        }},
    {match: {browser: 'mobile_safari', version_min: 15},
        rules: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'accept-language': 'en-us',
        }},
    {match: {browser: 'mobile_safari', https: true},
        rules: {
            'accept-encoding': 'gzip, deflate, br',
        }},
    {match: {browser: 'mobile_safari', type: 'image'},
        rules: {accept: 'image/png,image/svg+xml,image/*;q=0.8,video/*;q=0.8,*/*;q=0.5'}},
    {match: {browser: 'mobile_safari', version_min: 15, type: 'image'},
        rules: {accept: 'image/webp,image/png,image/svg+xml,image/*;q=0.8,video/*;q=0.8,*/*;q=0.5'}},
    {match: {browser: 'mobile_safari', version_min: 16, type: 'image'},
        rules: {accept: 'image/webp,image/avif,video/*;q=0.8,image/png,'
            +'image/svg+xml,image/*;q=0.8,*/*;q=0.5'}},
    {match: {type: 'script'},
        rules: {accept: '*/*'}},
    {match: {type: 'ajax'},
        rules: {accept: '*/*'}},
    {match: {type: 'css'},
        rules: {'accept': 'text/css,*/*;q=0.1'}},
];

// XXX josh: upgrade-insecure-requests might not be needed on 2nd request
// onwards
E.browser_defaults = function(browser, opt){
    opt = assign({}, opt);
    if (!is_browser_supported(browser))
        browser = 'chrome';
    return select_rules(rules_headers, {
        browser: browser,
        version: opt.major,
        https: opt.https,
        type: opt.type==='document' ? undefined : opt.type,
        redirect: opt.redirect,
        os: opt.os,
    });
};

// XXX dmitriie: deprecated
E.browser_accept = function(browser, type, opt={}){
    let defs = {
        document: {
            chrome: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            chrome_79: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            chrome_85: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            mobile_chrome: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            mobile_chrome_79: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            firefox: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            edge: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            safari: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            mobile_safari: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        image: {
            chrome: 'image/webp,image/apng,image/*,*/*;q=0.8',
            chrome_85: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
            firefox: 'image/webp,*/*',
            safari: '*/*',
        },
        video: {
            chrome: '*/*',
            firefox: 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
        },
        audio: {
            chrome: '*/*',
            firefox: 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,application/ogg;q=0.7,video/*;q=0.6,*/*;q=0.5',
            safari: '*/*',
        },
        script: {
            chrome: '*/*',
            firefox: '*/*',
            safari: '*/*',
        },
        css: {
            chrome: 'text/css,*/*;q=0.1',
            firefox: 'text/css,*/*;q=0.1',
            safari: 'text/css,*/*;q=0.1',
        },
    };
    let kind = defs[type]||defs.document;
    let browser_re = new RegExp(`^${browser}_(\\d+)$`);
    let versions = Object.keys(kind).filter(k=>browser_re.test(k))
        .map(k=>+k.match(browser_re)[1]).sort((a, b)=>b - a);
    let version = versions.find(v=>opt.major >= v);
    let v_key = `${browser}_${version}`;
    return kind[v_key]||kind[browser]||kind.chrome;
};

const rules_orders = [
    // http1 rules
    {match: {browser: 'chrome'},
        rules: {order: qw`host connection pragma cache-control
            upgrade-insecure-requests user-agent sec-fetch-mode sec-fetch-user
            accept sec-fetch-site referer accept-encoding accept-language
            cookie`}},
    {match: {browser: 'chrome', type: 'ajax'},
        rules: {order: qw`host connection pragma cache-control accept
            x-requested-with user-agent sec-fetch-mode content-type
            sec-fetch-site referer accept-encoding accept-language cookie`}},
    {match: {browser: 'chrome', version_min: 78},
        rules: {order: qw`host connection pragma cache-control origin
            upgrade-insecure-requests user-agent sec-fetch-user accept
            sec-fetch-site sec-fetch-mode referer accept-encoding
            accept-language cookie`}},
    {match: {browser: 'chrome', version_min: 80},
        rules: {order: qw`host connection pragma cache-control origin
            upgrade-insecure-requests user-agent sec-fetch-dest accept
            sec-fetch-site sec-fetch-mode sec-fetch-user referer
            accept-encoding accept-language cookie`}},
    {match: {browser: 'chrome', version_min: 85},
        rules: {order: qw`host connection pragma cache-control origin
            upgrade-insecure-requests user-agent accept
            sec-fetch-site sec-fetch-mode sec-fetch-user sec-fetch-dest referer
            accept-encoding accept-language cookie`}},
    {match: {browser: 'chrome', version_min: 78, type: 'ajax'},
        rules: {order: qw`host connection pragma cache-control accept
            x-requested-with user-agent content-type sec-fetch-site
            sec-fetch-mode referer accept-encoding accept-language cookie`}},
    {match: {browser: 'chrome', version_min: 80, type: 'ajax'},
        rules: {order: qw`host connection pragma cache-control accept
            sec-fetch-dest x-requested-with user-agent content-type
            sec-fetch-site sec-fetch-mode referer accept-encoding
            accept-language cookie`}},
    {match: {browser: 'mobile_chrome'},
        rules: {order: qw`host connection pragma cache-control
            upgrade-insecure-requests user-agent sec-fetch-mode sec-fetch-user
            accept sec-fetch-site referer accept-encoding accept-language
            cookie`}},
    {match: {browser: 'mobile_chrome', version_min: 78},
        rules: {order: qw`host connection pragma cache-control
            upgrade-insecure-requests user-agent sec-fetch-user
            accept sec-fetch-site sec-fetch-mode referer accept-encoding
            accept-language cookie`}},
    {match: {browser: 'mobile_chrome', version_min: 83},
        rules: {order: qw`host connection pragma cache-control
            upgrade-insecure-requests user-agent accept sec-fetch-site
            sec-fetch-mode sec-fetch-user sec-fetch-dest referer
            accept-encoding accept-language cookie`}},
    {match: {browser: 'firefox'},
        rules: {order: qw`host user-agent accept accept-language
            accept-encoding referer connection cookie
            upgrade-insecure-requests cache-control`}},
    {match: {browser: 'edge'},
        rules: {order: qw`referer cache-control accept accept-language
            upgrade-insecure-requests user-agent accept-encoding host
            connection`}},
    {match: {browser: 'safari'},
        rules: {order: qw`host cookie connection upgrade-insecure-requests
            accept user-agent referer accept-language accept-encoding`}},
    {match: {browser: 'mobile_safari'},
        rules: {order: qw`host connection accept user-agent accept-language
            referer accept-encoding`}},
    // http2 rules
    {match: {browser: 'chrome', http2: true},
        rules: {order: qw`:method :authority :scheme :path pragma
            cache-control upgrade-insecure-requests user-agent accept referer
            accept-encoding accept-language cookie`}},
    {match: {browser: 'chrome', http2: true, type: 'ajax'},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            x-requested-with user-agent content-type accept referer
            accept-encoding accept-language cookie`}},
    {match: {browser: 'chrome', http2: true, version_min: 76},
        rules: {order: qw`:method :authority :scheme :path pragma
            cache-control upgrade-insecure-requests user-agent sec-fetch-mode
            sec-fetch-user accept sec-fetch-site referer accept-encoding
            accept-language cookie`}},
    {match: {browser: 'chrome', http2: true, version_min: 81},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            origin upgrade-insecure-requests user-agent content-type accept
            sec-fetch-site sec-fetch-mode sec-fetch-user sec-fetch-dest referer
            accept-encoding accept-language cookie`}},
    {match: {browser: 'chrome', http2: true, version_min: 85},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            origin upgrade-insecure-requests user-agent accept
            sec-fetch-site sec-fetch-mode sec-fetch-user sec-fetch-dest referer
            accept-encoding accept-language cookie`}},
    {match: {browser: 'chrome', http2: true, version_min: 89},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            sec-ch-ua sec-ch-ua-mobile sec-ch-ua-platform
            origin upgrade-insecure-requests user-agent accept
            sec-fetch-site sec-fetch-mode sec-fetch-user sec-fetch-dest referer
            accept-encoding accept-language cookie`}},
    {match: {browser: 'chrome', http2: true, version_min: 89, redirect: true},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            upgrade-insecure-requests origin user-agent accept
            sec-ch-ua-platform sec-fetch-site sec-fetch-mode sec-fetch-user
            sec-fetch-dest sec-ch-ua sec-ch-ua-mobile referer accept-encoding
            accept-language cookie`}},
    {match: {browser: 'chrome', http2: true, version_min: 94, redirect: true},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            upgrade-insecure-requests origin user-agent accept sec-fetch-site
            sec-fetch-mode sec-fetch-user sec-fetch-dest sec-ch-ua
            sec-ch-ua-mobile sec-ch-ua-platform referer accept-encoding
            accept-language cookie`}},
    {match: {browser: 'chrome', http2: true, version_min: 76,
        type: ['script', 'image']},
        rules: {order: qw`:method :authority :scheme :path pragma
            cache-control upgrade-insecure-requests sec-fetch-mode user-agent
            sec-fetch-user accept sec-fetch-site referer accept-encoding
            accept-language cookie`}},
    {match: {browser: 'chrome', http2: true, version_min: 89,
        type: ['script', 'image']},
        rules: {order: qw`:method :authority :scheme :path pragma
            cache-control sec-ch-ua sec-ch-ua-mobile user-agent
            sec-ch-ua-platform accept sec-fetch-site sec-fetch-mode
            sec-fetch-dest referer upgrade-insecure-requests accept-encoding
            accept-language cookie`}},
    {match: {browser: 'chrome', http2: true, version_min: 76, type: 'ajax'},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            sec-fetch-mode x-requested-with user-agent content-type accept
            sec-fetch-site referer accept-encoding accept-language cookie`}},
    {match: {browser: 'chrome', http2: true, version_min: 78, type: 'ajax'},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            x-requested-with user-agent content-type accept sec-fetch-site
            sec-fetch-mode referer accept-encoding accept-language cookie`}},
    {match: {browser: 'chrome', http2: true, version_min: 80, type: 'ajax'},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            content-length user-agent sec-fetch-dest accept x-requested-with
            origin sec-fetch-site sec-fetch-mode referer accept-encoding
            accept-language cookie`}},
    {match: {browser: 'chrome', http2: true, version_min: 89, type: 'ajax'},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
        content-length sec-ch-ua sec-ch-ua-mobile user-agent accept
        x-requested-with sec-fetch-site sec-fetch-mode sec-fetch-dest
        origin referer accept-encoding accept-language cookie`}},
    {match: {browser: 'chrome', http2: true, version_min: 94, type: 'ajax'},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            content-length sec-ch-ua sec-ch-ua-mobile user-agent
            sec-ch-ua-platform accept x-requested-with sec-fetch-site
            sec-fetch-mode sec-fetch-dest origin referer accept-encoding
            accept-language cookie`}},
    {
        match: {browser: 'chrome', http2: true, version_min: 80, type: 'ajax',
            headers: {'content-type': exists}},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            content-length sec-fetch-dest user-agent content-type accept
            x-requested-with origin sec-fetch-site sec-fetch-mode referer
            accept-encoding accept-language cookie`}
    },
    {match: {browser: 'chrome', http2: true, version_min: 89, type: 'ajax',
        headers: {'content-type': exists}},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
        content-length sec-ch-ua sec-ch-ua-mobile user-agent content-type
        accept x-requested-with origin sec-fetch-site sec-fetch-mode
        sec-fetch-dest referer accept-encoding accept-language cookie`}
    },
    {match: {browser: 'chrome', http2: true, version_min: 94, type: 'ajax',
        headers: {'content-type': exists}},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            content-length sec-ch-ua sec-ch-ua-mobile user-agent
            sec-ch-ua-platform content-type accept x-requested-with origin
            sec-fetch-site sec-fetch-mode sec-fetch-dest referer
            accept-encoding accept-language cookie`}
    },
    {match: {browser: 'chrome', http2: true, version_min: 106, type: 'ajax',
        headers: {'content-type': exists}},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            content-length sec-ch-ua sec-ch-ua-platform sec-ch-ua-mobile
            user-agent content-type accept x-requested-with origin
            sec-fetch-site sec-fetch-mode sec-fetch-dest referer
            accept-encoding accept-language cookie`}
    },
    {match: {browser: 'mobile_chrome', http2: true},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            upgrade-insecure-requests user-agent sec-fetch-mode sec-fetch-user
            accept sec-fetch-site referer accept-encoding
            accept-language cookie`}},
    {match: {browser: 'mobile_chrome', http2: true, version_min: 78},
        rules: {order: qw`:method :authority :scheme :path pragma
            cache-control upgrade-insecure-requests user-agent sec-fetch-user
            accept sec-fetch-site sec-fetch-mode referer accept-encoding
            accept-language cookie`}},
    {match: {browser: 'mobile_chrome', http2: true, version_min: 83},
        rules: {order: qw`:method :authority :scheme :path pragma
            cache-control upgrade-insecure-requests user-agent accept
            sec-fetch-site sec-fetch-mode sec-fetch-user sec-fetch-dest
            referer accept-encoding accept-language cookie`}},
    {match: {browser: 'firefox', http2: true},
        rules: {order: qw`:method :path :authority :scheme user-agent accept
            accept-language accept-encoding referer cookie
            upgrade-insecure-requests cache-control content-type te`}},
    {match: {browser: 'edge', http2: true},
        rules: {order: qw`:method :path :authority :scheme referer
            cache-control accept accept-language upgrade-insecure-requests
            user-agent accept-encoding cookie`}},
    {match: {browser: 'edge', http2: true, version_min: 97},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            sec-ch-ua sec-ch-ua-mobile sec-ch-ua-platform
            origin upgrade-insecure-requests user-agent accept
            sec-fetch-site sec-fetch-mode sec-fetch-user sec-fetch-dest referer
            accept-encoding accept-language cookie`}},
    {match: {browser: 'edge', http2: true, version_min: 97, redirect: true},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            upgrade-insecure-requests origin user-agent accept sec-fetch-site
            sec-fetch-mode sec-fetch-user sec-fetch-dest sec-ch-ua
            sec-ch-ua-mobile sec-ch-ua-platform referer accept-encoding
            accept-language cookie`}},
    {match: {browser: 'edge', http2: true, version_min: 97,
        type: ['image', 'ajax', 'script']},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            sec-ch-ua sec-ch-ua-mobile user-agent sec-ch-ua-platform
            origin upgrade-insecure-requests accept
            sec-fetch-site sec-fetch-mode sec-fetch-user sec-fetch-dest referer
            accept-encoding accept-language cookie`}},
    {match: {browser: 'edge', http2: true, version_min: 97, type: 'ajax',
        headers: {'content-type': exists}},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            content-length sec-ch-ua sec-ch-ua-mobile user-agent
            sec-ch-ua-platform content-type accept x-requested-with origin
            sec-fetch-site sec-fetch-mode sec-fetch-dest referer
            accept-encoding accept-language cookie`}
        },
    {match: {browser: 'edge', http2: true, version_min: 106, type: 'ajax',
        headers: {'content-type': exists}},
        rules: {order: qw`:method :authority :scheme :path pragma cache-control
            content-length sec-ch-ua sec-ch-ua-platform sec-ch-ua-mobile
            user-agent content-type accept x-requested-with origin
            sec-fetch-site sec-fetch-mode sec-fetch-dest referer
            accept-encoding accept-language cookie`}
        },
    {match: {browser: 'safari', http2: true},
        rules: {order: qw`:method :scheme :path :authority cookie accept
            content-type accept-encoding user-agent accept-language referer`}},
    {match: {browser: 'safari', http2: true, type: 'document'},
        rules: {order: qw`:method :scheme :path :authority cookie user-agent
            accept accept-language accept-encoding referer`}},
    {
        match: {browser: 'safari', http2: true, type: 'ajax',
            headers: {'content-type': exists}},
        rules: {order: qw`:method :scheme :path :authority cookie accept
            content-type accept-encoding user-agent referer accept-language`}
    },
    {match: {browser: 'mobile_safari', http2: true},
        rules: {order: qw`:method :scheme :path :authority cookie accept
            accept-encoding user-agent accept-language referer`}},
    {match: {browser: 'mobile_safari', http2: true, version_min: 16},
        rules: {order: qw`:method :scheme :path :authority cookie user-agent
            accept accept-language accept-encoding referer`}},
    {match: {browser: 'mobile_safari', http2: true, version_min: 16,
        type: 'ajax', headers: {'content-type': exists}},
        rules: {order: qw`:method :scheme :path :authority cookie accept
            content-type accept-encoding user-agent referer accept-language`}},
];

function is_browser_supported(browser){
    return qw`chrome firefox edge safari mobile_chrome mobile_safari`
        .includes(browser);
}

E.browser_default_header_order = function(browser, opt){
    opt = assign({}, opt);
    if (!is_browser_supported(browser))
        browser = 'chrome';
    return select_rules(rules_orders, {
        browser: browser,
        version: +opt.major,
        type: opt.req_type||'document',
        http2: opt.http2,
        headers: opt.headers,
        redirect: opt.redirect,
    }).order;
};

E.browser_default_header_order_http2 = function(browser, opt){
    opt = assign({}, opt, {http2: true});
    return E.browser_default_header_order(browser, opt);
};

E.like_browser_case_and_order = function(headers, browser, opt){
    let ordered_headers = {};
    let source_header_keys = Object.keys(headers);
    if (source_header_keys.find(h=>h.toLowerCase()=='x-requested-with'))
        opt = assign({req_type: 'ajax'}, opt);
    let header_keys = E.browser_default_header_order(browser, opt);
    for (let header of header_keys)
    {
        let value = headers[source_header_keys
            .find(h=>h.toLowerCase()==header)];
        if (value)
            ordered_headers[header] = value;
    }
    for (let header in headers)
    {
        if (!header_keys.includes(header))
            ordered_headers[header] = headers[header];
    }
    return E.capitalize(ordered_headers);
};

// reverse pseudo headers (e.g. :method) because nodejs reverse it
// before send to server
// https://github.com/nodejs/node/blob/v12.x/lib/internal/http2/util.js#L489
E.reverse_http2_pseudo_headers_order = headers=>{
  let pseudo = {};
  let other = Object.keys(headers).reduce((r, h)=>{
      if (h[0]==':')
          pseudo[h] = headers[h];
      else
          r[h] = headers[h];
      return r;
  }, {});
  pseudo = Object.keys(pseudo).reverse()
      .reduce((r, h)=>{ r[h] = pseudo[h]; return r; }, {});
  return Object.assign(pseudo, other);
};

E.like_browser_case_and_order_http2 = function(headers, browser, opt){
    let ordered_headers = {};
    if (Object.keys(headers).find(h=>h.toLowerCase()=='x-requested-with'))
        opt = assign({req_type: 'ajax'}, opt);
    let header_keys = E.browser_default_header_order_http2(browser, opt);
    if (!header_keys)
        console.log('debug_header_keys_typeerror', browser, opt);
    let req_headers = {};
    for (let h in headers)
        req_headers[h.toLowerCase()] = headers[h];
    for (let h of header_keys)
    {
        if (req_headers[h])
            ordered_headers[h] = req_headers[h];
    }
    for (let h in req_headers)
    {
        if (!header_keys.includes(h))
           ordered_headers[h] = req_headers[h];
    }
    return E.reverse_http2_pseudo_headers_order(ordered_headers);
};

E.to_raw_headers = function(headers){
    let raw_headers = [];
    for (let name in headers)
    {
        if (Array.isArray(headers[name]))
        {
            for (let value of headers[name])
                raw_headers.push(name, value);
        }
        else
            raw_headers.push(name, headers[name]);
    }
    return raw_headers;
};

E.t = {rules_orders};
