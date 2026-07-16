FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["NotificationService.Api/NotificationService.Api.csproj", "NotificationService.Api/"]
COPY ["NotificationService.Application/NotificationService.Application.csproj", "NotificationService.Application/"]
COPY ["NotificationService.Domain/NotificationService.Domain.csproj", "NotificationService.Domain/"]
COPY ["NotificationService.Infrastructure/NotificationService.Infrastructure.csproj", "NotificationService.Infrastructure/"]
RUN --mount=type=cache,id=nuget-notificationservice,target=/root/.nuget/packages \
    dotnet restore "NotificationService.Api/NotificationService.Api.csproj" \
    --disable-parallel \
    --verbosity minimal

COPY . .
WORKDIR "/src/NotificationService.Api"
RUN --mount=type=cache,id=nuget-notificationservice,target=/root/.nuget/packages \
    dotnet build -c Release -o /app/build --no-restore
RUN --mount=type=cache,id=nuget-notificationservice,target=/root/.nuget/packages \
    dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "NotificationService.Api.dll"]
