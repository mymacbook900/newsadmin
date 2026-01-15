import { useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import { getSettingsAPI, updateSettingsAPI } from '../services/userApi';
import { Save } from 'lucide-react';

export default function Settings() {
    const [settings, setSettings] = useState({
        payoutPerView: 0,
        payoutPerLike: 0,
        payoutPerShare: 0,
        eventPublicCharge: 0,
        eventMemberCharge: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await getSettingsAPI();
            if (res.data) setSettings(res.data);
        } catch (error) {
            console.error("Fetch Settings Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateSettingsAPI(settings);
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Save Settings Error:", error);
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px' }}>
            <div className="page-header">
                <h1>System Settings</h1>
                <p className="text-secondary">Configure reporter payouts and event charges</p>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>Reporter Payouts (₹)</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Amount Per View</label>
                        <input
                            type="number" name="payoutPerView"
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            value={settings.payoutPerView} onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Amount Per Like</label>
                        <input
                            type="number" name="payoutPerLike"
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            value={settings.payoutPerLike} onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Amount Per Share</label>
                        <input
                            type="number" name="payoutPerShare"
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            value={settings.payoutPerShare} onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>Community Event Charges (₹)</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Public Event Charge</label>
                        <input
                            type="number" name="eventPublicCharge"
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            value={settings.eventPublicCharge} onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Member Only Event Charge</label>
                        <input
                            type="number" name="eventMemberCharge"
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            value={settings.eventMemberCharge} onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleSave} disabled={saving} style={{ display: 'flex', items: 'center', gap: '0.5rem' }}>
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
}
