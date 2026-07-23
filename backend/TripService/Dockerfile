FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
ENV NUGET_ENHANCED_MAX_NETWORK_TRY_COUNT=12 \
    NUGET_ENHANCED_NETWORK_RETRY_DELAY_MILLISECONDS=2000 \
    NUGET_ENHANCED_NETWORK_RETRY_DELAY_MAX_MILLISECONDS=30000

COPY ["TripService.Api/TripService.Api.csproj", "TripService.Api/"]
COPY ["TripService.Application/TripService.Application.csproj", "TripService.Application/"]
COPY ["TripService.Domain/TripService.Domain.csproj", "TripService.Domain/"]
COPY ["TripService.Infrastructure/TripService.Infrastructure.csproj", "TripService.Infrastructure/"]
RUN dotnet restore "TripService.Api/TripService.Api.csproj" \
    --disable-parallel \
    --verbosity minimal
COPY . .
WORKDIR "/src/TripService.Api"
RUN dotnet build -c Release -o /app/build --no-restore
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TripService.Api.dll"]
