import { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Plus, Calendar, MapPin, AlertCircle, QrCode } from 'lucide-react';

// Mock Data for Reporter Events
const MOCK_REPORTER_EVENTS = [
    { id: 1, title: 'Press Conference: New Policy', organizer: 'Govt. Dept', date: '2026-03-01', location: 'Press Club', category: 'News', status: 'Upcoming' },
    { id: 2, title: 'Reporter Workshop', organizer: 'Media House', date: '2026-03-10', location: 'Grand Plaza', category: 'Workshop', status: 'Upcoming' },
];

export default function ReporterEvents() {
    const [events, setEvents] = useState(MOCK_REPORTER_EVENTS);
    const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', organizer: '', date: '', location: '', category: 'News' });
    const [showQRCode, setShowQRCode] = useState(false);

    const handleCreateEvent = (e) => {
        e.preventDefault();
        setShowQRCode(true);
    };

    const confirmPayment = () => {
        const eventToAdd = {
            id: events.length + 1,
            ...newEvent,
            status: 'Upcoming'
        };
        setEvents([eventToAdd, ...events]);
        setIsCreateEventOpen(false);
        setNewEvent({ title: '', organizer: '', date: '', location: '', category: 'News' });
        setShowQRCode(false);
        alert("Payment Confirmed! Event Created.");
    };

    return (
        <div className="p-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Reporter Events</h1>
                    <p className="text-secondary">Official events and press meets for reporters</p>
                </div>
                <Button onClick={() => setIsCreateEventOpen(true)}>
                    <Plus size={18} style={{ marginRight: '8px' }} /> Create Reporter Event
                </Button>
            </div>

            <div className="card" style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Organizer</TableHead>
                            <TableHead>Date & Location</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.map((event) => (
                            <TableRow key={event.id}>
                                <TableCell>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ padding: '0.5rem', background: '#f3e8ff', borderRadius: '0.375rem', color: '#9333ea' }}>
                                            <Calendar size={18} />
                                        </div>
                                        <span style={{ fontWeight: 500 }}>{event.title}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{event.category}</Badge>
                                </TableCell>
                                <TableCell>{event.organizer}</TableCell>
                                <TableCell>
                                    <div style={{ fontSize: '0.875rem' }}>{event.date}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={12} /> {event.location}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={event.status === 'Upcoming' ? 'success' : 'default'}>
                                        {event.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Create Event Modal */}
            <Modal
                isOpen={isCreateEventOpen}
                onClose={() => { setIsCreateEventOpen(false); setShowQRCode(false); }}
                title={showQRCode ? "Payment QR Code" : "Create Reporter Event"}
            >
                {!showQRCode ? (
                    <form onSubmit={handleCreateEvent}>
                        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '4px', display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                            <AlertCircle size={20} color="#ea580c" />
                            <div>
                                <div style={{ fontWeight: 600, color: '#9a3412', marginBottom: '0.25rem' }}>Payment Required</div>
                                <div style={{ fontSize: '0.875rem', color: '#c2410c' }}>Creating an event requires a standard fee of ₹50.</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Event Title</label>
                            <input
                                type="text"
                                required
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            />
                        </div>
                        <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Organizer</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                    value={newEvent.organizer}
                                    onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                                <select
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                    value={newEvent.category}
                                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                                >
                                    <option value="News">News</option>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Meet">Meet</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date</label>
                                <input type="date" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Location</label>
                                <input type="text" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <Button type="button" variant="secondary" onClick={() => setIsCreateEventOpen(false)}>Cancel</Button>
                            <Button type="submit">Proceed to Payment</Button>
                        </div>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: 600 }}>Scan QR to Pay ₹50</div>
                        <div style={{
                            width: '200px',
                            height: '200px',
                            margin: '0 auto 1.5rem',
                            background: '#f8fafc',
                            border: '2px solid #e2e8f0',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            <QrCode size={160} color="#1e293b" />
                            <div style={{ position: 'absolute', bottom: '-10px', background: '#2563eb', color: 'white', padding: '2px 12px', borderRadius: '20px', fontSize: '0.75rem' }}>PAID VIA CR</div>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>The QR code is valid for 10 minutes. Please do not refresh the page.</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <Button variant="secondary" onClick={() => setShowQRCode(false)}>Back</Button>
                            <Button onClick={confirmPayment}>I have Paid</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
