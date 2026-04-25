import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { CheckCircleFill } from 'react-bootstrap-icons';
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

    // ✅ Analytics (NO pending anymore)
    const stats = {
        total: myTickets.length,
        in_progress: myTickets.filter(t => t.status === 'in_progress').length,
        completed: myTickets.filter(t => t.status === 'completed').length,
    };

    if (loading)
        return <Spinner animation="border" className="d-block mx-auto mt-5" />;

    return (
        <div className="p-3">
            <h2 className="fw-bold mb-4">My Service Queue</h2>

            {/* 🔥 ANALYTICS */}
            <Row className="mb-4">
                {[
                    { label: 'Total Jobs', value: stats.total, color: 'dark' },
                    { label: 'In Progress', value: stats.in_progress, color: 'primary' },
                    { label: 'Completed', value: stats.completed, color: 'success' },
                ].map((item, i) => (
                    <Col md={6} lg={4} key={i} className="mb-3">
                        <Card className="border-0 shadow-sm text-center" style={{ borderRadius: '14px' }}>
                            <Card.Body>
                                <div className={`fs-4 fw-bold text-${item.color}`}>
                                    {item.value}
                                </div>
                                <div className="text-muted small">{item.label}</div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* 🔥 TICKETS */}
            <Row>
                {myTickets.map(ticket => (
                    <Col md={6} lg={4} key={ticket.id} className="mb-4">

                        <Card
                            className="border-0 shadow-sm h-100 position-relative"
                            style={{
                                borderRadius: '16px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >

                            {/* Highlight active jobs */}
                            {ticket.status === 'in_progress' && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: '5px',
                                    backgroundColor: '#0d6efd',
                                    borderTopLeftRadius: '16px',
                                    borderBottomLeftRadius: '16px'
                                }} />
                            )}

                            <Card.Body className="d-flex flex-column">

                                {/* HEADER */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill fw-semibold">
                                        {ticket.asset_name}
                                    </Badge>

                                    <Badge bg={statusColors[ticket.status]} className="px-3 py-2 rounded-pill text-uppercase small">
                                        {ticket.status_display}
                                    </Badge>
                                </div>

                                {/* ISSUE */}
                                <div className="mb-4 flex-grow-1">
                                    <div className="text-muted small">Issue</div>
                                    <div className="fw-semibold">{ticket.issue}</div>
                                </div>

                                {/* ACTIONS */}

                                {/* ONLY in_progress → completed */}
                                {ticket.status === 'in_progress' && (
                                    <Button
                                        variant="success"
                                        className="w-100 rounded-pill fw-semibold d-flex align-items-center justify-content-center"
                                        onClick={() => updateStatus(ticket.id, 'completed')}
                                    >
                                        <CheckCircleFill className="me-2" />
                                        Finish Repair
                                    </Button>
                                )}

                                {ticket.status === 'completed' && (
                                    <div className="text-center text-success fw-semibold py-2">
                                        <CheckCircleFill className="me-1" />
                                        Job Finished
                                    </div>
                                )}

                            </Card.Body>
                        </Card>

                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default TechDashboard;