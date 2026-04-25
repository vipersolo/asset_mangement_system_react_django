import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Modal, Form, Spinner, Row, Col } from 'react-bootstrap';
import { PersonPlus, ArrowCounterclockwise } from 'react-bootstrap-icons';
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

    if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

    return (
        <div className="p-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Asset Assignments</h2>
                <Button variant="success" onClick={() => setShowModal(true)}>
                    <PersonPlus className="me-2" /> Assign New Gear
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Asset Name</th>
                                <th>Serial No.</th>
                                <th>Assigned On</th>
                                <th className="text-end">Status/Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map(asgn => (
                                <tr key={asgn.id}>
                                    <td><strong>{asgn.employee_name}</strong></td>
                                    <td>{asgn.asset_name}</td>
                                    <td><code>{asgn.asset_details?.serial_number}</code></td>
                                    <td>{asgn.date_assigned}</td>
                                    <td className="text-end">
                                        {asgn.date_returned ? (
                                            <span className="text-muted small italic">Returned {asgn.date_returned}</span>
                                        ) : (
                                            <Button variant="outline-warning" size="sm" onClick={() => handleReturn(asgn.id)}>
                                                <ArrowCounterclockwise className="me-1" /> Check In
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* ASSIGNMENT MODAL */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Issue New Asset</Modal.Title></Modal.Header>
                <Form onSubmit={handleAssign}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Employee</Form.Label>
                            <Form.Select required onChange={e => setFormData({...formData, employee: e.target.value})}>
                                <option value="">-- Choose User --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.username}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Select Available Asset</Form.Label>
                            <Form.Select required onChange={e => setFormData({...formData, asset: e.target.value})}>
                                <option value="">-- Choose Hardware --</option>
                                {availableAssets.map(asset => (
                                    <option key={asset.id} value={asset.id}>{asset.name} ({asset.serial_number})</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Assignment Date</Form.Label>
                            <Form.Control 
                                type="date" 
                                value={formData.date_assigned}
                                onChange={e => setFormData({...formData, date_assigned: e.target.value})} 
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="success" type="submit">Complete Assignment</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageAssignments;