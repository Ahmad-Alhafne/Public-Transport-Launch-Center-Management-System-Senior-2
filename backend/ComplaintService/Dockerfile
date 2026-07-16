FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["ComplaintService.Api/ComplaintService.Api.csproj", "ComplaintService.Api/"]
COPY ["ComplaintService.Application/ComplaintService.Application.csproj", "ComplaintService.Application/"]
COPY ["ComplaintService.Domain/ComplaintService.Domain.csproj", "ComplaintService.Domain/"]
COPY ["ComplaintService.Infrastructure/ComplaintService.Infrastructure.csproj", "ComplaintService.Infrastructure/"]
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet restore "ComplaintService.Api/ComplaintService.Api.csproj" \
    --disable-parallel \
    --verbosity minimal
COPY . .
WORKDIR "/src/ComplaintService.Api"
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet build -c Release -o /app/build --no-restore
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ComplaintService.Api.dll"]
