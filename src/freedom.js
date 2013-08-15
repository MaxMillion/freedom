/**
 * @module freedom
 */

/**
 * External freedom Setup.  global.freedom is set to the value returned by
 * setup (see preamble.js and postamble.js for that mechanism).  As a result,
 * this is the primary entry function for the freedom library.
 * @for util
 * @method setup
 * @static
 */
setup = function (global, freedom_src, config) {
  var def, hub;
  var site_cfg = {
    'debug': true,
    'strongIsolation': true,
    'stayLocal': false
  };

  if (isAppContext()) {
    def = new fdom.app.Internal();
    // If you can see your parent, you're likely not fully sandboxed.
    if (typeof global.parent !== 'undefined') {
      site_cfg['strongIsolation'] = false;
    }
  } else {
    hub = new fdom.Hub();
    advertise();
    def = new fdom.app.External(hub);
    
    // Configure against data-manifest.
    if (typeof document !== 'undefined') {
      eachReverse(scripts(), function (script) {
        var manifest = script.getAttribute('data-manifest');
        var source = script.src;
        if (manifest) {
          site_cfg.source = source;
          site_cfg.manifest = manifest;
          if (script.textContent.trim().length) {
            try {
              mixin(site_cfg, JSON.parse(script.innerText), true);
            } catch (e) {
              global.console.warn("Failed to parse configuration: " + e);
            }
          }
          return true;
        }
      });
    }
    //Try to talk to local FreeDOM Manager
    if (!site_cfg['stayLocal']) {
      fdom.ManagerLink.get().connect();
    }
  }
  site_cfg.global = global;
  site_cfg.src = freedom_src;
  if(config) {
    mixin(site_cfg, config, true);
  }
  if (hub) {
    mixin(hub.config, site_cfg, true);
  }
  def.configure(site_cfg);

  // Enable console.log from worker contexts.
  if (typeof global.console === 'undefined') {
    global.console = {
      log: def.debug.bind(def)
    };
  }
  
  return def.getProxy();
};

