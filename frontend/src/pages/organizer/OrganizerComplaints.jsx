import ComplaintFormAndHistory from '../../components/ComplaintFormAndHistory';
import { useTranslation } from 'react-i18next';

export default function OrganizerComplaints() {
  const { t } = useTranslation();
  return <ComplaintFormAndHistory heading={t('generated.components_ComplaintFormAndHistory_heading')} />;
}
