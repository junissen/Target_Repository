# Target_Repository
Repository for API Consumption case study

This repository houses the file `route.js`. This node application allows users to look up the arrival time for the next Metro Transit train or bus for their desired route, stop, and direction. 

To run, clone repository and install necessary node dependencies by running `npm install` in the command line. The user has two options for checking the next arrival time. 

If the user knows the information, they can input their exact route, stop and direction into the command line. Run the following code: `node route.js 'ROUTE' 'STOP' 'DIRECTION'`. This will output the next arrival. Below is an example of this application. 

![Alt Text](./Gif_images/output_manual.gif)

If the user doesn't know the exact route name or stop, the user can also search the application for the information. If the user runs the program without putting in route,stop, and direction variables, they will be prompted. The user just needs to run the following code: `node route.js`. Below is an example of this application with user prompts. 

![Alt Text](./Gif_images/output_inquirer.gif)

