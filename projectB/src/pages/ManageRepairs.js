import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Badge, Modal, Form, Spinner, Container, Row, Col } from 'react-bootstrap';
import { Tools, CheckCircleFill, HourglassSplit, Wrench, PersonGear, ExclamationTriangleFill, ArrowRightCircle } from 'react-bootstrap-icons';
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
                api.get('users/')
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
            await api.patch(`repairs/${selectedTicket.id}/`, assignmentData);
            setShowModal(false);
            fetchData();
        } catch (err) {
            alert("Failed to assign technician.");
        }
    };

    const getStatusBadge = (status, statusDisplay) => {
        const config = {
            completed: { bg: 'success', icon: <CheckCircleFill className="me-1" size={12} /> },
            pending: { bg: 'warning', icon: <HourglassSplit className="me-1" size={12} /> },
            in_progress: { bg: 'info', icon: <Wrench className="me-1" size={12} /> }
        };
        const cfg = config[status] || config.pending;
        return (
            <Badge bg={cfg.bg} className="d-inline-flex align-items-center px-3 py-2 rounded-pill fw-semibold" style={{ fontSize: '0.8rem' }}>
                {cfg.icon}
                {statusDisplay}
            </Badge>
        );
    };

    const getTechnicianBadge = (tech) => {
        if (tech) {
            return (
                <Badge bg="light" text="dark" className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill border" style={{ fontSize: '0.85rem' }}>
                    <PersonGear size={14} className="text-secondary" />
                    {tech}
                </Badge>
            );
        }
        return (
            <span className="d-inline-flex align-items-center gap-1 text-danger small fw-medium">
                <ExclamationTriangleFill size={12} />
                Unassigned
            </span>
        );
    };

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="text-muted mt-3 mb-0">Loading repair tickets...</p>
            </div>
        );
    }

    return (
        <Container fluid className="py-4" style={{ maxWidth: '1400px' }}>
            {/* Header */}
            <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 text-primary" style={{ width: 48, height: 48 }}>
                    <Tools size={24} />
                </div>
                <div>
                    <h2 className="fw-bold mb-0" style={{ fontSize: '1.75rem' }}>Repair Command Center</h2>
                    <p className="text-muted mb-0 small">Manage and assign repair tasks to your technical team</p>
                </div>
            </div>

            {/* Stats Summary */}
                <Row className="g-3 mb-4">
                    <Col xs={12} sm={6} md={3}>
                        <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)' }}>
                            <Card.Body className="d-flex align-items-center gap-3 text-white">
                                <div className="bg-white rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: 44, height: 44 }}>
                                    <Wrench size={22} style={{ color: '#0d6efd' }} />
                                </div>
                                <div>
                                    <div className="fw-bold" style={{ fontSize: '1.5rem' }}>{tickets.length}</div>
                                    <div className="small opacity-75">Total Tickets</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} md={3}>
                        <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #ffc107 0%, #e6ac00 100%)' }}>
                            <Card.Body className="d-flex align-items-center gap-3 text-white">
                                <div className="bg-white rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: 44, height: 44 }}>
                                    <HourglassSplit size={22} style={{ color: '#e6ac00' }} />
                                </div>
                                <div>
                                    <div className="fw-bold" style={{ fontSize: '1.5rem' }}>{tickets.filter(t => t.status === 'pending').length}</div>
                                    <div className="small opacity-75">Pending</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} md={3}>
                        <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #0dcaf0 0%, #0aa2c0 100%)' }}>
                            <Card.Body className="d-flex align-items-center gap-3 text-white">
                                <div className="bg-white rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: 44, height: 44 }}>
                                    <PersonGear size={22} style={{ color: '#0aa2c0' }} />
                                </div>
                                <div>
                                    <div className="fw-bold" style={{ fontSize: '1.5rem' }}>{tickets.filter(t => t.status === 'in_progress').length}</div>
                                    <div className="small opacity-75">In Progress</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} md={3}>
                        <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #198754 0%, #146c43 100%)' }}>
                            <Card.Body className="d-flex align-items-center gap-3 text-white">
                                <div className="bg-white rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: 44, height: 44 }}>
                                    <CheckCircleFill size={22} style={{ color: '#146c43' }} />
                                </div>
                                <div>
                                    <div className="fw-bold" style={{ fontSize: '1.5rem' }}>{tickets.filter(t => t.status === 'completed').length}</div>
                                    <div className="small opacity-75">Completed</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

            {/* Main Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <div className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                        <h5 className="mb-0 fw-semibold">Repair Tickets</h5>
                        <Badge bg="secondary" className="rounded-pill">{tickets.length}</Badge>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table hover className="mb-0 align-middle" style={{ fontSize: '0.95rem' }}>
                        <thead>
                            <tr className="bg-light">
                                <th className="fw-semibold text-secondary text-uppercase small px-4 py-3 border-0" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Asset</th>
                                <th className="fw-semibold text-secondary text-uppercase small px-4 py-3 border-0" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Issue Reported</th>
                                <th className="fw-semibold text-secondary text-uppercase small px-4 py-3 border-0" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Technician</th>
                                <th className="fw-semibold text-secondary text-uppercase small px-4 py-3 border-0" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Status</th>
                                <th className="fw-semibold text-secondary text-uppercase small px-4 py-3 border-0 text-end" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-5 text-muted">
                                        <div className="d-flex flex-column align-items-center gap-2">
                                            <Tools size={32} className="text-muted opacity-25" />
                                            <p className="mb-0">No repair tickets found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                tickets.map(ticket => (
                                    <tr key={ticket.id} style={{ transition: 'background-color 0.15s ease' }}>
                                        <td className="px-4 py-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="bg-primary bg-opacity-10 rounded-2 d-flex align-items-center justify-content-center text-primary" style={{ width: 32, height: 32 }}>
                                                    <Wrench size={14} />
                                                </div>
                                                <strong className="text-dark">{ticket.asset_name}</strong>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-secondary">{ticket.issue}</td>
                                        <td className="px-4 py-3">
                                            {getTechnicianBadge(ticket.technician_username)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(ticket.status, ticket.status_display)}
                                        </td>
                                        <td className="px-4 py-3 text-end">
                                            {ticket.status === 'pending' && (
                                                <Button 
                                                    variant="primary" 
                                                    size="sm" 
                                                    className="d-inline-flex align-items-center gap-2 rounded-pill px-3 fw-medium"
                                                    onClick={() => openAssignModal(ticket)}
                                                    style={{ fontSize: '0.85rem' }}
                                                >
                                                    <PersonGear size={14} />
                                                    Assign Tech
                                                </Button>
                                            )}
                                            {ticket.status === 'completed' && (
                                                <div className="d-inline-flex align-items-center gap-2 text-success fw-medium small">
                                                    <CheckCircleFill size={18} />
                                                    <span>Done</span>
                                                </div>
                                            )}
                                            {ticket.status === 'in_progress' && (
                                                <div className="d-inline-flex align-items-center gap-2 text-info fw-medium small">
                                                    <HourglassSplit size={18} />
                                                    <span>Active</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            {/* ASSIGN TECHNICIAN MODAL */}
            <Modal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                centered 
                backdrop="static"
                contentClassName="border-0 shadow-lg"
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="d-flex align-items-center gap-2 fw-bold">
                        <div className="bg-primary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center text-primary" style={{ width: 36, height: 36 }}>
                            <PersonGear size={18} />
                        </div>
                        Assign Repair Task
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAssignTech}>
                    <Modal.Body className="px-4 pt-3 pb-4">
                        <div className="bg-light rounded-3 p-3 mb-4 border">
                            <p className="small text-muted mb-1">Assigning technician for</p>
                            <div className="d-flex align-items-center gap-2">
                                <Wrench size={16} className="text-primary" />
                                <strong className="text-dark">{selectedTicket?.asset_name}</strong>
                            </div>
                        </div>
                        <Form.Group>
                            <Form.Label className="fw-semibold small text-secondary text-uppercase mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                Select Technician
                            </Form.Label>
                            <Form.Select 
                                required 
                                className="border-0 shadow-sm py-2"
                                style={{ backgroundColor: '#f8f9fa', fontSize: '0.95rem' }}
                                onChange={e => setAssignmentData({...assignmentData, technician: e.target.value})}
                            >
                                <option value="">-- Choose Technician --</option>
                                {technicians.map(tech => (
                                    <option key={tech.id} value={tech.id}>{tech.username}</option>
                                ))}
                            </Form.Select>
                            {technicians.length === 0 && (
                                <Form.Text className="text-danger small mt-2 d-block">
                                    No technicians available. Please add technicians first.
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 px-4 pb-4 pt-0">
                        <Button 
                            variant="light" 
                            onClick={() => setShowModal(false)}
                            className="rounded-pill px-4 fw-medium"
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            type="submit" 
                            className="d-inline-flex align-items-center gap-2 rounded-pill px-4 fw-medium"
                            disabled={!assignmentData.technician}
                        >
                            <ArrowRightCircle size={16} />
                            Dispatch Technician
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default ManageRepairs;