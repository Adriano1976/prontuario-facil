const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const OUT = path.resolve('_reversa_docs/assets/vendor');
fs.mkdirSync(OUT, { recursive: true });

const LIBS = [
  {
    name: 'three.min.js',
    urls: [
      'https://unpkg.com/three@0.147.0/build/three.min.js',
      'https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.147.0/three.min.js'
    ]
  },
  {
    name: 'OrbitControls.js',
    urls: [
      'https://raw.githubusercontent.com/mrdoob/three.js/r147/examples/js/controls/OrbitControls.js',
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r147/examples/js/controls/OrbitControls.js'
    ]
  },
  {
    name: 'd3.v7.min.js',
    urls: [
      'https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js',
      'https://unpkg.com/d3@7.8.5/dist/d3.min.js',
      'https://d3js.org/d3.v7.min.js'
    ]
  },
  {
    name: 'highcharts.js',
    urls: [
      'https://code.highcharts.com/11.4.8/highcharts.js',
      'https://cdn.jsdelivr.net/npm/highcharts@11.4.8/highcharts.js',
      'https://unpkg.com/highcharts@11.4.8/highcharts.js'
    ]
  },
  {
    name: 'highcharts-accessibility.js',
    urls: [
      'https://code.highcharts.com/11.4.8/modules/accessibility.js',
      'https://cdn.jsdelivr.net/npm/highcharts@11.4.8/modules/accessibility.js'
    ]
  },
  {
    name: 'highcharts-exporting.js',
    urls: [
      'https://code.highcharts.com/11.4.8/modules/exporting.js',
      'https://cdn.jsdelivr.net/npm/highcharts@11.4.8/modules/exporting.js'
    ]
  },
  {
    name: 'highcharts-treemap.js',
    urls: [
      'https://code.highcharts.com/11.4.8/modules/treemap.js',
      'https://cdn.jsdelivr.net/npm/highcharts@11.4.8/modules/treemap.js'
    ]
  },
  {
    name: 'highcharts-sankey.js',
    urls: [
      'https://code.highcharts.com/11.4.8/modules/sankey.js',
      'https://cdn.jsdelivr.net/npm/highcharts@11.4.8/modules/sankey.js'
    ]
  },
  {
    name: 'highcharts-timeline.js',
    urls: [
      'https://code.highcharts.com/11.4.8/modules/timeline.js',
      'https://cdn.jsdelivr.net/npm/highcharts@11.4.8/modules/timeline.js'
    ]
  }
];

function get(url, redirects) {
  redirects = redirects || 0;
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: 60000, headers: { 'User-Agent': 'reversa-docs-vendor/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects < 5) {
        res.resume();
        const next = new URL(res.headers.location, url).toString();
        return resolve(get(next, redirects + 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('HTTP ' + res.statusCode));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
    req.on('error', reject);
  });
}

(async () => {
  const results = [];
  for (const lib of LIBS) {
    let ok = false;
    for (const url of lib.urls) {
      try {
        const buf = await get(url);
        const dest = path.join(OUT, lib.name);
        fs.writeFileSync(dest, buf);
        ok = true;
        results.push({ lib: lib.name, status: 'ok', url, bytes: buf.length });
        break;
      } catch (e) {
        results.push({ lib: lib.name, status: 'fail', url, error: e.message });
      }
    }
    if (!ok) {
      results.push({ lib: lib.name, status: 'MISSING', url: null });
    }
  }
  console.log(JSON.stringify(results, null, 2));
})();
