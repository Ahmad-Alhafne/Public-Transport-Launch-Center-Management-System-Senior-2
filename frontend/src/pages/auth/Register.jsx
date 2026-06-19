import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../imgs/Syrian_logo_icon_gold.svg';
import { register } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [disabilityStatus, setDisabilityStatus] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await register({
        fullName,
        firstName,
        lastName,
        gender,
        dateOfBirth,
        city,
        region,
        currentAddress,
        phoneNumber,
        disabilityStatus,
        fatherName,
        motherName,
        birthPlace,
        nationalIdNumber,
        email,
        password,
      });
      loginUser(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.Detailed || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 page-shell">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <img src={logo} alt="Departure Center Logo" className="h-20 w-20 rounded-full shadow-card" />
          <h1 className="text-4xl font-bold brand-gradient">{t('app.title')}</h1>
          <p className="mt-2 text-muted">{t('auth.createAccount')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-card">
          <h2 className="text-2xl font-semibold mb-6 text-center">{t('auth.register')}</h2>
          {error && <div className="mb-4 alert alert-error text-sm">{error}</div>}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="form-label">{t('auth.firstName')}</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="input-field w-full" />
              </div>
              <div>
                <label className="form-label">{t('auth.lastName')}</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="input-field w-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="form-label">{t('auth.gender')}</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} required className="input-field w-full">
                  <option value="">{t('auth.selectGender')}</option>
                  <option value="Male">{t('auth.male')}</option>
                  <option value="Female">{t('auth.female')}</option>
                </select>
              </div>
              <div>
                <label className="form-label">{t('auth.dateOfBirth')}</label>
                <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required className="input-field w-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="form-label">{t('auth.city')}</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required className="input-field w-full" />
              </div>
              <div>
                <label className="form-label">{t('auth.region')}</label>
                <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} required className="input-field w-full" />
              </div>
            </div>

            <div>
              <label className="form-label">{t('auth.currentAddress')}</label>
              <textarea value={currentAddress} onChange={(e) => setCurrentAddress(e.target.value)} rows={2} className="input-field w-full" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="form-label">{t('auth.phoneNumber')}</label>
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="form-label">{t('auth.disabilityStatus')}</label>
                <select value={disabilityStatus} onChange={(e) => setDisabilityStatus(e.target.value)} className="input-field w-full">
                  <option value="">{t('auth.selectStatus')}</option>
                  <option value="None">{t('auth.statusNone')}</option>
                  <option value="Wheelchair">{t('auth.statusWheelchair')}</option>
                  <option value="Blind">{t('auth.statusBlind')}</option>
                  <option value="Deaf">{t('auth.statusDeaf')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="form-label">{t('auth.fatherName')}</label>
                <input type="text" value={fatherName} onChange={(e) => setFatherName(e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="form-label">{t('auth.motherName')}</label>
                <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} className="input-field w-full" />
              </div>
            </div>

            <div>
              <label className="form-label">{t('auth.birthPlace')}</label>
              <input type="text" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} className="input-field w-full" />
            </div>

            <div>
              <label className="form-label">{t('auth.nationalIdNumber')}</label>
              <input type="text" value={nationalIdNumber} onChange={(e) => setNationalIdNumber(e.target.value)} required className="input-field w-full" />
            </div>

            <div>
              <label className="form-label">{t('auth.fullName')}</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="input-field w-full" />
            </div>

            <div>
              <label className="form-label">{t('auth.email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field w-full" />
            </div>

            <div>
              <label className="form-label">{t('auth.password')}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field w-full" />
            </div>
          </div>

          <button type="submit" disabled={loading} 
          className="primary-button w-full mt-6 py-3 font-medium transition-all duration-200 disabled:opacity-50"
          style={{marginTop:'10px'}}
          >
            {loading ? t('auth.creatingAccount') : t('auth.createAccountButton')}
          </button>

          <p className="mt-4 text-center text-sm text-muted">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-forest hover:text-forest-dark">
              {t('auth.login')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
