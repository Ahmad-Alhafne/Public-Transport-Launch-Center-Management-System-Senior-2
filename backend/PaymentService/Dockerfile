FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
ENV NUGET_PACKAGES=/root/.nuget/packages

COPY ["PaymentService.Api/PaymentService.Api.csproj", "PaymentService.Api/"]
COPY ["PaymentService.Application/PaymentService.Application.csproj", "PaymentService.Application/"]
COPY ["PaymentService.Domain/PaymentService.Domain.csproj", "PaymentService.Domain/"]
COPY ["PaymentService.Infrastructure/PaymentService.Infrastructure.csproj", "PaymentService.Infrastructure/"]
RUN --mount=type=cache,id=nuget-paymentservice,target=/root/.nuget/packages \
    for i in 1 2 3; do \
      dotnet restore "PaymentService.Api/PaymentService.Api.csproj" \
      --disable-parallel \
      --verbosity minimal \
      --packages /root/.nuget/packages && break; \
      [ $i -lt 3 ] && sleep 5; \
    done

COPY . .
WORKDIR "/src/PaymentService.Api"
RUN --mount=type=cache,id=nuget-paymentservice,target=/root/.nuget/packages \
    dotnet build -c Release -o /app/build --no-restore
RUN --mount=type=cache,id=nuget-paymentservice,target=/root/.nuget/packages \
    dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "PaymentService.Api.dll"]
