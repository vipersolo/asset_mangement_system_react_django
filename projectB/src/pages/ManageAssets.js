// ManageAssets.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Card,
  Badge,
  Modal,
  Form,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import {
  PlusCircle,
  PencilSquare,
  Trash,
} from "react-bootstrap-icons";
import api from "../api/axios";

const emptyForm = {
  name: "",
  type: "",
  serial_number: "",
  status: "available",
  purchase_date: new Date().toISOString().split("T")[0],
};

const ManageAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await api.get("assets/");
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAsset(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      serial_number: asset.serial_number,
      status: asset.status,
      purchase_date: asset.purchase_date,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingAsset) {
        await api.put(`assets/${editingAsset.id}/`, formData);
      } else {
        await api.post("assets/", formData);
      }
      setShowModal(false);
      setEditingAsset(null);
      setFormData(emptyForm);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.serial_number || "Error saving asset");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    await api.delete(`assets/${id}/`);
    fetchAssets();
  };

  if (loading)
    return <Spinner animation="border" className="d-block mx-auto mt-5" />;

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Hardware Registry</h2>
        <Button onClick={handleAdd}>
          <PlusCircle className="me-2" />
          Add New Asset
        </Button>
      </div>

      <Card className="shadow-sm border-0">
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
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td className="fw-bold">{asset.name}</td>
                  <td>{asset.type}</td>
                  <td><code>{asset.serial_number}</code></td>
                  <td>
                    <Badge bg={
                      asset.status==="available"?"success":
                      asset.status==="assigned"?"primary":"danger"
                    }>
                      {asset.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td>{asset.purchase_date}</td>
                  <td className="text-end">
                    <Button variant="link" className="text-primary p-0 me-3"
                      onClick={()=>handleEdit(asset)}>
                      <PencilSquare/>
                    </Button>
                    <Button variant="link" className="text-danger p-0"
                      onClick={()=>handleDelete(asset.id)}>
                      <Trash/>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={()=>setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAsset ? "Edit Asset" : "Register New Hardware"}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Asset Name</Form.Label>
              <Form.Control
                value={formData.name}
                onChange={(e)=>setFormData({...formData,name:e.target.value})}
                required
              />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Control
                    value={formData.type}
                    onChange={(e)=>setFormData({...formData,type:e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>

              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e)=>setFormData({...formData,status:e.target.value})}
                  >
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                    <option value="repair">Repair</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Serial Number</Form.Label>
              <Form.Control
                value={formData.serial_number}
                disabled={editingAsset!==null}
                onChange={(e)=>setFormData({...formData,serial_number:e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Purchase Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.purchase_date}
                onChange={(e)=>setFormData({...formData,purchase_date:e.target.value})}
                required
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={()=>setShowModal(false)}>
              Close
            </Button>
            <Button type="submit">
              {editingAsset ? "Update Asset" : "Save Asset"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageAssets;
