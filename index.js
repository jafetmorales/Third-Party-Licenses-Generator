/**
 * Attention: My english is not good enough. Sorry.
 *
 * @author Mateus Gabi Moreira
 */
var fs = require('fs');
var qs = require('querystring');

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
var TPLGFile = 'server/static/licenses_third_party.html';
var manuallyCopiedFolder = 'licenses/manuallyCopied';

/**
 * Greetings text
 */
var greetings = "This software was gratefully developed using these third-parties softwares:";

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
var copyLicenseFileByName = function(dependency_name,dependency_version) {

    /* Read Package.json from dependency name */
    // var contents = fs.readFileSync("node_modules/" + dependency_name + "/LICENSE");

    // var license_urls = []
    var notFoundString = "NOT FOUND"
    // var licDest = notFoundString
    var licFound=notFoundString
    licenses_filenames.forEach(filename => {
        // console.log('looking for:' + filename)
        const licSource = "node_modules/" + dependency_name + "/" + filename

        if (fs.existsSync(licSource)) {
            // Do something
            // const licDestTry = 'licenses/' + qs.escape(dependency_name+) + "_" + filename
            // fs.copyFile(licSource, licDestTry, (err) => {
            //     if (err) {
            //         console.log('was not able to copy file ' + filename)
            //         // return
            //         throw err
            //     }
            //     console.log('found and copied ' + licSource + ' to ' + licDest);
            //     return
            // });
            // licDest = licDestTry
            licFound = licSource
        }
    })
    // if (licDest == notFoundString) {
    //     licDest = 'licenses/' + qs.escape(dependency_name) + "_LICENSE_NOT_FOUND"
    //     fs.writeFile(licDest, notFoundString);
    // }

    if (licFound == notFoundString) {
        licFound = manuallyCopiedFolder+'/' + qs.escape(dependency_name+'@'+ dependency_version) + "_LICENSE.txt"
        // fs.writeFile(licDest, notFoundString);
    console.log('Did not find license file for '+dependency_name+'@'+ dependency_version+'. I will be using manually added license in '+licFound+' if you have added one. Otherwise will spit out an error for you to enjoy.')
    }

    return licFound

};

var main = function() {

    console.log('\n\n===>>> Starting...\n\n');

    console.log('===>>> Clearing licenses html file...\n\n');
    fs.writeFile(TPLGFile, "");


    var dependencies = getProjectDependencies();


    // var header = "<html><body>"
    // fs.appendFile(TPLGFile, header);
    fs.appendFile(TPLGFile, '<pre>'+greetings+'</pre><br />');

    dependencies.forEach((dependency_name) => {

        var dependency = getDependencyByName(dependency_name);
        const license_url = copyLicenseFileByName(dependency_name,dependency.version)
        // var licText
        // console.log(license_url)
 
        fs.readFile(license_url, "utf8", function(err, data) {
            if (err) {
                console.log('ERROR: COULD NOT FIND A LICENSE AT ' + license_url + '. PLEASE CHECK IF THE PACKAGE INCLUDES A LICENSE FILE. IF IT DOES NOT THEN YOU CAN MAKE THE FILE '+ license_url+' MANUALLY. IF YOU ARE GOING TO DO THAT MAKE SURE YOU FIND THE ACTUAL LICENSE INFO AT '+dependency.uri+' WHICH IS THE SITE OF THE PACKAGE OR ON THE REPOSITORY PACKAGE IF IT WAS INSTALLED VIA NPM OR ON THE GITHUB REPOSITORY, COPY IT, AND PUT IT IN THAT FILE. SOMETIMES YOU CAN FIND THE LICENSE TEXT IN THE README, OR IT IS JUST IN A FORMAT THAT IS NOT IN THE LIST OF FORMATS THAT THIS PROGRAM CHECKS FOR. REMEMBER TO USE THE LICENSE THAT CORRESPONDS TO THAT RELEASE VERSION')
                throw err;
            }
            // console.log(data);
            var licText = data


    // console.log('the greetings are'+greetings)
            var string = "";
            //jafet replaced with line below it
            // string += dependency.name + '@' + dependency.version + '\n';
            string += '<a href=' + dependency.uri + ' target="_blank" style="color:#0086e6;">' + dependency.name + '</a><br />'
            // string += dependency.name + '<br />'; // + '@' + dependency.version + '\n';
            // string += dependency.uri + '<br />';
            // string += dependency.license + '<br />';
            // string += license_url + '<br />';
            string += '<pre>' + licText + '</pre><br />';
            // string += '<iframe src="https://www.w3schools.com"></iframe><br />';
            // string += '<iframe src="' + dependency.uri + '"></iframe><br />';
            fs.appendFile(TPLGFile, '<li style="list-style: none;">');
            fs.appendFile(TPLGFile, string, function(err) {
                if (err) console.error('ERR', err);
                //jafet replaced with line below it
                // console.log('Written: ' + dependency.name + '@' + dependency.version);
                // console.log('Written: ' + dependency.name);
            });
            fs.appendFile(TPLGFile, '</li>');



        });
    });
    // var footer = "</body></html>"
    // fs.appendFile(TPLGFile, footer);

};

main();
