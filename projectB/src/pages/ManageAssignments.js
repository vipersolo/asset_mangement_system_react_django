import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Modal, Form, Spinner, Badge } from 'react-bootstrap';
import { PersonPlus, ArrowCounterclockwise, Inbox, LaptopFill, PersonCircle } from 'react-bootstrap-icons';
import api from '../api/axios';

const ManageAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [availableAssets, setAvailableAssets] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        asset: '',
        employee: '',
        date_assigned: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [assignRes, assetRes, userRes] = await Promise.all([
                api.get('assignments/'),
                api.get('assets/?status=available'), // Filter for available gear
                api.get('users/') // You might need a custom endpoint for employees only
            ]);
            setAssignments(assignRes.data);
            setAvailableAssets(assetRes.data.filter(a => a.status === 'available'));
            setEmployees(userRes.data.filter(u => u.role === 'employee'));
        } catch (err) {
            console.error("Data fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await api.post('assignments/', formData);
            setShowModal(false);
            fetchInitialData(); // Refresh everything
        } catch (err) {
            alert(err.response?.data?.detail || "Assignment failed. Check if asset is available.");
        }
    };

    const handleReturn = async (id) => {
        if (window.confirm("Mark this asset as returned? This will make it available again.")) {
            try {
                // Update with return date - your Django logic handles the rest
                await api.patch(`assignments/${id}/`, {
                    date_returned: new Date().toISOString().split('T')[0]
                });
                fetchInitialData();
            } catch (err) {
                console.error("Return failed", err);
            }
        }
    };

    // Helper for avatar initials - presentational only
    const getInitials = (name) => {
        if (!name) return '?';
        return name.trim().charAt(0).toUpperCase();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" style={{ color: '#3D5A80', width: '3rem', height: '3rem' }} />
                <p className="text-muted mt-3 mb-0">Loading assignments…</p>
            </div>
        );
    }

    const activeCount = assignments.filter(a => !a.date_returned).length;

    return (
        <div className="p-2 p-md-3" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: '#1B2A41', letterSpacing: '-0.02em' }}>
                        Asset Assignments
                    </h2>
                    <p className="text-muted mb-0">
                        {assignments.length === 0
                            ? 'No assignments yet'
                            : `${activeCount} active · ${assignments.length} total`}
                    </p>
                </div>
                <Button
                    onClick={() => setShowModal(true)}
                    style={{ backgroundColor: '#5dac25', borderColor: '#3D5A80' }}
                    className="d-flex align-items-center shadow-sm"
                >
                    <PersonPlus className="me-2" size={18} /> Assign New Gear
                </Button>
            </div>

            <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <Card.Body className="p-0">
                    {assignments.length === 0 ? (
                        <div className="text-center py-5">
                            <Inbox size={42} className="text-muted mb-3" />
                            <h5 className="fw-semibold mb-1">No assignments yet</h5>
                            <p className="text-muted mb-3">Issue your first piece of gear to get started.</p>
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowModal(true)}
                                style={{ borderColor: '#3D5A80', color: '#3D5A80' }}
                            >
                                <PersonPlus className="me-2" /> Assign New Gear
                            </Button>
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead>
                                <tr style={{ backgroundColor: '#F4F6F8' }}>
                                    <th className="py-3 ps-4 text-uppercase small fw-semibold text-muted" style={{ letterSpacing: '0.04em' }}>Employee</th>
                                    <th className="py-3 text-uppercase small fw-semibold text-muted" style={{ letterSpacing: '0.04em' }}>Asset</th>
                                    <th className="py-3 text-uppercase small fw-semibold text-muted" style={{ letterSpacing: '0.04em' }}>Serial No.</th>
                                    <th className="py-3 text-uppercase small fw-semibold text-muted" style={{ letterSpacing: '0.04em' }}>Assigned On</th>
                                    <th className="py-3 pe-4 text-uppercase small fw-semibold text-muted text-end" style={{ letterSpacing: '0.04em' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map(asgn => (
                                    <tr key={asgn.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className="d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                                    style={{
                                                        width: 32, height: 32, borderRadius: '50%',
                                                        backgroundColor: '#E0E7F0', color: '#3D5A80',
                                                        fontWeight: 600, fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {getInitials(asgn.employee_name)}
                                                </div>
                                                <strong>{asgn.employee_name}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <LaptopFill className="me-2 text-muted" size={15} />
                                                {asgn.asset_name}
                                            </div>
                                        </td>
                                        <td>
                                            <code className="px-2 py-1 rounded" style={{ backgroundColor: '#F4F6F8', fontSize: '0.85rem' }}>
                                                {asgn.asset_details?.serial_number}
                                            </code>
                                        </td>
                                        <td className="text-muted">{formatDate(asgn.date_assigned)}</td>
                                        <td className="text-end pe-4">
                                            {asgn.date_returned ? (
                                                <Badge
                                                    pill
                                                    bg="light"
                                                    text="muted"
                                                    className="px-3 py-2 fw-normal"
                                                    style={{ border: '1px solid #dee2e6' }}
                                                >
                                                    Returned {formatDate(asgn.date_returned)}
                                                </Badge>
                                            ) : (
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    className="rounded-pill px-3"
                                                    onClick={() => handleReturn(asgn.id)}
                                                >
                                                    <ArrowCounterclockwise className="me-1" /> Check In
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* ASSIGNMENT MODAL */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Form onSubmit={handleAssign}>
                    <Modal.Header closeButton style={{ borderBottom: '1px solid #eef1f4' }}>
                        <Modal.Title className="fw-bold" style={{ color: '#1B2A41' }}>
                            <PersonPlus className="me-2" style={{ color: '#3D5A80' }} />
                            Issue New Asset
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="py-4">
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-muted text-uppercase" style={{ letterSpacing: '0.03em' }}>
                                <PersonCircle className="me-1 mb-1" /> Select Employee
                            </Form.Label>
                            <Form.Select
                                required
                                value={formData.employee}
                                onChange={e => setFormData({ ...formData, employee: e.target.value })}
                            >
                                <option value="">-- Choose User --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.username}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-muted text-uppercase" style={{ letterSpacing: '0.03em' }}>
                                <LaptopFill className="me-1 mb-1" /> Select Available Asset
                            </Form.Label>
                            <Form.Select
                                required
                                value={formData.asset}
                                onChange={e => setFormData({ ...formData, asset: e.target.value })}
                            >
                                <option value="">-- Choose Hardware --</option>
                                {availableAssets.map(asset => (
                                    <option key={asset.id} value={asset.id}>{asset.name} ({asset.serial_number})</option>
                                ))}
                            </Form.Select>
                            {availableAssets.length === 0 && (
                                <Form.Text className="text-warning">
                                    No assets are currently available to assign.
                                </Form.Text>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label className="fw-semibold small text-muted text-uppercase" style={{ letterSpacing: '0.03em' }}>
                                Assignment Date
                            </Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.date_assigned}
                                onChange={e => setFormData({ ...formData, date_assigned: e.target.value })}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer style={{ borderTop: '1px solid #eef1f4' }}>
                        <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button
                            type="submit"
                            style={{ backgroundColor: '#3D5A80', borderColor: '#3D5A80' }}
                        >
                            Complete Assignment
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageAssignments;