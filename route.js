// Require axios for GET API requests and inquirer for command line prompts
const axios = require('axios');
const inquirer = require("inquirer");

// DEFINED FUNCTIONS

// --------------------
// FUNCTIONS FOR PROMPTS
// --------------------

// Finds all routes available and prompt user
grabAllRoutesInquirer = () => {
    // Metro Transit API request to return all routes
    axios.get("http://svc.metrotransit.org/NexTrip/Routes?format=json")
    .then( function(res) {

        let routeArray = new Array()
        let routeObjectArray = new Array()
        
        // Loops through returned results and adds description and object to array
        for (var i = 0; i < res.data.length; i ++) {
            routeArray.push(res.data[i].Description)
            routeObjectArray.push(res.data[i])
        }

        // Prompts user for desired route
        inquirer.prompt([
            {
                type: 'list',
                name: 'userRoute',
                message: 'What route would you like to look up?',
                choices: routeArray
            }
        ]).then(function(inquirerResponse) {

            // Finds the object matching the inquirer response and saves it as routeObject 
            for (var j = 0; j < routeObjectArray.length; j ++ ) {
                if (routeObjectArray[j].Description === inquirerResponse.userRoute) {
                    routeObject = routeObjectArray[j]
                }
            }

            // Runs getDirectionsInquirer() function
            getDirectionsInquirer()
        })
    })
 
}

// Finds directions available for desired route and prompts user
getDirectionsInquirer = () => {
    // Metro Transit API request to return directions available for the user route
    let routeNumber = routeObject.Route
    let queryURL = 'http://svc.metrotransit.org/NexTrip/Directions/' + routeNumber + '?format=json'
    axios.get(queryURL) 
    .then(function(res) {
        let directionArray = new Array()
        let directionObjectArray = new Array()
        
        // Loops through returned results and adds text and object to array
        for ( var i = 0; i < res.data.length; i ++ ) {
            directionArray.push(res.data[i].Text)
            directionObjectArray.push(res.data[i])
        }

        // Prompts user for desired direction
        inquirer.prompt([
            {
                type: 'list',
                name: 'userDirection',
                message: 'What direction would you like to go?',
                choices: directionArray
            }
        ]).then(function(inquirerResponse) {

            // Finds the object matching the inquirer response and saves value as directionCardinal
            for (var j = 0; j < directionObjectArray.length; j ++ ) {
                if (directionObjectArray[j].Text === inquirerResponse.userDirection) {
                    directionCardinal = directionObjectArray[j].Value
                }
            }

            // Runs getStopInquirer() function
            getStopInquirer()
        })

    })
}

// Finds stops available for desired route and direction and prompts user
getStopInquirer = () => {
    // Metro Transit API request to return stop available for the user route and direction
    let routeNumber = routeObject.Route
    let queryURL = 'http://svc.metrotransit.org/NexTrip/Stops/' + routeNumber + '/' + directionCardinal + '?format=json'
    axios.get(queryURL)
    .then(function(res) {
        let stopArray = new Array()
        let stopObjectArray = new Array()
        
        // Loops through returned results and adds text and object to array
        for ( var i = 0; i < res.data.length; i ++ ) {
            stopArray.push(res.data[i].Text)
            stopObjectArray.push(res.data[i])
        }

        // Prompts user for desired stop
        inquirer.prompt([
            {
                type: 'list',
                name: 'userStop',
                message: 'What stop are you at?',
                choices: stopArray
            }
        ]).then(function(inquirerResponse) {

            // Finds the object matching the inquirer response and saves as stopObject
            for (var j = 0; j < stopObjectArray.length; j ++ ) {
                if (stopObjectArray[j].Text === inquirerResponse.userStop) {
                    stopObject = stopObjectArray[j]
                }
            }

            // Runs scheduleInfo() function
            scheduleInfo()
        })

    })
}

// --------------------
// FUNCTIONS FOR USER INPUT
// --------------------

// Finds all routes avaiable
grabAllRoutes = () => {
    // Metro Transit API request to return all routes
    axios.get("http://svc.metrotransit.org/NexTrip/Routes?format=json")
    .then( function(res) {
        
        for (var i = 0; i < res.data.length; i ++) {

            // split route description 
            let splitArray = res.data[i].Description.split(' ');
            let newArray = []

            // If the route information the user input does not start with a number
            if (isNaN(parseInt(routeArray[0]))) {
                // If the returned splitArray starts with METRO, does not change
                if (splitArray[0] === "METRO") {
                    newArray = splitArray
                }
                // Otherwise it deletes the first two indexes of the array (to delete the route number from the description)
                else {
                    newArray = splitArray.splice(2)
                }
            }
        
            // If the route information the user input does start with a number, does not change
            else {
                newArray = splitArray
            }

            // Passes the altered description array and the returned data to routeInfo() function
            routeInfo(newArray, res.data[i])

        }

    })
}

// Requires the description array and the route information object to find matching route
routeInfo = (newArray, apiResponse) => {
    let result = true

    // Loops through every variable of the description array and the user input route description array
    for (var j = 0; j < newArray.length; j ++) {

        // Continue loop if matches
        if (newArray[j] === routeArray[j]) {
            continue
        }

        // Else return false and break the loop
        else {
            result = false
            break
        }
    }

    // If the loop found a match, pass the returned route information into the routeObject and run stopInfo() function
    if (result) {
        routeObject = apiResponse
        stopInfo();
    }
}

// Returns the stop that matches the user input
stopInfo = () => {
    // Metro Transit API request to return all stops for the user route and direction
    let queryURL = 'http://svc.metrotransit.org/NexTrip/Stops/' + routeObject.Route + '/' + directionCardinal + '?format=json'
    axios.get(queryURL)
    .then(function(res) {
        // Loops through each returned stop to find the one matching the user input
        for (var i = 0; i < res.data.length; i ++) {
            // On match, passes the returned data to the stopObject and run scheduleInfo() function
            if (res.data[i].Text === stopName) {
                stopObject = res.data[i]
                scheduleInfo()
            }
        }
    })
   
}

// --------------------
// FUNCTION FOR BOTH USER INPUT AND PROMPTS TO FIND NEXT ARRIVAL
// --------------------

// Returns the next arrival for route, direction, and stop
scheduleInfo = () => {

    // Split routeObject description to determine if transportation is by train or bus
    let routeArray = routeObject.Description.split(' ')

    if (routeArray[0] === "METRO") {
        transportType = "train"
    }

    else {
        transportType = "bus"
    }

    // Metro Transit API request to return all scheduled stops at specific stop for route and direction
    let queryURL = 'http://svc.metrotransit.org/NexTrip/' + routeObject.Route + '/' + directionCardinal + '/' + stopObject.Value + '?format=json'
    axios.get(queryURL)
    .then(function(res) {

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
}

// --------------------
// STARTING VARIABLES AND FUNCTION
// --------------------

// Variables to be defined and used
let directionCardinal = 0;
let routeObject = {};
let stopObject = {};
let transportType = "";
let route = "";
let stopName = "";
let direction = "";

// If user inputs route/stop/direction information, program will grab the variables and 
// run the grabAllRoutes() function 
if (process.argv[2]) {
    route = process.argv[2];
    stopName = process.argv[3];
    direction = process.argv[4];
    if (direction === "north") {
        directionCardinal = 4
    }
    
    else if (direction === "south") {
        directionCardinal = 1
    }
    
    else if (direction === "east") {
        directionCardinal = 2
    }
    
    else if (direction === "west") {
        directionCardinal = 3
    }
    
    routeArray = route.split(' ')

    grabAllRoutes()
}

// If the user does not input anything, program will run grabAllRoutesInquirer() function
else {
    grabAllRoutesInquirer()
}



