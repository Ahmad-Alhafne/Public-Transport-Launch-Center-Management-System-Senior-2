FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
ENV NUGET_ENHANCED_MAX_NETWORK_TRY_COUNT=12 \
    NUGET_ENHANCED_NETWORK_RETRY_DELAY_MILLISECONDS=2000 \
    NUGET_ENHANCED_NETWORK_RETRY_DELAY_MAX_MILLISECONDS=30000

# Copy csproj files and restore dependencies into the image layer.
COPY ["AuditService.Api/AuditService.Api.csproj", "AuditService.Api/"]
COPY ["AuditService.Application/AuditService.Application.csproj", "AuditService.Application/"]
COPY ["AuditService.Domain/AuditService.Domain.csproj", "AuditService.Domain/"]
COPY ["AuditService.Infrastructure/AuditService.Infrastructure.csproj", "AuditService.Infrastructure/"]
RUN dotnet restore "AuditService.Api/AuditService.Api.csproj" \
	--disable-parallel \
	--verbosity minimal

# Copy everything and build
COPY . .
WORKDIR "/src/AuditService.Api"
RUN dotnet build -c Release -o /app/build --no-restore
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "AuditService.Api.dll"]
