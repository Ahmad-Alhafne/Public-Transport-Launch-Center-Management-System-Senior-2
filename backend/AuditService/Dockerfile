FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore (cache nuget)
COPY ["AuditService.Api/AuditService.Api.csproj", "AuditService.Api/"]
COPY ["AuditService.Application/AuditService.Application.csproj", "AuditService.Application/"]
COPY ["AuditService.Domain/AuditService.Domain.csproj", "AuditService.Domain/"]
COPY ["AuditService.Infrastructure/AuditService.Infrastructure.csproj", "AuditService.Infrastructure/"]
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
	dotnet restore "AuditService.Api/AuditService.Api.csproj" \
	--disable-parallel \
	--verbosity minimal

# Copy everything and build
COPY . .
WORKDIR "/src/AuditService.Api"
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
	dotnet build -c Release -o /app/build --no-restore
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
	dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "AuditService.Api.dll"]
