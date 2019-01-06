##### Launching the App from VS2017:

###### (Approach A) To run app in docker container, set the docker-compose project file as the start up project.

###### (Approach B) To run the app from your local IIS Express process, set the project  "Feed.Web.Backend" as the start up project

--------------------------------------------------

##### Viewing log while the app is running:

launch powershell with Admin right, navigate to the "Feed.Web.Backend" project folder and run the following commands:

`dotnet build`

`donet run`

then, open your favorite web browser and navigate to "http://localhost" or  preferably to "https://localhost:44355/".

As you interact with app, the powershell console will output the log 

