import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Trash2, AlertTriangle, Loader2, GraduationCap, BookOpen, MapPin, Calendar, School, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { StudentProfile } from '@/types/api';
import { fetchProfile, updateProfile, deleteAccount } from '@/services/profileService';

const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    return 'Errore imprevisto';
};

interface ProfileViewProps {
    userId: number;
    token: string;
    initialEmail: string;
    onLogout: () => void;
    onProfileUpdated?: () => void;
}

const DEGREE_TYPES = [
    { value: '', label: 'Seleziona...' },
    { value: 'Triennale', label: 'Laurea Triennale' },
    { value: 'Magistrale', label: 'Laurea Magistrale' },
    { value: 'Ciclo Unico', label: 'Laurea a Ciclo Unico' },
] as const;

const YEARS = [
    { value: '', label: 'Seleziona...' },
    { value: 1, label: '1° Anno' },
    { value: 2, label: '2° Anno' },
    { value: 3, label: '3° Anno' },
    { value: 4, label: '4° Anno' },
    { value: 5, label: '5° Anno' },
    { value: 6, label: '6° Anno (Fuori Corso)' },
] as const;

export const ProfileView: React.FC<ProfileViewProps> = ({ userId, token, initialEmail, onLogout, onProfileUpdated }: ProfileViewProps) => {
    const validUserId = !isNaN(userId);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [profileLoading, setProfileLoading] = useState(false);
    const [profileFetching, setProfileFetching] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [degreeProgram, setDegreeProgram] = useState('');
    const [degreeClass, setDegreeClass] = useState('');
    const [enrollmentYear, setEnrollmentYear] = useState<number | ''>('');
    const [degreeType, setDegreeType] = useState('');
    const [campus, setCampus] = useState('');
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [degreeTypeOpen, setDegreeTypeOpen] = useState(false);
    const [yearOpen, setYearOpen] = useState(false);
    const degreeTypeRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (degreeTypeRef.current && !degreeTypeRef.current.contains(event.target as Node)) {
                setDegreeTypeOpen(false);
            }
            if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
                setYearOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            setProfileError('');
            setProfileFetching(true);
            try {
                const data: StudentProfile = await fetchProfile(token);
                if (!isMounted) return;
                setDegreeProgram(data.degree_program || '');
                setDegreeClass(data.degree_class || '');
                setEnrollmentYear(data.enrollment_year || '');
                setDegreeType(data.degree_type || '');
                setCampus(data.campus || '');
            } catch (err: unknown) {
                if (!isMounted) return;
                const message = getErrorMessage(err);
                if (message === 'UNAUTHORIZED') {
                    onLogout();
                    return;
                }
                setProfileError(message);
            } finally {
                if (isMounted) {
                    setProfileFetching(false);
                    setProfileLoaded(true);
                }
            }
        };

        loadProfile();
        return () => {
            isMounted = false;
        };
    }, [token, onLogout]);

    const handleUpdateStudentProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');

        setProfileLoading(true);
        try {
            const payload: StudentProfile = {
                degree_program: degreeProgram || null,
                degree_class: degreeClass || null,
                enrollment_year: enrollmentYear || null,
                degree_type: degreeType || null,
                campus: campus || null,
            };
            await updateProfile(token, payload);
            setProfileSuccess('Informazioni accademiche salvate!');
            if (onProfileUpdated) onProfileUpdated();
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            if (message === 'UNAUTHORIZED') {
                onLogout();
                return;
            }
            setProfileError(message);
        } finally {
            setProfileLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!validUserId) {
            setError('ID utente non valido. Impossibile eliminare l\'account.');
            return;
        }
        setIsLoading(true);
        try {
            await deleteAccount(token);
            onLogout();
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="flex-1 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-linear-to-br from-[#003366] to-[#004080] rounded-2xl flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profilo Utente</h1>
                        <p className="text-gray-500 dark:text-gray-400">Gestisci le tue informazioni personali e le impostazioni dell'account</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {/* Account Info Card */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Informazioni Account</CardTitle>
                        <CardDescription>Account collegato con Google</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    type="email"
                                    value={initialEmail}
                                    className="pl-9 bg-gray-100 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 cursor-not-allowed"
                                    placeholder="la-tua-email@studenti.unimi.it"
                                    readOnly
                                    disabled
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Academic Profile Card */}
                <Card className="border-[#003366]/20 dark:border-blue-900/30 shadow-sm">
                    <CardHeader className="bg-linear-to-r from-[#003366]/5 to-transparent dark:from-blue-900/10 border-b border-[#003366]/10 dark:border-blue-900/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-linear-to-br from-[#003366] to-[#0055a4] rounded-xl flex items-center justify-center shadow-sm">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg text-[#003366] dark:text-blue-400">Informazioni Accademiche</CardTitle>
                                <CardDescription>Compila queste informazioni per migliorare la precisione delle ricerche</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {profileError && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {profileError}
                            </div>
                        )}
                        {profileSuccess && (
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-300 text-sm flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                {profileSuccess}
                            </div>
                        )}

                        {!profileLoaded || profileFetching ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-[#003366]" />
                                <span className="ml-2 text-sm text-gray-500">Caricamento profilo...</span>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateStudentProfile} className="space-y-6">
                                {/* Info banner */}
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl text-amber-800 dark:text-amber-300 text-sm">
                                    <p className="flex items-start gap-2">
                                        <span className="text-lg leading-none">💡</span>
                                        <span>Queste informazioni vengono utilizzate per personalizzare le risposte dell'assistente. Ad esempio, se chiedi <em>"Quando ho le lezioni di statistica?"</em> senza specificare il corso, il sistema userà automaticamente il tuo corso di laurea.</span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Corso di Laurea */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-1.5">
                                            <BookOpen className="w-3.5 h-3.5 text-[#003366] dark:text-blue-400" />
                                            Corso di Laurea
                                        </label>
                                        <Input
                                            type="text"
                                            value={degreeProgram}
                                            onChange={(e) => setDegreeProgram(e.target.value)}
                                            className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                            placeholder="es. Informatica, Scienze Biologiche, Giurisprudenza..."
                                        />
                                    </div>

                                    {/* Classe di Laurea */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-1.5">
                                            <School className="w-3.5 h-3.5 text-[#003366] dark:text-blue-400" />
                                            Classe di Laurea
                                        </label>
                                        <Input
                                            type="text"
                                            value={degreeClass}
                                            onChange={(e) => setDegreeClass(e.target.value)}
                                            className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                            placeholder="es. L-31, LM-18, LMG/01..."
                                        />
                                    </div>

                                    {/* Tipo di Laurea */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-1.5">
                                            <GraduationCap className="w-3.5 h-3.5 text-[#003366] dark:text-blue-400" />
                                            Tipo di Laurea
                                        </label>
                                        <div className="relative" ref={degreeTypeRef}>
                                            <button
                                                type="button"
                                                onClick={() => { setDegreeTypeOpen(!degreeTypeOpen); setYearOpen(false); }}
                                                className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-gray-900 dark:text-gray-100"
                                            >
                                                <span className={degreeType ? '' : 'text-gray-400 dark:text-gray-500'}>
                                                    {degreeType ? DEGREE_TYPES.find(dt => dt.value === degreeType)?.label : 'Seleziona...'}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${degreeTypeOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {degreeTypeOpen && (
                                                <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                                                    {DEGREE_TYPES.filter(dt => dt.value !== '').map(dt => (
                                                        <button
                                                            key={dt.value}
                                                            type="button"
                                                            onClick={() => { setDegreeType(dt.value); setDegreeTypeOpen(false); }}
                                                            className={`w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                                                                degreeType === dt.value
                                                                    ? 'bg-[#003366]/5 dark:bg-blue-900/20 text-[#003366] dark:text-blue-400 font-medium'
                                                                    : 'text-gray-700 dark:text-gray-300'
                                                            }`}
                                                        >
                                                            {dt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Anno di Corso */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-[#003366] dark:text-blue-400" />
                                            Anno di Corso
                                        </label>
                                        <div className="relative" ref={yearRef}>
                                            <button
                                                type="button"
                                                onClick={() => { setYearOpen(!yearOpen); setDegreeTypeOpen(false); }}
                                                className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-gray-900 dark:text-gray-100"
                                            >
                                                <span className={enrollmentYear ? '' : 'text-gray-400 dark:text-gray-500'}>
                                                    {enrollmentYear ? YEARS.find(y => y.value === enrollmentYear)?.label : 'Seleziona...'}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${yearOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {yearOpen && (
                                                <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                                                    {YEARS.filter(y => y.value !== '').map(y => (
                                                        <button
                                                            key={y.value}
                                                            type="button"
                                                            onClick={() => { setEnrollmentYear(y.value as number); setYearOpen(false); }}
                                                            className={`w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                                                                enrollmentYear === y.value
                                                                    ? 'bg-[#003366]/5 dark:bg-blue-900/20 text-[#003366] dark:text-blue-400 font-medium'
                                                                    : 'text-gray-700 dark:text-gray-300'
                                                            }`}
                                                        >
                                                            {y.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sede / Polo */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-[#003366] dark:text-blue-400" />
                                            Sede / Polo
                                        </label>
                                        <Input
                                            type="text"
                                            value={campus}
                                            onChange={(e) => setCampus(e.target.value)}
                                            className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                            placeholder="es. Milano, Crema, Sesto San Giovanni..."
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full md:w-auto bg-[#003366] hover:bg-[#004080] text-white flex items-center justify-center gap-2 px-8"
                                    disabled={profileLoading}
                                >
                                    {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
                                    Salva Informazioni Accademiche
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Danger Zone Card */}
                <Card className="border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/5 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-red-100 dark:border-red-900/20">
                        <CardTitle className="text-lg text-red-700 dark:text-red-400">Zona Pericolosa</CardTitle>
                        <CardDescription>Azioni irreversibili sul tuo account</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Elimina Account</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Eliminando il tuo account, tutti i tuoi dati e la cronologia delle chat saranno rimossi permanentemente.
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Elimina Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Account Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xl scale-in-center">
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    Sei assolutamente sicuro?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-8">
                                    Questa azione è <strong>permanente</strong> e non può essere annullata. Tutti i tuoi dati verranno cancellati dai nostri server.
                                </p>
                                <div className="flex w-full gap-4">
                                    <Button
                                        variant="outline"
                                        className="flex-1 py-6 border-gray-200 dark:border-gray-800"
                                        onClick={() => setShowDeleteConfirm(false)}
                                        disabled={isLoading}
                                    >
                                        Annulla
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1 py-6 bg-red-600 hover:bg-red-700 text-white font-bold"
                                        onClick={handleDeleteAccount}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sì, Elimina Account"}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
