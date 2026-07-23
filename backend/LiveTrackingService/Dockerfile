FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .
WORKDIR /src/LiveTrackingService.Api
ENV NUGET_HTTP_TIMEOUT=600
RUN --mount=type=cache,id=nuget-livetrackingservice,target=/root/.nuget/packages \
    dotnet restore "LiveTrackingService.Api.csproj" \
    --disable-parallel \
    --verbosity minimal
RUN --mount=type=cache,id=nuget-livetrackingservice,target=/root/.nuget/packages \
    dotnet publish -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "LiveTrackingService.Api.dll"]
