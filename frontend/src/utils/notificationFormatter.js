const normalizeEnumKey = (value) => {
  if (!value) return '';
  const trimmed = value.trim().replace(/[\.\,]/g, '');
  const flattened = trimmed.replace(/\s+/g, '');
  const camelized = `${flattened.charAt(0).toUpperCase()}${flattened.slice(1).toLowerCase()}`;
  return { trimmed, flattened, camelized, lower: flattened.toLowerCase() };
};

export const translateRole = (t, value) => {
  if (!value) return '';
  const normalized = value.trim().toLowerCase();
  return t(`roles.${normalized}`, value);
};

export const translateTripStatus = (t, value) => {
  if (!value) return '';
  const { trimmed, flattened, camelized, lower } = normalizeEnumKey(value);
  const keysToTry = [
    `notifications.tripStatuses.${trimmed}`,
    `notifications.tripStatuses.${camelized}`,
    `citizen.trips.status_${camelized}`,
    `citizen.trips.status${camelized}`,
    `citizen.trips.status_${trimmed}`,
    `generated.pages_admin_TripDetails_status_${lower}`,
  ];

  for (const key of keysToTry) {
    const translated = t(key, null);
    if (translated && translated !== key) return translated;
  }

  return trimmed;
};

export const translateEmergencyType = (t, value) => {
  if (!value) return '';
  return t(`emergency.type.${value.trim()}`, t(`emergency.type.${value.trim().toLowerCase()}`, value));
};

export const translatePriority = (t, value) => {
  if (!value) return '';
  return t(`emergency.priority.${value.trim()}`, value);
};

export const translateEmergencyStatus = (t, value) => {
  if (!value) return '';
  const { trimmed, flattened, camelized } = normalizeEnumKey(value);
  const keys = [
    `notifications.emergencyStatuses.${camelized}`,
    `notifications.emergencyStatuses.${trimmed}`,
    `emergency.status.${trimmed}`,
    `emergency.status.${flattened}`,
    `emergency.status.${camelized}`,
    // Fallback to type in case status isn't found (e.g., "mechanical" sent as status)
    `emergency.type.${trimmed}`,
    `emergency.type.${camelized}`,
  ];

  for (const key of keys) {
    const translated = t(key, null);
    if (translated && translated !== key) return translated;
  }

  return trimmed;
};

export const translateReporter = (t, value) => {
  if (!value) return '';
  const parts = value.trim().split(/\s+/);
  if (parts.length > 1) {
    const role = translateRole(t, parts[0]);
    return `${role} ${parts.slice(1).join(' ')}`.trim();
  }
  return value;
};

const extractTripInfo = (combined) => {
  const tripMatch =
    combined.match(/Trip\s+(\d+)\s*\(([^)]+)\)/i) ||
    combined.match(/الرحلة\s+(\d+)\s*\(([^)]+)\)/) ||
    combined.match(/trip\s+(\d+)\s*\(([^)]+)\)/i);

  return {
    tripNumber: tripMatch?.[1] || '',
    tripId: tripMatch?.[2] || '',
  };
};

const extractTripStatus = (combined, t) => {
  // Try English patterns first
  let statusMatch = combined.match(/status\s*(?:is now|changed to)\s*([^\.\n,]+)/i);
  if (!statusMatch) {
    // Try Arabic pattern
    statusMatch = combined.match(/تم تغيير حالتها إلى\s*([^\.\n,]+)/);
  }
  if (!statusMatch) {
    // Try alternative patterns
    statusMatch = combined.match(/changed to\s*([^\.\n,]+)/i);
  }
  
  const statusText = statusMatch?.[1]?.trim() || '';
  return statusText ? translateTripStatus(t, statusText) : '';
};

const extractEmergencyStatus = (combined, t) => {
  // Try Arabic pattern with English status value (تم تغيير حالة الطوارئ إلى mechanical)
  let emergencyStatusMatch = combined.match(/تم تغيير حالة الطوارئ إلى\s+([^\.\n,]+)/);
  if (!emergencyStatusMatch) {
    // Try Arabic pattern (حالة الطوارئ الآن InProgress)
    emergencyStatusMatch = combined.match(/حالة الطوارئ الآن\s+([^\.\n,]+)/);
  }
  if (!emergencyStatusMatch) {
    // Try English patterns
    emergencyStatusMatch = combined.match(/emergency status(?:\s+is)?(?:\s+now)?\s+([^\.\n,]+)/i);
  }
  if (!emergencyStatusMatch) {
    // Try alternative pattern
    emergencyStatusMatch = combined.match(/emergency status changed to\s+([^\.\n,]+)/i);
  }

  const statusText = emergencyStatusMatch?.[1]?.trim() || '';
  return statusText ? translateEmergencyStatus(t, statusText) : '';
};

const extractPaymentAmount = (combined) => {
  const normalized = (combined || '').replace(/\u00a0/g, ' ');

  const tryParse = (match) => {
    if (!match?.[1] && !match?.[2]) return null;
    const raw = (match[2] || match[1] || '').trim();
    const cleaned = raw.replace(/[^0-9,.-]/g, '');
    if (!cleaned) return null;
    const normalizedValue = cleaned.replace(/,/g, '.');
    const numericValue = Number(normalizedValue);
    if (!Number.isFinite(numericValue) || numericValue <= 0) return null;
    return normalizedValue;
  };

  const currencyFirstMatch = normalized.match(/(?:payment of|paid|of)\s+([A-Z]{3}|[a-z]{3})\s+([\d]+(?:[.,]\d+)?)/i);
  const parsedCurrencyFirst = tryParse(currencyFirstMatch);
  if (parsedCurrencyFirst) return parsedCurrencyFirst;

  const arabicAmountMatch = normalized.match(/(?:بقيمة|بمبلغ|مبلغ)\s+([\d]+(?:[.,]\d+)?)/i);
  const parsedArabicAmount = tryParse(arabicAmountMatch);
  if (parsedArabicAmount) return parsedArabicAmount;

  const englishAmountMatch = normalized.match(/payment of\s+([\d]+(?:[.,]\d+)?)/i);
  const parsedEnglishAmount = tryParse(englishAmountMatch);
  if (parsedEnglishAmount) return parsedEnglishAmount;

  const amountAfterCurrencyMatch = normalized.match(/(?:payment\s+)?amount\s*:\s*(?:([A-Z]{3}|[a-z]{3})\s+)?([\d]+(?:[.,]\d+)?)/i);
  const parsedAmountAfterCurrency = tryParse(amountAfterCurrencyMatch);
  if (parsedAmountAfterCurrency) return parsedAmountAfterCurrency;

  const amountBeforeCurrencyMatch = normalized.match(/([\d]+(?:[.,]\d+)?)\s+(?:USD|SYP|EUR|GBP|AED|usd|syp|eur|gbp|aed)/i);
  const parsedAmountBeforeCurrency = tryParse(amountBeforeCurrencyMatch);
  if (parsedAmountBeforeCurrency) return parsedAmountBeforeCurrency;

  const amountContextMatch = normalized.match(/(?:payment|paid|تم\s+إكمال\s+دفعتك|بقيمة|بمبلغ|amount)\b[^\d]{0,20}([\d]+(?:[.,]\d+)?)/i);
  const parsedAmountContext = tryParse(amountContextMatch);
  if (parsedAmountContext) return parsedAmountContext;

  const genericAmountMatches = normalized.matchAll(/([\d]+(?:[.,]\d+)?)/g);
  for (const match of genericAmountMatches) {
    const parsedGenericAmount = tryParse(match);
    if (parsedGenericAmount) return parsedGenericAmount;
  }

  return '0.00';
};

export const formatNotificationTitle = (notification, t) => {
  if (!notification) return '';
  const raw = (notification.title || '').trim();

  let m = raw.match(/^Emergency Reported:\s*(.+)/i) || raw.match(/^تم الإبلاغ عن حالة طارئة:\s*(.+)/i);
  if (m) return t('notifications.emergencyReported.title', { type: translateEmergencyType(t, m[1].trim()) });

  m = raw.match(/^Trip Update:\s*(\d+)/i) || raw.match(/^تحديث الرحلة:\s*(\d+)/i);
  if (m) return t('notifications.tripUpdate.title', { tripNumber: m[1] });

  m = raw.match(/^Emergency Update:\s*(.+)/i) || raw.match(/^تحديث الطارئ:\s*(.+)/i);
  if (m) return t('notifications.emergencyUpdate.title', { type: translateEmergencyType(t, m[1].trim()) });

  m = raw.match(/^Emergency Status Updated:\s*(.+)/i) || raw.match(/^تحديث حالة الطوارئ:\s*(.+)/i);
  if (m) return t('notifications.emergencyStatusUpdated.title', { type: translateEmergencyType(t, m[1].trim()) });

  m = raw.match(/^New Trip Assigned:\s*(\d+)/i) || raw.match(/^تم تعيين رحلة جديدة:\s*(\d+)/i);
  if (m) return t('notifications.newTripAssigned.title', { tripNumber: m[1] });

  m = raw.match(/^Driver assigned to Trip\s*#(\d+)/i) || raw.match(/^تم تعيينك على الرحلة\s*#(\d+)/i);
  if (m) return t('notifications.driverAssigned.title', { tripNumber: m[1] });

  if (/Payment Successful/i.test(raw) || /تمت عملية الدفع بنجاح/i.test(raw)) {
    return t('notifications.paymentSuccess.title');
  }

  m = raw.match(/^Reminder:\s*Trip\s*#(\d+)\s+departs soon/i) || raw.match(/^تذكير:\s*الرحلة\s*#(\d+)\s+تغادر قريباً/i);
  if (m) return t('notifications.driverReminder.title', { tripNumber: m[1] });

  m = raw.match(/^Reminder:\s*Your trip\s*#(\d+)\s+departs soon/i) || raw.match(/^تذكير:\s*رحلتك\s*#(\d+)\s+تغادر قريباً/i);
  if (m) return t('notifications.reminder.title', { text: `#${m[1]}` });

  m = raw.match(/^Reminder:\s*(.+)/i) || raw.match(/^تذكير:\s*(.+)/i);
  if (m) return t('notifications.reminder.title', { text: m[1].trim() });

  m = raw.match(/^Complaint response received/i) || raw.match(/^تم استلام رد على الشكوى/i);
  if (m) return t('notifications.complaintResponse.title');

  try {
    return raw
      .replace(/Complaint Update:/i, t('notifications.complaintUpdatePrefix'))
      .replace(/بلاغ:/i, t('notifications.complaintUpdatePrefix'));
  } catch {
    return raw;
  }
};

export const formatNotificationMessage = (notification, t) => {
  if (!notification) return '';
  const title = (notification.title || '').trim();
  const raw = (notification.message || '').trim();
  const combined = `${title}\n${raw}`;

  const { tripNumber, tripId } = extractTripInfo(combined);
  const priorityMatch = combined.match(/Priority:\s*([^\.\n]+)/i);
  const priority = translatePriority(t, priorityMatch?.[1]?.trim() || '');
  const reporterMatch = combined.match(/Reporter:\s*([^\.\n]+)/i);
  const reporter = translateReporter(t, reporterMatch?.[1]?.trim() || '');
  const status = extractTripStatus(combined, t);
  const emergencyStatus = extractEmergencyStatus(combined, t);
  const departureMatch =
    combined.match(/Departure:\s*([^\.\n]+)/i) ||
    combined.match(/المغادرة:\s*([^\.\n]+)/);
  const departure = departureMatch?.[1]?.trim() || '';
  const amount = extractPaymentAmount(combined) || '0.00';
  const routeMatch = combined.match(/from\s+(.+?)\s+to\s+(.+?)\s+departs at\s+([^\.\n]+)/i);
  const driverReminderMatch = combined.match(/Trip\s*#(\d+)\s+departs at\s+([^\.]+?)(?:\s+with\s+(.+?))?(?:\.\s*Route:\s*(.+?))?\.?$/i);
  const driverAssignedMatch =
    combined.match(/You have been assigned to [Tt]rip\s+(\d+)\s*\(([^)]+)\)\.\s*Departure:\s*([^\.\n]+)/i) ||
    combined.match(/You have been assigned to Trip\s*#(\d+)\s+departing at\s+([^\.\n]+)\.\s*Vehicle:\s*([^\.\n]+)\.\s*Route:\s*([^\.\n]+)/i);

  if (/Emergency Reported:/i.test(combined) || /تم الإبلاغ عن حالة طارئة:/i.test(combined)) {
    const typeMatch =
      title.match(/^Emergency Reported:\s*(.+)/i) ||
      title.match(/^تم الإبلاغ عن حالة طارئة:\s*(.+)/i);
    const type = translateEmergencyType(t, typeMatch?.[1]?.trim() || '');
    return t('notifications.emergencyReported.message', { tripNumber, tripId, type, priority, reporter });
  }

  if (/Trip Update:/i.test(combined) || /تحديث الرحلة:/i.test(combined)) {
    return t('notifications.tripUpdate.message', { tripNumber, tripId, status, departure });
  }

  if (/Emergency Status Updated:/i.test(combined) || /تحديث حالة الطوارئ:/i.test(combined) || /emergency status changed to/i.test(combined)) {
    const typeMatch = title.match(/^Emergency Status Updated:\s*(.+)/i) || title.match(/^تحديث حالة الطوارئ:\s*(.+)/i);
    const type = translateEmergencyType(t, typeMatch?.[1]?.trim() || '');
    const statusFinal = emergencyStatus || status;
    return t('notifications.emergencyStatusUpdated.message', {
      tripNumber,
      tripId,
      status: statusFinal,
      type,
    });
  }

  if (/Emergency Update:/i.test(combined) || /تحديث الطارئ/i.test(combined)) {
    const typeMatch = title.match(/^Emergency Update:\s*(.+)/i) || title.match(/^تحديث الطارئ:\s*(.+)/i);
    const type = translateEmergencyType(t, typeMatch?.[1]?.trim() || '');
    const emergencyStatusFinal = emergencyStatus || status;
    return t('notifications.emergencyUpdate.message', { tripNumber, tripId, status: emergencyStatusFinal, type });
  }

  if (/New Trip Assigned:/i.test(combined) || /تم تعيين رحلة جديدة:/i.test(combined) || /You have been assigned to trip/i.test(combined)) {
    return t('notifications.newTripAssigned.message', { tripNumber, tripId, departure });
  }

  if (/Driver assigned to Trip/i.test(combined) || /تم تعيينك على الرحلة/i.test(combined)) {
    const vehicle = driverAssignedMatch?.[3]?.trim() || '';
    const route = driverAssignedMatch?.[4]?.trim() || '';
    const assignedDeparture = driverAssignedMatch?.[2]?.trim() || departure;
    return t('notifications.driverAssigned.message', {
      tripNumber: driverAssignedMatch?.[1] || tripNumber,
      departure: assignedDeparture,
      vehicle,
      route,
    });
  }

  if (/Payment Successful/i.test(combined) || /تمت عملية الدفع بنجاح/i.test(combined) || /Your payment of/i.test(combined)) {
    return t('notifications.paymentSuccess.message', { amount });
  }

  if (/Reminder:/i.test(combined) || /تذكير:/i.test(combined)) {
    if (routeMatch) {
      return t('notifications.reminder.message', {
        from: routeMatch[1].trim(),
        to: routeMatch[2].trim(),
        time: routeMatch[3].trim(),
      });
    }

    if (driverReminderMatch) {
      return t('notifications.driverReminder.message', {
        tripNumber: driverReminderMatch[1],
        time: driverReminderMatch[2]?.trim() || '',
        vehicle: driverReminderMatch[3]?.trim() || t('common.na'),
        route: driverReminderMatch[4]?.trim() || t('common.na'),
      });
    }

    const citizenReminderMatch = combined.match(/Your trip from\s+(.+?)\s+to\s+(.+?)\s+departs at\s+([^\.\n]+)/i);
    if (citizenReminderMatch) {
      return t('notifications.reminder.message', {
        from: citizenReminderMatch[1].trim(),
        to: citizenReminderMatch[2].trim(),
        time: citizenReminderMatch[3].trim(),
      });
    }

    const formattedRaw = raw.replace(/^Your trip\s+/i, `${t('notifications.yourTrip')} `);
    return formattedRaw || title;
  }

  if (/Complaint response received/i.test(combined) || /تم استلام رد على الشكوى/i.test(combined)) {
    const responseMatch = raw.match(/response:\s*(.+)$/i) || raw.match(/الرد:\s*(.+)$/i);
    return t('notifications.complaintResponse.message', {
      title: raw.match(/'([^']+)'/)?.[1] || '',
      response: responseMatch?.[1]?.trim() || raw,
    });
  }

  const enMatch = combined.match(/Your complaint has been resolved\.\s*Admin response:\s*([\s\S]*)/i);
  const arMatch = combined.match(/تم حل شكواك\.\s*رد المسؤول:\s*([\s\S]*)/i);
  if (enMatch) return `${t('notifications.complaintResolvedAdminResponsePrefix')} ${enMatch[1].trim()}`;
  if (arMatch) return `${t('notifications.complaintResolvedAdminResponsePrefix')} ${arMatch[1].trim()}`;

  return raw
    .replace(/\bRead\b/g, t('generated.pages_NotificationsPage_status_read'))
    .replace(/\bUnread\b/g, t('generated.pages_NotificationsPage_status_unread'))
    .replace(/مقروء/g, t('generated.pages_NotificationsPage_status_read'))
    .replace(/غير مقروء/g, t('generated.pages_NotificationsPage_status_unread'));
};
