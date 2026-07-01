import React, { useEffect, useState } from 'react';
import {
    Row,
    Col,
    Card,
    ListGroup,
    Badge,
    Spinner
} from 'react-bootstrap';
import {
    Box,
    Wrench,
    People,
    ExclamationTriangle,
    Activity
} from 'react-bootstrap-icons';
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
                const [assets, inventory, repairs, assignments] =
                    await Promise.all([
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

    if (loading)
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "70vh" }}
            >
                <Spinner animation="border" variant="primary" />
            </div>
        );

    const pendingRepairs = data.repairs.filter(
        r => r.status === "pending"
    );

    const stats = [
        {
            title: "Total Assets",
            value: data.assets.length,
            icon: <Box size={28} />,
            color: "primary",
            sub: `${data.assets.filter(a => a.status === "available").length} Available`
        },
        {
            title: "Pending Assignments",
            value: pendingRepairs.length,
            icon: <Wrench size={28} />,
            color: "warning",
            sub: "Awaiting technician"
        },
        {
            title: "Active Repairs",
            value: data.repairs.filter(r => r.status !== "completed").length,
            icon: <Activity size={28} />,
            color: "danger",
            sub: "Tasks in progress"
        },
        {
            title: "Active Assignments",
            value: data.assignments.filter(a => !a.date_returned).length,
            icon: <People size={28} />,
            color: "success",
            sub: "Hardware in use"
        }
    ];

    const lowStockItems = data.inventory.filter(
        item => item.quantity <= item.threshold
    );

    return (
        <div className="p-3">

            {/* Header */}

            <div className="mb-4">
                <h2 className="fw-bold mb-1">
                    Admin Dashboard
                </h2>

                <p className="text-muted mb-0">
                    Monitor assets, repairs, assignments and inventory in one place.
                </p>
            </div>

            {/* Stats */}

            <Row className="g-4 mb-4">

                {stats.map((stat, idx) => (

                    <Col lg={3} md={6} key={idx}>

                        <Card
                            className="border-0 shadow-sm h-100"
                            style={{
                                borderRadius: "18px",
                                transition: "0.25s"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                    "translateY(-4px)";
                                e.currentTarget.style.boxShadow =
                                    "0 10px 25px rgba(0,0,0,0.08)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                    "translateY(0)";
                                e.currentTarget.style.boxShadow = "";
                            }}
                        >
                            <Card.Body>

                                <div className="d-flex justify-content-between align-items-center">

                                    <div>

                                        <small className="text-uppercase text-muted fw-semibold">
                                            {stat.title}
                                        </small>

                                        <h2 className="fw-bold mt-2 mb-1">
                                            {stat.value}
                                        </h2>

                                        <small className="text-muted">
                                            {stat.sub}
                                        </small>

                                    </div>

                                    <div
                                        className={`bg-${stat.color} bg-opacity-10 text-${stat.color} rounded-circle d-flex justify-content-center align-items-center`}
                                        style={{
                                            width: 65,
                                            height: 65
                                        }}
                                    >
                                        {stat.icon}
                                    </div>

                                </div>

                            </Card.Body>

                        </Card>

                    </Col>

                ))}

            </Row>

            <Row className="g-4">

                {/* Inventory */}

                <Col lg={6}>

                    <Card
                        className="border-0 shadow-sm h-100"
                        style={{ borderRadius: "18px" }}
                    >

                        <Card.Header
                            className="bg-white border-0 py-3"
                            style={{
                                borderTopLeftRadius: "18px",
                                borderTopRightRadius: "18px"
                            }}
                        >
                            <div className="d-flex align-items-center">

                                <div
                                    className="bg-warning bg-opacity-10 rounded-circle d-flex justify-content-center align-items-center me-3"
                                    style={{
                                        width: 45,
                                        height: 45
                                    }}
                                >
                                    <ExclamationTriangle
                                        className="text-warning"
                                        size={22}
                                    />
                                </div>

                                <div>

                                    <h5 className="fw-bold mb-0">
                                        Critical Inventory Alerts
                                    </h5>

                                    <small className="text-muted">
                                        Items requiring immediate attention
                                    </small>

                                </div>

                            </div>

                        </Card.Header>

                        <ListGroup variant="flush">

                            {lowStockItems.length > 0 ? (

                                lowStockItems.map(item => (

                                    <ListGroup.Item
                                        key={item.id}
                                        className="py-3 border-0 border-bottom"
                                    >

                                        <div className="d-flex justify-content-between align-items-center">

                                            <div>

                                                <div className="fw-semibold fs-6">
                                                    {item.item_type}
                                                </div>

                                                <small className="text-muted">
                                                    Minimum Threshold : {item.threshold}
                                                </small>

                                            </div>

                                            <Badge
                                                bg="danger"
                                                pill
                                                className="px-3 py-2"
                                            >
                                                {item.quantity} Left
                                            </Badge>

                                        </div>

                                    </ListGroup.Item>

                                ))

                            ) : (

                                <div className="text-center py-5">

                                    <ExclamationTriangle
                                        size={45}
                                        className="text-success mb-3"
                                    />

                                    <h6 className="fw-bold">
                                        Inventory Looks Good
                                    </h6>

                                    <small className="text-muted">
                                        No low-stock items detected.
                                    </small>

                                </div>

                            )}

                        </ListGroup>

                    </Card>

                </Col>

                {/* Repairs */}

                <Col lg={6}>

                    <Card
                        className="border-0 shadow-sm h-100"
                        style={{ borderRadius: "18px" }}
                    >

                        <Card.Header
                            className="bg-white border-0 py-3"
                            style={{
                                borderTopLeftRadius: "18px",
                                borderTopRightRadius: "18px"
                            }}
                        >
                            <div className="d-flex align-items-center">

                                <div
                                    className="bg-primary bg-opacity-10 rounded-circle d-flex justify-content-center align-items-center me-3"
                                    style={{
                                        width: 45,
                                        height: 45
                                    }}
                                >
                                    <Wrench
                                        className="text-primary"
                                        size={22}
                                    />
                                </div>

                                <div>

                                    <h5 className="fw-bold mb-0">
                                        Recent Repair Requests
                                    </h5>

                                    <small className="text-muted">
                                        Latest maintenance tickets
                                    </small>

                                </div>

                            </div>

                        </Card.Header>

                        <ListGroup variant="flush">

                            {data.repairs.length > 0 ? (

                                data.repairs.slice(0, 5).map(ticket => (

                                    <ListGroup.Item
                                        key={ticket.id}
                                        className="py-3 border-0 border-bottom"
                                    >

                                        <div className="d-flex justify-content-between align-items-start">

                                            <div style={{ flex: 1 }}>

                                                <div className="fw-semibold">
                                                    {ticket.asset_name}
                                                </div>

                                                <small
                                                    className="text-muted d-block mt-1"
                                                    style={{
                                                        maxWidth: "95%",
                                                        overflow: "hidden",
                                                        whiteSpace: "nowrap",
                                                        textOverflow: "ellipsis"
                                                    }}
                                                >
                                                    {ticket.issue}
                                                </small>

                                            </div>

                                            <Badge
                                                bg={
                                                    ticket.status === "completed"
                                                        ? "success"
                                                        : ticket.status === "pending"
                                                        ? "warning"
                                                        : "primary"
                                                }
                                                pill
                                                className="ms-3 px-3 py-2"
                                            >
                                                {ticket.status_display}
                                            </Badge>

                                        </div>

                                    </ListGroup.Item>

                                ))

                            ) : (

                                <div className="text-center py-5">

                                    <Wrench
                                        size={45}
                                        className="text-muted mb-3"
                                    />

                                    <h6 className="fw-bold">
                                        No Repair Requests
                                    </h6>

                                    <small className="text-muted">
                                        Everything is running smoothly.
                                    </small>

                                </div>

                            )}

                        </ListGroup>

                    </Card>

                </Col>

            </Row>

        </div>
    );
};

export default AdminDashboard;