// Require axios for GET API requests and inquirer for command line prompts
const axios = require('axios');
const inquirer = require("inquirer");

// DEFINED FUNCTIONS

// --------------------
// FUNCTIONS FOR PROMPTS
// --------------------

apiCallFunction = (api, callback) => {
    axios.get(api)
    .then(function(res) {
        return callback(res.data)
    })
    .catch(function(error){
        console.error("Error " + error)
    })
}

inquirerFunction = (promptObject, callback) => {
    inquirer.prompt([promptObject])
    .then(function(inquirerResponse) {
        return callback(inquirerResponse)
    })
    .catch(function(error){
        console.log("Error" + error)
    })
}

userDecisionFunction = (url_call, callback) => {

    var text_key = "";
    var return_key = "";
    var prompt_message = "";

    if (url_call.includes("Routes")) {
        api_call_type = "route";
        text_key = "Description";
        return_key = "Route";
        prompt_message = "What route would you like to look up?"
    }
    
    else if (url_call.includes("Directions")) {
        api_call_type = "direction";
        text_key = "Text";
        return_key = "Value";
        prompt_message = "What direction would you like to go?"
    }

    else if (url_call.includes("Stops")) {
        api_call_type = "stop";
        text_key = "Text";
        return_key = "Value";
        prompt_message = "What stop are you at?"
    }

    else {
        throw new Error("Type call not available")
    }

    try {
        apiCallFunction(url_call, function(response) {
            var dataObject = response
            var dataArray = []
            for (let i = 0; i < response.length; i ++ ){
                dataArray.push((response[i])[text_key])
            }
           inquirerFunction(
            {
                type: 'list',
                name: 'userDecision',
                message: prompt_message,
                choices: dataArray
            }, function(response) {
                var userResponse = response.userDecision  
                var responseValue = ""
                for (let j = 0; j < dataObject.length; j ++ ) {
                    if ((dataObject[j])[text_key] === userResponse) {
                        responseValue = (dataObject[j])[return_key]
                    }
                }
                
                if (responseValue === "") {
                    throw new Error("No " + api_call_type + " found")
                }
                else {
                    try {
                        return callback(responseValue)
                    }
                    catch(error) {
                        throw(error)
                    }
                }
            }) 
        });
    }
    catch(error) {
        throw(error)
    }   
    
}

var routeUrl= "http://svc.metrotransit.org/NexTrip/Routes?format=json"
userDecisionFunction(routeUrl, function(response) {
    var routeNumber = response;
    var directionUrl = 'http://svc.metrotransit.org/NexTrip/Directions/' + routeNumber + '?format=json';
    userDecisionFunction(directionUrl, function(response) {
        var directionCardinal = response;
        var stopUrl = 'http://svc.metrotransit.org/NexTrip/Stops/' + routeNumber + '/' + directionCardinal + '?format=json';
        userDecisionFunction(stopUrl, function(response) {
            var stopNumber = response;
            var nextStopUrl = 'http://svc.metrotransit.org/NexTrip/' + routeNumber + '/' + directionCardinal + '/' + stopNumber + '?format=json';
            axios.get(nextStopUrl)
            .then(function(res) {

                var transportType = "bus/train"

                // Determine current time
                let currentTime = parseInt(Date.now())
                let nextArrival = ""
                
                // Loop through all route stops for the day to find next arrival
                for (var i = 0; i < res.data.length; i ++ ) {
                    let newArray = res.data[i].DepartureTime.split('(')
                    let trainArray = newArray[1].split('-')
                    let trainTime = parseInt(trainArray[0])

                    // Compare the stop time with the current time. 
                    // If the same, the transport is arriving now and break the loop
                    if (trainTime === currentTime) {
                        nextArrival = transportType + " arriving now"
                        break
                    }

                    // Compare the stop time with the current time. 
                    // If the stop time is greater than the current time, this is the next arrival.
                    // Convert the difference into minutes and round integer.
                    // Return the next arrival message and break the loop.
                    if (trainTime > currentTime) {
                        let arrivalTime = Math.round((trainTime - currentTime)/60000)
                        nextArrival = "Next " + transportType + " arriving in " + arrivalTime + " min"
                        break
                    }
                }

                // Return next arrival information
                console.log(nextArrival)
            })
        })     
    })
})  

