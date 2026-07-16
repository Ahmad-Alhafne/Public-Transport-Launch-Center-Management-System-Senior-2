FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

COPY ["OrganizerService.Api/OrganizerService.Api.csproj", "OrganizerService.Api/"]
COPY ["OrganizerService.Application/OrganizerService.Application.csproj", "OrganizerService.Application/"]
COPY ["OrganizerService.Domain/OrganizerService.Domain.csproj", "OrganizerService.Domain/"]
COPY ["OrganizerService.Infrastructure/OrganizerService.Infrastructure.csproj", "OrganizerService.Infrastructure/"]
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet restore "OrganizerService.Api/OrganizerService.Api.csproj" \
    --disable-parallel \
    --verbosity minimal

COPY . .
WORKDIR "/src/OrganizerService.Api"
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet build -c Release -o /app/build --no-restore
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "OrganizerService.Api.dll"]
