FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY ["RouteService.Api/RouteService.Api.csproj", "RouteService.Api/"]
COPY ["RouteService.Application/RouteService.Application.csproj", "RouteService.Application/"]
COPY ["RouteService.Domain/RouteService.Domain.csproj", "RouteService.Domain/"]
COPY ["RouteService.Infrastructure/RouteService.Infrastructure.csproj", "RouteService.Infrastructure/"]
 RUN --mount=type=cache,id=nuget-routeservice,target=/root/.nuget/packages \
    dotnet restore "RouteService.Api/RouteService.Api.csproj" \
    --disable-parallel \
    --verbosity minimal
COPY . .
WORKDIR "/src/RouteService.Api"
 RUN --mount=type=cache,id=nuget-routeservice,target=/root/.nuget/packages \
    dotnet build -c Release -o /app/build --no-restore
 RUN --mount=type=cache,id=nuget-routeservice,target=/root/.nuget/packages \
    dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "RouteService.Api.dll"]
