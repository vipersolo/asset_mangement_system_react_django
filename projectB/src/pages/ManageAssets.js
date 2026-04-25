import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Badge, Modal, Form, Spinner, Row, Col } from 'react-bootstrap';
import { PlusCircle, PencilSquare, Trash } from 'react-bootstrap-icons';
import api from '../api/axios';

const ManageAssets = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // State for the Add/Edit Form
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        serial_number: '',
        status: 'available',
        purchase_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const res = await api.get('assets/');
            setAssets(res.data);
        } catch (err) {
            console.error("Failed to fetch assets", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // This calls your AssetViewSet's create method
            await api.post('assets/', formData);
            setShowModal(false);
            setFormData({ name: '', type: '', serial_number: '', status: 'available', purchase_date: '' });
            fetchAssets(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.serial_number || "Error saving asset");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this asset?")) {
            await api.delete(`assets/${id}/`);
            fetchAssets();
        }
    };

    if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

    return (
        <div className="p-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark">Hardware Registry</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    <PlusCircle className="me-2" /> Add New Asset
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Serial Number</th>
                                <th>Status</th>
                                <th>Purchase Date</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.map(asset => (
                                <tr key={asset.id}>
                                    <td className="fw-bold">{asset.name}</td>
                                    <td>{asset.type}</td>
                                    <td><code>{asset.serial_number}</code></td>
                                    <td>
                                        <Badge bg={asset.status === 'available' ? 'success' : asset.status === 'repair' ? 'danger' : 'info'}>
                                            {asset.status.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td>{asset.purchase_date}</td>
                                    <td className="text-end">
                                        <Button variant="link" className="text-primary p-0 me-3"><PencilSquare /></Button>
                                        <Button variant="link" className="text-danger p-0" onClick={() => handleDelete(asset.id)}><Trash /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* ADD ASSET MODAL */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Register New Hardware</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSave}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Asset Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="e.g. Dell XPS 15" 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                required 
                            />
                        </Form.Group>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Type</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="e.g. Laptop" 
                                        onChange={e => setFormData({...formData, type: e.target.value})} 
                                        required 
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select onChange={e => setFormData({...formData, status: e.target.value})}>
                                        <option value="available">Available</option>
                                        <option value="repair">Repair</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Serial Number</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Unique Service Tag" 
                                onChange={e => setFormData({...formData, serial_number: e.target.value})} 
                                required 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Purchase Date</Form.Label>
                            <Form.Control 
                                type="date" 
                                value={formData.purchase_date}
                                onChange={e => setFormData({...formData, purchase_date: e.target.value})} 
                                required 
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                        <Button variant="primary" type="submit">Save Asset</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageAssets;