'use strict';

var archiveType = require('archive-type');
var path = require('path');
var tempWrite = require('temp-write');
var Zip = require('adm-zip');

/**
 * zip decompress plugin
 *
 * @param {Object} opts
 * @api public
 */

module.exports = function (opts) {
    opts = opts || {};
    opts.strip = +opts.strip || 0;

    return function (file, decompress, cb) {
        var files = [];

        if (archiveType(file.contents) !== 'zip') {
            return cb();
        }

        tempWrite(file.contents, function (err, filepath) {
            var zip = new Zip(filepath);

            zip.getEntries().forEach(function (file) {
                if (!file.isDirectory) {
                    file.path = file.entryName.toString();

                    if (opts.strip) {
                        var f = path.basename(file.path);
                        var p = path.dirname(file.path.split('/'));

                        if (Array.isArray(p)) {
                            p = p.slice(opts.strip).join(path.sep);
                        }

                        file.path = path.join(p, f);
                    }

                    files.push({ contents: file.getData(), path: file.path });
                }
            });

            decompress.files = files;
            cb();
        });
    };
};