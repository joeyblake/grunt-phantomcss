/**
 * grunt-phantomcss
 * https://github.com/chrisgladd/grunt-phantomcss
 *
 * Copyright (c) 2013 Chris Gladd
 * Licensed under the MIT license.
 */
'use strict';

var path = require('path');

module.exports = function(grunt){
    var desc = 'CSS Regression Testing';
    grunt.registerMultiTask('phantomcss', desc, function(){
        function deleteDiffScreenshots(){
            var diffScreenshots = grunt.file.expand([
                path.join(options.screenshots, '**diff.png'),
                path.join(options.screenshots, '**fail.png')
            ]);

            // Delete diff files
            diffScreenshots.forEach(function(filepath){
                grunt.file.delete(filepath);
            });
        }

        var done = this.async();
        var options = this.options({
            screenshots: 'screenshots',
            results: 'results'
        });

        var dest = path.resolve(options.results);
        var screenshotDest = path.join(dest, 'screenshots/');
        var cwd = path.join(__dirname, '..', 'bower_components', 'phantomcss');
        var phantomBinary = path.join(__dirname, '..', 'node_modules', 'phantomjs', 'bin', 'phantomjs');
        var runnerLocation = path.join(__dirname, '..', 'config/runner.js');

        // Resolve paths for tests
        options.test = [];
        this.filesSrc.forEach(function(filepath) {
            options.test.push(path.resolve(filepath));
        });

        options.screenshots = path.resolve(options.screenshots);

        // Failures are put in the same place as screenshots
        // They'll be moved/deleted later
        options.failures = options.screenshots;

        grunt.verbose.writeflags(options, 'Options');

        // Remove old diff screenshots
        deleteDiffScreenshots();

        grunt.util.spawn({
            cmd: phantomBinary,
            args: [
                runnerLocation,
                JSON.stringify(options)
            ],
            opts: {
                cwd: cwd,
                stdio: 'inherit'
            }
        }, function(error, result, code){
            var allScreenshots = grunt.file.expand(path.join(options.screenshots, '**.png'));

            // Create the output directory
            grunt.file.mkdir(screenshotDest);

            // Copy results
            allScreenshots.forEach(function(filepath){
                grunt.file.copy(filepath, path.join(screenshotDest, path.basename(filepath)));
            });

            deleteDiffScreenshots();

            if(error) {
                done(false);
            }
            else {
                done();
            }
        });
    });
};
