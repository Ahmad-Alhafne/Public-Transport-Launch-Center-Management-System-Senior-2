FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["ApiGateway/ApiGateway.csproj", "ApiGateway/"]
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet restore "ApiGateway/ApiGateway.csproj" \
    --disable-parallel \
    --verbosity minimal
COPY . .
WORKDIR "/src/ApiGateway"
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet build -c Release -o /app/build --no-restore
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ApiGateway.dll"]
