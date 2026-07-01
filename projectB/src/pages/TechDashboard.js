import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { CheckCircleFill, Wrench, ClipboardCheck, ListTask } from 'react-bootstrap-icons';
import api from '../api/axios';

const TechDashboard = () => {
    const [myTickets, setMyTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchMyTickets(); }, []);

    const fetchMyTickets = async () => {
        try {
            const res = await api.get('repairs/');
            setMyTickets(res.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await api.patch(`repairs/${id}/`, { status: newStatus });
            fetchMyTickets();
        } catch (err) { alert("Update failed"); }
    };

    const statusColors = {
        in_progress: 'primary',
        completed: 'success',
    };

    const stats = {
        total: myTickets.length,
        in_progress: myTickets.filter(t => t.status === 'in_progress').length,
        completed: myTickets.filter(t => t.status === 'completed').length,
    };

    if (loading)
        return (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-3 mb-0">Loading your service queue...</p>
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
                    <Wrench size={24} color="white" />
                </div>
                <div>
                    <h2 className="fw-bold mb-0">My Service Queue</h2>
                    <p className="text-muted mb-0 small">Manage and track your repair assignments</p>
                </div>
            </div>

            {/* Analytics Cards */}
            <Row className="mb-4 g-3">
                {[
                    { 
                        label: 'Total Jobs', 
                        value: stats.total, 
                        color: '#212529',
                        icon: ListTask,
                        bgGradient: 'linear-gradient(135deg, #495057 0%, #212529 100%)'
                    },
                    { 
                        label: 'In Progress', 
                        value: stats.in_progress, 
                        color: '#0d6efd',
                        icon: Wrench,
                        bgGradient: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)'
                    },
                    { 
                        label: 'Completed', 
                        value: stats.completed, 
                        color: '#198754',
                        icon: ClipboardCheck,
                        bgGradient: 'linear-gradient(135deg, #20c997 0%, #198754 100%)'
                    },
                ].map((item, i) => (
                    <Col md={6} lg={4} key={i}>
                        <Card 
                            className="border-0 shadow-sm h-100" 
                            style={{ 
                                borderRadius: '16px',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                cursor: 'default'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '';
                            }}
                        >
                            <Card.Body className="d-flex align-items-center p-4">
                                <div 
                                    className="d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                    style={{ 
                                        width: '52px', 
                                        height: '52px', 
                                        borderRadius: '14px',
                                        background: item.bgGradient
                                    }}
                                >
                                    <item.icon size={26} color="white" />
                                </div>
                                <div>
                                    <div 
                                        className="fs-3 fw-bold"
                                        style={{ color: item.color, lineHeight: 1.2 }}
                                    >
                                        {item.value}
                                    </div>
                                    <div className="text-muted small fw-medium">{item.label}</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Section Divider */}
            <div className="d-flex align-items-center mb-4">
                <h5 className="fw-bold mb-0 me-3">Repair Tickets</h5>
                <div className="flex-grow-1" style={{ height: '1px', backgroundColor: '#e9ecef' }}></div>
                <Badge bg="light" text="dark" className="ms-3 fw-medium">
                    {myTickets.length} {myTickets.length === 1 ? 'ticket' : 'tickets'}
                </Badge>
            </div>

            {/* Tickets Grid */}
            <Row className="g-4">
                {myTickets.map(ticket => (
                    <Col md={6} lg={4} key={ticket.id}>

                        <Card
                            className="border-0 shadow-sm h-100 position-relative overflow-hidden"
                            style={{
                                borderRadius: '16px',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                backgroundColor: '#ffffff'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '';
                            }}
                        >
                            {/* Status accent bar */}
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '5px',
                                backgroundColor: ticket.status === 'in_progress' ? '#0d6efd' : '#198754',
                                borderTopLeftRadius: '16px',
                                borderBottomLeftRadius: '16px'
                            }} />

                            {/* Top status ribbon for completed */}
                            {ticket.status === 'completed' && (
                                <div 
                                    className="position-absolute top-0 end-0 px-3 py-1 text-white small fw-semibold"
                                    style={{
                                        background: 'linear-gradient(135deg, #20c997 0%, #198754 100%)',
                                        borderBottomLeftRadius: '12px',
                                        borderTopRightRadius: '16px',
                                        fontSize: '0.7rem',
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    Done
                                </div>
                            )}

                            <Card.Body className="d-flex flex-column p-4" style={{ paddingLeft: '1.75rem' }}>

                                {/* HEADER */}
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <Badge 
                                        bg="light" 
                                        text="dark" 
                                        className="px-3 py-2 rounded-pill fw-semibold border"
                                        style={{ borderColor: '#dee2e6', fontSize: '0.8rem' }}
                                    >
                                        {ticket.asset_name}
                                    </Badge>

                                    <Badge 
                                        bg={statusColors[ticket.status]} 
                                        className="px-3 py-2 rounded-pill text-uppercase small fw-semibold"
                                        style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}
                                    >
                                        {ticket.status_display}
                                    </Badge>
                                </div>

                                {/* ISSUE */}
                                <div className="mb-4 flex-grow-1">
                                    <div className="text-muted small text-uppercase fw-semibold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                                        Issue Description
                                    </div>
                                    <div className="fw-semibold" style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#212529' }}>
                                        {ticket.issue}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div style={{ height: '1px', backgroundColor: '#f1f3f5', marginBottom: '1.25rem' }}></div>

                                {/* ACTIONS */}
                                {ticket.status === 'in_progress' && (
                                    <Button
                                        variant="success"
                                        className="w-100 rounded-pill fw-semibold d-flex align-items-center justify-content-center py-2"
                                        style={{
                                            background: 'linear-gradient(135deg, #20c997 0%, #198754 100%)',
                                            border: 'none',
                                            boxShadow: '0 4px 12px rgba(25, 135, 84, 0.3)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(25, 135, 84, 0.4)';
                                            e.currentTarget.style.transform = 'scale(1.02)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 135, 84, 0.3)';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                        onClick={() => updateStatus(ticket.id, 'completed')}
                                    >
                                        <CheckCircleFill className="me-2" size={18} />
                                        Finish Repair
                                    </Button>
                                )}

                                {ticket.status === 'completed' && (
                                    <div className="d-flex align-items-center justify-content-center py-2 rounded-pill" style={{ backgroundColor: '#d1e7dd' }}>
                                        <CheckCircleFill className="me-2" size={18} color="#198754" />
                                        <span className="fw-semibold" style={{ color: '#198754', fontSize: '0.9rem' }}>
                                            Job Finished
                                        </span>
                                    </div>
                                )}

                            </Card.Body>
                        </Card>

                    </Col>
                ))}
            </Row>

            {/* Empty State */}
            {myTickets.length === 0 && !loading && (
                <div className="text-center py-5">
                    <div 
                        className="d-inline-flex align-items-center justify-content-center mb-3"
                        style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '24px',
                            backgroundColor: '#f8f9fa'
                        }}
                    >
                        <ClipboardCheck size={36} color="#adb5bd" />
                    </div>
                    <h5 className="text-muted fw-semibold">No tickets assigned</h5>
                    <p className="text-muted small mb-0">Your service queue is currently empty.</p>
                </div>
            )}
        </div>
    );
};

export default TechDashboard;