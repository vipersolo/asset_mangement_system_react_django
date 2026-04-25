import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { Tools, CheckCircleFill, HourglassSplit } from 'react-bootstrap-icons';
import api from '../api/axios';

const ManageRepairs = () => {
    const [tickets, setTickets] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [assignmentData, setAssignmentData] = useState({ technician: '', status: 'in_progress' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ticketRes, userRes] = await Promise.all([
                api.get('repairs/'),
                api.get('users/') // We will filter for technicians
            ]);
            setTickets(ticketRes.data);
            setTechnicians(userRes.data.filter(u => u.role === 'technician'));
        } catch (err) {
            console.error("Error fetching repair data", err);
        } finally {
            setLoading(false);
        }
    };

    const openAssignModal = (ticket) => {
        setSelectedTicket(ticket);
        setShowModal(true);
    };

    const handleAssignTech = async (e) => {
        e.preventDefault();
        try {
            // PATCH the ticket with the selected technician and change status to 'in_progress'
            await api.patch(`repairs/${selectedTicket.id}/`, assignmentData);
            setShowModal(false);
            fetchData();
        } catch (err) {
            alert("Failed to assign technician.");
        }
    };

    if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

    return (
        <div className="p-2">
            <h2 className="fw-bold mb-4">Repair Command Center</h2>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0">
                        <thead>
                            <tr>
                                <th>Asset</th>
                                <th>Issue Reported</th>
                                <th>Technician</th>
                                <th>Status</th>
                                <th className="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td><strong>{ticket.asset_name}</strong></td>
                                    <td>{ticket.issue}</td>
                                    <td>
                                        {ticket.technician ? (
                                            <Badge bg="secondary">{ticket.technician_username}</Badge>
                                        ) : (
                                            <span className="text-danger small">Unassigned</span>
                                        )}
                                    </td>
                                    <td>
                                        <Badge bg={ticket.status === 'completed' ? 'success' : ticket.status === 'pending' ? 'warning' : 'primary'}>
                                            {ticket.status_display}
                                        </Badge>
                                    </td>
                                    <td className="text-end">
                                        {ticket.status === 'pending' && (
                                            <Button variant="info" size="sm" className="text-white" onClick={() => openAssignModal(ticket)}>
                                                Assign Tech
                                            </Button>
                                        )}
                                        {ticket.status === 'completed' && <CheckCircleFill className="text-success" />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* ASSIGN TECHNICIAN MODAL */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Assign Repair Task</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAssignTech}>
                    <Modal.Body>
                        <p className="small text-muted">Assigning technician for: <strong>{selectedTicket?.asset_name}</strong></p>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Technician</Form.Label>
                            <Form.Select required onChange={e => setAssignmentData({...assignmentData, technician: e.target.value})}>
                                <option value="">-- Choose Technician --</option>
                                {technicians.map(tech => (
                                    <option key={tech.id} value={tech.id}>{tech.username}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="info" type="submit" className="text-white">Dispatch Technician</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageRepairs;