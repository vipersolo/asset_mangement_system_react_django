import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Badge, Modal, Form, Table, Spinner } from 'react-bootstrap';
import { ChatLeftText, Laptop, CheckCircleFill, ClockHistory } from 'react-bootstrap-icons';
import api from '../api/axios';

const EmployeeDashboard = () => {
    const [assignments, setAssignments] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Reporting State
    const [showModal, setShowModal] = useState(false);
    const [reportData, setReportData] = useState({ asset: '', issue: '', status: 'pending' });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [asgnRes, ticketRes] = await Promise.all([
                api.get('assignments/'),
                api.get('repairs/')
            ]);
            setAssignments(asgnRes.data);
            setTickets(ticketRes.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('repairs/', reportData);
            setShowModal(false);
            setReportData({ asset: '', issue: '', status: 'pending' });
            fetchData(); // Refresh to show the new ticket
        } catch (err) { alert("Failed to submit report."); }
    };

    const statusColors = { 'pending': 'warning', 'in_progress': 'primary', 'completed': 'success' };

    if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

    return (
        <div className="p-2">
            <h2 className="fw-bold mb-4">My Workspace</h2>

            {/* SECTION 1: MY ASSETS */}
            <h4 className="mb-3 text-secondary"><Laptop className="me-2"/>Assigned Equipment</h4>
            <Row className="mb-5">
                {assignments.length > 0 ? assignments.map(asgn => (
                    <Col md={6} lg={4} key={asgn.id}>
                        <Card className="border-0 shadow-sm mb-3">
                            <Card.Body>
                                <Card.Title className="fw-bold">{asgn.asset_details?.name}</Card.Title>
                                <Card.Subtitle className="mb-3 text-muted small">
                                    S/N: {asgn.asset_details?.serial_number}
                                </Card.Subtitle>
                                <Button 
                                    variant="outline-danger" 
                                    size="sm" 
                                    className="w-100"
                                    onClick={() => {
                                        setReportData({...reportData, asset: asgn.asset});
                                        setShowModal(true);
                                    }}
                                >
                                    <ChatLeftText className="me-2"/> Report an Issue
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                )) : <Col><p className="text-muted">No assets currently assigned to you.</p></Col>}
            </Row>

            {/* SECTION 2: TICKET STATUS */}
            <h4 className="mb-3 text-secondary"><ClockHistory className="me-2"/>Support Tickets</h4>
            <Card className="border-0 shadow-sm">
                <Table hover responsive className="mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th>Asset</th>
                            <th>Issue</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(ticket => (
                            <tr key={ticket.id}>
                                <td><strong>{ticket.asset_name}</strong></td>
                                <td className="text-muted">{ticket.issue}</td>
                                <td>
                                    <Badge bg={statusColors[ticket.status]}>
                                        {ticket.status_display}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            {/* REPORT MODAL */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Report Technical Issue</Modal.Title></Modal.Header>
                <Form onSubmit={handleReportSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Describe the problem</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                placeholder="What's wrong with the equipment?"
                                onChange={e => setReportData({...reportData, issue: e.target.value})}
                                required 
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="danger" type="submit">Submit Report</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default EmployeeDashboard;