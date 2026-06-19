FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["TripService.Api/TripService.Api.csproj", "TripService.Api/"]
COPY ["TripService.Application/TripService.Application.csproj", "TripService.Application/"]
COPY ["TripService.Domain/TripService.Domain.csproj", "TripService.Domain/"]
COPY ["TripService.Infrastructure/TripService.Infrastructure.csproj", "TripService.Infrastructure/"]
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet restore "TripService.Api/TripService.Api.csproj" \
    --disable-parallel \
    --verbosity minimal
COPY . .
WORKDIR "/src/TripService.Api"
RUN dotnet build -c Release -o /app/build
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TripService.Api.dll"]
