# EftApp -- Energy Forecast Tool App

A) Frontend setup:

  1) git clone https://gitlab.com/jeyoung88/energy_forecast_frontend.git

  2) run the following command to install all libraries:
  `npm install`

  This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.2.5.

  3) ## Development server

  Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

  4) Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.


  5) Brwoser setup
  If you run frontend in its own dev server such as ng serve, the front end calls into a separate backend on port :8000.
  In order to disable complains of Cross Site scripting, run Chrome as follow on OSX:

  'open -a Google\ Chrome --args --disable-web-security --user-data-dir'

---------------------------------------------------------------------------------------------------------------

B) Backend setup:

 1) git clone https://gitlab.com/WSU_V/cs_453/cs453_finalproj_backend.git

 2) Install mongodb.
    mkdir -p cs453_finalproj_backend/data/db 
    mongod --dbpath cs453_finalproj_backend/data/db --port 27017

    make sure no database 'forecast' exists.

 3) cd cs453_finalproj_backend
    curl https://sh.rustup.rs -sSf | sh
    rustup default nightly
    cargo run —bin seed —color=always
    cargo run —bin app —color=always









