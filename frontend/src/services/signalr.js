import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import API_BASE from '../config';

let connection = null;

export const createLiveTrackingConnection = (accessTokenFactory) => {
  const base = (API_BASE || '').replace(/\/$/, '');
  const hubUrl = `${base}/hubs/live-tracking`;

  connection = new HubConnectionBuilder()
    .withUrl(hubUrl, { accessTokenFactory })
    .configureLogging(LogLevel.Information)
    .withAutomaticReconnect()
    .build();

  return connection;
};

export const getConnection = () => connection;
