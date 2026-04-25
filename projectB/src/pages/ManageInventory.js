import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Badge, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { PlusCircle, Plus, Dash } from 'react-bootstrap-icons';
import api from '../api/axios';

const ManageInventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newItem, setNewItem] = useState({ item_type: '', quantity: 0, threshold: 5 });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await api.get('inventory/');
            setItems(res.data);
        } catch (err) {
            console.error("Error fetching inventory", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('inventory/', newItem);
            setShowModal(false);
            setNewItem({ item_type: '', quantity: 0, threshold: 5 });
            fetchInventory();
        } catch (err) {
            alert("Error adding item type");
        }
    };

    const updateQuantity = async (id, currentQty, amount) => {
        try {
            // Partial update (PATCH) just for the quantity field
            await api.patch(`inventory/${id}/`, { quantity: currentQty + amount });
            fetchInventory();
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

    return (
        <div className="p-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Consumables Inventory</h2>
                <Button variant="dark" onClick={() => setShowModal(true)}>
                    <PlusCircle className="me-2" /> New Category
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>Item Type</th>
                                <th className="text-center">Stock Level</th>
                                <th className="text-center">Min. Threshold</th>
                                <th>Status</th>
                                <th className="text-end">Quick Adjust</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => {
                                const isLow = item.quantity <= item.threshold;
                                return (
                                    <tr key={item.id} className={isLow ? "table-danger" : ""}>
                                        <td className="fw-bold">{item.item_type}</td>
                                        <td className="text-center">{item.quantity}</td>
                                        <td className="text-center text-muted">{item.threshold}</td>
                                        <td>
                                            <Badge bg={isLow ? 'danger' : 'success'}>
                                                {isLow ? 'RESTOCK REQUIRED' : 'STOCKED'}
                                            </Badge>
                                        </td>
                                        <td className="text-end">
                                            <Button 
                                                variant="outline-secondary" 
                                                size="sm" 
                                                className="me-2"
                                                onClick={() => updateQuantity(item.id, item.quantity, -1)}
                                                disabled={item.quantity <= 0}
                                            >
                                                <Dash />
                                            </Button>
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm"
                                                onClick={() => updateQuantity(item.id, item.quantity, 1)}
                                            >
                                                <Plus />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* ADD ITEM MODAL */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Add New Inventory Type</Modal.Title></Modal.Header>
                <Form onSubmit={handleAdd}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Item Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="e.g., HDMI Cables, Wireless Mice" 
                                onChange={e => setNewItem({...newItem, item_type: e.target.value})} 
                                required 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Current Quantity</Form.Label>
                            <Form.Control 
                                type="number" 
                                onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value)})} 
                                required 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Minimum Threshold (Alert level)</Form.Label>
                            <Form.Control 
                                type="number" 
                                defaultValue={5}
                                onChange={e => setNewItem({...newItem, threshold: parseInt(e.target.value)})} 
                                required 
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="dark" type="submit">Add Item</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageInventory;