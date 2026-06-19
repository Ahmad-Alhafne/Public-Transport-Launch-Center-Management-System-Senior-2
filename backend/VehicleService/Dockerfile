FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY ["VehicleService.Api/VehicleService.Api.csproj", "VehicleService.Api/"]
COPY ["VehicleService.Application/VehicleService.Application.csproj", "VehicleService.Application/"]
COPY ["VehicleService.Domain/VehicleService.Domain.csproj", "VehicleService.Domain/"]
COPY ["VehicleService.Infrastructure/VehicleService.Infrastructure.csproj", "VehicleService.Infrastructure/"]
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
	dotnet restore "VehicleService.Api/VehicleService.Api.csproj" \
	--disable-parallel \
	--verbosity minimal

# Copy the rest
COPY . .
WORKDIR "/src/VehicleService.Api"
RUN dotnet build -c Release -o /app/build
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "VehicleService.Api.dll"]
