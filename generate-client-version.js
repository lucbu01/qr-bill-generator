var replace = require('replace-in-file');
var moment = require('moment');
var package = require('./package.json');
var version = package.version;
var timestamp = moment().format();
const versionOptions = {
    files: 'src/app/client-version.ts',
    from: /version: '(.*)'/g,
    to: `version: '${version}'`,
    allowEmptyPaths: false,
};
const builtOptions = {
    files: 'src/app/client-version.ts',
    from: /timestamp: '(.*)'/g,
    to: `timestamp: '${timestamp}'`,
    allowEmptyPaths: false,
};

try {
    let changedFiles = replace.sync(versionOptions);
    if (changedFiles == 0) {
        throw "Please make sure that file '" + options.files + "' has \"version: ''\"";
    }
    changedFiles = replace.sync(builtOptions);
    if (changedFiles == 0) {
        throw "Please make sure that file '" + options.files + "' has \"timestamp: ''\"";
    }
    console.log(`Build version set: ${version} - ${timestamp}`);
}
catch (error) {
    console.error('Error occurred:', error);
    throw error
}
