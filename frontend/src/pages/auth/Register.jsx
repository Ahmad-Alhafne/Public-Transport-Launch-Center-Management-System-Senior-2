import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
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
                password
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
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        🚌 Departure Center
                    </h1>
                    <p className="mt-2 text-slate-400">Create your account</p>
                </div>
                <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
                    <h2 className="text-2xl font-semibold mb-6 text-center">Register</h2>
                    {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">First Name</label>
                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Last Name</label>
                                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Gender</label>
                                <select value={gender} onChange={(e) => setGender(e.target.value)} required
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors">
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Date of Birth</label>
                                <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">City</label>
                                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Region</label>
                                <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} required
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Current Address</label>
                            <textarea
                                value={currentAddress}
                                onChange={(e) => setCurrentAddress(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Phone Number</label>
                                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Disability Status</label>
                                <select value={disabilityStatus} onChange={(e) => setDisabilityStatus(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors">
                                    <option value="">Select status</option>
                                    <option value="None">None</option>
                                    <option value="Wheelchair">Wheelchair</option>
                                    <option value="Blind">Blind</option>
                                    <option value="Deaf">Deaf</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Father Name</label>
                                <input type="text" value={fatherName} onChange={(e) => setFatherName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Mother Name</label>
                                <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Birth Place</label>
                            <input type="text" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">National ID Number</label>
                            <input type="text" value={nationalIdNumber} onChange={(e) => setNationalIdNumber(e.target.value)} required
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Username</label>
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-xl font-medium transition-all duration-200 disabled:opacity-50">
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                    <p className="mt-4 text-center text-sm text-slate-400">
                        Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300">Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
