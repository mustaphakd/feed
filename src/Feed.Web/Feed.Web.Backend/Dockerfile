FROM microsoft/dotnet:2.1-aspnetcore-runtime AS base
WORKDIR /app
EXPOSE 22695
EXPOSE 44355

FROM microsoft/dotnet:2.1-sdk AS build
WORKDIR /src
COPY Feed.Web.Backend/Feed.Web.Backend.csproj Feed.Web.Backend/
RUN dotnet restore Feed.Web.Backend/Feed.Web.Backend.csproj
COPY . .
WORKDIR /src/Feed.Web.Backend
RUN dotnet build Feed.Web.Backend.csproj -c Release -o /app

FROM build AS publish
RUN dotnet publish Feed.Web.Backend.csproj -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "Feed.Web.Backend.dll"]
