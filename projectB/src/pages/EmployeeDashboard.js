import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Badge, Modal, Form, Table, Spinner } from 'react-bootstrap';
import { ChatLeftText, Laptop, CheckCircleFill, ClockHistory, ExclamationTriangleFill, Tools } from 'react-bootstrap-icons';
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

    if (loading) return (
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-3 mb-0">Loading your workspace...</p>
        </div>
    );

    return (
        <div className="p-3" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Page Header */}
            <div className="d-flex align-items-center mb-4">
                <div 
                    className="d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                    style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)'
                    }}
                >
                    <Laptop size={24} color="white" />
                </div>
                <div>
                    <h2 className="fw-bold mb-0">My Workspace</h2>
                    <p className="text-muted mb-0 small">Manage your equipment and support requests</p>
                </div>
            </div>

            {/* SECTION 1: MY ASSETS */}
            <div className="d-flex align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <Laptop className="me-2 text-primary" size={20} />
                    <h4 className="mb-0 fw-bold">Assigned Equipment</h4>
                </div>
                <div className="flex-grow-1 ms-3" style={{ height: '1px', backgroundColor: '#e9ecef' }}></div>
                <Badge bg="light" text="dark" className="ms-3 fw-medium border">
                    {assignments.length} {assignments.length === 1 ? 'item' : 'items'}
                </Badge>
            </div>

            <Row className="g-4 mb-5">
                {assignments.length > 0 ? assignments.map(asgn => (
                    <Col md={6} lg={4} key={asgn.id}>
                        <Card 
                            className="border-0 shadow-sm h-100"
                            style={{
                                borderRadius: '16px',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                backgroundColor: '#ffffff'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '';
                            }}
                        >
                            <Card.Body className="p-4 d-flex flex-column">
                                <div className="d-flex align-items-center mb-3">
                                    <div 
                                        className="d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                        style={{ 
                                            width: '44px', 
                                            height: '44px', 
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
                                        }}
                                    >
                                        <Laptop size={22} color="white" />
                                    </div>
                                    <div className="d-flex flex-column">
    <div
        className="fw-bold"
        style={{
            fontSize: "1.1rem",
            lineHeight: "1.4",
            marginBottom: "4px",
        }}
    >
        {asgn.asset_details?.name}
    </div>

    <small
        className="text-muted"
        style={{
            lineHeight: "1.3",
        }}
    >
        S/N: {asgn.asset_details?.serial_number}
    </small>
</div>
                                </div>
                                
                                <Button 
                                    variant="outline-danger" 
                                    className="w-100 mt-auto rounded-pill fw-semibold d-flex align-items-center justify-content-center py-2"
                                    style={{
                                        borderWidth: '2px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.backgroundColor = '#dc3545';
                                        e.currentTarget.style.color = 'white';
                                        e.currentTarget.style.borderColor = '#dc3545';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = '#dc3545';
                                        e.currentTarget.style.borderColor = '#dc3545';
                                    }}
                                    onClick={() => {
                                        setReportData({...reportData, asset: asgn.asset});
                                        setShowModal(true);
                                    }}
                                >
                                    <ChatLeftText className="me-2" size={16} />
                                    Report an Issue
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                )) : (
                    <Col>
                        <div className="text-center py-5">
                            <div 
                                className="d-inline-flex align-items-center justify-content-center mb-3"
                                style={{ 
                                    width: '72px', 
                                    height: '72px', 
                                    borderRadius: '20px',
                                    backgroundColor: '#f8f9fa'
                                }}
                            >
                                <Laptop size={32} color="#adb5bd" />
                            </div>
                            <h5 className="text-muted fw-semibold">No assets assigned</h5>
                            <p className="text-muted small mb-0">You don't have any equipment assigned to you yet.</p>
                        </div>
                    </Col>
                )}
            </Row>

            {/* SECTION 2: TICKET STATUS */}
            <div className="d-flex align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <ClockHistory className="me-2 text-primary" size={20} />
                    <h4 className="mb-0 fw-bold">Support Tickets</h4>
                </div>
                <div className="flex-grow-1 ms-3" style={{ height: '1px', backgroundColor: '#e9ecef' }}></div>
                <Badge bg="light" text="dark" className="ms-3 fw-medium border">
                    {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
                </Badge>
            </div>

            <Card 
                className="border-0 shadow-sm overflow-hidden"
                style={{ borderRadius: '16px' }}
            >
                <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th className="fw-semibold text-uppercase small text-muted py-3 px-4" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Asset</th>
                                <th className="fw-semibold text-uppercase small text-muted py-3 px-4" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Issue</th>
                                <th className="fw-semibold text-uppercase small text-muted py-3 px-4" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.length > 0 ? tickets.map(ticket => (
                                <tr key={ticket.id} style={{ transition: 'background-color 0.15s ease' }}>
                                    <td className="py-3 px-4">
                                        <div className="d-flex align-items-center">
                                            <div 
                                                className="d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                                style={{ 
                                                    width: '36px', 
                                                    height: '36px', 
                                                    borderRadius: '10px',
                                                    backgroundColor: '#e9ecef'
                                                }}
                                            >
                                                <Tools size={16} color="#6c757d" />
                                            </div>
                                            <strong className="fw-semibold" style={{ color: '#212529' }}>
                                                {ticket.asset_name}
                                            </strong>
                                        </div>
                                    </td>
                                    <td className="text-muted py-3 px-4" style={{ maxWidth: '400px' }}>
                                        {ticket.issue}
                                    </td>
                                    <td className="py-3 px-4">
                                        <Badge 
                                            bg={statusColors[ticket.status]} 
                                            className="px-3 py-2 rounded-pill text-uppercase small fw-semibold"
                                            style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}
                                        >
                                            {ticket.status_display}
                                        </Badge>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-5">
                                        <div 
                                            className="d-inline-flex align-items-center justify-content-center mb-3"
                                            style={{ 
                                                width: '64px', 
                                                height: '64px', 
                                                borderRadius: '18px',
                                                backgroundColor: '#f8f9fa'
                                            }}
                                        >
                                            <CheckCircleFill size={28} color="#adb5bd" />
                                        </div>
                                        <h6 className="text-muted fw-semibold mb-1">No support tickets</h6>
                                        <p className="text-muted small mb-0">You haven't submitted any repair requests yet.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            {/* REPORT MODAL */}
            <Modal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                centered
                size="lg"
            >
                <Modal.Header 
                    closeButton
                    className="border-0 pb-0"
                    style={{ padding: '1.5rem 1.5rem 0.5rem' }}
                >
                    <div className="d-flex align-items-center">
                        <div 
                            className="d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                            style={{ 
                                width: '44px', 
                                height: '44px', 
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #dc3545 0%, #a71d2a 100%)'
                            }}
                        >
                            <ExclamationTriangleFill size={22} color="white" />
                        </div>
                        <div>
                            <Modal.Title className="fw-bold">Report Technical Issue</Modal.Title>
                            <p className="text-muted small mb-0">Describe the problem with your equipment</p>
                        </div>
                    </div>
                </Modal.Header>
                <Form onSubmit={handleReportSubmit}>
                    <Modal.Body style={{ padding: '1.5rem' }}>
                        <Form.Group>
                            <Form.Label className="fw-semibold small text-uppercase text-muted mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                Problem Description
                            </Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={4} 
                                placeholder="What's wrong with the equipment? Be as detailed as possible."
                                onChange={e => setReportData({...reportData, issue: e.target.value})}
                                required 
                                className="border-2"
                                style={{ 
                                    borderRadius: '12px',
                                    resize: 'none',
                                    fontSize: '0.95rem'
                                }}
                                onFocus={e => e.target.style.borderColor = '#dc3545'}
                                onBlur={e => e.target.style.borderColor = '#dee2e6'}
                            />
                            <Form.Text className="text-muted small mt-2">
                                This will create a support ticket for the technical team.
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0" style={{ padding: '0 1.5rem 1.5rem' }}>
                        <Button 
                            variant="light" 
                            onClick={() => setShowModal(false)}
                            className="rounded-pill px-4 fw-semibold"
                            style={{ backgroundColor: '#f8f9fa' }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="danger" 
                            type="submit"
                            className="rounded-pill px-4 fw-semibold d-flex align-items-center"
                            style={{
                                background: 'linear-gradient(135deg, #dc3545 0%, #a71d2a 100%)',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
                            }}
                        >
                            <ChatLeftText className="me-2" size={16} />
                            Submit Report
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default EmployeeDashboard;