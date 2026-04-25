import React, { useEffect, useState } from 'react';
import { Row, Col, Card, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { Box, Wrench, People, ExclamationTriangle } from 'react-bootstrap-icons';
import api from '../api/axios';

const AdminDashboard = () => {
    const [data, setData] = useState({
        assets: [],
        inventory: [],
        repairs: [],
        assignments: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [assets, inventory, repairs, assignments] = await Promise.all([
                    api.get('assets/'),
                    api.get('inventory/'),
                    api.get('repairs/'),
                    api.get('assignments/')
                ]);
                setData({
                    assets: assets.data,
                    inventory: inventory.data,
                    repairs: repairs.data,
                    assignments: assignments.data
                });
            } catch (err) {
                console.error("Dashboard data fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" variant="primary" />;

    // 🔥 NEW: Pending Assignments
    const pendingRepairs = data.repairs.filter(r => r.status === 'pending');

    // Existing stats (unchanged, just added one more)
    const stats = [
        { 
            title: "Total Assets", 
            value: data.assets.length, 
            icon: <Box size={30} />, 
            color: "primary",
            sub: `${data.assets.filter(a => a.status === 'available').length} Available`
        },
        { 
            title: "Pending Assignments",   // ✅ NEW CARD
            value: pendingRepairs.length, 
            icon: <Wrench size={30} />, 
            color: "warning",
            sub: "Awaiting technician"
        },
        { 
            title: "Active Repairs", 
            value: data.repairs.filter(r => r.status !== 'completed').length, 
            icon: <Wrench size={30} />, 
            color: "danger",
            sub: "Tasks in progress"
        },
        { 
            title: "Active Assignments", 
            value: data.assignments.filter(a => !a.date_returned).length, 
            icon: <People size={30} />, 
            color: "success",
            sub: "Hardware in use"
        }
    ];

    const lowStockItems = data.inventory.filter(item => item.quantity <= item.threshold);

    return (
        <div className="p-2">
            <h2 className="fw-bold mb-4 text-dark">System Overview</h2>

            {/* Quick Stats Row */}
            <Row className="mb-4">
                {stats.map((stat, idx) => (
                    <Col md={6} lg={3} key={idx}> {/* ✅ adjusted grid to fit 4 cards */}
                        <Card className={`shadow-sm border-0 border-start border-4 border-${stat.color}`}>
                            <Card.Body className="d-flex align-items-center">
                                <div className={`p-3 rounded-circle bg-light text-${stat.color} me-3`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <Card.Subtitle className="text-muted small text-uppercase">{stat.title}</Card.Subtitle>
                                    <Card.Title className="h2 mb-0 fw-bold">{stat.value}</Card.Title>
                                    <small className="text-muted">{stat.sub}</small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row>
                {/* Low Stock Alerts */}
                <Col md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white py-3 d-flex align-items-center">
                            <ExclamationTriangle className="text-warning me-2" />
                            <h5 className="mb-0 fw-bold">Critical Inventory Alerts</h5>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {lowStockItems.length > 0 ? (
                                lowStockItems.map(item => (
                                    <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center py-3">
                                        <div>
                                            <div className="fw-bold">{item.item_type}</div>
                                            <small className="text-muted">Threshold: {item.threshold}</small>
                                        </div>
                                        <Badge bg="danger" pill>Only {item.quantity} left</Badge>
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <ListGroup.Item className="text-center py-4 text-muted">
                                    All inventory levels are healthy.
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>
                </Col>

                {/* Recent Activity */}
                <Col md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0 fw-bold">Recent Repair Requests</h5>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {data.repairs.slice(0, 5).map(ticket => (
                                <ListGroup.Item key={ticket.id} className="py-3">
                                    <div className="d-flex justify-content-between">
                                        <span className="fw-bold">{ticket.asset_name}</span>
                                        <Badge bg={ticket.status === 'completed' ? 'success' : 'warning'}>
                                            {ticket.status_display}
                                        </Badge>
                                    </div>
                                    <div className="small text-muted text-truncate" style={{ maxWidth: '300px' }}>
                                        {ticket.issue}
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;