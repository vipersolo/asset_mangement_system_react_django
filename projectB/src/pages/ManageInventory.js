import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Badge, Modal, Form, Spinner, Alert, ProgressBar, Toast, ToastContainer } from 'react-bootstrap';
import { PlusCircle, Plus, Dash, BoxSeam, ExclamationTriangle } from 'react-bootstrap-icons';
import api from '../api/axios';

const ManageInventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newItem, setNewItem] = useState({ item_type: '', quantity: 0, threshold: 5 });
    const [updatingId, setUpdatingId] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await api.get('inventory/');
            setItems(res.data);
        } catch (err) {
            console.error("Error fetching inventory", err);
            setToast({ show: true, message: 'Failed to load inventory data', variant: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('inventory/', newItem);
            setShowModal(false);
            setNewItem({ item_type: '', quantity: 0, threshold: 5 });
            fetchInventory();
            setToast({ show: true, message: 'New inventory category added successfully', variant: 'success' });
        } catch (err) {
            setToast({ show: true, message: 'Error adding item type. Please try again.', variant: 'danger' });
        } finally {
            setSubmitting(false);
        }
    };

    const updateQuantity = async (id, currentQty, amount) => {
        setUpdatingId(id);
        try {
            await api.patch(`inventory/${id}/`, { quantity: currentQty + amount });
            fetchInventory();
        } catch (err) {
            console.error("Update failed", err);
            setToast({ show: true, message: 'Failed to update quantity', variant: 'danger' });
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setNewItem({ item_type: '', quantity: 0, threshold: 5 });
    };

    const getStockPercentage = (quantity, threshold) => {
        if (threshold <= 0) return 100;
        const percentage = (quantity / (threshold * 2)) * 100;
        return Math.min(percentage, 100);
    };

    const getProgressVariant = (quantity, threshold) => {
        if (quantity <= threshold) return 'danger';
        if (quantity <= threshold * 1.5) return 'warning';
        return 'success';
    };

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="dark" style={{ width: '3rem', height: '3rem' }} />
                <p className="mt-3 text-muted">Loading inventory...</p>
            </div>
        );
    }

    return (
        <div className="p-3 p-md-4 w-100">
            {/* Toast Notifications */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1060 }}>
                <Toast 
                    show={toast.show} 
                    onClose={() => setToast({ ...toast, show: false })} 
                    delay={4000} 
                    autohide
                    bg={toast.variant}
                >
                    <Toast.Body className={toast.variant === 'danger' ? 'text-white' : ''}>
                        {toast.message}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            {/* Header */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1">Consumables Inventory</h2>
                    <p className="text-muted mb-0 small">Manage stock levels and monitor low inventory alerts</p>
                </div>
                <Button 
                    variant="dark" 
                    onClick={() => setShowModal(true)}
                    className="d-flex align-items-center gap-2"
                >
                    <PlusCircle /> New Category
                </Button>
            </div>

            {/* Empty State */}
            {items.length === 0 ? (
                <Card className="border-0 shadow-sm text-center py-5">
                    <Card.Body>
                        <BoxSeam size={48} className="text-muted mb-3" />
                        <h5 className="text-muted">No inventory items yet</h5>
                        <p className="text-muted small mb-3">Get started by adding your first inventory category</p>
                        <Button variant="dark" onClick={() => setShowModal(true)}>
                            <PlusCircle className="me-2" /> Add First Item
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                /* Inventory Table */
                <Card className="border-0 shadow-sm overflow-hidden">
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table hover className="mb-0 align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th className="ps-4">Item Type</th>
                                        <th className="text-center">Stock Level</th>
                                        <th className="text-center d-none d-md-table-cell">Min. Threshold</th>
                                        <th>Status</th>
                                        <th className="text-end pe-4">Quick Adjust</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => {
                                        const isLow = item.quantity <= item.threshold;
                                        const stockPercent = getStockPercentage(item.quantity, item.threshold);
                                        const progressVariant = getProgressVariant(item.quantity, item.threshold);
                                        
                                        return (
                                            <tr 
                                                key={item.id} 
                                                className={isLow ? "table-danger" : ""}
                                                style={{ transition: 'background-color 0.15s ease' }}
                                            >
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center gap-2">
                                                        {isLow && <ExclamationTriangle className="text-danger flex-shrink-0" size={16} />}
                                                        <span className="fw-semibold">{item.item_type}</span>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex flex-column align-items-center gap-1">
                                                        <span className="fw-bold">{item.quantity}</span>
                                                        <div style={{ width: '80px' }}>
                                                            <ProgressBar 
                                                                now={stockPercent} 
                                                                variant={progressVariant}
                                                                style={{ height: '6px' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-center text-muted d-none d-md-table-cell">
                                                    {item.threshold}
                                                </td>
                                                <td>
                                                    <Badge 
                                                        bg={isLow ? 'danger' : 'success'} 
                                                        className="px-3 py-2"
                                                        style={{ fontSize: '0.75rem', letterSpacing: '0.025em' }}
                                                    >
                                                        {isLow ? 'RESTOCK REQUIRED' : 'STOCKED'}
                                                    </Badge>
                                                </td>
                                                <td className="text-end pe-4">
                                                    <div className="d-inline-flex align-items-center gap-2">
                                                        <Button 
                                                            variant={isLow ? "outline-danger" : "outline-secondary"} 
                                                            size="sm" 
                                                            className="d-flex align-items-center justify-content-center"
                                                            style={{ width: '32px', height: '32px', padding: 0 }}
                                                            onClick={() => updateQuantity(item.id, item.quantity, -1)}
                                                            disabled={item.quantity <= 0 || updatingId === item.id}
                                                            aria-label={`Decrease ${item.item_type} quantity`}
                                                        >
                                                            {updatingId === item.id ? (
                                                                <Spinner size="sm" animation="border" />
                                                            ) : (
                                                                <Dash size={16} />
                                                            )}
                                                        </Button>
                                                        <Button 
                                                            variant="outline-primary" 
                                                            size="sm"
                                                            className="d-flex align-items-center justify-content-center"
                                                            style={{ width: '32px', height: '32px', padding: 0 }}
                                                            onClick={() => updateQuantity(item.id, item.quantity, 1)}
                                                            disabled={updatingId === item.id}
                                                            aria-label={`Increase ${item.item_type} quantity`}
                                                        >
                                                            {updatingId === item.id ? (
                                                                <Spinner size="sm" animation="border" />
                                                            ) : (
                                                                <Plus size={16} />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                    <Card.Footer className="bg-light border-0 py-2 px-4">
                        <small className="text-muted">
                            Showing {items.length} item{items.length !== 1 ? 's' : ''}
                            {items.filter(i => i.quantity <= i.threshold).length > 0 && (
                                <span className="ms-2">
                                    · <span className="text-danger fw-semibold">
                                        {items.filter(i => i.quantity <= i.threshold).length} need restocking
                                    </span>
                                </span>
                            )}
                        </small>
                    </Card.Footer>
                </Card>
            )}

            {/* Add Item Modal */}
            <Modal 
                show={showModal} 
                onHide={handleCloseModal} 
                centered
                backdrop="static"
                keyboard={!submitting}
            >
                <Modal.Header closeButton>
                    <Modal.Title className="fs-5">Add New Inventory Type</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAdd}>
                    <Modal.Body className="pt-4">
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-uppercase text-muted" style={{ letterSpacing: '0.05em' }}>
                                Item Name
                            </Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="e.g., HDMI Cables, Wireless Mice" 
                                value={newItem.item_type}
                                onChange={e => setNewItem({...newItem, item_type: e.target.value})} 
                                required 
                                autoFocus
                                disabled={submitting}
                            />
                            <Form.Text className="text-muted">
                                Choose a descriptive name for easy identification
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-uppercase text-muted" style={{ letterSpacing: '0.05em' }}>
                                Current Quantity
                            </Form.Label>
                            <Form.Control 
                                type="number" 
                                min="0"
                                placeholder="0"
                                value={newItem.quantity || ''}
                                onChange={e => setNewItem({...newItem, quantity: Math.max(0, parseInt(e.target.value) || 0)})} 
                                required 
                                disabled={submitting}
                            />
                        </Form.Group>
                        <Form.Group className="mb-1">
                            <Form.Label className="fw-semibold small text-uppercase text-muted" style={{ letterSpacing: '0.05em' }}>
                                Minimum Threshold
                            </Form.Label>
                            <Form.Control 
                                type="number" 
                                min="0"
                                placeholder="5"
                                value={newItem.threshold || ''}
                                onChange={e => setNewItem({...newItem, threshold: Math.max(0, parseInt(e.target.value) || 0)})} 
                                required 
                                disabled={submitting}
                            />
                            <Form.Text className="text-muted">
                                You'll be alerted when stock falls at or below this level
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <Button 
                            variant="light" 
                            onClick={handleCloseModal}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="dark" 
                            type="submit"
                            disabled={submitting || !newItem.item_type.trim()}
                            className="d-flex align-items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Spinner size="sm" animation="border" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <PlusCircle size={16} />
                                    Add Item
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageInventory;