/**
 * This is the global configuration file for system.js.
 * It is used for module loading.
 */

(function (global){
    System.config({
        paths: {
            'npm:':'node_modules/'
        },
        map: {
            app:'turniermanager',
            '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
            '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
            '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js'
        }
    })
})