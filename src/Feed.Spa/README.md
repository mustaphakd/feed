##Installation :
run    `npm install` `cd node_modules\rss-parser` `npm install --prod`
# FeedSpa

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.2.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).


# Overview
This simple feed reader should easily support **electron**

The backend was built using ASPNetCore 2.1.
The front End was built using Angular 2+ [[6.x.x]]

## set default project to Feed.Web.Backend [set as Startup Project]

## build front end from the backend dir by executing: 
`npm run-script build` or
for production: 
`npm run-script build-prod`

## else if using Visual studio, just click the build button from the menu and everything is taken care off.

This set up allows me to work on both the front and  backend separately but also combine them when required.

## login and passwords:
 - All share same password: **Musmus_1**
 - list of usable email from seeded acounts: "user1@mod.us", "user2@mod.us", "user3@mod.us", "feed_admin@mod.us"

 ## The app was architected with native front end such as xamrin app and desktop app in mind, thus the use bearer token is also supported beside cookies.
 
 ## For now on Google chrome is fully supported.  Edge is a bit slow and not displaying the remove button on mouse over a Rss feed.
 
 ## Debug build is build is the only config supported at this time.

