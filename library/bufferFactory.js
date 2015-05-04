'use strict';
var jshint = require('jshint').JSHINT;

function bufferFactory(file, options) {
    var i,
        ignorePaths = options.ignorePaths || [];

    var ignoreRegexes = [];
    for (i=0; i<ignorePaths.length; i++) {
        ignoreRegexes.push(new RegExp(ignorePaths[0]));
    }

    function shouldInclude(text) {
        var i;
        for (i=0; i<ignoreRegexes.length; i++) {
            if (ignoreRegexes[i].exec(text) !== null) {
                return false;
            }
        }
        return true;
    }

    function onLintError(error) {
        var location = [error.line, error.character].join(':');
        options.errors.each(location, error.reason);
    }

    function setBuffer(buffer, encoding, next) {
        var source = buffer.toString('utf8');

        if ('production' == process.env.NODE_ENV) {
            lintrc.debug = false;
            lintrc.devel = false;
        }

        jshint(source, options.lintrc);

        if (jshint.errors.length) {
            options.errors.head(file);
            jshint.errors.forEach(onLintError);
            options.errors.tail();
            this.emit('error', {
                message: options.errors.message
            });
        }

        this.push(source);
        next();
    }

    function noOp(buffer, encoding, next) {
        this.push(buffer.toString('utf8'));
        next();
    }

    return shouldInclude(file) ? setBuffer : noOp
}

module.exports = bufferFactory;
