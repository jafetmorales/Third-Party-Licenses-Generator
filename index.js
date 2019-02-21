/**
 * Attention: My english is not good enough. Sorry.
 *
 * @author Mateus Gabi Moreira
 */
var fs = require('fs');

/**
 * possibles filenames
 */
var licenses_filenames = [
    "LICENSE",
    "LICENSE.MD",
    "LICENSE.md",
    "license",
    "license.md",
    "LICENSE.TXT",
    "LICENSE.txt",
    "licensse.txt"
];

/**
 * NPM File, Bower File...
 */
var json_files = [
    "package.json"
];

/**
 * Name of the file that 3PLG will be generate on the root
 */
var TPLGFile = '3PLG.txt';

/**
 * Greetings text
 */
var greetings = "This software was gratefully developed using these third-parties softwares:\n\n";

/**
 * Sometimes, we just want build a 3PLG File with production dependencies or
 * prod + dev dependencies
 */
var only_production_dependencies = true;

var getProjectDependencies = function() {

    /* Read package.json from the project */
    var contents = fs.readFileSync(json_files[0]);

    /* become package.json => object */
    var package = JSON.parse(contents);

    var dependencies = [];

    for (var dependency in package.dependencies) {
        dependencies.push(dependency);
    }

    if (!only_production_dependencies) {
        for (var dependency in package.devDependencies) {
            dependencies.push(dependency);
        }
    }

    /* sort dependencies alphabetically */
    dependencies.sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    });

    return dependencies;
};

/**
 * Recieve a name and return an object {name, version, authors, uri, license}
 *
 * @param {*} name
 */
var getDependencyByName = function(dependency_name) {

    /* Read Package.json from dependency name */
    var contents = fs.readFileSync("node_modules/" + dependency_name + "/package.json");

    var dependency = JSON.parse(contents);

    return {
        name: dependency.name,
        version: dependency.version,
        authors: dependency.author,
        uri: dependency.homepage,
        license: dependency.license
    };
};

/**
 * Recieve a name and return an object {name, version, authors, uri, license}
 *
 * @param {*} name
 */
var copyLicenseFileByName = function(dependency_name) {

    /* Read Package.json from dependency name */
    // var contents = fs.readFileSync("node_modules/" + dependency_name + "/LICENSE");

    var license_urls = []
    licenses_filenames.forEach(filename => {

        console.log('looking for:' + filename)
        const licSource = "node_modules/" + dependency_name + "/"+filename
        const licDest = 'licenses/'+dependency_name+"_"+filename
        fs.copyFile(licSource, licDest, (err) => {
            if (err) {
                console.log('was not able to copy or did not find ' + filename)
                return
                // throw err
            }
            console.log('found and copied ' + licSource + ' to ' + licDest);
            license_urls.push(licDest)
        });
    })


    // destination.txt will be created or overwritten by default.
    const licSource = "node_modules/" + dependency_name + "/LICENSE"
    const licDest = 'licenses/LICENSE_' + dependency_name
    fs.copyFile(licSource, licDest, (err) => {
        if (err) throw err;
        console.log(licSource + ' was copied to ' + licDest);
    });

    // var dependency = JSON.parse(contents);

    // return {
    //     name: dependency.name,
    //     version: dependency.version,
    //     authors: dependency.author,
    //     uri: dependency.homepage,
    //     license: dependency.license
    // };
    return {
        license_link: licDest
    }
};

var main = function() {

    console.log('\n\n===>>> Starting...\n\n');

    console.log('===>>> Clear 3PLG file...\n\n');
    fs.writeFile(TPLGFile, "");

    fs.appendFile(TPLGFile, greetings);

    var dependencies = getProjectDependencies();

    dependencies.forEach((dependency_name) => {

        var dependency = getDependencyByName(dependency_name);
        var licenseUrl = copyLicenseFileByName(dependency_name)

        var string = "";
        //jafet replaced with line below it
        // string += dependency.name + '@' + dependency.version + '\n';
        string += dependency.name // + '@' + dependency.version + '\n';
        string += dependency.uri + '\n';
        string += dependency.license + '\n';
        string += licenseUrl + '\n\n';

        fs.appendFile(TPLGFile, string, function(err) {

            if (err) console.error('ERR', err);

            //jafet replaced with line below it
            // console.log('Written: ' + dependency.name + '@' + dependency.version);
            console.log('Written: ' + dependency.name);

        });
    });
};

main();
