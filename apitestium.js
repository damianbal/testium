/**
 * apiestium
 * 
 * Test API's with ease
 * 
 * @author balandowski@icloud.com
 */

 // import libs
let axios = require('axios')
let fs = require('fs')
let chalk = require('chalk')

// file path
let test_filepath = process.argv[2]


//
// Test 
//
let test_url = async (base_url, token, test) => {
    
    let resp = null
    let url = base_url + test.url
    let tok = token 

    if(typeof test.token !== 'undefined') { 
        tok = test.token
        console.log(chalk.dim('! Test has own token set so it is going to be used'));
    }

    // set auth token
    if(tok != null) {
        axios.defaults.headers.common['Authorization'] = tok 
    }
    else {
        axios.defaults.headers.common['Authorization'] = null
    }

    if (typeof test.data == undefined) test.data = {}
    if (test.data == null) test.data = {}

    test.method = test.method.toUpperCase()

    if(test.method === 'GET') {
        resp = await axios.get(url)
    }
    else if(test.method === 'PATCH') {
        resp = await axios.patch(url, test.data)
    }
    else if(test.method === 'PUT') {
        resp = await axios.put(url, test.data)
    }
    else if(test.method === 'DELETE') {
        resp = await axios.delete(url)
    }
    else if(test.method === 'POST') {
        resp = await axios.post(url, test.data)
    }

    if(resp != null) {
        
        // check if status matches the expected status
        if(resp.status != test.code) {
            console.log("'" + chalk.redBright(test.name) + "'" + ' failed because of status code ' + resp.status + ' but expected ' + test.code)
            return false;
        }

        // TODO check json
        let respData = resp.data;


        if(Array.isArray(test.expected)) {
            for(let expected of test.expected) {
                if(typeof resp.data[expected] === "undefined" ) {
                    console.log("'" + chalk.redBright(test.name) + "'" + ' failed because of missing ' + "'" + chalk.yellow(expected) + "'")

                    return false 
                }
            }
        }
        else {
            let keys = Object.keys(test.expected)

            for(let expected_key of keys) {
                if(resp.data[expected_key] == test.expected[expected_key]) {
                    //
                } else {
                    console.log("'" + chalk.redBright(test.name) + "'" + ' failed because of different value, expected ' + "'" + test.expected[expected_key] + "' is '" + resp.data[expected_key] + "'")
                    return false;
                }
            }
        }

    }

    return true;
} 

//
// Load file and run tests
//
fs.readFile(test_filepath, async (err, data) => {

    if(err) {
        throw err;
    }

    let json = JSON.parse(data.toString())

    let url = json.settings.url;
    let tests = json.urls;

    console.log(chalk.yellow("-== Tests started ==-\n"));

    for(let test of tests) {

        let test_success = await test_url(url, json.settings.token, test)

        if(test_success) {

            console.log(chalk.greenBright(`Test '${test.name}' passed!`));

        }
        else {
        
             console.log(chalk.redBright(`Test '${test.name}' failed!`));

        }
    }

    console.log(chalk.yellow("\n-== Tests ended ==-"))
})